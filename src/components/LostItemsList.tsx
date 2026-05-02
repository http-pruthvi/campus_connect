import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Grid, Card, CardMedia, CardContent, Typography, Box, Chip, TextField, MenuItem } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";

const LostItemsList = () => {
  const [lostItems, setLostItems] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const q = query(
      collection(db, "lost_items"),
      orderBy("date_reported", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLostItems(items);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories for filter
  const categories = ["All", ...new Set(lostItems.map(item => item.category).filter(Boolean))];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <TextField
          select
          size="small"
          label="Category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: '150px' }}
        >
          {categories.map(cat => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Box>

      {filteredItems.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          {lostItems.length === 0 ? "No lost items reported yet." : "No items match your filters."}
        </Typography>
      )}
      <Grid container spacing={3}>
        {filteredItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', transition: 'transform 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}>
              {item.imageUrl ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={item.imageUrl}
                  alt={item.title}
                  sx={{ objectFit: "cover" }}
                />
              ) : (
                <Box height="200" bgcolor="#f1f5f9" display="flex" alignItems="center" justifyContent="center">
                  <Typography variant="body2" color="text.secondary">No Image</Typography>
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" fontWeight="bold" component="div">
                    {item.title}
                  </Typography>
                  <Chip label={item.category} size="small" color="error" variant="outlined" />
                </Box>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {item.description}
                </Typography>
                <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                  <LocationOnIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">{item.location}</Typography>
                </Box>
                {item.date_reported?.seconds ? (
                  <Box display="flex" alignItems="center" color="text.secondary">
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="caption">
                      Reported: {new Date(item.date_reported.seconds * 1000).toLocaleDateString()}
                    </Typography>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" color="text.secondary">
                    <EventIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="caption">Reported: Just now</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LostItemsList;
