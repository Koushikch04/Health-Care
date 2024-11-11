import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import "./Table.css";

// Function to create styles based on the status
const makeStyle = (status) => {
  if (status === "Completed") return { background: "#34eb5c", color: "green" };
  if (status === "Scheduled") return { background: "#FF919D", color: "red" };
  return { background: "#59bfff", color: "white" };
};

const DynamicTable = ({ title, headers, rows }) => {
  return (
    <div className="Table">
      <h3>{title}</h3>
      <TableContainer
        component={Paper}
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
                  {header}
                </TableCell>
              ))}
              <TableCell align="left"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
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
                          {cellValue}
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
                      {typeof cellValue !== "undefined" ? cellValue : ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DynamicTable;
