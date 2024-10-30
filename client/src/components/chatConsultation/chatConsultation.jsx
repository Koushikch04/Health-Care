import React, { useState } from "react";
import styles from "./ChatConsultation.module.css";

const ChatConsultation = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add the user's message to the chat
    setMessages([...messages, { sender: "user", text: input }]);

    // Clear the input
    setInput("");

    // Fetch response from backend API
    const response = await fetch("/api/consultation/diagnose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });
    const data = await response.json();

    // Add the chatbot's response to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        sender: "bot",
        text:
          data.message ||
          "I'm here to help. Could you provide more details about your symptoms?",
      },
    ]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>Instant Consultation</div>
      <div className={styles.chatMessages}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.message} ${styles[msg.sender]}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className={styles.chatInput}>
        <input
          type="text"
          placeholder="Describe your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatConsultation;
