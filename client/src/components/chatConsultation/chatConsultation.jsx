// ChatConsultation.js
import React, { useState, useEffect } from "react";
import axios from "axios";

import { baseURL } from "../../api/api.js";
import styles from "./ChatConsultation.module.css";

const ChatConsultation = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm here to help you. Would you like to continue this chat?",
    },
  ]);
  const [gender, setGender] = useState("male");
  const [yearOfBirth, setYearOfBirth] = useState(1980);
  const [bodyLocations, setBodyLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [bodySublocations, setBodySublocations] = useState([]);
  const [selectedSublocation, setSelectedSublocation] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [step, setStep] = useState(1);
  console.log("component rendered", step);

  useEffect(() => {
    const fetchBodyLocations = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/health/specialty/body-locations`
        );
        setBodyLocations(response.data);
        // console.log(response.data);
      } catch (error) {
        console.error("Error fetching body locations", error);
      }
    };
    fetchBodyLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const fetchBodySublocations = async () => {
        try {
          const response = await axios.get(
            `${baseURL}/health/specialty/body-locations/${selectedLocation.ID}`
          );
          setBodySublocations(response.data);
        } catch (error) {
          console.error("Error fetching body sublocations", error);
        }
      };
      fetchBodySublocations();
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedSublocation) {
      const fetchSymptoms = async () => {
        try {
          const response = await axios.get(
            `${baseURL}/health/specialty/symptoms/${selectedSublocation.ID}/man`
          );
          setSymptoms(response.data);
        } catch (error) {
          console.error("Error fetching symptoms", error);
        }
      };
      fetchSymptoms();
    }
  }, [selectedSublocation]);

  const handleSelection = async (input) => {
    if (input.ID === "proceedToCase6") {
      setStep(6);
      console.log("finally");

      console.log(selectedSymptoms);
      const symptomsString = JSON.stringify(selectedSymptoms);

      const response = await axios.get(
        `${baseURL}/health/specialty/specializations`,
        {
          params: {
            symptoms: symptomsString,
            gender: gender.Name,
            yearOfBirth,
          },
        }
      );
      setSpecializations(response.data);
      console.log(response.data);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Here are the recommended specializations." },
      ]);
      return;
    }
    switch (step) {
      case 1: // Gender selection
        setGender(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input.Name },
          { sender: "bot", text: "Enter your year of birth." },
        ]);
        setStep(2);
        break;
      case 2: // Year of birth input
        setYearOfBirth(parseInt(input, 10));
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input },
          { sender: "bot", text: "Select a body location from the options." },
        ]);
        setStep(3);
        break;
      case 3: // Body location selection
        setSelectedLocation(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input.Name },
          { sender: "bot", text: "Select a sublocation." },
        ]);
        setStep(4);
        break;
      case 4: // Sublocation selection
        setSelectedSublocation(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input.Name },
          { sender: "bot", text: "Choose your symptoms." },
        ]);
        setStep(5);
        break;
      case 5:
        toggleSymptom(input.ID); // Now using ID to prevent duplicates
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "user", text: input.Name },
        ]);
        break;

      case 6:
        console.log("Hello");
        console.log(gender);

        const response = await axios.get("/api/health/specializations", {
          params: {
            symptoms: JSON.stringify(selectedSymptoms),
            gender: gender.Name,
            yearOfBirth,
          },
        });
        setSpecializations(response.data);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Here are the recommended specializations." },
        ]);
        break;
      default:
        break;
    }
  };

  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prevSymptoms) =>
      prevSymptoms.includes(symptomId)
        ? prevSymptoms.filter((id) => id !== symptomId)
        : [...prevSymptoms, symptomId]
    );
  };

  // Render buttons for selection
  const renderButtons = (options) => {
    return options.map((option) => (
      <button
        key={option.ID}
        onClick={() => handleSelection(option)}
        className={styles.optionButton}
      >
        {option.Name}
      </button>
    ));
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
      <div className={styles.chatOptions}>
        {step === 1 && (
          <>
            {renderButtons([
              { Name: "male", ID: "1" },
              { Name: "female", ID: "2" },
            ])}
          </>
        )}
        {step === 2 && (
          <input
            type="number"
            placeholder="Enter your year of birth..."
            onKeyDown={(e) =>
              e.key === "Enter" && handleSelection(e.target.value)
            }
          />
        )}
        {step === 3 && <>{renderButtons(bodyLocations.map((loc) => loc))}</>}
        {step === 4 && <>{renderButtons(bodySublocations.map((sub) => sub))}</>}
        {step === 5 && (
          <>
            {renderButtons(symptoms.map((symptom) => symptom))}
            <button
              onClick={() => handleSelection({ ID: "proceedToCase6" })}
              className={styles.proceedButton}
            >
              Proceed
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatConsultation;
