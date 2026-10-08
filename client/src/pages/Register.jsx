import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: {
      village: "",
      district: "",
      state: "",
      country: "India",
    },
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (
      ["village", "district", "state", "country"].includes(name)
    ) {
      setFormData((previous) => ({
        ...previous,
        location: {
          ...previous.location,
          [name]: value,
        },
      }));

      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      await register(formData);

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-register-page">
      <div className="auth-visual auth-register-visual">
        <div className="auth-visual-overlay">
          <Link to="/" className="auth-visual-brand">
            <span className="auth-brand-mark">✦</span>
            Kisan<span>Bandhu</span>
          </Link>

          <div className="auth-visual-content">
            <span className="auth-visual-label">
              YOUR FARM. YOUR JOURNEY.
            </span>

            <h1>
              Everything
              <br />
              starts with a <em>seed.</em>
            </h1>

            <p>
              Create your KisanBandhu account and keep your farm,
              crops, expenses and important farming activities
              together.
            </p>
          </div>

          <div className="auth-visual-bottom">
            <span>🌾 One digital space for your farm</span>
            <span>02 / KisanBandhu</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side register-form-side">
        <div className="auth-form-container register-container">
          <div className="auth-mobile-brand">
            <Link to="/">
              <span className="auth-brand-mark">✦</span>
              Kisan<span>Bandhu</span>
            </Link>
          </div>

          <div className="auth-heading">
            <span className="auth-small-label">
              • GET STARTED
            </span>

            <h2>Create your account.</h2>

            <p>
              Start organizing your farming journey with
              KisanBandhu.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="name">
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="email">
                  Email *
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
                <label htmlFor="phone">
                  Phone *
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="+91..."
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password *
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>

            <div className="auth-location-heading">
              <span>LOCATION</span>
              <div></div>
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="village">
                  Village
                </label>

                <input
                  id="village"
                  type="text"
                  name="village"
                  placeholder="Village"
                  value={formData.location.village}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="district">
                  District
                </label>

                <input
                  id="district"
                  type="text"
                  name="district"
                  placeholder="District"
                  value={formData.location.district}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="form-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  name="state"
                  placeholder="State"
                  value={formData.location.state}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">
                  Country
                </label>

                <input
                  id="country"
                  type="text"
                  name="country"
                  value={formData.location.country}
                  onChange={handleChange}
                />
              </div>
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
              {loading
                ? "Creating account..."
                : "Create Account"}

              {!loading && <span>↗</span>}
            </button>
          </form>

          <div className="auth-existing">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>

          <Link to="/" className="auth-back-link">
            ← Back to KisanBandhu
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;