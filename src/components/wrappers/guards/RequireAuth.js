import { Navigate, useLocation } from "react-router-dom";
/** Guests are sent home and the login modal opens (see Home). */
export default function RequireAuth({ children }) {
  const loc = useLocation();
  return localStorage.getItem("Tkn") ? children : <Navigate to="/" replace state={{ login: true, from: loc.pathname }} />;
}
