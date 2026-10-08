import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "../App.css";

function Home() {
  const features = [
    {
      number: "01",
      name: "Farm Management",
      description:
        "Keep your land, soil, irrigation and farm information organized in one simple digital space.",
      image:
        "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=85",
    },
    {
      number: "02",
      name: "Crop Management",
      description:
        "Track crops from sowing to harvest with seasonal details, expected yield and crop status.",
      image:
        "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1000&q=85",
    },
    {
      number: "03",
      name: "Expense & Profit",
      description:
        "Record your farming expenses and harvest revenue to understand how your farm is performing.",
      image:
        "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1000&q=85",
    },
    {
      number: "04",
      name: "Weather & Reminders",
      description:
        "Stay informed with weather updates and timely reminders for important farming activities.",
      image:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1000&q=85",
    },
    {
      number: "05",
      name: "Government Schemes",
      description:
        "Discover agricultural schemes and important information in one accessible place.",
      image:
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000&q=85",
    },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-shell">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              Smart Digital Farm Assistant
            </div>

            <h1 className="hero-title">
              Grow smarter.
              <br />
              Farm <span className="highlight">better.</span>
            </h1>

            <p className="hero-description">
              KisanBandhu brings your farm, crops, expenses,
              weather, reminders and government schemes together
              in one beautifully simple digital platform.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="primary-btn">
                Start Farming Smarter ↗
              </Link>

              <a href="#solutions" className="secondary-btn">
                Explore Solutions
              </a>
            </div>

            <div className="hero-tags">
              <span className="hero-tag">Farm Management</span>
              <span className="hero-tag">Crop Tracking</span>
              <span className="hero-tag">Profit Analysis</span>
              <span className="hero-tag">Live Weather</span>
              <span className="hero-tag">Smart Reminders</span>
            </div>
          </div>

          <div className="hero-floating-card">
            <div className="hero-floating-card-top">
              <div className="hero-floating-icon">
                🌱
              </div>

              <div>
                <strong>Your farm, at a glance.</strong>

                <span>
                  Everything you need to make better farming
                  decisions.
                </span>
              </div>
            </div>

            <div className="hero-floating-card-footer">
              <span>Built for everyday farmers</span>

              <Link to="/register" className="floating-link">
                Join KisanBandhu →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="section-label">
          • About KisanBandhu
        </div>

        <div className="intro-layout">
          <h2 className="intro-title">
            Farming shouldn't be
            <br />
            complicated. <em>We make it simpler.</em>
          </h2>

          <div>
            <p className="intro-text">
              From understanding your land to tracking your crops,
              expenses and harvests, KisanBandhu gives farmers a
              single digital place to organize the work that matters.
            </p>

            <div className="intro-points">
              <div className="intro-point">
                <span className="intro-number">01</span>

                <p>
                  Manage farms and crop information without
                  scattered records.
                </p>
              </div>

              <div className="intro-point">
                <span className="intro-number">02</span>

                <p>
                  Understand your actual expenses, harvest revenue
                  and profit.
                </p>
              </div>

              <div className="intro-point">
                <span className="intro-number">03</span>

                <p>
                  Stay prepared with weather information, reminders
                  and government schemes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="solutions">
        <div className="features-inner">
          <div className="features-header">
            <div>
              <div className="section-label">
                • Our Solutions
              </div>

              <h2 className="features-title">
                Everything your farm needs,
                <br />
                in one place.
              </h2>
            </div>

            <p className="features-description">
              Simple tools designed around the everyday needs of
              modern farmers — from the first sowing date to the
              final harvest.
            </p>
          </div>

          <div className="feature-list">
            {features.map((feature) => (
              <div
                className="feature-item"
                key={feature.number}
              >
                <div className="feature-button">
                  <span className="feature-number">
                    {feature.number}
                  </span>

                  <span className="feature-name">
                    {feature.name}
                  </span>

                  <span className="feature-arrow">
                    →
                  </span>
                </div>

                <div className="feature-content">
                  <img
                    src={feature.image}
                    alt={feature.name}
                    className="feature-image"
                  />

                  <div className="feature-copy">
                    <p>{feature.description}</p>

                    <Link
                      to="/login"
                      className="text-link"
                    >
                      Explore this feature →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-inner">
          <div className="stats-heading">
            <div>
              <div className="section-label">
                • Why KisanBandhu
              </div>

              <h2 className="stats-title">
                Made for a
                <br />
                <em>smarter harvest.</em>
              </h2>
            </div>

            <p className="stats-description">
              Every feature is designed to turn everyday farm
              information into something useful, organized and
              easier to act on.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">01</div>

              <div>
                <div className="stat-label">
                  One Farm Space
                </div>

                <p className="stat-text">
                  Keep your farm information organized instead of
                  spread across notebooks and apps.
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">05</div>

              <div>
                <div className="stat-label">
                  Core Farm Areas
                </div>

                <p className="stat-text">
                  Farm, crop, finance, weather and reminders work
                  together.
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">24/7</div>

              <div>
                <div className="stat-label">
                  Digital Access
                </div>

                <p className="stat-text">
                  Access your farming records whenever you need
                  them.
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-value">∞</div>

              <div>
                <div className="stat-label">
                  Better Decisions
                </div>

                <p className="stat-text">
                  Turn your records into clearer decisions for the
                  season ahead.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-shell">
          <div
            className="section-label"
            style={{ color: "#b6c9a6" }}
          >
            • Start Today
          </div>

          <h2>
            Your farm already does
            <br />
            great things. Let's make
            <br />
            managing it <em>smarter.</em>
          </h2>

          <p>
            Create your KisanBandhu account and bring your farming
            journey into one simple digital space.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-btn">
              Create Your Account ↗
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;