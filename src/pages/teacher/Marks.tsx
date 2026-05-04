import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Search, 
  Save, 
  Download, 
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MarksPage: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState("Mid-Term 2023");
  const [search, setSearch] = useState("");

  const [students, setStudents] = useState([
    { id: "1", name: "Alice Johnson", rollNo: "CS201", marks: "85", total: "100" },
    { id: "2", name: "Bob Smith", rollNo: "CS202", marks: "78", total: "100" },
    { id: "3", name: "Charlie Davis", rollNo: "CS203", marks: "92", total: "100" },
    { id: "4", name: "Diana Prince", rollNo: "CS204", marks: "65", total: "100" },
    { id: "5", name: "Ethan Hunt", rollNo: "CS205", marks: "88", total: "100" },
  ]);

  const handleMarkChange = (id: string, value: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, marks: value } : s
    ));
  };

  const handleSave = () => {
    toast.success("Marks updated successfully!");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  const average = Math.round(
    students.reduce((acc, s) => acc + parseInt(s.marks || "0"), 0) / students.length
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Examination Marks</h1>
          <p className="text-muted-foreground mt-1">Enter and manage student performance results.</p>
        </motion.div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-4">Exam Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Select Exam</label>
                <select 
                  className="w-full bg-background border rounded-md p-2 text-sm"
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                >
                  <option>Mid-Term 2023</option>
                  <option>End-Term 2023</option>
                  <option>Quiz 1</option>
                  <option>Internal Assessment</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Max Marks</label>
                <Input value="100" disabled className="h-8 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-4">Class Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Highest
                </div>
                <span className="font-bold">92%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Average
                </div>
                <span className="font-bold">{average}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search student..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 transition-colors">
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
                  <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Roll No</th>
                  <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground w-32">Marks</th>
                  <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{student.name}</td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{student.rollNo}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Input 
                          value={student.marks} 
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-16 h-8 text-center font-bold"
                        />
                        <span className="text-muted-foreground">/ {student.total}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Badge variant={parseInt(student.marks) >= 35 ? "secondary" : "destructive"}>
                        {parseInt(student.marks) >= 35 ? "Pass" : "Fail"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarksPage;
