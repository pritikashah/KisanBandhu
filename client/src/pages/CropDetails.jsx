import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Leaf,
  MapPin,
  Pencil,
  Sprout,
  Wheat,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getCropById } from "../services/cropService";

import { getFarms } from "../services/farmService";

import "./CropDetails.css";

const cropImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1523742813585-8f0f9d3e6a16?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=90",
];

const statusLabels = {
  planned: "Planned",
  growing: "Growing",
  harvested: "Harvested",
  cancelled: "Cancelled",
};

const statusClassNames = {
  planned: "detail-status-planned",
  growing: "detail-status-growing",
  harvested: "detail-status-harvested",
  cancelled: "detail-status-cancelled",
};

function formatDate(date) {
  if (!date) {
    return "Not specified";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

function extractFarmList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.farms)) {
    return data.farms;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function CropDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [crop, setCrop] =
    useState(null);

  const [farms, setFarms] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadCrop = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          cropResponse,
          farmsResponse,
        ] = await Promise.all([
          getCropById(id),
          getFarms(),
        ]);

        setCrop(
          cropResponse.crop ||
            cropResponse.data ||
            cropResponse
        );

        setFarms(
          extractFarmList(
            farmsResponse
          )
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load crop details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCrop();
  }, [id]);

  if (loading) {
    return (
      <div className="crop-details-page">

        <div className="crop-details-loading">

          <div className="crop-details-loading-icon">
            🌱
          </div>

          <h2>
            Loading crop details...
          </h2>

          <p>
            Fetching your crop information.
          </p>

        </div>

      </div>
    );
  }

  if (error || !crop) {
    return (
      <div className="crop-details-page">

        <div className="crop-details-error">

          <div className="crop-details-error-icon">
            !
          </div>

          <h2>
            Crop not found
          </h2>

          <p>
            {error ||
              "We couldn't find this crop."}
          </p>

          <button
            type="button"
            className="crop-details-back-button"
            onClick={() =>
              navigate("/crops")
            }
          >
            <ArrowLeft size={17} />
            Back to Crops
          </button>

        </div>

      </div>
    );
  }

  const farm = farms.find(
    (item) =>
      String(item._id) ===
      String(crop.farmId)
  );

  const imageIndex =
    crop._id
      ?.split("")
      .reduce(
        (total, character) =>
          total +
          character.charCodeAt(0),
        0
      ) % cropImages.length;

  const image =
    cropImages[imageIndex || 0];

  const handleEditCrop = () => {
    navigate(
      `/crops?edit=${crop._id}`
    );
  };

  return (
    <div className="crop-details-page">

      {/* TOP BAR */}

      <header className="crop-details-topbar">

        <div className="crop-details-topbar-inner">

          <Link
            to="/crops"
            className="crop-details-back-link"
          >
            <ArrowLeft size={17} />
            My Crops
          </Link>

          <Link
            to="/"
            className="crop-details-logo"
          >
            <span>
              ✦
            </span>

            Kisan<span>Bandhu</span>
          </Link>

          <div></div>

        </div>

      </header>

      <main className="crop-details-content">

        {/* HERO */}

        <section className="crop-details-hero">

          <div
            className="crop-details-hero-image"
            style={{
              backgroundImage:
                `url("${image}")`,
            }}
          >

            <div className="crop-details-image-overlay"></div>

            <span
              className={`crop-details-status ${statusClassNames[crop.status] || ""}`}
            >
              <span></span>
              {statusLabels[
                crop.status
              ] ||
                crop.status}
            </span>

          </div>

          <div className="crop-details-hero-content">

            <span className="crop-details-overline">
              • CROP DETAILS
            </span>

            <h1>
              {crop.name}
            </h1>

            <div className="crop-details-farm">

              <MapPin size={16} />

              <span>
                {farm?.name ||
                  "Farm information unavailable"}
              </span>

            </div>

            <p>
              {crop.season} season crop with
              planned yield, timeline and sales
              expectations.
            </p>

            <div className="crop-details-actions">

              <button
                type="button"
                className="crop-details-edit-button"
                onClick={
                  handleEditCrop
                }
              >
                <Pencil size={16} />
                Edit Crop
              </button>

              <Link
                to="/crops"
                className="crop-details-all-button"
              >
                All Crops
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>

        </section>

        {/* OVERVIEW */}

        <section className="crop-overview-section">

          <div className="crop-details-section-heading">

            <div>

              <span className="crop-details-overline">
                CROP OVERVIEW
              </span>

              <h2>
                From sowing to harvest.
              </h2>

            </div>

            <p>
              The key information stored for this
              crop.
            </p>

          </div>

          <div className="crop-overview-grid">

            <div className="crop-overview-card">

              <div className="crop-overview-icon">
                <Sprout size={22} />
              </div>

              <span>
                SEASON
              </span>

              <strong>
                {crop.season}
              </strong>

              <p>
                Farming season
              </p>

            </div>

            <div className="crop-overview-card">

              <div className="crop-overview-icon">
                <Wheat size={22} />
              </div>

              <span>
                EXPECTED YIELD
              </span>

              <strong>
                {
                  crop.expectedYield
                    ?.value
                }{" "}
                {
                  crop.expectedYield
                    ?.unit
                }
              </strong>

              <p>
                Planned production
              </p>

            </div>

            <div className="crop-overview-card">

              <div className="crop-overview-icon">
                <Leaf size={22} />
              </div>

              <span>
                EXPECTED SALE PRICE
              </span>

              <strong>
                {crop.expectedSalePrice !==
                  undefined &&
                crop.expectedSalePrice !==
                  null
                  ? `₹${crop.expectedSalePrice}`
                  : "Not specified"}
              </strong>

              <p>
                Expected price per unit
              </p>

            </div>

          </div>

        </section>

        {/* TIMELINE */}

        <section className="crop-timeline-section">

          <div className="crop-timeline-content">

            <span className="crop-details-overline">
              CROP TIMELINE
            </span>

            <h2>
              Your crop's journey.
            </h2>

            <p>
              Important dates recorded for this
              crop.
            </p>

            <div className="crop-timeline-list">

              <div className="crop-timeline-item">

                <div className="crop-timeline-icon">
                  <CalendarDays
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    SOWING DATE
                  </span>

                  <strong>
                    {formatDate(
                      crop.sowingDate
                    )}
                  </strong>

                </div>

              </div>

              <div className="crop-timeline-item">

                <div className="crop-timeline-icon">
                  <Clock3
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    EXPECTED HARVEST
                  </span>

                  <strong>
                    {formatDate(
                      crop.expectedHarvestDate
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          <div className="crop-season-card">

            <div className="crop-season-icon">
              <Sprout size={27} />
            </div>

            <span>
              SEASON
            </span>

            <strong>
              {crop.season}
            </strong>

            <p>
              Current crop season
            </p>

            <div className="crop-season-line"></div>

            <small>
              Status
            </small>

            <b>
              {statusLabels[
                crop.status
              ] ||
                crop.status}
            </b>

          </div>

        </section>

        {/* FARM */}

        <section className="crop-farm-section">

          <div className="crop-farm-section-icon">
            <MapPin size={23} />
          </div>

          <div>

            <span>
              REGISTERED FARM
            </span>

            <h3>
              {farm?.name ||
                "Farm information unavailable"}
            </h3>

            <p>
              {farm?.location?.village
                ? `${farm.location.village}, ${farm.location.district}, ${farm.location.state}`
                : "Location not available"}
            </p>

          </div>

          {farm?._id && (
            <Link
              to={`/farms/${farm._id}`}
              className="view-farm-from-crop"
            >
              View Farm
              <ArrowUpRight
                size={15}
              />
            </Link>
          )}

        </section>

        {/* NOTES */}

        {crop.notes && (
          <section className="crop-notes-section">

            <div className="crop-notes-icon">
              <Leaf size={21} />
            </div>

            <div>

              <span>
                NOTES
              </span>

              <p>
                {crop.notes}
              </p>

            </div>

          </section>
        )}

        {/* STATUS */}

        <section className="crop-status-section">

          <div className="crop-status-content">

            <div className="crop-status-icon">

              <CheckCircle2
                size={27}
              />

            </div>

            <div>

              <span>
                CROP STATUS
              </span>

              <h3>
                This crop is{" "}
                {statusLabels[
                  crop.status
                ]?.toLowerCase() ||
                  crop.status}
                .
              </h3>

              <p>
                Keep your crop records updated as
                the season progresses.
              </p>

            </div>

          </div>

          <div className="crop-status-mark">
            <Wheat size={43} />
          </div>

        </section>

      </main>

    </div>
  );
}

export default CropDetails;