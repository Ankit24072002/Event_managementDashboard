import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import socket from "../socket";

function Navbar() {
  const { token, role, name, logout, toggleTheme, theme } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications/unread-count");
        setUnreadCount(res.data.count);
      } catch (err) {
        console.error(err);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 120000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    socket.on("notification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/">🏠 Home</Link>
        {token && <Link to="/dashboard">📊 Dashboard</Link>}
        {token && (
          <Link to="/notifications">
            🔔 Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
        )}
        {token && <Link to="/profile">👤 Profile</Link>}
        {token && role === "organizer" && <Link to="/analytics">📈 Analytics</Link>}
      </div>

      <div className="user-info">
        {/* ✅ THEME TOGGLE */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙" : "☀️"}
        </button>

        {token ? (
          <>
            <span>Hello, {name}!</span>
            {role === "organizer" && <span className="organizer-badge">🎭 Organizer</span>}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;