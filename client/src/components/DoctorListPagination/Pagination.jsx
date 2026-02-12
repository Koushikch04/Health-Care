import React, { useEffect } from "react";
import styles from "./Pagination.module.css";

const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}) => {
  const totalPages = Math.ceil(totalPosts / postsPerPage);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) {
      return;
    }
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const totalPageNumbersToShow = 5;
    const currentPageIndex = pageNumbers.indexOf(currentPage);

    let startPage = currentPageIndex - Math.floor(totalPageNumbersToShow / 2);
    let endPage = currentPageIndex + Math.floor(totalPageNumbersToShow / 2);

    if (startPage < 0) {
      startPage = 0;
      endPage = totalPageNumbersToShow - 1;
    }

    if (endPage >= pageNumbers.length) {
      startPage = Math.max(0, pageNumbers.length - totalPageNumbersToShow);
      endPage = pageNumbers.length - 1;
    }

    const displayedPageNumbers = pageNumbers.slice(startPage, endPage + 1);

    return (
      <>
        {startPage > 0 && (
          <>
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              className={styles.pagination_item}
            >
              1
            </button>
            <span className={styles.paginationEllipsis}>...</span>
          </>
        )}
        {displayedPageNumbers.map((number) => (
          <button
            type="button"
            key={number}
            onClick={() => handlePageChange(number)}
            className={`${styles.pagination_item} ${
              number === currentPage ? styles.active : ""
            }`}
          >
            {number}
          </button>
        ))}
        {endPage < pageNumbers.length - 1 && (
          <>
            <span className={styles.paginationEllipsis}>...</span>
            <button
              type="button"
              onClick={() => handlePageChange(pageNumbers.length)}
              className={styles.pagination_item}
            >
              {pageNumbers.length}
            </button>
          </>
        )}
      </>
    );
  };

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.pagination_button}
      >
        &lt;
      </button>
      {renderPageNumbers()}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className={styles.pagination_button}
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
