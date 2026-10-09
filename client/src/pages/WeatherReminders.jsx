
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, ArrowUpRight, Bell, CalendarDays,
  Check, CheckCircle2, CloudSun, Droplets,
  MapPin, Plus, RefreshCw, Sprout, Trash2, X,
} from "lucide-react";

import {
  getCurrentWeather,
  getWeatherForecast,
} from "../services/weatherService";

import {
  getReminders,
  createReminder,
  updateReminder,
  completeReminder,
  deleteReminder,
} from "../services/reminderService";

import { getFarms } from "../services/farmService";
import { getCrops } from "../services/cropService";

import "./WeatherReminders.css";

function extractList(response, key) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data?.[key])) return response.data[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function idOf(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
}

function dateTimeValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function showDate(value) {
  if (!value) return "Not specified";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function WeatherReminders() {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const [form, setForm] = useState({
    title: "",
    description: "",
    remindAt: "",
    status: "pending",
    farmId: "",
    cropId: "",
  });

  const loadData = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getFarms(),
      getCrops(),
      getReminders(),
    ]);

    if (results[0].status === "fulfilled") {
      const farmList = extractList(results[0].value, "farms");

      setFarms(farmList);

      setSelectedFarmId((previous) => {
        const exists = farmList.some(
          (farm) => idOf(farm) === previous
        );

        return exists ? previous : idOf(farmList[0]);
      });
    } else {
      setFarms([]);
      setError("Unable to load farms.");
    }

    if (results[1].status === "fulfilled") {
      setCrops(extractList(results[1].value, "crops"));
    } else {
      setCrops([]);
    }

    if (results[2].status === "fulfilled") {
      setReminders(extractList(results[2].value, "reminders"));
    } else {
      setReminders([]);
      setError("Unable to load reminders.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFarmName = (farmId) => {
    const farm = farms.find(
      (item) => idOf(item) === idOf(farmId)
    );

    return farm?.name || "Unknown Farm";
  };

  const getCropName = (cropId) => {
    const crop = crops.find(
      (item) => idOf(item) === idOf(cropId)
    );

    return crop?.name || "";
  };

  const loadWeather = async () => {
    if (!selectedFarmId) {
      setWeather(null);
      setForecast([]);
      return;
    }

    setWeatherLoading(true);

    try {
      const [currentResponse, forecastResponse] =
        await Promise.all([
          getCurrentWeather({ farmId: selectedFarmId }),
          getWeatherForecast({ farmId: selectedFarmId }),
        ]);

      setWeather(
        currentResponse?.weather ||
        currentResponse?.current ||
        currentResponse?.data?.weather ||
        currentResponse?.data ||
        currentResponse
      );

      const forecastData =
        forecastResponse?.forecast ||
        forecastResponse?.list ||
        forecastResponse?.data?.forecast ||
        forecastResponse?.data?.list ||
        forecastResponse?.data ||
        [];

      setForecast(
        Array.isArray(forecastData) ? forecastData : []
      );
    } catch (err) {
      setWeather(null);
      setForecast([]);

      setError(
        err.response?.data?.message ||
        "Unable to load weather. Check the farm coordinates and weather API configuration."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      loadWeather();
    }
  }, [selectedFarmId]);

  const startCreate = () => {
    setError("");
    setSuccess("");
    setEditingId(null);

    setForm({
      title: "",
      description: "",
      remindAt: "",
      status: "pending",
      farmId: "",
      cropId: "",
    });

    setShowForm(true);
  };

  const startEdit = (reminder) => {
    setError("");
    setSuccess("");
    setEditingId(reminder._id);

    setForm({
      title: reminder.title || "",
      description: reminder.description || "",
      remindAt: dateTimeValue(reminder.remindAt),
      status: reminder.status || "pending",
      farmId: idOf(reminder.farmId),
      cropId: idOf(reminder.cropId),
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "farmId" ? { cropId: "" } : {}),
    }));
  };

  const refreshReminders = async () => {
    const response = await getReminders();
    setReminders(extractList(response, "reminders"));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.title.trim() ||
      !form.remindAt ||
      !form.status
    ) {
      setError(
        "Reminder title, remindAt, and status are required."
      );
      return;
    }

    const reminderDate = new Date(form.remindAt);

    if (Number.isNaN(reminderDate.getTime())) {
      setError("Please select a valid reminder date and time.");
      return;
    }

    // Important: title, remindAt AND status are sent to the backend.
    const data = {
      title: form.title.trim(),
      remindAt: reminderDate.toISOString(),
      status: form.status,
    };

    if (form.description.trim()) {
      data.description = form.description.trim();
    }

    if (form.farmId) {
      data.farmId = form.farmId;
    }

    if (form.cropId) {
      data.cropId = form.cropId;
    }

    try {
      setSaving(true);

      if (editingId) {
        await updateReminder(editingId, data);
        setSuccess("Reminder updated successfully.");
      } else {
        await createReminder(data);
        setSuccess("Reminder added successfully.");
      }

      closeForm();
      await refreshReminders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save the reminder."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (reminder) => {
    try {
      setError("");
      setSuccess("");

      await completeReminder(reminder._id);

      setSuccess("Reminder marked as completed.");
      await refreshReminders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to complete this reminder."
      );
    }
  };

  const handleDelete = async (reminder) => {
    if (!window.confirm(`Delete reminder "${reminder.title}"?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteReminder(reminder._id);

      setSuccess("Reminder deleted successfully.");
      await refreshReminders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete this reminder."
      );
    }
  };

  const visibleReminders = reminders.filter(
    (reminder) =>
      filter === "all" || reminder.status === filter
  );

  const temperature =
    weather?.temperature ??
    weather?.temp ??
    weather?.main?.temp;

  const feelsLike =
    weather?.feelsLike ??
    weather?.feels_like ??
    weather?.main?.feels_like;

  const humidity =
    weather?.humidity ??
    weather?.main?.humidity;

  const condition =
    weather?.condition ??
    weather?.description ??
    weather?.weather?.[0]?.description ??
    "Weather information";

  const city =
    weather?.city ??
    weather?.name ??
    weather?.location ??
    getFarmName(selectedFarmId);

  return (
    <div className="weather-page">
      <header className="weather-topbar">
        <div className="weather-topbar-inner">
          <Link to="/dashboard" className="weather-back">
            <ArrowLeft size={17} /> Dashboard
          </Link>

          <Link to="/" className="weather-logo">
            <span>✦</span> Kisan<span>Bandhu</span>
          </Link>

          <div />
        </div>
      </header>

      <main className="weather-content">
        <section className="weather-intro">
          <div>
            <span className="weather-overline">
              • WEATHER & REMINDERS
            </span>

            <h1>
              Plan around the <em>weather.</em>
            </h1>

            <p>
              Keep an eye on conditions and stay on top
              of important farming activities.
            </p>
          </div>
        </section>

        {error && (
          <div className="weather-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="weather-message success">
            <Check size={17} /> {success}
          </div>
        )}

        <section className="current-weather-section">
          <div className="weather-section-heading">
            <div>
              <span className="weather-overline">LOCAL CONDITIONS</span>
              <h2>Weather today.</h2>
            </div>

            <button
              type="button"
              className="weather-refresh"
              onClick={loadWeather}
              disabled={weatherLoading}
            >
              <RefreshCw size={15} />
              {weatherLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="weather-farm-picker">
            <label htmlFor="weatherFarm">Choose farm</label>

            <select
              id="weatherFarm"
              value={selectedFarmId}
              onChange={(event) => setSelectedFarmId(event.target.value)}
            >
              <option value="">
                {loading ? "Loading farms..." : "Select a farm"}
              </option>

              {farms.map((farm) => (
                <option key={idOf(farm)} value={idOf(farm)}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>

          <div className="weather-current-card">
            <div className="weather-current-main">
              <div className="weather-current-icon">
                <CloudSun size={42} />
              </div>

              <span className="weather-city">
                {selectedFarmId ? city : "Select a farm"}
              </span>

              <strong>
                {temperature !== undefined && temperature !== null
                  ? `${Math.round(Number(temperature))}°C`
                  : "—"}
              </strong>

              <p>{condition}</p>
            </div>

            <div className="weather-current-stats">
              <div>
                <span>FEELS LIKE</span>
                <strong>
                  {feelsLike !== undefined && feelsLike !== null
                    ? `${Math.round(Number(feelsLike))}°C`
                    : "—"}
                </strong>
              </div>

              <div>
                <Droplets size={19} />
                <span>HUMIDITY</span>
                <strong>
                  {humidity !== undefined && humidity !== null
                    ? `${humidity}%`
                    : "—"}
                </strong>
              </div>

              <div>
                <MapPin size={19} />
                <span>FARM</span>
                <strong>
                  {selectedFarmId
                    ? getFarmName(selectedFarmId)
                    : "Select a farm"}
                </strong>
              </div>
            </div>
          </div>

          <div className="weather-section-heading forecast-heading">
            <div>
              <span className="weather-overline">UPCOMING CONDITIONS</span>
              <h2>Forecast.</h2>
            </div>
          </div>

          {forecast.length === 0 ? (
            <div className="weather-empty">
              {weatherLoading
                ? "Loading forecast…"
                : "Forecast data will appear here when available."}
            </div>
          ) : (
            <div className="forecast-grid">
              {forecast.slice(0, 8).map((item, index) => {
                const temp =
                  item.temperature ??
                  item.temp ??
                  item.main?.temp;

                const date =
                  item.date ??
                  item.dt_txt ??
                  (item.dt
                    ? new Date(item.dt * 1000).toISOString()
                    : "");

                const description =
                  item.condition ??
                  item.description ??
                  item.weather?.[0]?.description ??
                  "Forecast";

                return (
                  <article
                    className="forecast-card"
                    key={`${date}-${index}`}
                  >
                    <span>
                      {date
                        ? new Date(date).toLocaleString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            hour: "2-digit",
                          })
                        : `Period ${index + 1}`}
                    </span>

                    <CloudSun size={23} />

                    <strong>
                      {temp !== undefined && temp !== null
                        ? `${Math.round(Number(temp))}°C`
                        : "—"}
                    </strong>

                    <p>{description}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="reminders-section">
          <div className="weather-section-heading">
            <div>
              <span className="weather-overline">FARM TASKS</span>
              <h2>Don't forget.</h2>
            </div>

            <button
              type="button"
              className="weather-primary-button"
              onClick={startCreate}
            >
              <Plus size={17} /> Add Reminder
            </button>
          </div>

          {showForm && (
            <section className="reminder-form-card">
              <div className="reminder-form-heading">
                <div>
                  <span className="weather-overline">
                    {editingId ? "EDIT REMINDER" : "NEW REMINDER"}
                  </span>

                  <h3>
                    {editingId
                      ? "Update reminder."
                      : "Plan an activity."}
                  </h3>
                </div>

                <button
                  type="button"
                  className="reminder-close"
                  onClick={closeForm}
                  aria-label="Close form"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="reminder-form">
                <div className="reminder-form-grid">
                  <div className="weather-field full">
                    <label htmlFor="reminderTitle">Title *</label>
                    <input
                      id="reminderTitle"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Apply fertilizer"
                    />
                  </div>

                  <div className="weather-field">
                    <label htmlFor="remindAt">Date and time *</label>
                    <input
                      id="remindAt"
                      name="remindAt"
                      type="datetime-local"
                      value={form.remindAt}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="weather-field">
                    <label htmlFor="reminderStatus">Status *</label>
                    <select
                      id="reminderStatus"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="weather-field">
                    <label htmlFor="reminderFarm">Farm</label>
                    <select
                      id="reminderFarm"
                      name="farmId"
                      value={form.farmId}
                      onChange={handleChange}
                    >
                      <option value="">No specific farm</option>
                      {farms.map((farm) => (
                        <option key={idOf(farm)} value={idOf(farm)}>
                          {farm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="weather-field">
                    <label htmlFor="reminderCrop">Crop</label>
                    <select
                      id="reminderCrop"
                      name="cropId"
                      value={form.cropId}
                      onChange={handleChange}
                    >
                      <option value="">No specific crop</option>
                      {crops
                        .filter(
                          (crop) =>
                            !form.farmId ||
                            idOf(crop.farmId) === form.farmId
                        )
                        .map((crop) => (
                          <option key={idOf(crop)} value={idOf(crop)}>
                            {crop.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="weather-field full">
                    <label htmlFor="reminderDescription">Description</label>
                    <textarea
                      id="reminderDescription"
                      name="description"
                      rows="3"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Add details about this activity..."
                    />
                  </div>
                </div>

                <div className="reminder-form-actions">
                  <button
                    type="button"
                    className="weather-cancel-button"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="weather-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Reminder"
                      : "Save Reminder"}

                    {!saving && <ArrowUpRight size={16} />}
                  </button>
                </div>
              </form>
            </section>
          )}

          <div className="reminder-filter-row">
            {["all", "pending", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                type="button"
                className={
                  filter === status
                    ? "reminder-filter active"
                    : "reminder-filter"
                }
                onClick={() => setFilter(status)}
              >
                {status === "all"
                  ? "All"
                  : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="weather-empty">Loading reminders…</div>
          ) : visibleReminders.length === 0 ? (
            <div className="weather-empty">
              <Bell size={25} />
              <h3>No reminders here.</h3>
              <p>
                Add farming activities to keep your schedule organized.
              </p>
            </div>
          ) : (
            <div className="reminders-grid">
              {visibleReminders.map((reminder) => (
                <article className="reminder-card" key={reminder._id}>
                  <div className="reminder-card-icon">
                    {reminder.status === "completed"
                      ? <CheckCircle2 size={21} />
                      : <CalendarDays size={21} />}
                  </div>

                  <div className="reminder-card-main">
                    <span
                      className={`reminder-status status-${reminder.status || "pending"}`}
                    >
                      {reminder.status || "pending"}
                    </span>

                    <h3>{reminder.title}</h3>

                    <p className="reminder-date">
                      {showDate(reminder.remindAt)}
                    </p>

                    {reminder.description && (
                      <p className="reminder-description">
                        {reminder.description}
                      </p>
                    )}

                    {(reminder.farmId || reminder.cropId) && (
                      <p className="reminder-related">
                        {reminder.farmId && (
                          <span>
                            <MapPin size={13} />
                            {getFarmName(reminder.farmId)}
                          </span>
                        )}

                        {reminder.cropId && (
                          <span>
                            <Sprout size={13} />
                            {getCropName(reminder.cropId)}
                          </span>
                        )}
                      </p>
                    )}

                    <div className="reminder-card-actions">
                      <button
                        type="button"
                        onClick={() => startEdit(reminder)}
                      >
                        Edit
                      </button>

                      {reminder.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => handleComplete(reminder)}
                        >
                          <Check size={14} /> Complete
                        </button>
                      )}

                      <button
                        type="button"
                        className="reminder-delete"
                        onClick={() => handleDelete(reminder)}
                      >
                        <Trash2 size={14} /> Delete
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

export default WeatherReminders;
