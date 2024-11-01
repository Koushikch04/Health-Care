import React, { useState, useEffect } from "react";
import axios from "axios";

import { baseURL } from "../../api/api.js";
import styles from "./ChatConsultation.module.css";
import { useNavigate } from "react-router-dom";

const ChatConsultation = () => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm here to help you. Would you like to continue this chat?",
    },
  ]);
  const [gender, setGender] = useState("");
  const [yearOfBirth, setYearOfBirth] = useState("");
  const [bodyLocations, setBodyLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [bodySublocations, setBodySublocations] = useState([]);
  const [selectedSublocation, setSelectedSublocation] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchBodyLocations();
  }, []);

  const fetchBodyLocations = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/health/specialty/body-locations`
      );
      setBodyLocations(response.data);
    } catch (error) {
      console.error("Error fetching body locations", error);
    }
  };

  const fetchBodySublocations = async (locationId) => {
    try {
      const response = await axios.get(
        `${baseURL}/health/specialty/body-locations/${locationId}`
      );
      setBodySublocations(response.data);
    } catch (error) {
      console.error("Error fetching body sublocations", error);
    }
  };

  const handleSpecializationSelect = (specialization) => {
    navigate(`/appointments?specialty=${specialization.doctor}`);
  };

  const fetchSymptoms = async (sublocationId) => {
    try {
      const response = await axios.get(
        `${baseURL}/health/specialty/symptoms/${sublocationId}/man`
      );
      setSymptoms(response.data);
    } catch (error) {
      console.error("Error fetching symptoms", error);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get(
        `${baseURL}/health/specialty/specializations`,
        {
          params: {
            symptoms: JSON.stringify(selectedSymptoms),
            gender,
            yearOfBirth,
          },
        }
      );
      setSpecializations(response.data);
      addBotMessage("Here are the recommended specializations.");
    } catch (error) {
      console.error("Error fetching specializations", error);
    }
  };

  const addBotMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "bot", text }]);
  };

  const addUserMessage = (text) => {
    setMessages((prev) => [...prev, { sender: "user", text }]);
  };

  const handleSelection = async (input) => {
    addUserMessage(input.Name || input);

    switch (step) {
      case 1:
        setGender(input.Name);
        addBotMessage("Enter your year of birth.");
        setStep(2);
        break;

      case 2:
        setYearOfBirth(input);
        addBotMessage("Select a body location from the options.");
        setStep(3);
        break;

      case 3:
        setSelectedLocation(input);
        await fetchBodySublocations(input.ID);
        addBotMessage("Select a sublocation.");
        setStep(4);
        break;

      case 4:
        setSelectedSublocation(input);
        await fetchSymptoms(input.ID);
        addBotMessage("Choose your symptoms.");
        setStep(5);
        break;

      case 5:
        toggleSymptom(input.ID);
        break;

      case 6:
        await fetchSpecializations();
        break;

      default:
        break;
    }
  };

  const toggleSymptom = (symptomId) => {
    const isSelected = selectedSymptoms.includes(symptomId);
    const newSymptoms = isSelected
      ? selectedSymptoms.filter((id) => id !== symptomId)
      : [...selectedSymptoms, symptomId];

    setSelectedSymptoms(newSymptoms);

    // Update messages based on selection
    const symptomText = symptoms.find((s) => s.ID === symptomId).Name;
    if (isSelected) {
      addUserMessage(`Removed symptom: ${symptomText}`);
    } else {
      addUserMessage(`Selected symptom: ${symptomText}`);
    }
  };

  const renderButtons = (options, onClickHandler) =>
    options.map((option, index) => {
      const isSelected = selectedSymptoms.includes(option.ID);
      if (step == 6) console.log(option);

      return (
        <button
          key={`${option.ID}-${index}`}
          onClick={() =>
            step === 6
              ? handleSpecializationSelect(option)
              : onClickHandler(option)
          }
          className={`${styles.optionButton} ${
            isSelected ? styles.selectedSymptom : ""
          }`}
        >
          {option.Name}
        </button>
      );
    });

  // const renderButtons = (options, onClickHandler) =>
  //   options.map((option, index) => (
  //     <button
  //       key={`${option.ID}-${index}`}
  //       onClick={() => onClickHandler(option)}
  //       className={styles.optionButton}
  //     >
  //       {option.Name}
  //     </button>
  //   ));

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
        {step === 1 &&
          renderButtons(
            [{ Name: "Male" }, { Name: "Female" }],
            handleSelection
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
        {step === 3 && renderButtons(bodyLocations, handleSelection)}
        {step === 4 && renderButtons(bodySublocations, handleSelection)}
        {step === 5 && (
          <>
            {renderButtons(symptoms, handleSelection)}
            <button
              onClick={() => {
                setStep(6);
                fetchSpecializations();
              }}
              className={styles.proceedButton}
            >
              Proceed
            </button>
          </>
        )}
        {step === 6 && renderButtons(specializations, () => {})}
      </div>
    </div>
  );
};

export default ChatConsultation;
