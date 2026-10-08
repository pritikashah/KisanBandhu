import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CloudSun,
  Droplets,
  Leaf,
  MapPin,
  Plus,
  Sprout,
  TrendingUp,
  Wheat,
  Wind,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Farmer";

  return (
    <div className="farmer-dashboard">
      {/* TOP NAVIGATION */}

      <header className="dashboard-topbar">
        <div className="dashboard-topbar-inner">
          <Link to="/" className="dashboard-logo">
            <span className="dashboard-logo-mark">✦</span>

            <span>
              Kisan<span>Bandhu</span>
            </span>
          </Link>

          <nav className="dashboard-menu">
            <Link
              to="/dashboard"
              className="dashboard-menu-link active"
            >
              Overview
            </Link>

            <button
              type="button"
              className="dashboard-menu-link"
            >
              My Farms
            </button>

            <button
              type="button"
              className="dashboard-menu-link"
            >
              Crops
            </button>

            <button
              type="button"
              className="dashboard-menu-link"
            >
              Finances
            </button>

            <button
              type="button"
              className="dashboard-menu-link"
            >
              Weather
            </button>
          </nav>

          <div className="dashboard-user-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-indicator"></span>
            </button>

            <div className="user-chip">
              <div className="user-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="user-chip-text">
                <strong>{firstName}</strong>
                <span>Farmer</span>
              </div>

              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}

      <main className="dashboard-content">
        {/* WELCOME */}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-overline">
              YOUR FARM · TODAY
            </span>

            <h1>
              Good morning,{" "}
              <em>{firstName}.</em>
            </h1>

            <p>
              Everything you need to keep your farm moving forward,
              all in one place.
            </p>
          </div>

          <div className="welcome-actions">
            <button
              type="button"
              className="quick-action secondary"
            >
              <Plus size={17} />
              Add Crop
            </button>

            <button
              type="button"
              className="quick-action primary"
            >
              <Plus size={17} />
              Add Farm
            </button>
          </div>
        </section>

        {/* FEATURED FARM */}

        <section className="featured-farm-card">
          <div className="featured-farm-content">
            <div className="featured-farm-top">
              <span className="featured-overline">
                CURRENT FARM
              </span>

              <span className="farm-status">
                <span></span>
                Active
              </span>
            </div>

            <h2>
              Kisan Test Farm
            </h2>

            <div className="featured-location">
              <MapPin size={16} />
              <span>Gandevi, Gujarat</span>
            </div>

            <p className="featured-copy">
              Your main farm is currently in the growing season.
              Rice is growing across your 5-acre field, with
              irrigation and upcoming activities on schedule.
            </p>

            <div className="featured-farm-stats">
              <div>
                <span>AREA</span>
                <strong>5 acre</strong>
              </div>

              <div>
                <span>SOIL</span>
                <strong>Alluvial</strong>
              </div>

              <div>
                <span>IRRIGATION</span>
                <strong>Borewell</strong>
              </div>
            </div>

            <div className="featured-farm-footer">
              <div className="current-crop">
                <div className="current-crop-icon">
                  🌾
                </div>

                <div>
                  <span>Growing now</span>
                  <strong>Rice · Kharif</strong>
                </div>
              </div>

              <button
                type="button"
                className="featured-view-button"
              >
                View farm
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>

          <div className="featured-farm-visual">
            <div className="farm-visual-overlay"></div>

            <div className="farm-visual-badge">
              <Sprout size={17} />

              <div>
                <span>Growing season</span>
                <strong>On track</strong>
              </div>
            </div>
          </div>
        </section>

        {/* SEASON SNAPSHOT */}

        <section className="season-snapshot">
          <div className="snapshot-heading">
            <span>SEASON AT A GLANCE</span>
          </div>

          <div className="snapshot-grid">
            <div className="snapshot-item">
              <div className="snapshot-icon">
                <Wheat size={21} />
              </div>

              <div>
                <span>Active Farms</span>
                <strong>3</strong>
              </div>
            </div>

            <div className="snapshot-item">
              <div className="snapshot-icon">
                <Leaf size={21} />
              </div>

              <div>
                <span>Growing Crops</span>
                <strong>6</strong>
              </div>
            </div>

            <div className="snapshot-item">
              <div className="snapshot-icon">₹</div>

              <div>
                <span>Season Expenses</span>
                <strong>₹38.5K</strong>
              </div>
            </div>

            <div className="snapshot-item profit-snapshot">
              <div className="snapshot-icon">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>Net Profit</span>
                <strong>₹76.2K</strong>

                <small>
                  ↗ Healthy performance
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* WEATHER + CROPS */}

        <section className="dashboard-feature-grid">
          {/* WEATHER */}

          <article className="info-card weather-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  FARM WEATHER
                </span>

                <h2>
                  Conditions today
                </h2>
              </div>

              <button
                type="button"
                className="round-arrow"
              >
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="weather-main">
              <div className="weather-reading">
                <CloudSun
                  size={69}
                  strokeWidth={1.25}
                />

                <div>
                  <strong>28°</strong>
                  <span>Clear skies</span>
                </div>
              </div>

              <div className="weather-location">
                <MapPin size={15} />
                Gandevi, Gujarat
              </div>
            </div>

            <div className="weather-stats">
              <div>
                <Droplets size={19} />

                <span>
                  Humidity
                  <strong>62%</strong>
                </span>
              </div>

              <div>
                <Wind size={19} />

                <span>
                  Wind
                  <strong>9 km/h</strong>
                </span>
              </div>

              <div>
                <Leaf size={19} />

                <span>
                  Farm condition
                  <strong>Good</strong>
                </span>
              </div>
            </div>
          </article>

          {/* CROPS */}

          <article className="info-card crops-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  YOUR CROPS
                </span>

                <h2>
                  What's growing
                </h2>
              </div>

              <button
                type="button"
                className="text-arrow-button"
              >
                View all →
              </button>
            </div>

            <div className="crop-list">
              <div className="crop-item">
                <div className="crop-image wheat-bg">
                  🌾
                </div>

                <div className="crop-name">
                  <strong>Wheat</strong>
                  <span>Rabi · Growing</span>
                </div>

                <div className="crop-progress-block">
                  <div>
                    <span>78%</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-value"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="crop-item">
                <div className="crop-image rice-bg">
                  🌱
                </div>

                <div className="crop-name">
                  <strong>Rice</strong>
                  <span>Kharif · Growing</span>
                </div>

                <div className="crop-progress-block">
                  <div>
                    <span>54%</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-value"
                      style={{ width: "54%" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="crop-item">
                <div className="crop-image vegetable-bg">
                  🥕
                </div>

                <div className="crop-name">
                  <strong>Vegetables</strong>
                  <span>Zaid · Growing</span>
                </div>

                <div className="crop-progress-block">
                  <div>
                    <span>34%</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-value"
                      style={{ width: "34%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* PERFORMANCE */}

        <section className="performance-section">
          <div className="performance-top">
            <div>
              <span className="card-overline">
                FARM PERFORMANCE
              </span>

              <h2>
                Understanding your season.
              </h2>

              <p>
                Track the relationship between your recorded
                revenue, expenses and overall farm profit.
              </p>
            </div>

            <div className="performance-number">
              <span>NET PROFIT</span>

              <strong>₹76,200</strong>

              <small>
                ↗ 18.4% this season
              </small>
            </div>
          </div>

          <div className="large-chart">
            <div className="chart-labels">
              <span>120K</span>
              <span>90K</span>
              <span>60K</span>
              <span>30K</span>
              <span>0</span>
            </div>

            <div className="chart-body">
              <div className="chart-lines">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <svg
                viewBox="0 0 1000 300"
                preserveAspectRatio="none"
                className="chart-svg"
              >
                <defs>
                  <linearGradient
                    id="dashboardChartFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#78986F"
                      stopOpacity="0.25"
                    />

                    <stop
                      offset="100%"
                      stopColor="#78986F"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 255
                  C90 245 115 225 180 230
                  C245 237 270 220 335 205
                  C405 187 435 205 500 175
                  C570 142 605 155 670 125
                  C735 96 790 110 850 83
                  C900 61 945 54 1000 26
                  L1000 300
                  L0 300 Z"
                  fill="url(#dashboardChartFill)"
                />

                <path
                  d="M0 255
                  C90 245 115 225 180 230
                  C245 237 270 220 335 205
                  C405 187 435 205 500 175
                  C570 142 605 155 670 125
                  C735 96 790 110 850 83
                  C900 61 945 54 1000 26"
                  fill="none"
                  stroke="#48724D"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                <circle
                  cx="1000"
                  cy="26"
                  r="7"
                  fill="#48724D"
                />
              </svg>

              <div className="chart-months">
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
              </div>
            </div>
          </div>

          <div className="performance-bottom">
            <div>
              <span>Total revenue</span>
              <strong>₹1,14,700</strong>
            </div>

            <div>
              <span>Total expenses</span>
              <strong>₹38,500</strong>
            </div>

            <div>
              <span>Net profit</span>
              <strong>₹76,200</strong>
            </div>
          </div>
        </section>

        {/* ACTIVITIES */}

        <section className="dashboard-activity-grid">
          {/* UPCOMING */}

          <article className="activity-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  WHAT'S NEXT
                </span>

                <h2>
                  Upcoming activities
                </h2>
              </div>

              <button
                type="button"
                className="text-arrow-button"
              >
                See all →
              </button>
            </div>

            <div className="activities-list">
              <div className="activity-item">
                <div className="activity-date">
                  <span>OCT</span>
                  <strong>12</strong>
                </div>

                <div className="activity-details">
                  <strong>
                    Apply fertilizer
                  </strong>

                  <span>
                    Wheat · Kisan Test Farm
                  </span>
                </div>

                <ChevronRight size={18} />
              </div>

              <div className="activity-item">
                <div className="activity-date">
                  <span>OCT</span>
                  <strong>15</strong>
                </div>

                <div className="activity-details">
                  <strong>
                    Check irrigation
                  </strong>

                  <span>
                    Rice · Kisan Test Farm
                  </span>
                </div>

                <ChevronRight size={18} />
              </div>

              <div className="activity-item">
                <div className="activity-date">
                  <span>OCT</span>
                  <strong>18</strong>
                </div>

                <div className="activity-details">
                  <strong>
                    Harvest preparation
                  </strong>

                  <span>
                    Seasonal activity
                  </span>
                </div>

                <ChevronRight size={18} />
              </div>
            </div>
          </article>

          {/* RECENT */}

          <article className="activity-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  RECENT ACTIVITY
                </span>

                <h2>
                  Latest updates
                </h2>
              </div>

              <button
                type="button"
                className="round-arrow"
              >
                <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="recent-list">
              <div className="recent-item">
                <div className="recent-icon crop-recent">
                  <Wheat size={18} />
                </div>

                <div>
                  <strong>
                    Rice crop added
                  </strong>

                  <span>
                    Kisan Test Farm · Today
                  </span>
                </div>

                <span className="recent-check">
                  ✓
                </span>
              </div>

              <div className="recent-item">
                <div className="recent-icon expense-recent">
                  ₹
                </div>

                <div>
                  <strong>
                    Expense recorded
                  </strong>

                  <span>
                    Fertilizer · ₹3,800
                  </span>
                </div>

                <span className="recent-check">
                  ✓
                </span>
              </div>

              <div className="recent-item">
                <div className="recent-icon weather-recent">
                  <CloudSun size={18} />
                </div>

                <div>
                  <strong>
                    Weather checked
                  </strong>

                  <span>
                    Gandevi · Clear skies
                  </span>
                </div>

                <span className="recent-check">
                  ✓
                </span>
              </div>
            </div>
          </article>
        </section>

        {/* QUICK LINKS */}

        <section className="quick-links-section">
          <div className="quick-links-heading">
            <span>KEEP GOING</span>

            <h2>
              What would you like to manage?
            </h2>
          </div>

          <div className="quick-links-grid">
            <button
              type="button"
              className="quick-link-card"
            >
              <div>
                <Wheat size={25} />
                <span>01</span>
              </div>

              <strong>My Farms</strong>

              <small>
                Manage your land and farm details.
              </small>

              <ArrowUpRight size={18} />
            </button>

            <button
              type="button"
              className="quick-link-card"
            >
              <div>
                <Sprout size={25} />
                <span>02</span>
              </div>

              <strong>Crops</strong>

              <small>
                Track your crops throughout the season.
              </small>

              <ArrowUpRight size={18} />
            </button>

            <button
              type="button"
              className="quick-link-card"
            >
              <div>
                <span>03</span>
                ₹
              </div>

              <strong>
                Expenses & Profit
              </strong>

              <small>
                Understand what your farm is earning.
              </small>

              <ArrowUpRight size={18} />
            </button>

            <button
              type="button"
              className="quick-link-card"
            >
              <div>
                <CalendarDays size={25} />
                <span>04</span>
              </div>

              <strong>Reminders</strong>

              <small>
                Stay on top of important farm activities.
              </small>

              <ArrowUpRight size={18} />
            </button>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="dashboard-footer">
          <span>
            KisanBandhu · Smart Digital Farming
          </span>

          <div>
            <Link to="/">
              Back to website
            </Link>

            <button
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;