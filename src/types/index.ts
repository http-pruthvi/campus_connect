import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// User Roles
export type UserRole = "admin" | "hod" | "teacher" | "student";

// Base Firestore Document Interface
export interface BaseDoc {
  id?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// User Profile
export interface UserProfile extends BaseDoc {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  course?: string;
  year?: number;
  rollNo?: string;
  photoURL?: string;
  onboarded: boolean;
  preferences: {
    notifications: boolean;
    theme: "light" | "dark" | "system";
  };
}

// Zod Schema for User Profile (used in onboarding/profile)
export const UserProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  photoURL: z.string().url().optional(),
  department: z.string().optional(),
  course: z.string().optional(),
  year: z.number().int().min(1).max(5).optional(),
  rollNo: z.string().optional(),
});

// Notice
export interface Notice extends BaseDoc {
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  targetAudience: "all" | "department" | "course";
  department?: string;
  course?: string;
  priority: "urgent" | "general" | "event";
  attachmentURL?: string;
}

// Event
export interface CampusEvent extends BaseDoc {
  name: string;
  description: string;
  date: Timestamp;
  venue: string;
  capacity: number;
  registeredCount: number;
  bannerURL?: string;
  createdBy: string;
}

// Registration (Sub-collection under event)
export interface Registration extends BaseDoc {
  uid: string;
  userName: string;
  userEmail: string;
  registeredAt: Timestamp;
  qrCodeURL?: string;
}

// Q&A Question
export interface Question extends BaseDoc {
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  department: string;
  subject: string;
  tags: string[];
  upvotes: string[]; // array of uids
  status: "open" | "answered";
}

// Q&A Answer (Sub-collection under question)
export interface Answer extends BaseDoc {
  body: string;
  authorId: string;
  authorName: string;
  helpful: boolean;
}

// Lost & Found
export interface LostFoundItem extends BaseDoc {
  type: "lost" | "found";
  title: string;
  category: string;
  description: string;
  location: string;
  date: Timestamp;
  imageURL?: string;
  postedBy: string;
  postedByName: string;
  status: "lost" | "found" | "resolved";
}

// Query / Ticket
export interface QueryTicket extends BaseDoc {
  title: string;
  category: "fee" | "academic" | "hostel" | "other";
  description: string;
  studentId: string;
  studentName: string;
  status: "open" | "in-progress" | "resolved";
  assignedTo?: string; // admin/hod id
}

// Query Reply (Sub-collection under query)
export interface QueryReply extends BaseDoc {
  body: string;
  authorId: string;
  authorName: string;
}

// Fee Management
export interface FeeRecord extends BaseDoc {
  studentId: string;
  studentName: string;
  rollNo: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Timestamp;
  transactions: FeeTransaction[];
}

export interface FeeTransaction {
  amount: number;
  date: Timestamp;
  txId: string;
  receiptURL?: string;
}

// Notification
export interface NotificationItem extends BaseDoc {
  type: "notice" | "event" | "query" | "qna";
  message: string;
  link: string;
  read: boolean;
}
