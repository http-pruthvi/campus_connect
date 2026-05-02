import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("PRIVATE ROUTE USER:", user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const role = user.role?.trim().toLowerCase();

  console.log("ROLE CHECK:", role, allowedRoles);

  if (!allowedRoles.map(r => r.toLowerCase()).includes(role)) {
    return <Navigate to="/home" replace />;
  }
console.log("ALLOWED:", allowedRoles);
console.log("USER ROLE:", role);
console.log("MATCH:", allowedRoles.includes(role));
  return children;
}