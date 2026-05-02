// src/pages/LostFoundPage.jsx
import React, { useState } from "react";
import { Tabs, Tab, Box, Container, Typography, Paper } from "@mui/material";
import LostItemForm from "../components/LostItemForm";
import LostItemsList from "../components/LostItemsList";
import FoundItemForm from "../components/FoundItemForm";
import FoundItemsList from "../components/FoundItemsList";
import "../styles/Home.css";

const LostFoundPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }} className="fade-in">
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold", background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="slide-down">
        Lost & Found Portal
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', overflow: 'hidden' }} className="slide-up delay-1">
        <Tabs
          value={tabValue}
          onChange={handleChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTabs-flexContainer': { gap: 2, p: 1 } }}
        >
        <Tab label="Lost Items" />
        <Tab label="Found Items" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <Box className="slide-up delay-2">
        {tabValue === 0 && (
          <Box>
            <LostItemForm />
            <Box mt={4}>
              <LostItemsList />
            </Box>
          </Box>
        )}
        {tabValue === 1 && (
          <Box>
            <FoundItemForm />
            <Box mt={4}>
              <FoundItemsList />
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default LostFoundPage;
