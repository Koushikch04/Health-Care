import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import "./SearchBarResults.css";

const SearchBarResults = ({ searchData, selectedItem, onItemClick }) => {
  useEffect(() => {
    const sr = ScrollReveal();
    sr.reveal(".results-list a", {
      duration: 500,
      distance: "20px",
      easing: "ease-in-out",
      origin: "bottom",
      interval: 100,
      opacity: 1,
    });
    return () => sr.destroy();
  }, [searchData]);

  return (
    <div className="results-list">
      {searchData.map((data, index) => (
        <a
          href="#"
          key={index}
          className={`search_suggestion_line ${
            selectedItem === index ? "active" : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            onItemClick(data);
          }}
        >
          <span>{data.name}</span>
          <span className="specialty">{data.specialty}</span>
        </a>
      ))}
    </div>
  );
};

export default SearchBarResults;
