import React from "react";
import "./SearchBarResults.css";

const SearchBarResults = ({ searchData, selectedItem }) => {
  return (
    <div className="results-list">
      {searchData.map((data, index) => (
        <a
          href={data.url}
          key={index}
          target="_blank"
          className={`search_suggestion_line ${
            selectedItem === index ? "active" : ""
          }`}
          onMouseDown={(e) => e.preventDefault()}
        >
          <span>{data.name}</span>
          <span className="specialty">{data.specialty}</span>
        </a>
      ))}
    </div>
  );
};

export default SearchBarResults;
