import React, { useState } from "react";
import { Button, Box, Container, Typography, Paper, Tabs, Tab } from "@mui/material";
import AddQueryForm from "../../components/AddQueryForm";
import QueryList from "../../components/QueryList";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';

export default function QueriesPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} className="fade-in">
      <Box sx={{ mb: 4, textAlign: 'center' }} className="slide-down">
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>
          Student Support & Queries
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Need help? Submit a query or check the status of your existing requests.
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 3, 
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden'
        }}
        className="slide-up delay-1"
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          centered
          sx={{
            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTab-root': { py: 2, fontWeight: 700, fontSize: '0.95rem' }
          }}
        >
          <Tab icon={<ListAltIcon sx={{ mr: 1 }} />} iconPosition="start" label="All Queries" />
          <Tab icon={<HelpOutlineIcon sx={{ mr: 1 }} />} iconPosition="start" label="Submit New Query" />
        </Tabs>
      </Paper>

      <Box className="slide-up delay-2">
        {tabValue === 0 ? (
          <QueryList />
        ) : (
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>
            <AddQueryForm onQueryAdded={() => setTabValue(0)} />
          </Paper>
        )}
      </Box>
    </Container>
  );
}
