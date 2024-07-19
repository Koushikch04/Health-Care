import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import "./SearchBar.css";
import SearchBarResults from "./SearchBarResults";

const specialties = [
  { name: "Dentist", url: "#", specialty: "SPECIALITY" },
  { name: "Gynecologist/obstetrician", url: "#", specialty: "SPECIALITY" },
  { name: "General Physician", url: "#", specialty: "SPECIALITY" },
  { name: "Dermatologist", url: "#", specialty: "SPECIALITY" },
  {
    name: "Ear-nose-throat (ent) Specialist",
    url: "#",
    specialty: "SPECIALITY",
  },
  { name: "Homeopath", url: "#", specialty: "SPECIALITY" },
  { name: "Cardiologist", url: "#", specialty: "SPECIALITY" },
  { name: "Pediatrician", url: "#", specialty: "SPECIALITY" },
  { name: "Orthopedic Surgeon", url: "#", specialty: "SPECIALITY" },
  { name: "Neurologist", url: "#", specialty: "SPECIALITY" },
  { name: "Psychiatrist", url: "#", specialty: "SPECIALITY" },
  { name: "Oncologist", url: "#", specialty: "SPECIALITY" },
  { name: "Endocrinologist", url: "#", specialty: "SPECIALITY" },
  { name: "Nephrologist", url: "#", specialty: "SPECIALITY" },
  { name: "Urologist", url: "#", specialty: "SPECIALITY" },
  { name: "Gastroenterologist", url: "#", specialty: "SPECIALITY" },
  { name: "Pulmonologist", url: "#", specialty: "SPECIALITY" },
  { name: "Rheumatologist", url: "#", specialty: "SPECIALITY" },
  { name: "Allergist/Immunologist", url: "#", specialty: "SPECIALITY" },
  { name: "Ophthalmologist", url: "#", specialty: "SPECIALITY" },
  { name: "Plastic Surgeon", url: "#", specialty: "SPECIALITY" },
  { name: "Vascular Surgeon", url: "#", specialty: "SPECIALITY" },
  { name: "Hematologist", url: "#", specialty: "SPECIALITY" },
  { name: "Infectious Disease Specialist", url: "#", specialty: "SPECIALITY" },
  { name: "Geriatrician", url: "#", specialty: "SPECIALITY" },
  { name: "Podiatrist", url: "#", specialty: "SPECIALITY" },
  { name: "Chiropractor", url: "#", specialty: "SPECIALITY" },
  { name: "Pain Management Specialist", url: "#", specialty: "SPECIALITY" },
  { name: "Sports Medicine Specialist", url: "#", specialty: "SPECIALITY" },
  { name: "Occupational Therapist", url: "#", specialty: "SPECIALITY" },
  { name: "Speech Therapist", url: "#", specialty: "SPECIALITY" },
  { name: "Dietitian/Nutritionist", url: "#", specialty: "SPECIALITY" },
];

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const handleClose = () => {
    setSearch("");
    setSearchData([]);
    setSelectedItem(-1);
    setShowSuggestions(false);
  };

  const handleChange = (e) => {
    setSearch(e.target.value);
    if (e.target.value === "") {
      setSearchData(specialties);
    } else {
      const filteredData = specialties.filter((specialty) =>
        specialty.name.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setSearchData(filteredData);
    }
  };

  const handleKeyDown = (e) => {
    if (selectedItem < searchData.length) {
      if (e.key === "ArrowUp" && selectedItem > 0) {
        setSelectedItem((prev) => prev - 1);
      } else if (
        e.key === "ArrowDown" &&
        selectedItem < searchData.length - 1
      ) {
        setSelectedItem((prev) => prev + 1);
      } else if (e.key === "Enter" && selectedItem >= 0) {
        window.open(searchData[selectedItem].url);
      }
    } else {
      setSelectedItem(-1);
    }
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    setSearchData(specialties);
  };

  const handleBlur = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.relatedTarget)) {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <div className="input-wrapper" ref={searchRef}>
      <input
        type="text"
        placeholder="Search doctors, clinics, hospitals, etc."
        value={search}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {showSuggestions && (
        <SearchBarResults searchData={searchData} selectedItem={selectedItem} />
      )}
      {search ? (
        <CloseIcon id="close-icon" onClick={handleClose} />
      ) : (
        <FaSearch id="search-icon" />
      )}
    </div>
  );
};

export default SearchBar;
