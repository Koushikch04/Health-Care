import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { baseURL } from "../../api/api.js";
import styles from "./chatConsultation.module.css";

const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I can help you discuss symptoms in natural language. Tell me what you are feeling, when it started, and how severe it is.";
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
const MAX_STREAM_REPLY_LENGTH = 6000;
const MAX_REASON_LENGTH = 180;
const MAX_ADDITIONAL_LENGTH = 400;

const getStreamStatusLabel = (status, mode) => {
  if (status === "connecting") {
    return "Connecting...";
  }
  if (status === "streaming") {
    return mode === "fallback_fake_stream" ? "Fallback typing..." : "Live stream";
  }
  if (status === "fallback") {
    return "Retrying...";
  }
  if (status === "done") {
    return "Response ready";
  }
  return "Ready";
};

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
        <strong key={`strong-${tokenMatch.index}`}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      segments.push(
        <em key={`em-${tokenMatch.index}`}>{token.slice(1, -1)}</em>,
      );
    }

    cursor = tokenMatch.index + token.length;
  }

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return segments;
};

const cleanPrefillText = (value) =>
  typeof value === "string"
    ? value
        .replace(/\s+/g, " ")
        .replace(/[^\S\r\n]+/g, " ")
        .trim()
    : "";

const trimTrailingPunctuation = (value) =>
  typeof value === "string" ? value.replace(/[.,;:\s]+$/g, "").trim() : "";

const splitSummaryForPrefill = (aiSummary) => {
  const normalized = cleanPrefillText(aiSummary)
    .replace(/^patient reports\s+/i, "")
    .replace(/^patient states\s+/i, "");

  if (!normalized) {
    return { reasonForVisit: "", additionalNotes: "" };
  }

  const firstSplitIndex = normalized.search(/[.;]|,\s+(?:with|and|accompanied|associated)\b/i);
  if (firstSplitIndex === -1) {
    return {
      reasonForVisit: trimTrailingPunctuation(normalized).slice(0, MAX_REASON_LENGTH),
      additionalNotes: "",
    };
  }

  const reasonForVisit = trimTrailingPunctuation(
    normalized.slice(0, firstSplitIndex),
  ).slice(0, MAX_REASON_LENGTH);
  const additionalNotes = cleanPrefillText(
    normalized.slice(firstSplitIndex + 1),
  ).slice(0, MAX_ADDITIONAL_LENGTH);

  return { reasonForVisit, additionalNotes };
};

const extractFromUserMessages = (messages) => {
  const userStatements = messages
    .filter(
      (message) => message.role === "user" && typeof message.text === "string",
    )
    .map((message) => cleanPrefillText(message.text))
    .filter(Boolean)
    .filter((text) => !/\?$/.test(text));

  if (userStatements.length === 0) {
    return { reasonForVisit: "", additionalNotes: "" };
  }

  const reasonForVisit = trimTrailingPunctuation(
    userStatements[userStatements.length - 1],
  ).slice(0, MAX_REASON_LENGTH);
  const additionalNotes = userStatements
    .slice(0, -1)
    .join(" ")
    .slice(0, MAX_ADDITIONAL_LENGTH)
    .trim();

  return { reasonForVisit, additionalNotes };
};

const parseSseFrames = async ({ response, signal, onEvent }) => {
  if (!response.ok) {
    throw new Error(`SSE request failed with status ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("text/event-stream")) {
    const maybeJson = await response.json().catch(() => null);
    if (maybeJson && typeof maybeJson === "object") {
      onEvent("done", maybeJson);
      return;
    }
    throw new Error("Expected SSE response but received non-SSE payload");
  }
  if (!response.body) {
    throw new Error("SSE response body is missing");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const parseFrame = (frameText) => {
    const lines = frameText.split("\n");
    let eventName = "message";
    const dataLines = [];

    for (const line of lines) {
      if (!line || line.startsWith(":")) {
        continue;
      }
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trimStart());
      }
    }

    if (dataLines.length === 0) {
      return;
    }

    const raw = dataLines.join("\n");
    let payload = raw;
    try {
      payload = JSON.parse(raw);
    } catch (_error) {
      // Keep raw payload for non-JSON events.
    }
    onEvent(eventName, payload);
  };

  while (true) {
    if (signal?.aborted) {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      throw abortError;
    }

    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex !== -1) {
      const frame = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      parseFrame(frame);
      separatorIndex = buffer.indexOf("\n\n");
    }
  }

  if (buffer.trim()) {
    parseFrame(buffer.trim());
  }
};

const buildConsultationPrefill = ({ messages, specialtyName, aiSummary }) => {
  const normalizedAiSummary = cleanPrefillText(aiSummary);
  const fromSummary = splitSummaryForPrefill(normalizedAiSummary);
  const fromUserMessages = extractFromUserMessages(messages);
  const reasonForVisit = fromSummary.reasonForVisit || fromUserMessages.reasonForVisit;
  const additionalNotes =
    fromSummary.additionalNotes || fromUserMessages.additionalNotes;

  return {
    source: "instant_consultation",
    specialty: specialtyName || "",
    reasonForVisit,
    additionalNotes,
    aiSummary: normalizedAiSummary,
    generatedAt: new Date().toISOString(),
  };
};

const ChatConsultation = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: "init-assistant",
      role: "assistant",
      text: INITIAL_ASSISTANT_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [disclaimer, setDisclaimer] = useState(
    "This is informational only and not a diagnosis.",
  );
  const [specializations, setSpecializations] = useState([]);
  const [quickReplies, setQuickReplies] = useState(FALLBACK_QUICK_REPLIES);
  const [latestClinicalSummary, setLatestClinicalSummary] = useState("");
  const [streamStatus, setStreamStatus] = useState("idle");
  const [streamMode, setStreamMode] = useState("");
  const [activeAssistantId, setActiveAssistantId] = useState(null);
  const endRef = useRef(null);
  const isMountedRef = useRef(true);
  const requestAbortControllerRef = useRef(null);
  const seenQuickRepliesRef = useRef(new Set());

  const canSend = useMemo(
    () => input.trim().length > 0 && !isSending,
    [input, isSending],
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleSpecializationSelect = (specialtyName) => {
    if (isSending) {
      return;
    }

    const consultationPrefill = buildConsultationPrefill({
      messages,
      specialtyName,
      aiSummary: latestClinicalSummary,
    });

    navigate(`/appointments?specialty=${encodeURIComponent(specialtyName)}`, {
      state: { consultationPrefill },
    });
  };

  const buildHistory = (existingMessages) =>
    existingMessages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .slice(-8)
      .map((msg) => ({ role: msg.role, text: msg.text }));

  const applyConsultationMetadata = (payload) => {
    if (!payload || typeof payload !== "object") {
      return;
    }

    setDisclaimer((prev) =>
      typeof payload.disclaimer === "string" && payload.disclaimer.trim()
        ? payload.disclaimer.trim()
        : prev,
    );
    setLatestClinicalSummary(
      typeof payload.ai_summary === "string" ? payload.ai_summary : "",
    );
    setSpecializations(
      Array.isArray(payload.specializations) ? payload.specializations : [],
    );

    const predictedReplies = normalizeQuickReplies(
      payload.suggested_followups ||
        payload.quickReplies ||
        payload.suggestedFollowUps ||
        payload.followUps,
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
  };

  const sendMessage = async (draftText) => {
    const text =
      typeof draftText === "string" ? draftText.trim() : input.trim();
    if (!text || isSending) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    setActiveAssistantId(assistantMessageId);
    const updatedMessages = [...messages, userMessage];
    setMessages([
      ...updatedMessages,
      {
        id: assistantMessageId,
        role: "assistant",
        text: "",
      },
    ]);
    setInput("");
    setIsSending(true);
    setStreamStatus("connecting");
    setStreamMode("");
    setQuickReplies([]);
    scrollToBottom();

    const requestAbortController = new AbortController();
    requestAbortControllerRef.current = requestAbortController;
    let streamStartTimeout = null;

    try {
      let streamedReply = "";
      let hasDoneEvent = false;
      let hasAnyStreamEvent = false;
      const streamStartTimeoutMs = 12000;
      const streamResponse = await fetch(`${baseURL}/health/specialty/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: buildHistory(updatedMessages),
        }),
        signal: requestAbortController.signal,
      });
      streamStartTimeout = setTimeout(() => {
        if (!hasAnyStreamEvent && !hasDoneEvent) {
          requestAbortController.abort();
        }
      }, streamStartTimeoutMs);

      await parseSseFrames({
        response: streamResponse,
        signal: requestAbortController.signal,
        onEvent: (eventName, payload) => {
          if (!isMountedRef.current) {
            return;
          }

          if (eventName === "start") {
            hasAnyStreamEvent = true;
            setStreamStatus("streaming");
            if (typeof payload?.mode === "string") {
              setStreamMode(payload.mode);
            }
            return;
          }

          if (eventName === "token") {
            hasAnyStreamEvent = true;
            setStreamStatus("streaming");
            const token = typeof payload?.token === "string" ? payload.token : "";
            if (!token) {
              return;
            }
            if (streamedReply.length >= MAX_STREAM_REPLY_LENGTH) {
              return;
            }
            const remaining = MAX_STREAM_REPLY_LENGTH - streamedReply.length;
            const safeToken = token.slice(0, remaining);
            streamedReply += safeToken;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, text: `${msg.text || ""}${safeToken}` }
                  : msg,
              ),
            );
            return;
          }

          if (eventName === "meta") {
            hasAnyStreamEvent = true;
            applyConsultationMetadata(payload);
            return;
          }

          if (eventName === "done") {
            hasAnyStreamEvent = true;
            hasDoneEvent = true;
            setStreamStatus("done");
            if (typeof payload?.mode === "string") {
              setStreamMode(payload.mode);
            }
            const finalReply =
              typeof payload?.reply === "string" && payload.reply.trim()
                ? payload.reply
                : streamedReply ||
                  "Could you share a bit more detail about your symptoms?";
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId ? { ...msg, text: finalReply } : msg,
              ),
            );
            applyConsultationMetadata(payload);
            return;
          }

          if (eventName === "error") {
            throw new Error(
              payload?.message || "Unable to process consultation right now.",
            );
          }
        },
      });
      if (streamStartTimeout) {
        clearTimeout(streamStartTimeout);
        streamStartTimeout = null;
      }

      if (!hasDoneEvent) {
        throw new Error("Stream ended before completion");
      }
    } catch (error) {
      if (streamStartTimeout) {
        clearTimeout(streamStartTimeout);
        streamStartTimeout = null;
      }
      if (error?.code === "ERR_CANCELED") {
        return;
      }
      if (!isMountedRef.current) {
        return;
      }
      setStreamStatus("fallback");
      setStreamMode("fallback_fake_stream");
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
          response?.data?.reply ||
          "Could you share a bit more detail about your symptoms?";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, text: assistantReply } : msg,
          ),
        );
        applyConsultationMetadata(response?.data || {});
        setStreamStatus("done");
      } catch (legacyError) {
        if (
          legacyError?.code === "ERR_CANCELED" ||
          legacyError?.name === "AbortError"
        ) {
          return;
        }
        setStreamStatus("fallback");
        setStreamMode("fallback_fake_stream");
        console.error("Consultation chat failed:", error, legacyError);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  text: "I could not process that message right now. Please try again.",
                }
              : msg,
          ),
        );
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
      }
    } finally {
      if (streamStartTimeout) {
        clearTimeout(streamStartTimeout);
        streamStartTimeout = null;
      }
      if (requestAbortControllerRef.current === requestAbortController) {
        requestAbortControllerRef.current = null;
      }
      if (!isMountedRef.current) {
        return;
      }
      setIsSending(false);
      setActiveAssistantId(null);
      setStreamStatus("idle");
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
          <div className={styles.headerTop}>
            <h1>Instant Consultation</h1>
            <span
              className={`${styles.streamBadge} ${
                isSending ? styles.streamBadgeActive : ""
              }`}
            >
              {getStreamStatusLabel(streamStatus, streamMode)}
            </span>
          </div>
          <p>
            Describe your symptoms naturally. I will guide and suggest relevant
            specialties.
          </p>
        </header>

        <div className={styles.messageList}>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`${styles.messageBubble} ${
                message.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble
              } ${
                isSending &&
                message.role === "assistant" &&
                message.id === activeAssistantId
                  ? styles.streamingBubble
                  : ""
              }`}
            >
              {renderSimpleMarkdown(
                message.text ||
                  (isSending && message.role === "assistant" ? "Thinking..." : ""),
              )}
              {isSending &&
                message.role === "assistant" &&
                message.id === activeAssistantId && (
                  <span className={styles.typingCursor} aria-hidden="true" />
                )}
            </article>
          ))}
          <div ref={endRef} />
        </div>

        <footer className={styles.composer}>
          {!isSending && quickReplies.length > 0 && (
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

        {!isSending && specializations.length > 0 && (
          <section className={styles.specializations}>
            <h2>Suggested Specialties</h2>
            <div className={styles.specializationList}>
              {specializations.map((item, index) => (
                <button
                  key={`${item.Name}-${index}`}
                  type="button"
                  className={styles.specializationChip}
                  onClick={() => handleSpecializationSelect(item.Name)}
                  disabled={isSending}
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
