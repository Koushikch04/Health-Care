import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import "./SearchBarResults.css";
import { Opacity } from "@mui/icons-material";

const SearchBarResults = ({ searchData, selectedItem }) => {
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
      {searchData.length > 0 ? (
        searchData.map((data, index) => (
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
        ))
      ) : (
        <div>No results found</div>
      )}
    </div>
  );
};

export default SearchBarResults;
