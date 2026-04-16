import { useEffect, useState } from "react";
import api from "../api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (err) {
        setError("Unable to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => {
        const updated = prev.map((note) => (note._id === id ? { ...note, read: true } : note));
        const unreadCount = updated.filter((note) => !note.read).length;
        window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: unreadCount }));
        return updated;
      });
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((note) => ({ ...note, read: true })));
      window.dispatchEvent(new CustomEvent("notificationsUpdated", { detail: 0 }));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) return <div className="loading">Loading notifications...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>🔔 Notifications</h1>
          <p>Stay informed about new events and registration updates</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <h3>No notifications yet</h3>
          <p>You'll see alerts for new events and registrations here.</p>
        </div>
      ) : (
        notifications.map((notification) => (
          <div key={notification._id} className={`card ${notification.read ? "read-notification" : ""}`}>
            <div className="notification-header">
              <h3>{notification.read ? "Read" : "New"}</h3>
              <span>{new Date(notification.createdAt).toLocaleString()}</span>
            </div>
            <p>{notification.message}</p>
            {!notification.read && (
              <button className="btn btn-secondary" onClick={() => markAsRead(notification._id)}>
                Mark as read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
