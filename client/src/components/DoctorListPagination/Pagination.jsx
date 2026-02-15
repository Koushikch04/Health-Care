import React, { useEffect } from "react";
import styles from "./Pagination.module.css";

const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}) => {
  const safePostsPerPage = Math.max(1, postsPerPage || 1);
  const totalPages = Math.max(1, Math.ceil(totalPosts / safePostsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      return;
    }

    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const startItem =
    totalPosts === 0 ? 0 : (currentPage - 1) * safePostsPerPage + 1;
  const endItem = Math.min(currentPage * safePostsPerPage, totalPosts);

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
            aria-current={number === currentPage ? "page" : undefined}
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
      <p className={styles.paginationMeta}>
        Showing {startItem}-{endItem} of {totalPosts}
      </p>
      <div className={styles.paginationControls}>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={styles.pagination_button}
          aria-label="Previous page"
        >
          &lt;
        </button>
        {renderPageNumbers()}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={styles.pagination_button}
          aria-label="Next page"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Pagination;
