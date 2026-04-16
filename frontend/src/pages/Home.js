import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, upcoming, past
  const [locationFilter, setLocationFilter] = useState("");
  const { token, role } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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

  const register = async (id) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      await api.post(`/events/${id}/register`);
      toast.success("Successfully registered for the event!");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div>
      <section className="home-hero">
        <div className="hero-copy">
          <div className="hero-tag">Easy event management for organizers and attendees</div>
          <h1>Welcome to the coolest event dashboard</h1>
          <p>Discover new experiences, register in seconds, and manage your own events with real-time updates.</p>
          <div className="hero-actions">
            <Link className="btn hero-primary" to={token ? "/dashboard" : "/signup"}>
              {token ? "Go to Dashboard" : "Start Free"}
            </Link>
            <Link className="btn btn-secondary hero-secondary" to="/">
              Browse Events
            </Link>
          </div>
        </div>
        <div className="hero-panel">
          <div className="hero-panel-card">
            <p className="panel-label">Upcoming Event</p>
            <h2>Marketing Masterclass</h2>
            <p>Live webinar · Apr 28 · Online</p>
            <div className="panel-stats">
              <span>120 registrations</span>
              <span>Organizer: Alex</span>
            </div>
          </div>
          <div className="hero-panel-highlight">
            <h3>Organizers</h3>
            <p>Create events, track attendance, and send updates automatically.</p>
          </div>
        </div>
      </section>

      <div className="dashboard-header">
        <h1>🎉 Event Dashboard</h1>
        <p>Discover and register for amazing events</p>
      </div>

      {/* Search and Filter Section */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <input
            type="text"
            placeholder="📍 Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Filtered Events */}
      {(events.length === 0 || events
        .filter(event => {
          const now = new Date();
          const eventDate = new Date(event.date);
          const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesLocation = !locationFilter || 
            event.location?.toLowerCase().includes(locationFilter.toLowerCase());
          const matchesDate = dateFilter === "all" ||
            (dateFilter === "upcoming" && eventDate >= now) ||
            (dateFilter === "past" && eventDate < now);
          return matchesSearch && matchesLocation && matchesDate;
        }).length === 0) ? (
        <div className="empty-state">
          <h3>No events found</h3>
          <p>Try adjusting your search or filters!</p>
        </div>
      ) : (
        events
        .filter(event => {
          const now = new Date();
          const eventDate = new Date(event.date);
          const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesLocation = !locationFilter || 
            event.location?.toLowerCase().includes(locationFilter.toLowerCase());
          const matchesDate = dateFilter === "all" ||
            (dateFilter === "upcoming" && eventDate >= now) ||
            (dateFilter === "past" && eventDate < now);
          return matchesSearch && matchesLocation && matchesDate;
        })
        .map((event) => {
          const registrations = event.registrationsCount ?? event.registrations?.length ?? 0;
          const isFull = event.capacity && registrations >= event.capacity;

          return (
            <div key={event._id} className="card">
              <h3>
                <Link to={`/events/${event._id}`}>{event.title}</Link>
              </h3>
              <p>{event.description}</p>
              <div className="meta">
                <div>
                  <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleString()}</p>
                  <p><strong>📍 Location:</strong> {event.location}</p>
                  <p><strong>👤 Organizer:</strong> {event.createdBy?.name || "Unknown"}</p>
                </div>
                <div className="registrations">
                  {registrations} registered
                </div>
              </div>
              {role !== "organizer" && (
                <button className="btn" onClick={() => register(event._id)} disabled={isFull}>
                  {isFull ? "Event Full" : "Register Now"}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;
