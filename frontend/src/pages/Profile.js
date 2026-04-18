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

  const [formData, setFormData] = useState({
    name: name || "",
    bio: "",
    profilePic: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const regRes = await api.get("/registrations/mine");

      const eventPromises = regRes.data.map((reg) =>
        api.get(`/events/${reg.event}`)
      );

      const eventResponses = await Promise.all(eventPromises);

      const registrationsWithEvents = regRes.data.map((reg, index) => ({
        ...reg,
        event: eventResponses[index].data,
      }));

      setRegistrations(registrationsWithEvents);

      if (role === "organizer") {
        const eventsRes = await api.get("/events");
        setMyEvents(
          eventsRes.data.filter((e) => e.createdBy === userId)
        );
      }
    } catch (err) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // IMAGE UPLOAD
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  // UPDATE PROFILE
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("bio", formData.bio);

      if (formData.profilePic) {
        data.append("profilePic", formData.profilePic);
      }

      await api.put("/auth/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated!");
      setEditing(false);
      localStorage.setItem("name", formData.name);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">

      {/* COVER */}
      <div className="profile-cover"></div>

      {/* PROFILE CARD */}
      <div className="profile-card">

        {/* AVATAR */}
        <div className="avatar-wrapper">
          {preview ? (
            <img src={preview} alt="profile" />
          ) : (
            <div className="avatar-fallback">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}

          {editing && (
            <label className="upload-btn">
              Change
              <input type="file" onChange={handleImageChange} hidden />
            </label>
          )}
        </div>

        {/* INFO */}
        <div className="profile-info">
          {editing ? (
            <form onSubmit={handleUpdateProfile}>

              <input
                className="input"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <textarea
                className="textarea"
                placeholder="Write your bio..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
              />

              <div className="btn-group">
                <button className="btn save">Save</button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn cancel"
                >
                  Cancel
                </button>
              </div>

            </form>
          ) : (
            <>
              <h2>{name}</h2>
              <span className="badge">{role}</span>

              <button className="btn edit" onClick={() => setEditing(true)}>
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>

      {/* PROGRESS */}
      <div className="progress-card">
        <p>Profile Activity</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(registrations.length * 20, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* STATS */}
      <div className="profile-stats">
        <div className="stat-card glow">
          <h2>{registrations.length}</h2>
          <p>Events Joined</p>
        </div>

        {role === "organizer" && (
          <div className="stat-card glow">
            <h2>{myEvents.length}</h2>
            <p>Events Created</p>
          </div>
        )}
      </div>

      {/* TIMELINE */}
      <div className="profile-section">
        <h3>My Activity</h3>

        {registrations.map((reg) => (
          <div key={reg._id} className="timeline-item">
            <h4>{reg.event?.title}</h4>
            <p>{reg.event?.location}</p>
          </div>
        ))}
      </div>

      {/* LOGOUT */}
      <button onClick={logout} className="btn-logout">
        Logout
      </button>
    </div>
  );
}

export default Profile;