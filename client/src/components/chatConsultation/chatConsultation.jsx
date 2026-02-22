import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { baseURL } from "../../api/api.js";
import styles from "./chatConsultation.module.css";

const INITIAL_ASSISTANT_MESSAGE =
  "Hi, I can help you discuss symptoms in natural language. Tell me what you are feeling, when it started, and how severe it is.";

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
  const endRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  const scrollToBottom = () => {
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleSpecializationSelect = (specialtyName) => {
    navigate(`/appointments?specialty=${encodeURIComponent(specialtyName)}`);
  };

  const buildHistory = (existingMessages) =>
    existingMessages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .slice(-8)
      .map((msg) => ({ role: msg.role, text: msg.text }));

  const sendMessage = async () => {
    const text = input.trim();
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
    scrollToBottom();

    try {
      const response = await axios.post(`${baseURL}/health/specialty/chat`, {
        message: text,
        history: buildHistory(updatedMessages),
      });

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
    } catch (error) {
      console.error("Consultation chat failed:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "I could not process that message right now. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
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
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Example: I have had chest tightness and dry cough for 3 days."
            rows={2}
          />
          <button type="button" disabled={!canSend} onClick={sendMessage}>
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
