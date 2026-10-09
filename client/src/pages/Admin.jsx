
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ExternalLink,
  FileText,
  Landmark,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSchemes } from "../services/schemeService";
import "./Admin.css";

function extractList(response, key) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.[key],
    response?.data?.[key],
    response?.data?.data?.[key],
    response?.result?.[key],
    response?.result,
    response?.data,
    response?.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function extractUser(response) {
  return (
    response?.user ||
    response?.data?.user ||
    response?.data ||
    response
  );
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [schemes, setSchemes] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schemeError, setSchemeError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const isAdmin = user?.role === "admin";

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    setSchemeError("");

    const [usersResult, schemesResult] =
      await Promise.allSettled([
        api.get("/admin/users"),
        getSchemes(),
      ]);

    if (usersResult.status === "fulfilled") {
      setUsers(
        extractList(usersResult.value.data, "users")
      );
    } else {
      setUsers([]);
      setError(
        usersResult.reason?.response?.data?.message ||
          "Unable to load registered users. Check administrator access."
      );
    }

    if (schemesResult.status === "fulfilled") {
      setSchemes(
        extractList(schemesResult.value, "schemes")
      );
    } else {
      setSchemes([]);
      setSchemeError(
        "Unable to load scheme information. Open Government Schemes to retry."
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const farmerCount = users.filter(
    (item) => item.role === "farmer"
  ).length;

  const activeUserCount = users.filter(
    (item) => item.isActive !== false
  ).length;

  const activeSchemeCount = schemes.filter(
    (scheme) => scheme.isActive !== false
  ).length;

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesRole =
        roleFilter === "all" ||
        item.role === roleFilter;

      const searchable = [
        item.name,
        item.email,
        item.phone,
        item.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesRole &&
        (!query || searchable.includes(query));
    });
  }, [users, search, roleFilter]);

  const openUserDetails = async (item) => {
    setSelectedUser(item);
    setDetailError("");
    setDetailLoading(true);

    try {
      const response = await api.get(
        `/admin/users/${item._id}`
      );

      const fullUser = extractUser(response.data);

      if (fullUser && typeof fullUser === "object") {
        setSelectedUser((current) =>
          current?._id === item._id
            ? { ...item, ...fullUser }
            : current
        );
      }
    } catch (err) {
      setDetailError(
        err.response?.data?.message ||
          "Additional user details could not be loaded."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeUserDetails = () => {
    setSelectedUser(null);
    setDetailError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <main className="admin-content">
          <section className="admin-access-denied">
            <ShieldCheck size={38} />

            <h1>Administrator access required.</h1>

            <p>
              Sign in with an administrator account to view registered
              users and manage government schemes.
            </p>

            <Link to="/dashboard" className="admin-primary-button">
              Return to Dashboard
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link to="/dashboard" className="admin-back">
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link to="/" className="admin-logo">
            <span className="admin-logo-mark">✦</span>
            <span>Kisan<span>Bandhu</span></span>
          </Link>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <main className="admin-content">
        <section className="admin-welcome">
          <div>
            <span className="admin-overline">
              • ADMINISTRATION
            </span>

            <h1>
              Admin <em>Dashboard.</em>
            </h1>

            <p>
              Welcome, {user?.name || "Administrator"}.
              Manage registered accounts and government scheme information.
            </p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadAdminData}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Refreshing..." : "Refresh Data"}
          </button>
        </section>

        {error && (
          <div className="admin-message admin-error">
            {error}
          </div>
        )}

        <section className="admin-stat-grid">
          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <Users size={21} />
            </div>

            <span>REGISTERED ACCOUNTS</span>

            <strong>
              {loading ? "—" : users.length}
            </strong>

            <p>Accounts returned by the backend</p>
          </article>

          <article className="admin-stat-card">
            <div className="admin-stat-icon">
              <CircleUserRound size={21} />
            </div>

            <span>REGISTERED FARMERS</span>

            <strong>
              {loading ? "—" : farmerCount}
            </strong>

            <p>Accounts with the farmer role</p>
          </article>

          <article className="admin-stat-card admin-highlight-stat">
            <div className="admin-stat-icon">
              <Landmark size={21} />
            </div>

            <span>ACTIVE SCHEMES</span>

            <strong>
              {loading ? "—" : activeSchemeCount}
            </strong>

            <p>Currently enabled scheme records</p>
          </article>
        </section>

        <section className="admin-main-grid">
          {/* REGISTERED USERS */}

          <article className="admin-panel admin-users-panel">
            <div className="admin-panel-heading">
              <div className="admin-panel-heading-icon">
                <Users size={21} />
              </div>

              <div>
                <span className="admin-overline">
                  ACCOUNT DIRECTORY
                </span>

                <h2>Registered users</h2>

                <p>
                  View accounts and their details.
                </p>
              </div>
            </div>

            <div className="admin-user-summary">
              <span>
                {loading
                  ? "Loading accounts..."
                  : `${visibleUsers.length} ${
                      visibleUsers.length === 1
                        ? "account"
                        : "accounts"
                    }`}
              </span>

              <span>
                <CheckCircle2 size={14} />
                {loading ? "—" : activeUserCount} active
              </span>
            </div>

            <div className="admin-users-toolbar">
              <div className="admin-search">
                <Search size={17} />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search by name, email or phone"
                  aria-label="Search registered users"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value)
                }
                aria-label="Filter users by role"
                className="admin-role-filter"
              >
                <option value="all">All roles</option>
                <option value="farmer">Farmers</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {loading ? (
              <div className="admin-table-empty">
                Loading registered users...
              </div>
            ) : visibleUsers.length === 0 ? (
              <div className="admin-table-empty">
                <Users size={25} />

                <h3>No accounts found.</h3>

                <p>
                  Try another search or role filter.
                </p>
              </div>
            ) : (
              <div className="admin-table-scroll">
                <table className="admin-users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleUsers.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                              {(item.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {item.name || "Unnamed user"}
                              </strong>

                              <span>
                                {item.email || "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-role-badge role-${item.role || "unknown"}`}
                          >
                            {item.role || "Unknown"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              item.isActive === false
                                ? "admin-status inactive"
                                : "admin-status active"
                            }
                          >
                            {item.isActive === false
                              ? "Inactive"
                              : "Active"}
                          </span>
                        </td>

                        <td>
                          <span className="admin-joined-date">
                            {formatDate(item.createdAt)}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-view-user"
                            onClick={() =>
                              openUserDetails(item)
                            }
                          >
                            View
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>

          {/* SCHEME MANAGEMENT */}

          <aside className="admin-schemes-panel">
            <div className="admin-scheme-art">
              <Landmark size={33} strokeWidth={1.5} />

              <span>SCHEME DIRECTORY</span>
            </div>

            <div className="admin-scheme-content">
              <span className="admin-overline">
                FARMER SUPPORT
              </span>

              <h2>
                Government schemes,
                <br />
                managed in one place.
              </h2>

              <p>
                Review the scheme directory, update eligibility
                information and keep available support information organized.
              </p>

              {schemeError && (
                <p className="admin-scheme-error">
                  {schemeError}
                </p>
              )}

              <div className="admin-scheme-count">
                <div>
                  <FileText size={19} />

                  <span>
                    All scheme records
                  </span>
                </div>

                <strong>
                  {loading ? "—" : schemes.length}
                </strong>
              </div>

              {schemes.length > 0 && (
                <div className="admin-scheme-preview">
                  {schemes.slice(0, 3).map((scheme) => (
                    <div
                      className="admin-scheme-preview-item"
                      key={scheme._id}
                    >
                      <div>
                        <strong>{scheme.title}</strong>

                        <span>
                          {scheme.state || "All India"}
                        </span>
                      </div>

                      <span
                        className={
                          scheme.isActive === false
                            ? "admin-status inactive"
                            : "admin-status active"
                        }
                      >
                        {scheme.isActive === false
                          ? "Inactive"
                          : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                to="/schemes"
                className="admin-schemes-link"
              >
                Manage Government Schemes
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </aside>
        </section>

        <section className="admin-footer-note">
          <div>
            <ShieldCheck size={19} />

            <span>
              Administrator workspace
            </span>
          </div>

          <span>
            User information is available to administrators only.
          </span>
        </section>
      </main>

      {/* USER DETAILS MODAL */}

      {selectedUser && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUserDetails();
            }
          }}
        >
          <section
            className="admin-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-details-title"
          >
            <div className="admin-modal-heading">
              <div>
                <span className="admin-overline">
                  ACCOUNT INFORMATION
                </span>

                <h2 id="admin-user-details-title">
                  User details
                </h2>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeUserDetails}
                aria-label="Close user details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="admin-modal-user">
              <div className="admin-modal-avatar">
                {(selectedUser.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {selectedUser.name || "Unnamed user"}
                </h3>

                <span
                  className={`admin-role-badge role-${selectedUser.role || "unknown"}`}
                >
                  {selectedUser.role || "Unknown role"}
                </span>
              </div>
            </div>

            {detailLoading && (
              <p className="admin-detail-loading">
                Loading complete account information...
              </p>
            )}

            {detailError && (
              <div className="admin-message admin-error">
                {detailError}
              </div>
            )}

            <div className="admin-user-detail-grid">
              <div>
                <Mail size={17} />
                <span>Email address</span>
                <strong>
                  {selectedUser.email || "Not provided"}
                </strong>
              </div>

              <div>
                <Phone size={17} />
                <span>Phone number</span>
                <strong>
                  {selectedUser.phone || "Not provided"}
                </strong>
              </div>

              <div>
                <CalendarDays size={17} />
                <span>Registration date</span>
                <strong>
                  {formatDate(selectedUser.createdAt)}
                </strong>
              </div>

              <div>
                <BadgeCheck size={17} />
                <span>Account status</span>
                <strong>
                  {selectedUser.isActive === false
                    ? "Inactive"
                    : "Active"}
                </strong>
              </div>

              {selectedUser.location && (
                <div className="admin-detail-full">
                  <Landmark size={17} />
                  <span>Location</span>
                  <strong>
                    {typeof selectedUser.location === "string"
                      ? selectedUser.location
                      : [
                          selectedUser.location.village,
                          selectedUser.location.district,
                          selectedUser.location.state,
                          selectedUser.location.country,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Not provided"}
                  </strong>
                </div>
              )}

              <div>
                <CalendarDays size={17} />
                <span>Last login</span>
                <strong>
                  {formatDate(selectedUser.lastLoginAt)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-modal-done"
              onClick={closeUserDetails}
            >
              Close Details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

export default Admin;
