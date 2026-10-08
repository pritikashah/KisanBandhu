import { Link } from "react-router-dom";
import "../App.css";

function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h1>404</h1>

        <p className="page-subtitle">
          The page you are looking for does not exist.
        </p>

        <div className="hero-actions">
          <Link to="/" className="primary-btn">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;