import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Leaf,
  MapPin,
  Pencil,
  Plus,
  Sprout,
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
  createCrop,
  deleteCrop,
  getCrops,
  updateCrop,
} from "../services/cropService";

import { getFarms } from "../services/farmService";

import "./Crops.css";

const emptyForm = {
  farmId: "",
  name: "",
  season: "Kharif",
  sowingDate: "",
  expectedHarvestDate: "",
  expectedYieldValue: "",
  expectedYieldUnit: "quintal",
  expectedSalePrice: "",
  status: "planned",
  notes: "",
};

const cropImages = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1523742813585-8f0f9d3e6a16?auto=format&fit=crop&w=1200&q=85",

  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85",
];

const statusLabels = {
  planned: "Planned",
  growing: "Growing",
  harvested: "Harvested",
  cancelled: "Cancelled",
};

const statusClassNames = {
  planned: "status-planned",
  growing: "status-growing",
  harvested: "status-harvested",
  cancelled: "status-cancelled",
};

function formatDate(date) {
  if (!date) {
    return "Not specified";
  }

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function extractCropList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.crops)) {
    return data.crops;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
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

function getIdValue(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value === "object" &&
    value._id
  ) {
    return String(value._id);
  }

  return String(value);
}

function Crops() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [crops, setCrops] = useState([]);

  const [farms, setFarms] = useState([]);

  const [formData, setFormData] =
    useState(emptyForm);

  const [showForm, setShowForm] =
    useState(false);

  const [editingCropId, setEditingCropId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [farmsLoading, setFarmsLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const formRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setFarmsLoading(true);
      setError("");

      const [
        cropsResponse,
        farmsResponse,
      ] = await Promise.all([
        getCrops(),
        getFarms(),
      ]);

      setCrops(
        extractCropList(
          cropsResponse
        )
      );

      setFarms(
        extractFarmList(
          farmsResponse
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load crop information."
      );
    } finally {
      setLoading(false);
      setFarmsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFarmName = (farmId) => {
    const cropFarmId =
      getIdValue(farmId);

    const farm = farms.find(
      (item) =>
        getIdValue(item._id) ===
        cropFarmId
    );

    return farm?.name || "Unknown Farm";
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");

    const firstFarm =
      farms.length > 0
        ? farms[0]._id
        : "";

    setFormData({
      ...emptyForm,
      farmId: firstFarm,
    });

    setEditingCropId(null);
    setShowForm(true);
  };

  const openEditForm = (crop) => {
    setError("");
    setSuccess("");

    setEditingCropId(crop._id);

    setFormData({
      farmId: getIdValue(
        crop.farmId
      ),

      name: crop.name || "",

      season:
        crop.season || "Kharif",

      sowingDate: crop.sowingDate
        ? crop.sowingDate.substring(
            0,
            10
          )
        : "",

      expectedHarvestDate:
        crop.expectedHarvestDate
          ? crop.expectedHarvestDate.substring(
              0,
              10
            )
          : "",

      expectedYieldValue:
        crop.expectedYield?.value !==
          undefined &&
        crop.expectedYield?.value !==
          null
          ? String(
              crop.expectedYield.value
            )
          : "",

      expectedYieldUnit:
        crop.expectedYield?.unit ||
        "quintal",

      expectedSalePrice:
        crop.expectedSalePrice !==
          undefined &&
        crop.expectedSalePrice !==
          null
          ? String(
              crop.expectedSalePrice
            )
          : "",

      status:
        crop.status || "planned",

      notes:
        crop.notes || "",
    });

    setShowForm(true);
  };

  /*
   * When /crops?edit=<cropId> is opened,
   * wait until BOTH crops and farms have
   * finished loading before opening edit mode.
   */
  useEffect(() => {
    const editCropId =
      searchParams.get("edit");

    if (
      !editCropId ||
      !crops.length ||
      farmsLoading
    ) {
      return;
    }

    const cropToEdit = crops.find(
      (crop) =>
        getIdValue(crop._id) ===
        String(editCropId)
    );

    if (cropToEdit) {
      openEditForm(cropToEdit);

      setSearchParams(
        {},
        {
          replace: true,
        }
      );
    }
  }, [
    crops,
    farmsLoading,
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
  }, [
    showForm,
    editingCropId,
  ]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingCropId(null);

    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.farmId ||
      !formData.name.trim() ||
      !formData.sowingDate ||
      !formData.expectedYieldValue
    ) {
      setError(
        "Please fill in all required crop fields."
      );

      return;
    }

    const yieldValue = Number(
      formData.expectedYieldValue
    );

    if (
      Number.isNaN(yieldValue) ||
      yieldValue < 0
    ) {
      setError(
        "Expected yield must be a valid non-negative number."
      );

      return;
    }

    let salePrice;

    if (
      formData.expectedSalePrice !==
      ""
    ) {
      salePrice = Number(
        formData.expectedSalePrice
      );

      if (
        Number.isNaN(salePrice) ||
        salePrice < 0
      ) {
        setError(
          "Expected sale price must be a valid non-negative number."
        );

        return;
      }
    }

    if (
      formData.expectedHarvestDate &&
      new Date(
        formData.expectedHarvestDate
      ) <
        new Date(
          formData.sowingDate
        )
    ) {
      setError(
        "Expected harvest date cannot be before the sowing date."
      );

      return;
    }

    const cropData = {
      farmId: formData.farmId,

      name:
        formData.name.trim(),

      season:
        formData.season,

      sowingDate:
        formData.sowingDate,

      expectedYield: {
        value: yieldValue,
        unit:
          formData.expectedYieldUnit,
      },

      status:
        formData.status,
    };

    if (
      formData.expectedHarvestDate
    ) {
      cropData.expectedHarvestDate =
        formData.expectedHarvestDate;
    }

    if (
      formData.expectedSalePrice !==
      ""
    ) {
      cropData.expectedSalePrice =
        salePrice;
    }

    if (formData.notes.trim()) {
      cropData.notes =
        formData.notes.trim();
    }

    try {
      setSaving(true);

      if (editingCropId) {
        await updateCrop(
          editingCropId,
          cropData
        );

        setSuccess(
          "Crop updated successfully."
        );
      } else {
        await createCrop(
          cropData
        );

        setSuccess(
          "Crop added successfully."
        );
      }

      resetForm();

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to save the crop."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (crop) => {
    const confirmed =
      window.confirm(
        `Cancel "${crop.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteCrop(
        crop._id
      );

      setSuccess(
        "Crop cancelled successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to cancel the crop."
      );
    }
  };

  const handleViewCrop = (
    cropId
  ) => {
    navigate(
      `/crops/${cropId}`
    );
  };

  return (
    <div className="crops-page">

      {/* TOP BAR */}

      <header className="crops-topbar">

        <div className="crops-topbar-inner">

          <Link
            to="/dashboard"
            className="crops-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link
            to="/"
            className="crops-logo"
          >
            <span className="crops-logo-mark">
              ✦
            </span>

            <span>
              Kisan<span>Bandhu</span>
            </span>
          </Link>

          <div></div>

        </div>

      </header>

      <main className="crops-content">

        {/* INTRO */}

        <section className="crops-intro">

          <div>

            <span className="crops-overline">
              • CROP MANAGEMENT
            </span>

            <h1>
              Grow with
              <br />
              <em>clarity.</em>
            </h1>

            <p>
              Track what you're growing,
              when you planted it and what
              you expect from each season.
            </p>

          </div>

          <button
            type="button"
            className="add-crop-main-button"
            onClick={
              openCreateForm
            }
          >
            <Plus size={19} />
            Add New Crop
          </button>

        </section>

        {/* MESSAGES */}

        {success && (
          <div className="crop-message success-crop-message">

            <Check size={18} />

            {success}

          </div>
        )}

        {error && (
          <div className="crop-message error-crop-message">
            {error}
          </div>
        )}

        {/* FORM */}

        {showForm && (
          <section
            ref={formRef}
            className="crop-form-card"
          >

            <div className="crop-form-header">

              <div>

                <span className="crops-overline">
                  {editingCropId
                    ? "EDIT CROP"
                    : "NEW CROP"}
                </span>

                <h2>
                  {editingCropId
                    ? "Update your crop."
                    : "Add your crop."}
                </h2>

              </div>

              <button
                type="button"
                className="crop-close-button"
                onClick={
                  resetForm
                }
                aria-label="Close form"
              >
                <X size={19} />
              </button>

            </div>

            {farmsLoading ? (
              <div className="crop-no-farm-message">

                <Sprout size={25} />

                <div>

                  <h3>
                    Loading your farms...
                  </h3>

                  <p>
                    Getting your active farms
                    ready for this crop.
                  </p>

                </div>

              </div>
            ) : farms.length === 0 ? (
              <div className="crop-no-farm-message">

                <Sprout size={25} />

                <div>

                  <h3>
                    Add a farm first.
                  </h3>

                  <p>
                    Every crop must belong to
                    an active farm.
                  </p>

                  <Link
                    to="/farms"
                    className="go-to-farms-button"
                  >
                    Go to Farms
                    <ArrowUpRight
                      size={15}
                    />
                  </Link>

                </div>

              </div>
            ) : (
              <form
                className="crop-form"
                onSubmit={
                  handleSubmit
                }
              >

                {/* CROP BASICS */}

                <div className="crop-form-section">

                  <span className="crop-form-section-title">
                    CROP INFORMATION
                  </span>

                  <div className="crop-form-grid">

                    <div className="crop-field crop-field-full">

                      <label htmlFor="crop-name">
                        Crop Name *
                      </label>

                      <input
                        id="crop-name"
                        name="name"
                        type="text"
                        placeholder="e.g. Rice"
                        value={
                          formData.name
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    <div className="crop-field">

                      <label htmlFor="farmId">
                        Farm *
                      </label>

                      <select
                        id="farmId"
                        name="farmId"
                        value={
                          formData.farmId
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="">
                          Select Farm
                        </option>

                        {farms.map(
                          (farm) => (
                            <option
                              key={
                                farm._id
                              }
                              value={
                                farm._id
                              }
                            >
                              {farm.name}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    <div className="crop-field">

                      <label htmlFor="season">
                        Season *
                      </label>

                      <select
                        id="season"
                        name="season"
                        value={
                          formData.season
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="Kharif">
                          Kharif
                        </option>

                        <option value="Rabi">
                          Rabi
                        </option>

                        <option value="Zaid">
                          Zaid
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <div className="crop-field">

                      <label htmlFor="status">
                        Status *
                      </label>

                      <select
                        id="status"
                        name="status"
                        value={
                          formData.status
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="planned">
                          Planned
                        </option>

                        <option value="growing">
                          Growing
                        </option>

                        <option value="harvested">
                          Harvested
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                </div>

                {/* DATES */}

                <div className="crop-form-section">

                  <span className="crop-form-section-title">
                    CROP TIMELINE
                  </span>

                  <div className="crop-form-grid">

                    <div className="crop-field">

                      <label htmlFor="sowingDate">
                        Sowing Date *
                      </label>

                      <div className="crop-input-with-icon">

                        <CalendarDays
                          size={16}
                        />

                        <input
                          id="sowingDate"
                          name="sowingDate"
                          type="date"
                          value={
                            formData.sowingDate
                          }
                          onChange={
                            handleChange
                          }
                        />

                      </div>

                    </div>

                    <div className="crop-field">

                      <label htmlFor="expectedHarvestDate">
                        Expected Harvest Date
                      </label>

                      <div className="crop-input-with-icon">

                        <CalendarDays
                          size={16}
                        />

                        <input
                          id="expectedHarvestDate"
                          name="expectedHarvestDate"
                          type="date"
                          value={
                            formData.expectedHarvestDate
                          }
                          onChange={
                            handleChange
                          }
                        />

                      </div>

                    </div>

                  </div>

                </div>

                {/* EXPECTATIONS */}

                <div className="crop-form-section">

                  <span className="crop-form-section-title">
                    EXPECTED OUTPUT
                  </span>

                  <div className="crop-form-grid">

                    <div className="crop-field">

                      <label htmlFor="expectedYieldValue">
                        Expected Yield *
                      </label>

                      <input
                        id="expectedYieldValue"
                        name="expectedYieldValue"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 30"
                        value={
                          formData.expectedYieldValue
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                    <div className="crop-field">

                      <label htmlFor="expectedYieldUnit">
                        Yield Unit *
                      </label>

                      <select
                        id="expectedYieldUnit"
                        name="expectedYieldUnit"
                        value={
                          formData.expectedYieldUnit
                        }
                        onChange={
                          handleChange
                        }
                      >

                        <option value="kg">
                          Kilogram
                        </option>

                        <option value="quintal">
                          Quintal
                        </option>

                      </select>

                    </div>

                    <div className="crop-field">

                      <label htmlFor="expectedSalePrice">
                        Expected Sale Price
                      </label>

                      <input
                        id="expectedSalePrice"
                        name="expectedSalePrice"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 2400"
                        value={
                          formData.expectedSalePrice
                        }
                        onChange={
                          handleChange
                        }
                      />

                    </div>

                  </div>

                </div>

                {/* NOTES */}

                <div className="crop-form-section">

                  <span className="crop-form-section-title">
                    NOTES
                  </span>

                  <div className="crop-field">

                    <label htmlFor="notes">
                      Additional Notes
                    </label>

                    <textarea
                      id="notes"
                      name="notes"
                      rows="4"
                      placeholder="Add any useful information about this crop..."
                      value={
                        formData.notes
                      }
                      onChange={
                        handleChange
                      }
                    ></textarea>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="crop-form-actions">

                  <button
                    type="button"
                    className="cancel-crop-button"
                    onClick={
                      resetForm
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-crop-button"
                    disabled={
                      saving
                    }
                  >

                    {saving
                      ? "Saving..."
                      : editingCropId
                      ? "Update Crop"
                      : "Add Crop"}

                    {!saving && (
                      <ArrowUpRight
                        size={17}
                      />
                    )}

                  </button>

                </div>

              </form>
            )}

          </section>
        )}

        {/* CROP COLLECTION */}

        <section className="crops-list-section">

          <div className="crops-list-header">

            <div>

              <span className="crops-overline">
                YOUR CROP COLLECTION
              </span>

              <h2>
                {crops.length}{" "}
                {crops.length === 1
                  ? "crop"
                  : "crops"}
              </h2>

            </div>

            <span className="crops-list-note">
              Current records
            </span>

          </div>

          {loading ? (
            <div className="crops-empty-state">

              <div className="crops-loading-mark">
                🌱
              </div>

              <h3>
                Loading your crops...
              </h3>

              <p>
                Fetching your crop records.
              </p>

            </div>
          ) : crops.length === 0 ? (
            <div className="crops-empty-state">

              <div className="crops-empty-icon">
                <Wheat size={30} />
              </div>

              <h3>
                Your crop collection is empty.
              </h3>

              <p>
                Add your first crop to start
                tracking your farming season.
              </p>

              <button
                type="button"
                className="empty-add-crop-button"
                onClick={
                  openCreateForm
                }
              >
                <Plus size={17} />
                Add Your First Crop
              </button>

            </div>
          ) : (
            <div className="crops-grid">

              {crops.map(
                (crop, index) => (
                  <article
                    key={
                      crop._id
                    }
                    className="crop-card"
                  >

                    <div
                      className="crop-card-image"
                      style={{
                        backgroundImage:
                          `url("${cropImages[index % cropImages.length]}")`,
                      }}
                    >

                      <div className="crop-card-image-overlay"></div>

                      <span
                        className={`crop-status ${statusClassNames[crop.status] || ""}`}
                      >
                        <span></span>

                        {statusLabels[
                          crop.status
                        ] ||
                          crop.status}

                      </span>

                      <div className="crop-card-icon">

                        <Leaf
                          size={23}
                        />

                      </div>

                    </div>

                    <div className="crop-card-body">

                      <div className="crop-card-heading">

                        <div>

                          <span className="crop-card-label">
                            {
                              crop.season
                            }
                          </span>

                          <h3>
                            {
                              crop.name
                            }
                          </h3>

                        </div>

                        <Sprout
                          size={18}
                          className="crop-heading-icon"
                        />

                      </div>

                      <div className="crop-farm-name">

                        <MapPin
                          size={14}
                        />

                        {
                          getFarmName(
                            crop.farmId
                          )
                        }

                      </div>

                      <div className="crop-card-details">

                        <div>

                          <span>
                            SOWN
                          </span>

                          <strong>
                            {formatDate(
                              crop.sowingDate
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            EXPECTED
                          </span>

                          <strong>
                            {formatDate(
                              crop.expectedHarvestDate
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            YIELD
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

                        </div>

                      </div>

                      <div className="crop-card-footer">

                        <button
                          type="button"
                          className="crop-card-action edit"
                          onClick={() =>
                            openEditForm(
                              crop
                            )
                          }
                        >
                          <Pencil
                            size={15}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="crop-card-action delete"
                          onClick={() =>
                            handleDelete(
                              crop
                            )
                          }
                        >
                          <Trash2
                            size={15}
                          />
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="crop-card-view"
                          onClick={() =>
                            handleViewCrop(
                              crop._id
                            )
                          }
                        >
                          View
                          <ArrowUpRight
                            size={15}
                          />
                        </button>

                      </div>

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default Crops;