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
            {rows.map((row, index) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <span className="status">{row.patientName}</span>
                </TableCell>
                <TableCell align="left">
                  {new Date(row.date).toLocaleDateString("en-US")}{" "}
                </TableCell>
                <TableCell align="left">{row.time}</TableCell>
                <TableCell align="left">{row.reasonForVisit}</TableCell>
                <TableCell align="left">
                  <span className="status" style={makeStyle(row.status)}>
                    {row.status}
                  </span>
                </TableCell>
                {/* <TableCell align="left" className="Details">
                  Details
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DynamicTable;
