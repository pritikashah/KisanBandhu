import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Wheat,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  createFarm,
  deleteFarm,
  getFarms,
  updateFarm,
} from "../services/farmService";

import "./Farms.css";

const emptyForm = {
  name: "",
  village: "",
  district: "",
  state: "",
  country: "India",
  latitude: "",
  longitude: "",
  areaValue: "",
  areaUnit: "acre",
  soilType: "",
  irrigationSource: "",
};

const farmImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1472141521881-95d0e87e2e39?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85",
];

function Farms() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [farms, setFarms] = useState([]);

  const [formData, setFormData] =
    useState(emptyForm);

  const [showForm, setShowForm] =
    useState(false);

  const [editingFarmId, setEditingFarmId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const formRef = useRef(null);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFarms();

      setFarms(
        data.farms ||
          data.data ||
          data ||
          []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your farms."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const openEditForm = (farm) => {
    setSuccess("");
    setError("");

    setEditingFarmId(farm._id);

    setFormData({
      name: farm.name || "",

      village:
        farm.location?.village || "",

      district:
        farm.location?.district || "",

      state:
        farm.location?.state || "",

      country:
        farm.location?.country || "India",

      latitude:
        farm.location?.latitude !== undefined &&
        farm.location?.latitude !== null
          ? String(farm.location.latitude)
          : "",

      longitude:
        farm.location?.longitude !== undefined &&
        farm.location?.longitude !== null
          ? String(farm.location.longitude)
          : "",

      areaValue:
        farm.area?.value !== undefined &&
        farm.area?.value !== null
          ? String(farm.area.value)
          : "",

      areaUnit:
        farm.area?.unit || "acre",

      soilType:
        farm.soilType || "",

      irrigationSource:
        farm.irrigationSource || "",
    });

    setShowForm(true);
  };

  /*
   * When /farms?edit=<farmId> is opened,
   * automatically find that farm and open
   * its edit form.
   */
  useEffect(() => {
    const editFarmId =
      searchParams.get("edit");

    if (!editFarmId || !farms.length) {
      return;
    }

    const farmToEdit = farms.find(
      (farm) => farm._id === editFarmId
    );

    if (farmToEdit) {
      openEditForm(farmToEdit);

      setSearchParams(
        {},
        {
          replace: true,
        }
      );
    }
  }, [
    farms,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const scrollTimer = setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => {
      clearTimeout(scrollTimer);
    };
  }, [showForm, editingFarmId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingFarmId(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setSuccess("");
    setError("");

    setFormData(emptyForm);
    setEditingFarmId(null);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.village.trim() ||
      !formData.district.trim() ||
      !formData.state.trim() ||
      !formData.country.trim() ||
      !formData.areaValue ||
      !formData.soilType.trim()
    ) {
      setError(
        "Please fill in all required farm fields."
      );

      return;
    }

    const numericArea =
      Number(formData.areaValue);

    if (
      Number.isNaN(numericArea) ||
      numericArea < 0
    ) {
      setError(
        "Farm area must be a valid non-negative number."
      );

      return;
    }

    const farmData = {
      name: formData.name.trim(),

      location: {
        village:
          formData.village.trim(),

        district:
          formData.district.trim(),

        state:
          formData.state.trim(),

        country:
          formData.country.trim(),
      },

      area: {
        value: numericArea,
        unit: formData.areaUnit,
      },

      soilType:
        formData.soilType.trim(),
    };

    if (formData.latitude !== "") {
      farmData.location.latitude =
        Number(formData.latitude);
    }

    if (formData.longitude !== "") {
      farmData.location.longitude =
        Number(formData.longitude);
    }

    if (formData.irrigationSource.trim()) {
      farmData.irrigationSource =
        formData.irrigationSource.trim();
    }

    try {
      setSaving(true);

      if (editingFarmId) {
        await updateFarm(
          editingFarmId,
          farmData
        );

        setSuccess(
          "Farm updated successfully."
        );
      } else {
        await createFarm(farmData);

        setSuccess(
          "Farm added successfully."
        );
      }

      resetForm();

      await loadFarms();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save the farm."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (farm) => {
    const confirmed = window.confirm(
      `Archive "${farm.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteFarm(farm._id);

      setSuccess(
        "Farm archived successfully."
      );

      await loadFarms();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to archive the farm."
      );
    }
  };

  const handleViewFarm = (farmId) => {
    navigate(`/farms/${farmId}`);
  };

  return (
    <div className="farms-page">

      {/* TOP BAR */}

      <header className="farms-topbar">

        <div className="farms-topbar-inner">

          <Link
            to="/dashboard"
            className="farms-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link
            to="/"
            className="farms-logo"
          >
            <span className="farms-logo-mark">
              ✦
            </span>

            <span>
              Kisan<span>Bandhu</span>
            </span>
          </Link>

          <div className="farms-topbar-spacer"></div>

        </div>

      </header>

      <main className="farms-content">

        {/* INTRO */}

        <section className="farms-intro">

          <div>

            <span className="farms-overline">
              • FARM MANAGEMENT
            </span>

            <h1>
              Your farms,
              <br />
              <em>your foundation.</em>
            </h1>

            <p>
              Keep your land, soil, irrigation and
              location details organized in one
              digital space.
            </p>

          </div>

          <button
            type="button"
            className="add-farm-main-button"
            onClick={openCreateForm}
          >
            <Plus size={19} />
            Add New Farm
          </button>

        </section>

        {/* MESSAGES */}

        {success && (
          <div className="farm-message success-message">
            <Check size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="farm-message error-message">
            {error}
          </div>
        )}

        {/* FARM FORM */}

        {showForm && (
          <section
            ref={formRef}
            className="farm-form-card"
          >

            <div className="farm-form-header">

              <div>

                <span className="farms-overline">
                  {editingFarmId
                    ? "EDIT FARM"
                    : "NEW FARM"}
                </span>

                <h2>
                  {editingFarmId
                    ? "Update your farm."
                    : "Add your farm."}
                </h2>

              </div>

              <button
                type="button"
                className="farm-close-button"
                onClick={resetForm}
                aria-label="Close form"
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="farm-form"
              onSubmit={handleSubmit}
            >

              <div className="farm-form-section">

                <span className="farm-form-section-title">
                  BASIC INFORMATION
                </span>

                <div className="farm-form-grid">

                  <div className="farm-field farm-field-full">

                    <label htmlFor="name">
                      Farm Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Kisan Test Farm"
                      value={formData.name}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="areaValue">
                      Area *
                    </label>

                    <input
                      id="areaValue"
                      name="areaValue"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 5"
                      value={formData.areaValue}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="areaUnit">
                      Unit *
                    </label>

                    <select
                      id="areaUnit"
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                    >
                      <option value="acre">
                        Acre
                      </option>

                      <option value="hectare">
                        Hectare
                      </option>

                      <option value="bigha">
                        Bigha
                      </option>
                    </select>

                  </div>

                  <div className="farm-field">

                    <label htmlFor="soilType">
                      Soil Type *
                    </label>

                    <input
                      id="soilType"
                      name="soilType"
                      type="text"
                      placeholder="e.g. Alluvial"
                      value={formData.soilType}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="irrigationSource">
                      Irrigation Source
                    </label>

                    <input
                      id="irrigationSource"
                      name="irrigationSource"
                      type="text"
                      placeholder="e.g. Borewell"
                      value={formData.irrigationSource}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              <div className="farm-form-section">

                <span className="farm-form-section-title">
                  LOCATION
                </span>

                <div className="farm-form-grid">

                  <div className="farm-field">

                    <label htmlFor="village">
                      Village *
                    </label>

                    <input
                      id="village"
                      name="village"
                      type="text"
                      placeholder="Village"
                      value={formData.village}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="district">
                      District *
                    </label>

                    <input
                      id="district"
                      name="district"
                      type="text"
                      placeholder="District"
                      value={formData.district}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="state">
                      State *
                    </label>

                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="country">
                      Country *
                    </label>

                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              <div className="farm-form-section">

                <span className="farm-form-section-title">
                  OPTIONAL COORDINATES
                </span>

                <div className="farm-form-grid">

                  <div className="farm-field">

                    <label htmlFor="latitude">
                      Latitude
                    </label>

                    <input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g. 20.95"
                      value={formData.latitude}
                      onChange={handleChange}
                    />

                  </div>

                  <div className="farm-field">

                    <label htmlFor="longitude">
                      Longitude
                    </label>

                    <input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g. 72.93"
                      value={formData.longitude}
                      onChange={handleChange}
                    />

                  </div>

                </div>

              </div>

              <div className="farm-form-actions">

                <button
                  type="button"
                  className="cancel-farm-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-farm-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingFarmId
                    ? "Update Farm"
                    : "Add Farm"}

                  {!saving && (
                    <ArrowUpRight size={17} />
                  )}

                </button>

              </div>

            </form>

          </section>
        )}

        {/* FARM COLLECTION */}

        <section className="farms-list-section">

          <div className="farms-list-header">

            <div>

              <span className="farms-overline">
                YOUR COLLECTION
              </span>

              <h2>
                {farms.length}{" "}
                {farms.length === 1
                  ? "farm"
                  : "farms"}
              </h2>

            </div>

            <span className="farms-list-note">
              Active farms
            </span>

          </div>

          {loading ? (
            <div className="farms-empty-state">

              <div className="farms-loading-mark">
                🌱
              </div>

              <h3>
                Loading your farms...
              </h3>

              <p>
                Fetching your farm information.
              </p>

            </div>
          ) : farms.length === 0 ? (
            <div className="farms-empty-state">

              <div className="farms-empty-icon">
                <Wheat size={30} />
              </div>

              <h3>
                Your farm collection is empty.
              </h3>

              <p>
                Add your first farm to start building
                your digital farming space.
              </p>

              <button
                type="button"
                className="empty-add-button"
                onClick={openCreateForm}
              >
                <Plus size={17} />
                Add Your First Farm
              </button>

            </div>
          ) : (
            <div className="farms-grid">

              {farms.map((farm, index) => (
                <article
                  key={farm._id}
                  className="farm-card"
                >

                  <div
                    className="farm-card-image"
                    style={{
                      backgroundImage: `url("${farmImages[index % farmImages.length]}")`,
                    }}
                  >

                    <div className="farm-card-image-overlay"></div>

                    <div className="farm-card-icon">
                      🌾
                    </div>

                    <span className="farm-card-status">
                      <span></span>
                      Active
                    </span>

                  </div>

                  <div className="farm-card-body">

                    <div className="farm-card-heading">

                      <div>

                        <span className="farm-card-label">
                          FARM
                        </span>

                        <h3>
                          {farm.name}
                        </h3>

                      </div>

                      <MapPin
                        size={18}
                        className="farm-card-pin"
                      />

                    </div>

                    <p className="farm-card-location">
                      {farm.location?.village},{" "}
                      {farm.location?.district},{" "}
                      {farm.location?.state}
                    </p>

                    <div className="farm-card-details">

                      <div>
                        <span>AREA</span>

                        <strong>
                          {farm.area?.value}{" "}
                          {farm.area?.unit}
                        </strong>
                      </div>

                      <div>
                        <span>SOIL</span>

                        <strong>
                          {farm.soilType}
                        </strong>
                      </div>

                      <div>
                        <span>IRRIGATION</span>

                        <strong>
                          {farm.irrigationSource ||
                            "Not specified"}
                        </strong>
                      </div>

                    </div>

                    <div className="farm-card-footer">

                      <button
                        type="button"
                        className="farm-card-action edit"
                        onClick={() =>
                          openEditForm(farm)
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="farm-card-action delete"
                        onClick={() =>
                          handleDelete(farm)
                        }
                      >
                        <Trash2 size={15} />
                        Archive
                      </button>

                      <button
                        type="button"
                        className="farm-card-view"
                        onClick={() =>
                          handleViewFarm(farm._id)
                        }
                      >
                        View
                        <ArrowUpRight size={15} />
                      </button>

                    </div>

                  </div>

                </article>
              ))}

            </div>
          )}

        </section>

      </main>
    </div>
  );
}

export default Farms;