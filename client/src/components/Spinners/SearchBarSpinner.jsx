import React from "react";
import styles from "./SearchBarSpinner.module.css";

const SearchBarSpinner = () => {
  return (
    <div className={styles.searchBarSpinner}>
      <span class={styles.loader}></span>
    </div>
  );
};

export default SearchBarSpinner;
