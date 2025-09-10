"use client";
import * as React from "react";
import { Box, Typography, TextField, Button, Card, CardContent, Stack, TablePagination, Chip } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import ReusableTable from "../../../components/atoms/ReusableTable";
import { useState, useEffect } from "react";
import { getCustomerList } from "@/apiStore/api";

interface Customer {
  id: string;
  fullName: string;
  email: string;
  contactNumber: string;
  address: string;
}

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // TablePagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    { id: "fullName", label: "Customer Name", minWidth: 150 },
    { id: "email", label: "Email", minWidth: 200 },
    { id: "contactNumber", label: "Phone", minWidth: 120 },
    { id: "address", label: "Address", minWidth: 200, align: "left" as const },
  ];
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1, 
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await getCustomerList(params);
      if (response.status === 200) {
        setCustomers(response.data.users);
        setTotalCount(response.data.totalUsers);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, rowsPerPage]);

  // Add debouncing for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setPage(0);
        fetchCustomers();
      } else if (searchTerm === "") {
        setPage(0);
        fetchCustomers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = () => {
    setPage(0); 
    fetchCustomers();
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box >
      <Card sx={{ mb: 3, boxShadow: "none", border: "1px solid #e0e0e0" }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 1 }}>
            <Typography variant="h5" component="h5" sx={{ fontWeight: 600, color: "#1a1a1a" }}>
              Customer List
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": { backgroundColor: "#2563eb" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500
              }}
            >
              Add Customer
            </Button>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mb: 3, justifyContent: "flex-end", alignItems: "center" }}>
            <TextField
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#9ca3af", mr: 1 }} />
              }}
              sx={{
                width: "250px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                  height: "36px",
                  "&:hover fieldset": {
                    borderColor: "#3b82f6"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                    borderWidth: "2px"
                  }
                },
                "& .MuiInputBase-input": {
                  padding: "8px 12px",
                  fontSize: "13px"
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                backgroundColor: "#10b981",
                "&:hover": { 
                  backgroundColor: "#059669",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
                },
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: 600,
                padding: "8px 20px",
                minWidth: "80px",
                height: "36px",
                fontSize: "13px",
                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                transition: "all 0.2s ease-in-out"
              }}
            >
              Search
            </Button>
          </Stack>

          <ReusableTable
            columns={columns}
            data={customers}
            loading={loading}
            emptyMessage="No customers found"
            stickyHeader={true}
            maxHeight={600}
          />

          {/* TablePagination */}
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            sx={{
              border: "1px solid #e0e0e0",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              backgroundColor: "#ffffff",
              "& .MuiTablePagination-toolbar": {
                paddingLeft: "16px",
                paddingRight: "16px",
                minHeight: "52px",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "nowrap",
              },
              "& .MuiTablePagination-selectLabel": {
                marginBottom: 0,
                marginRight: "8px",
                fontSize: "0.875rem",
                color: "#374151",
                fontWeight: 500,
              },
              "& .MuiTablePagination-select": {
                marginLeft: "8px",
                marginRight: "24px",
                fontSize: "0.875rem",
                "& .MuiSelect-select": {
                  padding: "4px 8px",
                }
              },
              "& .MuiTablePagination-displayedRows": {
                marginBottom: 0,
                fontSize: "0.875rem",
                color: "#374151",
                fontWeight: 500,
              },
              "& .MuiTablePagination-actions": {
                marginLeft: "16px",
                "& .MuiIconButton-root": {
                  padding: "8px",
                  "&:disabled": {
                    color: "#d1d5db",
                  },
                  "&:not(:disabled)": {
                    color: "#374151",
                    "&:hover": {
                      backgroundColor: "#f3f4f6",
                    }
                  }
                }
              },
              "& .MuiTablePagination-spacer": {
                flex: "1 1 100%",
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerList;
