import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Admin() {
  const { user, logout } = useAuth();

  return (
    <div className="page-container">
      <h1 className="page-title">
        Admin Dashboard
      </h1>

      <p className="page-subtitle">
        Welcome, {user?.name || "Administrator"}!
      </p>

      <div className="info-grid">
        <div className="info-card">
          <h3>👥 Registered Users</h3>

          <p>
            View registered farmer accounts and their
            details.
          </p>
        </div>

        <div className="info-card">
          <h3>📚 Government Schemes</h3>

          <p>
            Manage government schemes available to
            farmers.
          </p>
        </div>
      </div>

      <div className="hero-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={logout}
        >
          Logout
        </button>

        <Link to="/" className="secondary-btn">
          Home
        </Link>
      </div>
    </div>
  );
}

export default Admin;