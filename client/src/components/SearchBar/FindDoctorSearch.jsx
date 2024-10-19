// FindDoctorSearch.js
import React, { useState, useRef, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import CloseIcon from "@mui/icons-material/Close";
import styles from "./FindDoctorSearch.module.css";
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
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1500,
        profile: "Specializes in cosmetic and restorative dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1500,
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1000,
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 500,
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 500,
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 750,
        profile: "Expert in pediatric and general dentistry.",
      },
      {
        name: "Dr. Bob Smith",
        experience: 8,
        rating: 4.5,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1500,
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
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 500,
        profile:
          "Experienced in high-risk pregnancies and gynecological surgeries.",
      },
      {
        name: "Dr. David Wilson",
        experience: 10,
        rating: 4.6,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 2500,
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
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 2000,
        profile:
          "Provides comprehensive care and treatment for common illnesses.",
      },
      {
        name: "Dr. Frank Miller",
        experience: 9,
        rating: 4.4,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1500,
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
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 1000,
        profile: "Expert in skin conditions and cosmetic dermatology.",
      },
      {
        name: "Dr. Henry Martinez",
        experience: 6,
        rating: 4.2,
        image: "/Images/Appointment/DoctorCard/doctor.png",
        cost: 500,
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
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [moveToTop, setMoveToTop] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [filters, setFilters] = useState({
    minExperience: 0,
    minRating: 0,
    maxCost: Infinity,
  });

  const searchRef = useRef(null);

  const handleClose = () => {
    setSearch("");
    setSearchData([]);
    setSelectedItem(-1);
    setShowSuggestions(false);
    setSelectedDoctors([]);
    setShowImage(true);
    setMoveToTop(false);
    setSelectedSpecialty("");
  };

  const handleSpecialtySelect = (specialty) => {
    setSelectedSpecialty(specialty.name);
    const filteredDoctors = filterDoctors(specialty.doctors);
    setSelectedDoctors(filteredDoctors); // Set doctors without filtering here
    setShowSuggestions(false);
    setMoveToTop(true);
    setShowImage(false);
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
        setSelectedSpecialty(selectedSpecialty.name);
        setShowSuggestions(false);
        setShowImage(false);
        setMoveToTop(true);
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

  const filterDoctors = (doctors) => {
    return doctors.filter(
      (doctor) =>
        doctor.experience >= filters.minExperience &&
        doctor.rating >= filters.minRating &&
        doctor.cost <= filters.maxCost
    );
  };

  const applyFilters = () => {
    if (selectedSpecialty) {
      const specialty = specialties.find(
        (spec) => spec.name === selectedSpecialty
      );
      const filteredDoctors = filterDoctors(specialty.doctors);
      setSelectedDoctors(filteredDoctors);
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
    <div className={styles.doctorSearch}>
      {showImage && (
        <div className={styles.image}>
          <img src="/Images/Appointment/doctorSearch.png" alt="Banner" />
        </div>
      )}
      <div
        className={`${styles.input_wrapper} ${moveToTop ? "move-to-top" : ""}`}
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
            onItemClick={handleSpecialtySelect}
          />
        )}
        {search ? (
          <CloseIcon id="close-icon" onClick={handleClose} />
        ) : (
          <FaSearch id="search-icon" />
        )}
      </div>
      {!showImage && (
        <div className={styles.filterSection}>
          <label>Min Experience:</label>
          <input
            type="number"
            min="0"
            onChange={(e) =>
              setFilters({ ...filters, minExperience: e.target.value })
            }
          />

          <label>Min Rating:</label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            onChange={(e) =>
              setFilters({ ...filters, minRating: e.target.value })
            }
          />

          <label>Max Cost:</label>
          <input
            type="number"
            min="0"
            step="100"
            onChange={(e) =>
              setFilters({ ...filters, maxCost: e.target.value })
            }
          />

          <button className={styles.applyFiltersButton} onClick={applyFilters}>
            Apply Filters
          </button>
        </div>
      )}

      {selectedDoctors.length > 0 && (
        <div className={styles.availableDoctors}>
          <AvailableDoctors
            doctorData={selectedDoctors}
            selectedSpecialty={selectedSpecialty}
          />
        </div>
      )}
    </div>
  );
};

export default FindDoctorSearch;
