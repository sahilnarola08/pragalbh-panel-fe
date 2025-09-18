"use client";
import * as React from "react";
import { Box, Typography, TextField, Button, Card, CardContent, Stack, TablePagination, Chip } from "@mui/material";
import { Search as SearchIcon, Add as AddIcon } from "@mui/icons-material";
import ReusableTable from "../../../components/atoms/ReusableTable";
import { useState, useEffect } from "react";
import { getProductList } from "@/apiStore/api";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  category: string;
  productName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // TablePagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();

  const columns = [
    { id: "_id", label: "Product ID", minWidth: 120 },
    { id: "productName", label: "Product Name", minWidth: 200 },
    { id: "category", label: "Category", minWidth: 150 },
    { id: "createdAt", label: "Created Date", minWidth: 120, align: "left" as const },
    { id: "updatedAt", label: "Updated Date", minWidth: 120, align: "left" as const },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1, 
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await getProductList(params);
      if (response.status === 200) {
        setProducts(response.data.products || []);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, rowsPerPage]);

  // Add debouncing for search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        setPage(0);
        fetchProducts();
      } else if (searchTerm === "") {
        setPage(0);
        fetchProducts();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = () => {
    setPage(0); 
    fetchProducts();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductId = (id: string) => {
    return id.slice(-6).toUpperCase(); // Show last 6 characters as product ID
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Electronics': '#3b82f6',
      'Books & Media': '#10b981',
      'Toys & Games': '#f59e0b',
      'jewellery': '#ef4444',
      'bueaty': '#8b5cf6',
      'cotton': '#06b6d4',
      'Electronicss': '#3b82f6',
      'default': '#6b7280'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <Card sx={{ mb: 3, boxShadow: "none", border: "1px solid #e0e0e0", width: "100%" }}>
        <CardContent sx={{ padding: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: { xs: "flex-start", sm: "center" }, 
            mb: 2, 
            gap: 1,
            flexDirection: { xs: "column", sm: "row" }
          }}>
            <Typography variant="h5" component="h5" sx={{ fontWeight: 600, color: "#1a1a1a", mb: { xs: 2, sm: 0 } }}>
              Product List
            </Typography>
            <Button
              onClick={() => {
                router.push("/product/add-product");
              }}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: "#3b82f6",
                "&:hover": { backgroundColor: "#2563eb" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                width: { xs: "100%", sm: "auto" }
              }}
            >
              Add Product
            </Button>
          </Box>

          {/* Search Section - Mobile Optimized */}
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" }, 
            gap: 2, 
            mb: 3,
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: { xs: "stretch", sm: "flex-end" }
          }}>
            <Box sx={{ 
              display: "flex", 
              gap: 1, 
              alignItems: "center",
              width: { xs: "100%", sm: "auto" }
            }}>
              <TextField
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "#9ca3af", mr: 0.5 }} />
                }}
                sx={{
                  flex: 1,
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
                    padding: "8px 50px 8px 2px ",
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
                  padding: "8px 16px",
                  minWidth: "80px",
                  height: "36px",
                  fontSize: "13px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                  transition: "all 0.2s ease-in-out",
                  display: { xs: "none", sm: "block" }
                }}
              >
                Search
              </Button>
            </Box>
          </Box>

          <Box sx={{ width: "100%", overflow: "hidden" }}>
            <ReusableTable
              columns={columns}
              data={products.map(product => ({
                ...product,
                _id: getProductId(product._id),
                category: (
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(product.category),
                      color: 'white',
                      fontWeight: 500,
                      fontSize: '0.75rem'
                    }}
                  />
                ),
                createdAt: formatDate(product.createdAt),
                updatedAt: formatDate(product.updatedAt)
              }))}
              loading={loading}
              emptyMessage="No products found"
              stickyHeader={false}
              maxHeight="auto"
            />
          </Box>

          {/* TablePagination - Desktop Right Aligned */}
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
              width: "100%",
              overflow: "hidden",
              "& .MuiTablePagination-toolbar": {
                minHeight: "52px",
                alignItems: "center",
                justifyContent: { xs: "center", sm: "flex-end" },
                flexWrap: "nowrap",
                gap: "2px",
              },
              "& .MuiTablePagination-selectLabel": {
                margin:0,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                color: "#374151",
                fontWeight: 500,
                whiteSpace: "nowrap",
              },
              "& .MuiTablePagination-select": {
                marginRight: "15px",
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                "& .MuiSelect-select": {
                  padding: "4px 8px",
                }
              },
              "& .MuiTablePagination-displayedRows": {
                marginBottom: 0,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                color: "#374151",
                fontWeight: 500,
                whiteSpace: "nowrap",
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
                display: "none",
              }
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProductList;
