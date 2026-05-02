# 🎓 Campus Connect

**Elevating College/University Management with a Unified Digital Ecosystem.**

Campus Connect is a comprehensive, multi-role web platform designed to streamline academic administration, enhance student engagement, and simplify campus utility services. Built with a modern tech stack, it provides a seamless experience for students, faculty, and administrators.

---

## 🚀 Key Features

### 🔐 Multi-Role Dashboards
Tailored experiences for different user groups, ensuring relevant access and tools:
- **Admin**: Oversight of all users, site settings, and core data.
- **HOD (Head of Department)**: Department-specific management and faculty oversight.
- **Teacher**: Course management, student tracking, and mentorship.
- **Student**: Fee payments, notice board, event registration, and more.

### 📅 Academic & Social Hub
- **Dynamic Notice Board**: Stay updated with real-time university announcements.
- **Event Management**: Create, manage, and register for campus events with ease.
- **Mentorship & Guidance**: A dedicated Q&A portal where students can seek advice and faculty can provide expert guidance.

### 🛠️ Utility Services
- **Lost & Found**: A centralized portal to report and claim lost items on campus with image upload support.
- **Query Resolution**: Dedicated system for students to submit and track administrative queries.

### 💳 Finance Management
- **Fee Tracking**: Real-time tracking of paid, pending, and remaining university fees.
- **Official Receipt Generation**: Generate professional, electronically-signed PDF receipts for every transaction using `jsPDF` and `AutoTable`.

---

## 🛠️ Tech Stack

- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Material UI (MUI)](https://mui.com/)
- **Backend/Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Utilities**: 
  - [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) (PDF Generation)
  - [EmailJS](https://www.emailjs.com/) (Notification Services)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/http-pruthvi/campus_connect.git
   cd campus-connect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   Update the Firebase configuration in `src/firebase.ts` or create a `.env` file:
   ```env
   VITE_FIREBASE_API_KEY="YOUR_API_KEY"
   VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
   VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
   VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
   VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
   VITE_FIREBASE_APP_ID="YOUR_APP_ID"
   VITE_FIREBASE_MEASUREMENT_ID="YOUR_MEASUREMENT_ID"
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
campus-connect/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page-level components (Dashboards, Home, etc.)
│   ├── context/         # Auth and Global State
│   ├── utils/           # Helper functions (PDF generators, etc.)
│   ├── firebase.ts      # Firebase initialization
│   ├── theme.ts         # MUI theme configuration
│   └── App.tsx          # Main application routing
├── package.json         # Project dependencies
└── vite.config.ts       # Vite configuration
```

---

## 📜 License

This project is developed as part of **MiniProject-1**. All rights reserved.

---

**Developed with ❤️ for a Smarter Campus.**
