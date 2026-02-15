import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Table.css";
import TableSpinner from "../Spinners/TableSpinner";
import Pagination from "../DoctorListPagination/Pagination";

// Function to create styles based on the status
const makeStyle = (status) => {
  const normalizedStatus = String(status).toLowerCase();
  if (normalizedStatus === "completed") {
    return { background: "rgb(145 254 159 / 47%)", color: "green" };
  }
  if (normalizedStatus === "scheduled") {
    return { background: "#59bfff", color: "white" };
  }
  if (normalizedStatus === "rescheduled") {
    return { background: "#ffe59a", color: "#7a5a00" };
  }
  if (normalizedStatus === "canceled" || normalizedStatus === "cancelled") {
    return { background: "#ffadad8f", color: "#b3261e" };
  }
  if (normalizedStatus === "expired") {
    return { background: "#e4e8ef", color: "#4c576a" };
  }
  return { background: "#eef2f9", color: "#3f4b63" };
};

const formatStatusLabel = (status) => {
  const normalized = String(status).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
const formatString = (str) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (match) => match.toUpperCase());
};

const DynamicTable = ({
  title,
  headers,
  rows,
  loading = true,
  emptyMessage = "No records found.",
  rowsPerPage = 5,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const paginatedRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="Table">
      <h3 className="tableTitle">{title}</h3>
      <div className="tableBodyShell">
        {loading ? (
          <div className="tableState">
            <TableSpinner />
          </div>
        ) : (
          <TableContainer
            component={Paper}
            className="tablePaper"
            style={{ boxShadow: "0px 13px 20px 0px #80808029" }}
          >
            <Table sx={{ minWidth: 200 }} aria-label="dynamic table">
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableCell
                      key={index}
                      align="left"
                      style={{ fontWeight: "bold" }}
                    >
                      {formatString(header)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell align="center" colSpan={headers.length}>
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row, rowIndex) => (
                    <TableRow
                      key={`${indexOfFirstRow + rowIndex}`}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      {headers.map((header, headerIndex) => {
                        // Access the dynamic value from the row based on header name
                        const cellValue = row[header]; // Dynamically get value from row

                        // Special handling for 'Status' column
                        if (header.toLowerCase() === "status" && cellValue) {
                          return (
                            <TableCell key={headerIndex} align="left">
                              <span className="status" style={makeStyle(cellValue)}>
                                {formatStatusLabel(cellValue)}
                              </span>
                            </TableCell>
                          );
                        }

                        // Special handling for 'Date' column
                        if (header.toLowerCase() === "date" && cellValue) {
                          return (
                            <TableCell key={headerIndex} align="left">
                              {new Date(cellValue).toLocaleDateString("en-US")}
                            </TableCell>
                          );
                        }

                        // For other columns, just display the value
                        return (
                          <TableCell key={headerIndex} align="left">
                            {typeof cellValue !== "undefined"
                              ? cellValue === ""
                                ? "-"
                                : cellValue
                              : ""}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
      {!loading && (
        <Pagination
          totalPosts={rows.length}
          postsPerPage={rowsPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

export default DynamicTable;
