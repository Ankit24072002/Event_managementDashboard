import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import socket from "../socket";

function Dashboard() {
  const { role, userId } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsRes = await api.get("/events");
        setEvents(eventsRes.data);
        if (role !== "organizer") {
          const regRes = await api.get("/registrations/mine");
          setRegistrations(regRes.data);
        }
      } catch (err) {
        setError("Unable to load dashboard data");
      }
    };

    fetchData();
  }, [role]);

  useEffect(() => {
    socket.on("eventUpdated", (data) => {
      setEvents((prev) =>
        prev.map((event) =>
          event._id === data.eventId
            ? { ...event, registrationsCount: data.registrationsCount }
            : event
        )
      );
    });
    return () => {
      socket.off("eventUpdated");
    };
  }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/events", {
        title,
        description,
        date,
        location,
        capacity: Number(capacity)
      });
      setEvents((prev) => [...prev, res.data]);
      setTitle("");
      setDescription("");
      setDate("");
      setLocation("");
      setCapacity(0);
      alert("Event created successfully!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (role === "organizer") {
    const myEvents = events.filter(
      (event) => event.createdBy?._id === userId || event.createdBy === userId
    );
    const totalRegistrations = myEvents.reduce(
      (sum, event) => {
        const registrations = event.registrationsCount ?? event.registrations?.length ?? 0;
        return sum + registrations;
      },
      0
    );

    return (
      <div>
        <div className="dashboard-header">
          <h1>🎭 Organizer Dashboard</h1>
          <p>Manage your events and track registrations</p>
        </div>

        <div className="dashboard-grid">
          <div className="stats-card">
            <h3>Total Events</h3>
            <div className="number">{myEvents.length}</div>
          </div>
          <div className="stats-card">
            <h3>Total Registrations</h3>
            <div className="number">{totalRegistrations}</div>
          </div>
        </div>

        <div className="event-form">
          <h2>📝 Create New Event</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={createEvent}>
            <div className="form-row">
              <div className="form-group">
                <label>Event Title</label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Event location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="Brief description of the event"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  placeholder="Maximum attendees"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </button>
          </form>
        </div>

        <h2 style={{ color: "white", marginTop: "40px" }}>📅 Your Events</h2>
        {myEvents.length === 0 ? (
          <div className="empty-state">
            <h3>No events created yet</h3>
            <p>Create your first event above!</p>
          </div>
        ) : (
          myEvents.map((event) => (
            <div key={event._id} className="card">
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <div className="meta">
                <div>
                  <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleString()}</p>
                  <p><strong>📍 Location:</strong> {event.location}</p>
                  <p><strong>👥 Capacity:</strong> {event.capacity || "Unlimited"}</p>
                </div>
                <div className="registrations">
                  {(() => {
                    const count = event.registrationsCount ?? event.registrations?.length ?? 0;
                    return count;
                  })()} registered
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <h1>👤 User Dashboard</h1>
        <p>View your event registrations</p>
      </div>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>My Registrations</h3>
          <div className="number">{registrations.length}</div>
        </div>
      </div>

      <h2 style={{ color: "white", marginTop: "40px" }}>🎫 My Registered Events</h2>
      {error && <div className="error">{error}</div>}
      {registrations.length === 0 ? (
        <div className="empty-state">
          <h3>No registrations yet</h3>
          <p>Browse events and register for ones that interest you!</p>
        </div>
      ) : (
        registrations.map((registration) => (
          <div key={registration._id} className="card">
            <h3>{registration.event?.title}</h3>
            <p>{registration.event?.description}</p>
            <div className="meta">
              <div>
                <p><strong>📅 Date:</strong> {new Date(registration.event?.date).toLocaleString()}</p>
                <p><strong>📍 Location:</strong> {registration.event?.location}</p>
                <p><strong>👤 Organizer:</strong> {registration.event?.createdBy?.name}</p>
              </div>
              <div style={{ background: "linear-gradient(45deg, #48bb78, #38a169)", color: "white", padding: "4px 12px", borderRadius: "15px", fontWeight: "bold" }}>
                Registered
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
