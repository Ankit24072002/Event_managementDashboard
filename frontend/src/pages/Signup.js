import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="saas-login">

      <div className="saas-left">
        <h1>Join EventHub 🚀</h1>
        <p>
          Create your account to explore events, connect with people,
          and start managing experiences seamlessly.
        </p>
      </div>

      <div className="saas-right">
        <div className="saas-card">

          <h2>Create your account</h2>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <div className="password-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <div className="field">
              <label>Account Type</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">User - Browse events</option>
                <option value="organizer">Organizer - Manage events</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="signup">
            Already have an account? <Link to="/login">Login</Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Signup;