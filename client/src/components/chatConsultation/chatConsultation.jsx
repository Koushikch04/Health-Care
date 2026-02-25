import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { baseURL } from "../../api/api.js";
import styles from "./chatConsultation.module.css";

const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I can help you discuss symptoms in natural language. Tell me what you are feeling, when it started, and how severe it is.";
const CONSULTATION_PREFILL_STORAGE_KEY = "consultationPrefill";
const FALLBACK_QUICK_REPLIES = [
  "It started 2 days ago.",
  "Symptoms are moderate right now.",
  "What warning signs should I watch for?",
  "Should I book with a specialist now?",
  "Is it okay to monitor this at home for 24 hours?",
  "What can I do right now to feel better safely?",
  "When should I see a doctor if this does not improve?",
  "Can I use over-the-counter medicine for this?",
];

const normalizeQuickReplies = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }
  const normalized = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(normalized)).slice(0, 4);
};

const getNonRepeatingQuickReplies = ({
  apiReplies,
  fallbackReplies,
  seenReplies,
  limit = 4,
}) => {
  const normalizedApi = normalizeQuickReplies(apiReplies);
  const normalizedFallback = normalizeQuickReplies(fallbackReplies);
  const normalizedSeen = new Set(
    Array.from(seenReplies).map((item) => item.toLowerCase()),
  );

  const pickUnique = (replies, selected) => {
    for (const reply of replies) {
      const key = reply.toLowerCase();
      if (normalizedSeen.has(key) || selected.has(key)) {
        continue;
      }
      selected.add(key);
      if (selected.size >= limit) {
        break;
      }
    }
  };

  const selected = new Set();
  pickUnique(normalizedApi, selected);
  pickUnique(normalizedFallback, selected);

  if (selected.size === 0) {
    normalizedSeen.clear();
    pickUnique(normalizedApi, selected);
    pickUnique(normalizedFallback, selected);
  }

  const selectedReplies = [];
  for (const key of selected) {
    const original =
      normalizedApi.find((item) => item.toLowerCase() === key) ||
      normalizedFallback.find((item) => item.toLowerCase() === key);
    if (original) {
      selectedReplies.push(original);
    }
  }

  return {
    selectedReplies: selectedReplies.slice(0, limit),
  };
};

const renderSimpleMarkdown = (text) => {
  if (typeof text !== "string" || !text) {
    return text;
  }

  const segments = [];
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let cursor = 0;
  let tokenMatch;

  while ((tokenMatch = tokenRegex.exec(text)) !== null) {
    if (tokenMatch.index > cursor) {
      segments.push(text.slice(cursor, tokenMatch.index));
    }

    const token = tokenMatch[0];
    if (token.startsWith("**")) {
      segments.push(
        <strong key={`strong-${tokenMatch.index}`}>{token.slice(2, -2)}</strong>,
      );
    } else {
      segments.push(<em key={`em-${tokenMatch.index}`}>{token.slice(1, -1)}</em>);
    }

    cursor = tokenMatch.index + token.length;
  }

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return segments;
};

const buildConsultationPrefill = ({ messages, specialtyName }) => {
  const userMessages = messages
    .filter((message) => message.role === "user" && typeof message.text === "string")
    .map((message) => message.text.trim())
    .filter(Boolean);
  const assistantMessages = messages
    .filter(
      (message) =>
        message.role === "assistant" &&
        typeof message.text === "string" &&
        message.text.trim() &&
        message.text.trim() !== INITIAL_ASSISTANT_MESSAGE,
    )
    .map((message) => message.text.trim());

  const reasonForVisit = userMessages[userMessages.length - 1] || "";
  const additionalNotes = userMessages.slice(-3, -1).join(" ").trim();
  const aiSummary = assistantMessages[assistantMessages.length - 1] || "";

  return {
    source: "instant_consultation",
    specialty: specialtyName || "",
    reasonForVisit,
    additionalNotes,
    aiSummary,
    generatedAt: new Date().toISOString(),
  };
};

const ChatConsultation = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: "init-assistant", role: "assistant", text: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [disclaimer, setDisclaimer] = useState(
    "This is informational only and not a diagnosis.",
  );
  const [specializations, setSpecializations] = useState([]);
  const [quickReplies, setQuickReplies] = useState(FALLBACK_QUICK_REPLIES);
  const endRef = useRef(null);
  const isMountedRef = useRef(true);
  const requestAbortControllerRef = useRef(null);
  const seenQuickRepliesRef = useRef(new Set());

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleSpecializationSelect = (specialtyName) => {
    const consultationPrefill = buildConsultationPrefill({
      messages,
      specialtyName,
    });

    try {
      sessionStorage.setItem(
        CONSULTATION_PREFILL_STORAGE_KEY,
        JSON.stringify(consultationPrefill),
      );
    } catch (error) {
      console.error("Failed to persist consultation prefill:", error);
    }

    navigate(`/appointments?specialty=${encodeURIComponent(specialtyName)}`, {
      state: { consultationPrefill },
    });
  };

  const buildHistory = (existingMessages) =>
    existingMessages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .slice(-8)
      .map((msg) => ({ role: msg.role, text: msg.text }));

  const sendMessage = async (draftText) => {
    const text = typeof draftText === "string" ? draftText.trim() : input.trim();
    if (!text || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsSending(true);
    setQuickReplies([]);
    scrollToBottom();

    const requestAbortController = new AbortController();
    requestAbortControllerRef.current = requestAbortController;

    try {
      const response = await axios.post(
        `${baseURL}/health/specialty/chat`,
        {
          message: text,
          history: buildHistory(updatedMessages),
        },
        { signal: requestAbortController.signal },
      );

      if (!isMountedRef.current) {
        return;
      }

      const assistantReply =
        response?.data?.reply || "Could you share a bit more detail about your symptoms?";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: assistantReply,
        },
      ]);

      setDisclaimer(response?.data?.disclaimer || disclaimer);
      setSpecializations(Array.isArray(response?.data?.specializations) ? response.data.specializations : []);
      const predictedReplies = normalizeQuickReplies(
        response?.data?.suggested_followups ||
          response?.data?.quickReplies ||
          response?.data?.suggestedFollowUps ||
          response?.data?.followUps,
      );
      const { selectedReplies } = getNonRepeatingQuickReplies({
        apiReplies: predictedReplies,
        fallbackReplies: FALLBACK_QUICK_REPLIES,
        seenReplies: seenQuickRepliesRef.current,
      });
      selectedReplies.forEach((reply) =>
        seenQuickRepliesRef.current.add(reply.toLowerCase()),
      );
      setQuickReplies(
        selectedReplies.length > 0 ? selectedReplies : FALLBACK_QUICK_REPLIES,
      );
    } catch (error) {
      if (error?.code === "ERR_CANCELED") {
        return;
      }
      if (!isMountedRef.current) {
        return;
      }
      console.error("Consultation chat failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "I could not process that message right now. Please try again.",
        },
      ]);
      const { selectedReplies } = getNonRepeatingQuickReplies({
        apiReplies: [],
        fallbackReplies: FALLBACK_QUICK_REPLIES,
        seenReplies: seenQuickRepliesRef.current,
      });
      selectedReplies.forEach((reply) =>
        seenQuickRepliesRef.current.add(reply.toLowerCase()),
      );
      setQuickReplies(
        selectedReplies.length > 0 ? selectedReplies : FALLBACK_QUICK_REPLIES,
      );
    } finally {
      if (requestAbortControllerRef.current === requestAbortController) {
        requestAbortControllerRef.current = null;
      }
      if (!isMountedRef.current) {
        return;
      }
      setIsSending(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      requestAbortControllerRef.current?.abort();
    };
  }, []);

  const onInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReplySelect = (reply) => {
    if (!reply || isSending) {
      return;
    }
    sendMessage(reply);
  };

  return (
    <section className={styles.page}>
      <div className={styles.chatCard}>
        <header className={styles.header}>
          <h1>Instant Consultation</h1>
          <p>Describe your symptoms naturally. I will guide and suggest relevant specialties.</p>
        </header>

        <div className={styles.messageList}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`${styles.messageBubble} ${
                message.role === "user" ? styles.userBubble : styles.assistantBubble
              }`}
            >
              {renderSimpleMarkdown(message.text)}
            </article>
          ))}
          {isSending && (
            <article className={`${styles.messageBubble} ${styles.assistantBubble}`}>
              Thinking...
            </article>
          )}
          <div ref={endRef} />
        </div>

        <footer className={styles.composer}>
          {quickReplies.length > 0 && (
            <div className={styles.quickReplyList}>
              {quickReplies.map((reply, index) => (
                <button
                  key={`quick-reply-${index}`}
                  type="button"
                  className={styles.quickReplyChip}
                  onClick={() => handleQuickReplySelect(reply)}
                  disabled={isSending}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Example: I have had chest tightness and dry cough for 3 days."
            rows={2}
          />
          <button
            type="button"
            className={styles.sendButton}
            disabled={!canSend}
            onClick={sendMessage}
          >
            Send
          </button>
        </footer>

        {specializations.length > 0 && (
          <section className={styles.specializations}>
            <h2>Suggested Specialties</h2>
            <div className={styles.specializationList}>
              {specializations.map((item, index) => (
                <button
                  key={`${item.Name}-${index}`}
                  type="button"
                  className={styles.specializationChip}
                  onClick={() => handleSpecializationSelect(item.Name)}
                  title={item.Reason || ""}
                >
                  {item.Name}
                </button>
              ))}
            </div>
          </section>
        )}

        <p className={styles.disclaimer}>{disclaimer}</p>
      </div>
    </section>
  );
};

export default ChatConsultation;
