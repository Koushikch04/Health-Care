import React, { useState } from "react";
import styles from "./SearchBar.module.css";

const SearchBar = ({ searchTable }) => {
  const [searchValue, setSearchValue] = useState("");
  const submitForm = (e) => {
    e.preventDefault();
    searchTable(searchValue);
  };
  return (
    <div className={styles.searchBar}>
      <form onSubmit={submitForm}>
        <input
          type="text"
          placeholder="Search by Name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </form>
    </div>
  );
};

export default SearchBar;
