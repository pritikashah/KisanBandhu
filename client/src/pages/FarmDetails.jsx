import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Droplets,
  LandPlot,
  Leaf,
  MapPin,
  Pencil,
  Wheat,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getFarmById } from "../services/farmService";

import "./FarmDetails.css";

const farmImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=90",

  "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=1600&q=90",

  "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1600&q=90",

  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=90",

  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=90",
];

function FarmDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadFarm = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getFarmById(id);

        setFarm(
          data.farm ||
            data.data ||
            data
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load farm details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadFarm();
  }, [id]);

  if (loading) {
    return (
      <div className="farm-details-page">
        <div className="farm-details-loading">

          <div className="farm-details-loading-icon">
            🌱
          </div>

          <h2>
            Loading farm details...
          </h2>

          <p>
            Fetching your farm information.
          </p>

        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="farm-details-page">

        <div className="farm-details-error">

          <div className="farm-details-error-icon">
            !
          </div>

          <h2>
            Farm not found
          </h2>

          <p>
            {error ||
              "We couldn't find this farm."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/farms")
            }
            className="farm-details-back-button"
          >
            <ArrowLeft size={17} />
            Back to Farms
          </button>

        </div>

      </div>
    );
  }

  const imageIndex =
    farm._id
      ?.split("")
      .reduce(
        (total, character) =>
          total + character.charCodeAt(0),
        0
      ) % farmImages.length;

  const image =
    farmImages[imageIndex || 0];

  const handleEditFarm = () => {
    navigate(`/farms?edit=${farm._id}`);
  };

  return (
    <div className="farm-details-page">

      {/* TOP BAR */}

      <header className="farm-details-topbar">

        <div className="farm-details-topbar-inner">

          <Link
            to="/farms"
            className="farm-details-back-link"
          >
            <ArrowLeft size={17} />
            My Farms
          </Link>

          <Link
            to="/"
            className="farm-details-logo"
          >
            <span>
              ✦
            </span>

            Kisan<span>Bandhu</span>
          </Link>

          <div></div>

        </div>

      </header>

      <main className="farm-details-content">

        {/* HERO */}

        <section className="farm-details-hero">

          <div
            className="farm-details-hero-image"
            style={{
              backgroundImage:
                `url("${image}")`,
            }}
          >

            <div className="farm-details-image-overlay"></div>

            <span className="farm-details-status">
              <span></span>
              Active Farm
            </span>

          </div>

          <div className="farm-details-hero-content">

            <span className="farm-details-overline">
              • FARM DETAILS
            </span>

            <h1>
              {farm.name}
            </h1>

            <div className="farm-details-location">

              <MapPin size={17} />

              <span>
                {farm.location?.village},{" "}
                {farm.location?.district},{" "}
                {farm.location?.state},{" "}
                {farm.location?.country}
              </span>

            </div>

            <p>
              Your registered farm information,
              organized in one place.
            </p>

            <div className="farm-details-actions">

              <button
                type="button"
                className="farm-details-edit-button"
                onClick={handleEditFarm}
              >
                <Pencil size={16} />
                Edit Farm
              </button>

              <Link
                to="/farms"
                className="farm-details-all-button"
              >
                All Farms
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>

        </section>

        {/* FARM INFORMATION */}

        <section className="farm-information-section">

          <div className="farm-details-section-heading">

            <div>

              <span className="farm-details-overline">
                FARM INFORMATION
              </span>

              <h2>
                Know your land.
              </h2>

            </div>

            <p>
              The key information stored for this
              farm.
            </p>

          </div>

          <div className="farm-information-grid">

            <div className="farm-information-card">

              <div className="farm-information-icon">
                <LandPlot size={22} />
              </div>

              <span>
                LAND AREA
              </span>

              <strong>
                {farm.area?.value}{" "}
                {farm.area?.unit}
              </strong>

              <p>
                Total registered farm area
              </p>

            </div>

            <div className="farm-information-card">

              <div className="farm-information-icon">
                <Leaf size={22} />
              </div>

              <span>
                SOIL TYPE
              </span>

              <strong>
                {farm.soilType}
              </strong>

              <p>
                Registered soil classification
              </p>

            </div>

            <div className="farm-information-card">

              <div className="farm-information-icon">
                <Droplets size={22} />
              </div>

              <span>
                IRRIGATION
              </span>

              <strong>
                {farm.irrigationSource ||
                  "Not specified"}
              </strong>

              <p>
                Primary irrigation source
              </p>

            </div>

          </div>

        </section>

        {/* LOCATION */}

        <section className="farm-location-section">

          <div className="farm-location-content">

            <span className="farm-details-overline">
              LOCATION
            </span>

            <h2>
              Where your farm is.
            </h2>

            <p>
              Your farm is registered at the
              following location.
            </p>

            <div className="farm-location-list">

              <div>
                <span>VILLAGE</span>

                <strong>
                  {farm.location?.village ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>DISTRICT</span>

                <strong>
                  {farm.location?.district ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>STATE</span>

                <strong>
                  {farm.location?.state ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>COUNTRY</span>

                <strong>
                  {farm.location?.country ||
                    "Not specified"}
                </strong>
              </div>

            </div>

          </div>

          <div className="farm-coordinate-card">

            <div className="coordinate-icon">
              <MapPin size={25} />
            </div>

            <span>
              COORDINATES
            </span>

            <strong>
              {farm.location?.latitude !==
                undefined
                ? farm.location.latitude
                : "Not available"}
            </strong>

            <small>
              Latitude
            </small>

            <strong>
              {farm.location?.longitude !==
                undefined
                ? farm.location.longitude
                : "Not available"}
            </strong>

            <small>
              Longitude
            </small>

          </div>

        </section>

        {/* CURRENT STATUS */}

        <section className="farm-status-section">

          <div className="farm-status-content">

            <div className="farm-status-icon">
              <CheckCircle2 size={27} />
            </div>

            <div>

              <span>
                FARM STATUS
              </span>

              <h3>
                Your farm is active.
              </h3>

              <p>
                This farm is currently active and
                available for crop, expense and
                harvest management.
              </p>

            </div>

          </div>

          <div className="farm-status-mark">
            <Wheat size={42} />
          </div>

        </section>

      </main>

    </div>
  );
}

export default FarmDetails;