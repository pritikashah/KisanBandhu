import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login(
        formData.email,
        formData.password
      );

      if (response.user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-overlay">
          <Link to="/" className="auth-visual-brand">
            <span className="auth-brand-mark">✦</span>
            Kisan<span>Bandhu</span>
          </Link>

          <div className="auth-visual-content">
            <span className="auth-visual-label">
              SMART DIGITAL FARMING
            </span>

            <h1>
              Grow with purpose.
              <br />
              Farm with <em>confidence.</em>
            </h1>

            <p>
              Bring your farming journey into one simple digital
              space — from your first sowing date to your final
              harvest.
            </p>
          </div>

          <div className="auth-visual-bottom">
            <span>🌱 Built for everyday farmers</span>
            <span>01 / KisanBandhu</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <Link to="/">
              <span className="auth-brand-mark">✦</span>
              Kisan<span>Bandhu</span>
            </Link>
          </div>

          <div className="auth-heading">
            <span className="auth-small-label">
              • WELCOME BACK
            </span>

            <h2>Let's get growing.</h2>

            <p>
              Sign in to continue managing your farm with
              KisanBandhu.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <span>↗</span>}
            </button>
          </form>

          <div className="auth-divider">
            <span></span>
            <p>New to KisanBandhu?</p>
            <span></span>
          </div>

          <Link
            to="/register"
            className="auth-secondary-action"
          >
            Create your account
          </Link>

          <Link to="/" className="auth-back-link">
            ← Back to KisanBandhu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;