import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Box, Typography, CircularProgress } from "@mui/material";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
}

interface ReusableTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  emptyMessage?: string;
  stickyHeader?: boolean;
  maxHeight?: number | "auto";
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  stickyHeader = false,
  maxHeight = 400
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: maxHeight === "auto" ? "none" : maxHeight,
          boxShadow: "none",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          width: "100%",
          overflow: "hidden"
        }}
      >
        <Table 
          stickyHeader={stickyHeader} 
          sx={{ 
            minWidth: { xs: "100%", sm: 650 },
            width: "100%",
            "& .MuiTableCell-root": {
              padding: { xs: "8px 12px", sm: "12px 16px" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }
          }} 
          aria-label="data table"
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{ 
                    minWidth: { xs: "auto", sm: column.minWidth },
                    backgroundColor: "#f8f9fa",
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    padding: { xs: "8px 12px", sm: "12px 16px" }
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ 
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:nth-of-type(odd)": {
                      backgroundColor: "#f9f9f9",
                    },
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    }
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell 
                        key={column.id} 
                        align={column.align}
                        sx={{ 
                          padding: { xs: "8px 12px", sm: "12px 16px" },
                          borderBottom: "1px solid #e0e0e0",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          wordBreak: "break-word",
                          maxWidth: { xs: "150px", sm: "none" },
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReusableTable;
