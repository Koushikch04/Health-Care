import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import "./FindDoctorSearch.css";
import SearchBarResults from "./SearchBarResults";
import AvailableDoctors from "../DoctorListPagination/AvailableDoctors";

const specialties = [
  {
    name: "Dentist",
    url: "#",
    specialty: "Dental Care",
    doctors: [
      {
        name: "Dr. Alice Johnson",
        experience: 12,
        rating: 4.7,
        image: "https://example.com/images/alice.jpg",
        profile: "Specializes in cosmetic and restorative dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "https://example.com/images/bob.jpg",
        profile: "Expert in pediatric and general dentistry.",
      },
    ],
  },
  {
    name: "Gynecologist/Obstetrician",
    url: "#",
    specialty: "Women's Health",
    doctors: [
      {
        name: "Dr. Carol Brown",
        experience: 15,
        rating: 4.9,
        image: "https://example.com/images/carol.jpg",
        profile:
          "Experienced in high-risk pregnancies and gynecological surgeries.",
      },
      {
        name: "Dr. David Wilson",
        experience: 10,
        rating: 4.6,
        image: "https://example.com/images/david.jpg",
        profile: "Focuses on women's reproductive health and menopause.",
      },
    ],
  },
  {
    name: "General Physician",
    url: "#",
    specialty: "Primary Care",
    doctors: [
      {
        name: "Dr. Emily Davis",
        experience: 7,
        rating: 4.3,
        image: "https://example.com/images/emily.jpg",
        profile:
          "Provides comprehensive care and treatment for common illnesses.",
      },
      {
        name: "Dr. Frank Miller",
        experience: 9,
        rating: 4.4,
        image: "https://example.com/images/frank.jpg",
        profile:
          "Specializes in preventive medicine and chronic disease management.",
      },
    ],
  },
  {
    name: "Dermatologist",
    url: "#",
    specialty: "Skin Care",
    doctors: [
      {
        name: "Dr. Grace Lee",
        experience: 11,
        rating: 4.8,
        image: "https://example.com/images/grace.jpg",
        profile: "Expert in skin conditions and cosmetic dermatology.",
      },
      {
        name: "Dr. Henry Martinez",
        experience: 6,
        rating: 4.2,
        image: "https://example.com/images/henry.jpg",
        profile: "Specializes in acne treatment and skin cancer screenings.",
      },
    ],
  },
];

const FindDoctorSearch = () => {
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [moveToTop, setMoveToTop] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const searchRef = useRef(null);

  const handleClose = () => {
    setSearch("");
    setSearchData([]);
    setSelectedItem(-1);
    setShowSuggestions(false);
    setSelectedDoctors([]);
    setShowImage(true);
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
        const selectedSpecialty = searchData[selectedItem];
        setSelectedDoctors(selectedSpecialty.doctors);
        setShowSuggestions(false);
        setShowImage(false);
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
    <div className="doctorSearch">
      {showImage && (
        <div className="image">
          <img src="/Images/LandingPage/single_doctor.jpg" alt="Banner" />
        </div>
      )}
      <div
        className={`input-wrapper ${moveToTop ? "move-to-top" : ""}`}
        ref={searchRef}
      >
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
          <SearchBarResults
            searchData={searchData}
            selectedItem={selectedItem}
            onItemClick={(item) => {
              setSelectedDoctors(item.doctors);
              setShowSuggestions(false);
              setMoveToTop(true);
              setShowImage(false);
            }}
          />
        )}
        {search ? (
          <CloseIcon id="close-icon" onClick={handleClose} />
        ) : (
          <FaSearch id="search-icon" />
        )}
      </div>
      {selectedDoctors.length > 0 && (
        <div className="availableDoctors">
          <AvailableDoctors doctorData={selectedDoctors} />
        </div>
      )}
    </div>
  );
};

export default FindDoctorSearch;
