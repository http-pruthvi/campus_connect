import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import AddQueryForm from "../components/AddQueryForm";
import QueryList from "../components/QueryList";

export default function QueriesPage() {
  const [view, setView] = useState("list"); // 'form' or 'list'

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}>
        <Button
          variant={view === "list" ? "contained" : "outlined"}
          onClick={() => setView("list")}
        >
          View Queries
        </Button>
        <Button
          variant={view === "form" ? "contained" : "outlined"}
          onClick={() => setView("form")}
        >
          Add New Query
        </Button>
      </Box>

      {view === "form" ? <AddQueryForm /> : <QueryList />}
    </Box>
  );
}
