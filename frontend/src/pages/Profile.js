import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import "./Profile.css";

function Profile() {
  const { role, userId, name, logout } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: name || "" });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const regRes = await api.get("/registrations/mine");
      // Fetch event details for each registration
      const eventPromises = regRes.data.map(reg => 
        api.get(`/events/${reg.event}`)
      );
      const eventResponses = await Promise.all(eventPromises);
      const registrationsWithEvents = regRes.data.map((reg, index) => ({
        ...reg,
        event: eventResponses[index].data
      }));
      setRegistrations(registrationsWithEvents);

      if (role === "organizer") {
        const eventsRes = await api.get("/events");
        setMyEvents(eventsRes.data.filter(e => e.createdBy === userId));
      }
    } catch (err) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.put("/auth/profile", formData);
      toast.success("Profile updated!");
      setEditing(false);
      localStorage.setItem("name", formData.name);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const exportToCSV = () => {
    const data = registrations.map(reg => ({
      Event: reg.event?.title || "Unknown",
      Date: reg.event?.date ? new Date(reg.event.date).toLocaleDateString() : "N/A",
      Location: reg.event?.location || "N/A",
      Registered: new Date(reg.createdAt).toLocaleDateString()
    }));

    const csv = [
      ["Event", "Date", "Location", "Registered"],
      ...data.map(row => Object.values(row))
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-registrations.csv";
    a.click();
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          {editing ? (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
              <div className="edit-actions">
                <button type="submit" className="btn-save">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="btn-cancel">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h2>{name}</h2>
              <span className="role-badge">{role}</span>
              <button onClick={() => setEditing(true)} className="btn-edit">Edit Profile</button>
            </>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{registrations.length}</span>
          <span className="stat-label">Events Joined</span>
        </div>
        {role === "organizer" && (
          <div className="stat-card">
            <span className="stat-number">{myEvents.length}</span>
            <span className="stat-label">Events Created</span>
          </div>
        )}
      </div>

      {registrations.length > 0 && (
        <div className="profile-section">
          <div className="section-header">
            <h3>My Registrations</h3>
            <button onClick={exportToCSV} className="btn-export">Export CSV</button>
          </div>
          <div className="registrations-list">
            {registrations.map((reg) => (
              <div key={reg._id} className="registration-card">
                <div className="reg-event-info">
                  <h4>{reg.event?.title}</h4>
                  <p>{reg.event?.location} • {reg.event?.date && new Date(reg.event.date).toLocaleDateString()}</p>
                </div>
                <span className="reg-date">
                  Registered on {new Date(reg.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === "organizer" && myEvents.length > 0 && (
        <div className="profile-section">
          <h3>My Created Events</h3>
          <div className="my-events-list">
            {myEvents.map((event) => (
              <div key={event._id} className="my-event-card">
                <div className="event-info">
                  <h4>{event.title}</h4>
                  <p>{event.location} • {new Date(event.date).toLocaleDateString()}</p>
                </div>
                <div className="event-stats">
                  <span>{event.registrationsCount || 0} / {event.capacity} spots</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={logout} className="btn-logout">Logout</button>
    </div>
  );
}

export default Profile;