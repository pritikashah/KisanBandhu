
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  CloudSun,
  Droplets,
  Landmark,
  Leaf,
  MapPin,
  Plus,
  Sprout,
  TrendingUp,
  Wheat,
  Wind,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import { getFarms } from "../services/farmService";
import { getCrops } from "../services/cropService";
import { getExpenses } from "../services/expenseService";
import { getHarvests } from "../services/harvestService";
import { getReminders } from "../services/reminderService";
import { getCurrentWeather } from "../services/weatherService";

import "./Dashboard.css";

function extractList(response, key) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.[key],
    response?.data?.[key],
    response?.data,
    response?.result?.[key],
    response?.result,
    response?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function idOf(value) {
  if (!value) return "";

  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }

  return String(value);
}

function numericValue(value) {
  if (value === null || value === undefined) return 0;

  if (typeof value === "object") {
    if (value.$numberDecimal !== undefined) {
      return Number(value.$numberDecimal) || 0;
    }

    if (value.value !== undefined) {
      return Number(value.value) || 0;
    }
  }

  return Number(value) || 0;
}

function formatCurrency(value) {
  return numericValue(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatCompactCurrency(value) {
  return `₹${numericValue(value).toLocaleString("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  })}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getFarmLocation(farm) {
  const location = farm?.location || {};

  return [
    location.village,
    location.district,
    location.state,
  ]
    .filter(Boolean)
    .join(", ") || "Location not specified";
}

function getRecordFarmId(record) {
  return idOf(record?.farmId);
}

function getRecordCropId(record) {
  return idOf(record?.cropId);
}

function getMoneyFromRecords(records, field) {
  return records.reduce(
    (total, record) => total + numericValue(record[field]),
    0
  );
}

function makeMonthlyPerformance(expenses, harvests) {
  const today = new Date();
  const months = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1
    );

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    months.push({
      key,
      label: date.toLocaleDateString("en-IN", {
        month: "short",
      }),
      revenue: 0,
      expenses: 0,
      profit: 0,
    });
  }

  const monthMap = new Map(
    months.map((month) => [month.key, month])
  );

  for (const harvest of harvests) {
    const dateValue =
      harvest.harvestDate || harvest.createdAt;

    if (!dateValue) continue;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const month = monthMap.get(key);

    if (month) {
      month.revenue += numericValue(harvest.grossRevenue);
    }
  }

  for (const expense of expenses) {
    const dateValue =
      expense.expenseDate || expense.createdAt;

    if (!dateValue) continue;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) continue;

    const key = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;

    const month = monthMap.get(key);

    if (month) {
      month.expenses += numericValue(expense.amount);
    }
  }

  for (const month of months) {
    month.profit = month.revenue - month.expenses;
  }

  return months;
}

function makeChartPaths(months) {
  const values = months.map((month) => month.profit);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const range = maximum - minimum || 1;

  const points = months.map((month, index) => ({
    ...month,
    x: months.length > 1
      ? (index / (months.length - 1)) * 1000
      : 500,
    y: 15 + ((maximum - month.profit) / range) * 250,
  }));

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const lastPoint = points[points.length - 1];

  const areaPath = points.length
    ? `${linePath} L ${lastPoint.x} 280 L ${points[0].x} 280 Z`
    : "";

  return {
    linePath,
    areaPath,
    points,
    minimum,
    maximum,
  };
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function Dashboard() {
  const { user, logout } = useAuth();

  const firstName =
    user?.name?.split(" ")[0] || "Farmer";

  const isAdmin = user?.role === "admin";

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [reminders, setReminders] = useState([]);

  const [weather, setWeather] = useState(null);

  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setDashboardError("");

      const results = await Promise.allSettled([
        getFarms(),
        getCrops(),
        getExpenses(),
        getHarvests(),
        getReminders(),
      ]);

      if (cancelled) return;

      const farmList =
        results[0].status === "fulfilled"
          ? extractList(results[0].value, "farms")
          : [];

      const cropList =
        results[1].status === "fulfilled"
          ? extractList(results[1].value, "crops")
          : [];

      const expenseList =
        results[2].status === "fulfilled"
          ? extractList(results[2].value, "expenses")
          : [];

      const harvestList =
        results[3].status === "fulfilled"
          ? extractList(results[3].value, "harvests")
          : [];

      const reminderList =
        results[4].status === "fulfilled"
          ? extractList(results[4].value, "reminders")
          : [];

      setFarms(farmList);
      setCrops(cropList);
      setExpenses(expenseList);
      setHarvests(harvestList);
      setReminders(reminderList);

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      ).length;

      if (failedRequests > 0) {
        setDashboardError(
          "Some dashboard information could not be loaded. Open the relevant module to check its records."
        );
      }

      setLoading(false);

      const firstFarm = farmList[0];

      if (firstFarm?._id) {
        setWeatherLoading(true);

        try {
          const response = await getCurrentWeather({
            farmId: firstFarm._id,
          });

          if (!cancelled) {
            setWeather(
              response?.weather ||
              response?.data?.weather ||
              response?.data ||
              response
            );
          }
        } catch {
          if (!cancelled) {
            setWeather(null);
          }
        } finally {
          if (!cancelled) {
            setWeatherLoading(false);
          }
        }
      } else {
        setWeather(null);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const featuredFarm = farms[0] || null;

  const featuredFarmId = idOf(featuredFarm?._id);

  const farmCrops = crops.filter(
    (crop) => getRecordFarmId(crop) === featuredFarmId
  );

  const featuredCrop =
    farmCrops.find((crop) => crop.status === "growing") ||
    farmCrops.find((crop) => crop.status !== "cancelled") ||
    null;

  const growingCrops = crops.filter(
    (crop) => crop.status === "growing"
  );

  const activeFarms = farms.length;

  const totalExpenses = getMoneyFromRecords(
    expenses,
    "amount"
  );

  const totalRevenue = getMoneyFromRecords(
    harvests,
    "grossRevenue"
  );

  const netProfit = totalRevenue - totalExpenses;

  const monthlyPerformance = useMemo(
    () => makeMonthlyPerformance(expenses, harvests),
    [expenses, harvests]
  );

  const chart = useMemo(
    () => makeChartPaths(monthlyPerformance),
    [monthlyPerformance]
  );

  const hasChartData = monthlyPerformance.some(
    (month) => month.revenue !== 0 || month.expenses !== 0
  );

  const chartRange = chart.maximum - chart.minimum || 1;

  const chartTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (fraction) =>
      chart.maximum - chartRange * fraction
  );

  const upcomingReminders = useMemo(() => {
    const now = new Date();

    return reminders
      .filter(
        (reminder) =>
          reminder.status === "pending" &&
          reminder.remindAt &&
          new Date(reminder.remindAt) >= now
      )
      .sort(
        (first, second) =>
          new Date(first.remindAt) -
          new Date(second.remindAt)
      )
      .slice(0, 3);
  }, [reminders]);

  const recentActivities = useMemo(() => {
    const cropActivities = crops.map((crop) => ({
      id: `crop-${crop._id}`,
      type: "crop",
      title: `${crop.name || "Crop"} record`,
      detail: `${crop.season || "Season not specified"} · ${formatDate(
        crop.createdAt || crop.sowingDate
      )}`,
      date: crop.createdAt || crop.sowingDate,
    }));

    const expenseActivities = expenses.map((expense) => ({
      id: `expense-${expense._id}`,
      type: "expense",
      title: "Expense recorded",
      detail: `${expense.category || "Expense"} · ₹${formatCurrency(
        expense.amount
      )}`,
      date: expense.createdAt || expense.expenseDate,
    }));

    const harvestActivities = harvests.map((harvest) => ({
      id: `harvest-${harvest._id}`,
      type: "harvest",
      title: "Harvest recorded",
      detail: `Revenue · ₹${formatCurrency(harvest.grossRevenue)}`,
      date: harvest.createdAt || harvest.harvestDate,
    }));

    const reminderActivities = reminders.map((reminder) => ({
      id: `reminder-${reminder._id}`,
      type: "reminder",
      title: reminder.title || "Reminder",
      detail: `${reminder.status || "pending"} · ${formatDate(
        reminder.remindAt
      )}`,
      date: reminder.createdAt || reminder.remindAt,
    }));

    return [
      ...cropActivities,
      ...expenseActivities,
      ...harvestActivities,
      ...reminderActivities,
    ]
      .filter(
        (activity) =>
          activity.date &&
          !Number.isNaN(new Date(activity.date).getTime())
      )
      .sort(
        (first, second) =>
          new Date(second.date) - new Date(first.date)
      )
      .slice(0, 3);
  }, [crops, expenses, harvests, reminders]);

  const currentTemperature =
    weather?.temp ??
    weather?.temperature ??
    weather?.main?.temp;

  const currentCondition =
    weather?.condition ??
    weather?.description ??
    weather?.weather?.[0]?.description ??
    "Weather unavailable";

  const currentCity =
    weather?.city ||
    weather?.name ||
    featuredFarm?.location?.village ||
    "Farm location";

  const humidity =
    weather?.humidity ??
    weather?.main?.humidity;

  const windSpeed =
    weather?.windSpeed ??
    weather?.wind_speed ??
    (weather?.wind?.speed !== undefined
      ? Number(weather.wind.speed) * 3.6
      : undefined);

  function getFarmName(farmId) {
    const farm = farms.find(
      (item) => idOf(item) === idOf(farmId)
    );

    return farm?.name || "Farm";
  }

  function getCropName(cropId) {
    const crop = crops.find(
      (item) => idOf(item) === idOf(cropId)
    );

    return crop?.name || "Crop";
  }

  function getCropBackground(name) {
    const normalized = (name || "").toLowerCase();

    if (normalized.includes("wheat")) return "wheat-bg";
    if (
      normalized.includes("rice") ||
      normalized.includes("paddy")
    ) {
      return "rice-bg";
    }

    return "vegetable-bg";
  }

  function getCropEmoji(name) {
    const normalized = (name || "").toLowerCase();

    if (normalized.includes("wheat")) return "🌾";
    if (
      normalized.includes("rice") ||
      normalized.includes("paddy")
    ) {
      return "🌱";
    }

    return "🌿";
  }

  function getActivityIcon(type) {
    if (type === "crop" || type === "harvest") {
      return <Wheat size={18} />;
    }

    if (type === "expense") return "₹";

    if (type === "reminder") {
      return <CalendarDays size={18} />;
    }

    return <Leaf size={18} />;
  }

  const cropStatuses = {
    planned: "Planned",
    growing: "Growing",
    harvested: "Harvested",
    cancelled: "Cancelled",
  };

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

            <Link
              to="/farms"
              className="dashboard-menu-link"
            >
              My Farms
            </Link>

            <Link
              to="/crops"
              className="dashboard-menu-link"
            >
              Crops
            </Link>

            <Link
              to="/expenses"
              className="dashboard-menu-link"
            >
              Finances
            </Link>

            <Link
              to="/weather-reminders"
              className="dashboard-menu-link"
            >
              Weather
            </Link>
          </nav>

          <div className="dashboard-user-actions">
            <Link
              to="/weather-reminders"
              className="notification-button"
              aria-label="Reminders and notifications"
              title="Open reminders"
            >
              <Bell size={19} />
              {upcomingReminders.length > 0 && (
                <span className="notification-indicator" />
              )}
            </Link>

            <div className="user-chip">
              <div className="user-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="user-chip-text">
                <strong>{firstName}</strong>
                <span>{isAdmin ? "Administrator" : "Farmer"}</span>
              </div>

              <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        {dashboardError && (
          <div
            role="status"
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "12px",
              background: "#f4e8d8",
              color: "#795b36",
              fontSize: "0.78rem",
            }}
          >
            {dashboardError}
          </div>
        )}

        {/* WELCOME */}

        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-overline">
              YOUR FARM · TODAY
            </span>

            <h1>
              {getGreeting()},{" "}
              <em>{firstName}.</em>
            </h1>

            <p>
              Everything you need to keep your farm moving forward,
              all in one place.
            </p>
          </div>

          <div className="welcome-actions">
            <Link
              to="/crops"
              className="quick-action secondary"
            >
              <Plus size={17} />
              Add Crop
            </Link>

            <Link
              to="/farms"
              className="quick-action primary"
            >
              <Plus size={17} />
              Add Farm
            </Link>
          </div>
        </section>

        {/* FEATURED FARM */}

        <section className="featured-farm-card">
          <div className="featured-farm-content">
            <div className="featured-farm-top">
              <span className="featured-overline">
                {featuredFarm ? "YOUR FARM" : "GET STARTED"}
              </span>

              {featuredFarm && (
                <span className="farm-status">
                  <span />
                  Active
                </span>
              )}
            </div>

            <h2>
              {loading
                ? "Loading your farms..."
                : featuredFarm?.name || "Your first farm awaits"}
            </h2>

            <div className="featured-location">
              <MapPin size={16} />
              <span>
                {featuredFarm
                  ? getFarmLocation(featuredFarm)
                  : "Add your farm location to begin"}
              </span>
            </div>

            <p className="featured-copy">
              {featuredFarm
                ? featuredCrop
                  ? `${featuredCrop.name} is currently marked as ${cropStatuses[featuredCrop.status] || featuredCrop.status}. Keep your land, crops, expenses and reminders organized here.`
                  : "Your farm is registered. Add a crop to start recording this season's progress and harvests."
                : "Register your farmland to manage crop seasons, farming costs, harvests and weather updates in one place."}
            </p>

            <div className="featured-farm-stats">
              <div>
                <span>AREA</span>
                <strong>
                  {featuredFarm?.area?.value !== undefined
                    ? `${featuredFarm.area.value} ${featuredFarm.area.unit || ""}`.trim()
                    : "Not specified"}
                </strong>
              </div>

              <div>
                <span>SOIL</span>
                <strong>
                  {featuredFarm?.soilType || "Not specified"}
                </strong>
              </div>

              <div>
                <span>IRRIGATION</span>
                <strong>
                  {featuredFarm?.irrigationSource || "Not specified"}
                </strong>
              </div>
            </div>

            <div className="featured-farm-footer">
              <div className="current-crop">
                <div className="current-crop-icon">
                  {featuredCrop
                    ? getCropEmoji(featuredCrop.name)
                    : <Sprout size={21} />}
                </div>

                <div>
                  <span>
                    {featuredCrop ? "Current crop" : "Crop records"}
                  </span>

                  <strong>
                    {featuredCrop
                      ? `${featuredCrop.name} · ${featuredCrop.season || "Season not specified"}`
                      : "No crop selected"}
                  </strong>
                </div>
              </div>

              <Link
                to={
                  featuredFarm
                    ? `/farms/${featuredFarm._id}`
                    : "/farms"
                }
                className="featured-view-button"
              >
                {featuredFarm ? "View farm" : "Add farm"}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="featured-farm-visual">
            <div className="farm-visual-overlay" />

            <div className="farm-visual-badge">
              <Sprout size={17} />

              <div>
                <span>Farm workspace</span>
                <strong>
                  {featuredFarm ? "Connected" : "Ready to start"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* SEASON SNAPSHOT */}

        <section className="season-snapshot">
          <div className="snapshot-heading">
            <span>YOUR FARM AT A GLANCE</span>
          </div>

          <div className="snapshot-grid">
            <div className="snapshot-item">
              <div className="snapshot-icon">
                <Wheat size={21} />
              </div>

              <div>
                <span>Active Farms</span>
                <strong>{loading ? "—" : activeFarms}</strong>
              </div>
            </div>

            <div className="snapshot-item">
              <div className="snapshot-icon">
                <Leaf size={21} />
              </div>

              <div>
                <span>Growing Crops</span>
                <strong>
                  {loading ? "—" : growingCrops.length}
                </strong>
              </div>
            </div>

            <div className="snapshot-item">
              <div className="snapshot-icon">₹</div>

              <div>
                <span>Recorded Expenses</span>
                <strong>
                  {loading
                    ? "—"
                    : `₹${formatCurrency(totalExpenses)}`}
                </strong>
              </div>
            </div>

            <div className="snapshot-item profit-snapshot">
              <div className="snapshot-icon">
                <TrendingUp size={21} />
              </div>

              <div>
                <span>Net Profit</span>
                <strong>
                  {loading
                    ? "—"
                    : `₹${formatCurrency(netProfit)}`}
                </strong>

                <small>
                  {loading
                    ? "Loading records"
                    : "Harvest revenue − expenses"}
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* WEATHER + CROPS */}

        <section className="dashboard-feature-grid">
          <article className="info-card weather-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  FARM WEATHER
                </span>

                <h2>Conditions today</h2>
              </div>

              <Link
                to="/weather-reminders"
                className="round-arrow"
                aria-label="Open weather and reminders"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="weather-main">
              <div className="weather-reading">
                <CloudSun
                  size={69}
                  strokeWidth={1.25}
                />

                <div>
                  <strong>
                    {currentTemperature !== undefined &&
                    currentTemperature !== null
                      ? `${Math.round(Number(currentTemperature))}°`
                      : "—"}
                  </strong>

                  <span>
                    {weatherLoading
                      ? "Loading weather..."
                      : currentCondition}
                  </span>
                </div>
              </div>

              <div className="weather-location">
                <MapPin size={15} />
                {currentCity}
              </div>
            </div>

            <div className="weather-stats">
              <div>
                <Droplets size={19} />

                <span>
                  Humidity
                  <strong>
                    {humidity !== undefined && humidity !== null
                      ? `${humidity}%`
                      : "—"}
                  </strong>
                </span>
              </div>

              <div>
                <Wind size={19} />

                <span>
                  Wind
                  <strong>
                    {windSpeed !== undefined && windSpeed !== null
                      ? `${Math.round(Number(windSpeed))} km/h`
                      : "—"}
                  </strong>
                </span>
              </div>

              <div>
                <Leaf size={19} />

                <span>
                  Weather data
                  <strong>
                    {weather ? "Available" : "Unavailable"}
                  </strong>
                </span>
              </div>
            </div>

            {!featuredFarm && !loading && (
              <p style={{ marginTop: "12px", fontSize: "0.75rem" }}>
                Add a farm to request local weather.
              </p>
            )}
          </article>

          <article className="info-card crops-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  YOUR CROPS
                </span>

                <h2>What's growing</h2>
              </div>

              <Link
                to="/crops"
                className="text-arrow-button"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <p>Loading crop records...</p>
            ) : crops.length === 0 ? (
              <div className="dashboard-module-empty">
                <Sprout size={25} />
                <p>No crops recorded yet.</p>
                <Link to="/crops">Add your first crop →</Link>
              </div>
            ) : (
              <div className="crop-list">
                {crops.slice(0, 4).map((crop) => (
                  <Link
                    to={`/crops/${crop._id}`}
                    className="crop-item"
                    key={crop._id}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      className={`crop-image ${getCropBackground(
                        crop.name
                      )}`}
                    >
                      {getCropEmoji(crop.name)}
                    </div>

                    <div className="crop-name">
                      <strong>{crop.name}</strong>
                      <span>
                        {crop.season || "Season not specified"} ·{" "}
                        {cropStatuses[crop.status] || crop.status || "Status unavailable"}
                      </span>
                    </div>

                    <div className="crop-progress-block">
                      <div>
                        <span>
                          {crop.expectedYield?.value !== undefined
                            ? `${crop.expectedYield.value} ${crop.expectedYield.unit || ""}`.trim()
                            : "Yield not set"}
                        </span>
                      </div>
                      <small>
                        {crop.expectedHarvestDate
                          ? `Harvest · ${formatDate(crop.expectedHarvestDate)}`
                          : "Harvest date not set"}
                      </small>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>

        {/* PERFORMANCE */}

        <section className="performance-section">
          <div className="performance-top">
            <div>
              <span className="card-overline">
                FARM PERFORMANCE
              </span>

              <h2>Your recorded performance.</h2>

              <p>
                Compare recorded harvest revenue against recorded expenses.
                Profit is calculated as revenue minus expenses.
              </p>
            </div>

            <div className="performance-number">
              <span>NET PROFIT</span>
              <strong>
                {loading
                  ? "—"
                  : `₹${formatCurrency(netProfit)}`}
              </strong>
              <small>
                Based on recorded transactions
              </small>
            </div>
          </div>

          {hasChartData ? (
            <>
              <div className="large-chart">
                <div className="chart-labels">
                  {chartTicks.map((tick, index) => (
                    <span key={`${tick}-${index}`}>
                      {formatCompactCurrency(tick)}
                    </span>
                  ))}
                </div>

                <div className="chart-body">
                  <div className="chart-lines">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>

                  <svg
                    viewBox="0 0 1000 300"
                    preserveAspectRatio="none"
                    className="chart-svg"
                    role="img"
                    aria-label="Monthly recorded net profit chart"
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
                      d={chart.areaPath}
                      fill="url(#dashboardChartFill)"
                    />

                    <path
                      d={chart.linePath}
                      fill="none"
                      stroke="#48724D"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {chart.points.map((point) => (
                      <circle
                        key={point.key}
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#48724D"
                      />
                    ))}
                  </svg>

                  <div className="chart-months">
                    {monthlyPerformance.map((month) => (
                      <span key={month.key}>
                        {month.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="performance-bottom">
                <div>
                  <span>Harvest revenue</span>
                  <strong>₹{formatCurrency(totalRevenue)}</strong>
                </div>

                <div>
                  <span>Total expenses</span>
                  <strong>₹{formatCurrency(totalExpenses)}</strong>
                </div>

                <div>
                  <span>Net profit</span>
                  <strong>₹{formatCurrency(netProfit)}</strong>
                </div>
              </div>
            </>
          ) : (
            <div className="dashboard-module-empty performance-empty">
              <TrendingUp size={27} />

              <h3>
                Your performance chart will appear here.
              </h3>

              <p>
                Add actual harvest and expense records to see monthly
                revenue, costs and profit.
              </p>

              <Link to="/expenses">
                Manage financial records →
              </Link>
            </div>
          )}
        </section>

        {/* ACTIVITIES */}

        <section className="dashboard-activity-grid">
          <article className="activity-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  WHAT'S NEXT
                </span>

                <h2>Upcoming activities</h2>
              </div>

              <Link
                to="/weather-reminders"
                className="text-arrow-button"
              >
                See all →
              </Link>
            </div>

            {upcomingReminders.length === 0 ? (
              <div className="dashboard-module-empty">
                <CalendarDays size={25} />
                <p>No upcoming pending reminders.</p>
                <Link to="/weather-reminders">
                  Add a reminder →
                </Link>
              </div>
            ) : (
              <div className="activities-list">
                {upcomingReminders.map((reminder) => {
                  const date = new Date(reminder.remindAt);

                  return (
                    <Link
                      to="/weather-reminders"
                      className="activity-item"
                      key={reminder._id}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      <div className="activity-date">
                        <span>
                          {date
                            .toLocaleDateString("en-IN", {
                              month: "short",
                            })
                            .toUpperCase()}
                        </span>

                        <strong>
                          {date.getDate()}
                        </strong>
                      </div>

                      <div className="activity-details">
                        <strong>{reminder.title}</strong>

                        <span>
                          {reminder.cropId
                            ? `${getCropName(reminder.cropId)} · `
                            : ""}
                          {reminder.farmId
                            ? getFarmName(reminder.farmId)
                            : "Farm activity"}
                        </span>
                      </div>

                      <ChevronRight size={18} />
                    </Link>
                  );
                })}
              </div>
            )}
          </article>

          <article className="activity-card">
            <div className="info-card-header">
              <div>
                <span className="card-overline">
                  RECENT ACTIVITY
                </span>

                <h2>Latest updates</h2>
              </div>

              <Link
                to="/expenses"
                className="round-arrow"
                aria-label="Open financial records"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div className="dashboard-module-empty">
                <Leaf size={25} />
                <p>Your recent records will appear here.</p>
              </div>
            ) : (
              <div className="recent-list">
                {recentActivities.map((activity) => (
                  <Link
                    to={
                      activity.type === "crop"
                        ? "/crops"
                        : activity.type === "reminder"
                        ? "/weather-reminders"
                        : "/expenses"
                    }
                    className="recent-item"
                    key={activity.id}
                    style={{
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      className={`recent-icon ${
                        activity.type === "crop"
                          ? "crop-recent"
                          : activity.type === "expense"
                          ? "expense-recent"
                          : "weather-recent"
                      }`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>

                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                    </div>

                    <span className="recent-check">
                      <ChevronRight size={17} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </article>
        </section>

        {/* QUICK LINKS */}

        <section className="quick-links-section">
          <div className="quick-links-heading">
            <span>YOUR WORKSPACE</span>

            <h2>
              What would you like to manage?
            </h2>
          </div>

          <div className="quick-links-grid">
            <Link
              to="/farms"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
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
            </Link>

            <Link
              to="/crops"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <Sprout size={25} />
                <span>02</span>
              </div>

              <strong>Crops</strong>

              <small>
                Track crops throughout the season.
              </small>

              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/expenses"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <span>03</span>
                ₹
              </div>

              <strong>Expenses & Harvests</strong>

              <small>
                Record costs and harvest revenue.
              </small>

              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/profit-analysis"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <TrendingUp size={25} />
                <span>04</span>
              </div>

              <strong>Profit Analysis</strong>

              <small>
                Review overall and crop-wise performance.
              </small>

              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/weather-reminders"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <CalendarDays size={25} />
                <span>05</span>
              </div>

              <strong>Weather & Reminders</strong>

              <small>
                Check conditions and plan farm activities.
              </small>

              <ArrowUpRight size={18} />
            </Link>

            <Link
              to="/schemes"
              className="quick-link-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div>
                <Landmark size={25} />
                <span>06</span>
              </div>

              <strong>Government Schemes</strong>

              <small>
                Browse eligibility and scheme benefits.
              </small>

              <ArrowUpRight size={18} />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="quick-link-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <Bell size={25} />
                  <span>07</span>
                </div>

                <strong>Admin Dashboard</strong>

                <small>
                  View registered users and account details.
                </small>

                <ArrowUpRight size={18} />
              </Link>
            )}
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

            {isAdmin && (
              <Link to="/admin">
                Admin
              </Link>
            )}

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
