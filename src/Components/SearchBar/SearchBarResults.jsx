import React, { useEffect } from "react";
import ScrollReveal from "scrollreveal";
import styles from "./SearchBarResults.module.css";

const SearchBarResults = ({ searchData, selectedItem, onItemClick }) => {
  useEffect(() => {
    const sr = ScrollReveal();
    sr.reveal(`.${styles.search_suggestion_line}`, {
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
    <div className={styles.results_list}>
      {searchData.map((data, index) => (
        <a
          href="#"
          key={index}
          className={`${styles.search_suggestion_line} ${
            selectedItem === index ? styles.active : ""
          }`}
          onClick={(e) => {
            e.preventDefault();
            onItemClick(data);
          }}
        >
          <span>{data.name}</span>
          <span className={styles.specialty}>{data.specialty}</span>
        </a>
      ))}
    </div>
  );
};

export default SearchBarResults;
