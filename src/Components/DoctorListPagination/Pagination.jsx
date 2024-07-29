import React from "react";
import "./Pagination.css";

const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNumber) => {
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
      startPage = pageNumbers.length - totalPageNumbersToShow;
      endPage = pageNumbers.length - 1;
    }

    const displayedPageNumbers = pageNumbers.slice(startPage, endPage + 1);

    return (
      <>
        {startPage > 0 && (
          <>
            <span
              onClick={() => handlePageChange(1)}
              className="pagination-item"
            >
              1
            </span>
            <span className="pagination-ellipsis">...</span>
          </>
        )}
        {displayedPageNumbers.map((number) => (
          <span
            key={number}
            onClick={() => handlePageChange(number)}
            className={`pagination-item ${
              number === currentPage ? "active" : ""
            }`}
          >
            {number}
          </span>
        ))}
        {endPage < pageNumbers.length - 1 && (
          <>
            <span className="pagination-ellipsis">...</span>
            <span
              onClick={() => handlePageChange(pageNumbers.length)}
              className="pagination-item"
            >
              {pageNumbers.length}
            </span>
          </>
        )}
      </>
    );
  };

  return (
    <div className="pagination">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        &lt;
      </button>
      {renderPageNumbers()}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className="pagination-button"
      >
        &gt;
      </button>
    </div>
  );
};

export default Pagination;
