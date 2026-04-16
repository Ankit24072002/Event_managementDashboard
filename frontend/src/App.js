import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EventDetails from "./pages/EventDetails";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import Navbar from "./components/Navbar";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import "./App.css";

function RequireAuth({ children }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  return token ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppRoutes() {
  const { role } = useContext(AuthContext);
  
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/notifications"
            element={
              <RequireAuth>
                <Notifications />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          {role === "organizer" && (
            <Route
              path="/analytics"
              element={
                <RequireAuth>
                  <Analytics />
                </RequireAuth>
              }
            />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
