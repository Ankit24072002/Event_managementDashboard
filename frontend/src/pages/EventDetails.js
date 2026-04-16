import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import socket from "../socket";
import toast from "react-hot-toast";

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const { token, role, userId } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchEvent = async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data);
    } catch (err) {
      setError("Unable to load event");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    socket.on("eventUpdated", (data) => {
      if (event && data.eventId === event._id) {
        setEvent((prev) => ({
          ...prev,
          registrationsCount: data.registrationsCount,
        }));
      }
    });

    return () => socket.off("eventUpdated");
  }, [event]);
  const handleRegister = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    // safety check
    if (!id || typeof id !== "string") {
      console.error("Invalid ID:", id);
      toast.error("Invalid event ID");
      return;
    }

    try {
      await api.post(
        `/events/${id}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Successfully registered!");
      fetchEvent();
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!event) return <div className="error">Event not found</div>;

  const registrationsCount =
    event.registrationsCount ??
    event.registrations?.length ??
    0;

  const isFull = event.capacity && registrationsCount >= event.capacity;

  const isRegistered = event.registrations?.some(
    (reg) => reg.user?._id === userId
  );

  return (
    <div className="event-details">
      <h1>{event.title}</h1>

      <div className="event-meta">
        <p>📅 {new Date(event.date).toLocaleString()}</p>
        <p>📍 {event.location}</p>
        <p>👥 {registrationsCount}</p>
      </div>

      <p>{event.description}</p>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        {isRegistered ? (
          <div className="registered-badge">
  ✅ Already Registered
</div>
        ) : isFull ? (
          <p>🚫 Event Full</p>
        ) : (
          <button className="btn" onClick={handleRegister}>
            Register
          </button>
        )}
      </div>
    </div>
  );
}

export default EventDetails;