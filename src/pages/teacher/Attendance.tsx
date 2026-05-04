import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  XCircle, 
  Search,
  Filter,
  UserCheck,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AttendancePage: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState("CS - 2nd Year");
  const [search, setSearch] = useState("");
  
  // Placeholder student list - will be fetched from Firestore in production
  const [students, setStudents] = useState([
    { id: "1", name: "Alice Johnson", rollNo: "CS201", status: "present" },
    { id: "2", name: "Bob Smith", rollNo: "CS202", status: "present" },
    { id: "3", name: "Charlie Davis", rollNo: "CS203", status: "absent" },
    { id: "4", name: "Diana Prince", rollNo: "CS204", status: "present" },
    { id: "5", name: "Ethan Hunt", rollNo: "CS205", status: "present" },
  ]);

  const toggleStatus = (id: string) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === "present" ? "absent" : "present" } : s
    ));
  };

  const handleSave = () => {
    toast.success("Attendance saved successfully!");
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold tracking-tight">Mark Attendance</h1>
          <p className="text-muted-foreground mt-1">Manage daily attendance for your assigned classes.</p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {new Date().toLocaleDateString()}
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Attendance
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Class
            </h3>
            <div className="space-y-2">
              {["CS - 1st Year", "CS - 2nd Year", "CS - 3rd Year"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedClass === cls 
                      ? "bg-primary text-primary-foreground font-medium" 
                      : "hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="text-sm font-semibold mb-2">Summary</h3>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Present</span>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {students.filter(s => s.status === "present").length}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Absent</span>
                <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/20">
                  {students.filter(s => s.status === "absent").length}
                </Badge>
              </div>
              <div className="pt-3 border-t flex justify-between items-center text-sm font-medium">
                <span>Total</span>
                <span>{students.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="md:col-span-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or roll number..." 
              className="pl-9 bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 transition-colors">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Roll No</th>
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Student Name</th>
                    <th className="h-10 px-4 text-center align-middle font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono text-xs">{student.rollNo}</td>
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={student.status === "present" ? "default" : "outline"}
                            className={`h-8 gap-1.5 ${student.status === "present" ? "bg-green-600 hover:bg-green-500" : ""}`}
                            onClick={() => toggleStatus(student.id)}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === "absent" ? "destructive" : "outline"}
                            className="h-8 gap-1.5"
                            onClick={() => toggleStatus(student.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Absent
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
