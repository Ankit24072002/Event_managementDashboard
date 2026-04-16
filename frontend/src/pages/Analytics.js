import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts";
import "./Analytics.css";

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"];

function Analytics() {
  const { userId } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events/analytics");
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!stats) return;
    
    const report = `
Event Dashboard Analytics Report
Generated: ${new Date().toLocaleDateString()}

OVERVIEW
--------
Total Events: ${stats.totalEvents}
Total Registrations: ${stats.totalRegistrations}
Average Registrations per Event: ${stats.avgRegistrations.toFixed(1)}

EVENT DETAILS
-------------
${stats.events.map(e => `
${e.title}
- Registrations: ${e.registrationsCount}/${e.capacity}
- Date: ${new Date(e.date).toLocaleDateString()}
- Location: ${e.location}
`).join("\n")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.txt";
    a.click();
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!stats || stats.totalEvents === 0) {
    return (
      <div className="analytics-empty">
        <h3>No Analytics Data</h3>
        <p>Create some events to see your analytics here!</p>
      </div>
    );
  }

  // Prepare chart data
  const eventChartData = stats.events.map(e => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
    registrations: e.registrationsCount,
    capacity: e.capacity
  }));

  const registrationTrend = stats.events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(e => ({
      date: new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      registrations: e.registrationsCount
    }));

  const capacityData = [
    { name: "Filled", value: stats.totalRegistrations },
    { name: "Available", value: stats.totalCapacity - stats.totalRegistrations }
  ];

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <button onClick={exportReport} className="btn-export-report">
          Export Report
        </button>
      </div>

      <div className="analytics-cards">
        <div className="analytics-card highlight">
          <span className="card-icon">📅</span>
          <div className="card-content">
            <span className="card-value">{stats.totalEvents}</span>
            <span className="card-label">Total Events</span>
          </div>
        </div>
        <div className="analytics-card highlight">
          <span className="card-icon">👥</span>
          <div className="card-content">
            <span className="card-value">{stats.totalRegistrations}</span>
            <span className="card-label">Total Registrations</span>
          </div>
        </div>
        <div className="analytics-card highlight">
          <span className="card-icon">📈</span>
          <div className="card-content">
            <span className="card-value">{stats.avgRegistrations.toFixed(1)}</span>
            <span className="card-label">Avg per Event</span>
          </div>
        </div>
        <div className="analytics-card highlight">
          <span className="card-icon">🎯</span>
          <div className="card-content">
            <span className="card-value">{stats.totalCapacity}</span>
            <span className="card-label">Total Capacity</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Registrations by Event</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="registrations" fill="#667eea" name="Registered" />
              <Bar dataKey="capacity" fill="#e0e0e0" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Capacity Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={capacityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {capacityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Registration Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={registrationTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: "#667eea", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="events-table-card">
        <h3>Event Performance</h3>
        <table className="events-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Location</th>
              <th>Registered</th>
              <th>Capacity</th>
              <th>Fill Rate</th>
            </tr>
          </thead>
          <tbody>
            {stats.events.map((event) => {
              const fillRate = event.capacity > 0 
                ? ((event.registrationsCount / event.capacity) * 100).toFixed(0) 
                : 0;
              return (
                <tr key={event._id}>
                  <td>{event.title}</td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.location}</td>
                  <td>{event.registrationsCount}</td>
                  <td>{event.capacity}</td>
                  <td>
                    <div className="fill-rate-bar">
                      <div 
                        className="fill-rate-fill" 
                        style={{ width: `${fillRate}%` }}
                      />
                      <span>{fillRate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Analytics;