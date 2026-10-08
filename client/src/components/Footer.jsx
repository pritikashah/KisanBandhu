import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand-area">
            <Link to="/" className="footer-brand">
              <span className="footer-brand-mark">✦</span>
              <span>
                Kisan<span>Bandhu</span>
              </span>
            </Link>

            <p className="footer-description">
              A smarter digital companion for managing farms,
              crops, finances, weather and everyday farming
              activities.
            </p>

            <Link to="/register" className="footer-cta">
              Start Farming Smarter
              <span>↗</span>
            </Link>
          </div>

          <div className="footer-column">
            <h3>Platform</h3>

            <Link to="/">Home</Link>
            <a href="#solutions">Solutions</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>

          <div className="footer-column">
            <h3>Features</h3>

            <span>Farm Management</span>
            <span>Crop Management</span>
            <span>Expense & Profit</span>
            <span>Weather & Reminders</span>
            <span>Government Schemes</span>
          </div>

          <div className="footer-column">
            <h3>KisanBandhu</h3>

            <span>Smart Farming</span>
            <span>Digital Records</span>
            <span>Better Decisions</span>
            <span>Built for Farmers</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} KisanBandhu. All rights
            reserved.
          </p>

          <div className="footer-bottom-links">
            <span>Smart Digital Farming</span>
            <span>•</span>
            <span>Made with 🌱 for farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;