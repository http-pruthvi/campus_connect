import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  MoreVertical,
  Download,
  Eye,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AssignmentsPage: React.FC = () => {
  const [assignments] = useState([
    {
      id: "1",
      title: "Data Structures - Assignment 1",
      course: "Computer Science - 2nd Year",
      dueDate: "Oct 25, 2023",
      submissions: 42,
      totalStudents: 50,
      status: "active"
    },
    {
      id: "2",
      title: "Algorithms - Final Project",
      course: "Computer Science - 2nd Year",
      dueDate: "Nov 15, 2023",
      submissions: 15,
      totalStudents: 50,
      status: "active"
    },
    {
      id: "3",
      title: "Operating Systems - Quiz 2",
      course: "Computer Science - 3rd Year",
      dueDate: "Oct 10, 2023",
      submissions: 48,
      totalStudents: 48,
      status: "completed"
    }
  ]);

  const handleCreate = () => {
    toast.info("Create assignment modal would open here.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">Create and manage course assignments and projects.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Assignment
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">12</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Graded</p>
            <p className="text-2xl font-bold">85%</p>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">5</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment, i) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-xl border bg-card p-5 hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">{assignment.title}</h3>
                  <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                    {assignment.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{assignment.course}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due: {assignment.dueDate}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {assignment.submissions}/{assignment.totalStudents} Submitted
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${(assignment.submissions / assignment.totalStudents) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">
                  {Math.round((assignment.submissions / assignment.totalStudents) * 100)}%
                </span>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm" className="h-8 gap-2">
                  <Download className="h-3.5 w-3.5" />
                  Report
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsPage;
