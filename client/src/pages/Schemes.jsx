import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ExternalLink,
  FileText,
  Landmark,
  Leaf,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
} from "../services/schemeService";

import "./Schemes.css";

const emptyForm = {
  title: "",
  summary: "",
  eligibility: "",
  benefits: "",
  applicationUrl: "",
  state: "All India",
  tags: "",
  isActive: true,
};

function getList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.schemes)) return response.schemes;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.schemes)) return response.data.schemes;
  return [];
}

function textValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function schemeTags(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function Schemes() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [schemes, setSchemes] = useState([]);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getSchemes();
      setSchemes(getList(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load government schemes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, []);

  const activeSchemes = useMemo(
    () => schemes.filter((scheme) => scheme.isActive !== false),
    [schemes]
  );

  const availableStates = useMemo(
    () => [
      ...new Set(
        activeSchemes
          .map((scheme) => scheme.state)
          .filter(Boolean)
      ),
    ],
    [activeSchemes]
  );

  const visibleSchemes = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return activeSchemes.filter((scheme) => {
      const matchesState =
        stateFilter === "all" ||
        scheme.state === stateFilter;

      const searchableText = [
        scheme.title,
        scheme.summary,
        scheme.eligibility,
        scheme.benefits,
        scheme.state,
        ...schemeTags(scheme.tags),
      ]
        .map(textValue)
        .join(" ")
        .toLowerCase();

      return (
        matchesState &&
        (!searchText ||
          searchableText.includes(searchText))
      );
    });
  }, [activeSchemes, search, stateFilter]);

  const openCreate = () => {
    setError("");
    setSuccess("");
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (scheme) => {
    setError("");
    setSuccess("");
    setEditingId(scheme._id);

    setForm({
      title: scheme.title || "",
      summary: textValue(scheme.summary),
      eligibility: textValue(scheme.eligibility),
      benefits: textValue(scheme.benefits),
      applicationUrl: scheme.applicationUrl || "",
      state: scheme.state || "All India",
      tags: schemeTags(scheme.tags).join(", "),
      isActive: scheme.isActive !== false,
    });

    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.title.trim() ||
      !form.summary.trim() ||
      !form.eligibility.trim() ||
      !form.benefits.trim()
    ) {
      setError(
        "Title, summary, eligibility and benefits are required."
      );
      return;
    }

    if (form.applicationUrl.trim()) {
      try {
        const url = new URL(form.applicationUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError(
          "Enter a valid application URL starting with http:// or https://."
        );
        return;
      }
    }

    const data = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      eligibility: form.eligibility.trim(),
      benefits: form.benefits.trim(),
      applicationUrl: form.applicationUrl.trim(),
      state: form.state.trim() || "All India",
      tags: schemeTags(form.tags),
      isActive: form.isActive,
    };

    try {
      setSaving(true);

      if (editingId) {
        await updateScheme(editingId, data);
        setSuccess("Scheme updated successfully.");
      } else {
        await createScheme(data);
        setSuccess("Scheme created successfully.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadSchemes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the scheme. Check that you are logged in as an administrator."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scheme) => {
    if (!window.confirm(`Delete "${scheme.title}"?`)) return;

    try {
      setError("");
      setSuccess("");

      await deleteScheme(scheme._id);

      setSuccess("Scheme deleted successfully.");
      setExpandedId(null);

      await loadSchemes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the scheme."
      );
    }
  };

  const handleToggleActive = async (scheme) => {
    try {
      setError("");
      setSuccess("");

      await updateScheme(scheme._id, {
        title: scheme.title,
        summary: scheme.summary,
        eligibility: scheme.eligibility,
        benefits: scheme.benefits,
        applicationUrl: scheme.applicationUrl || "",
        state: scheme.state || "All India",
        tags: schemeTags(scheme.tags),
        isActive: scheme.isActive === false,
      });

      setSuccess(
        scheme.isActive === false
          ? "Scheme activated successfully."
          : "Scheme deactivated successfully."
      );

      await loadSchemes();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update scheme status."
      );
    }
  };

  return (
    <div className="schemes-page">
      <header className="schemes-topbar">
        <div className="schemes-topbar-inner">
          <Link to="/dashboard" className="schemes-back">
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link to="/" className="schemes-logo">
            <span>✦</span>
            Kisan<span>Bandhu</span>
          </Link>

          {isAdmin ? (
            <span className="schemes-role">
              <ShieldCheck size={15} />
              Administrator
            </span>
          ) : (
            <div />
          )}
        </div>
      </header>

      <main className="schemes-content">
        <section className="schemes-intro">
          <div>
            <span className="schemes-overline">
              • GOVERNMENT SCHEME DIRECTORY
            </span>

            <h1>
              Support for your
              <br />
              <em>next season.</em>
            </h1>

            <p>
              Explore farming schemes, understand eligibility
              and find official application information in one place.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              className="scheme-primary-button"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add Scheme
            </button>
          )}
        </section>

        {error && (
          <div className="schemes-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="schemes-message success">
            <Check size={17} />
            {success}
          </div>
        )}

        <section className="schemes-search-panel">
          <div className="schemes-search-box">
            <Search size={19} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search schemes, eligibility, benefits or keywords..."
              aria-label="Search government schemes"
            />
          </div>

          <div className="schemes-filter">
            <label htmlFor="schemeState">
              State
            </label>

            <select
              id="schemeState"
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
            >
              <option value="all">All states</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="schemes-results">
          <div className="schemes-results-heading">
            <div>
              <span className="schemes-overline">
                AVAILABLE SUPPORT
              </span>

              <h2>
                {visibleSchemes.length}{" "}
                {visibleSchemes.length === 1 ? "scheme" : "schemes"}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="schemes-empty">
              Loading government schemes…
            </div>
          ) : visibleSchemes.length === 0 ? (
            <div className="schemes-empty">
              <Landmark size={29} />
              <h3>No matching schemes found.</h3>
              <p>
                Try another keyword or state. Administrators can add schemes.
              </p>
              {isAdmin && (
                <button
                  type="button"
                  className="scheme-primary-button"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  Add First Scheme
                </button>
              )}
            </div>
          ) : (
            <div className="schemes-grid">
              {visibleSchemes.map((scheme) => {
                const expanded = expandedId === scheme._id;

                return (
                  <article
                    className="scheme-card"
                    key={scheme._id}
                  >
                    <div className="scheme-card-top">
                      <div className="scheme-card-icon">
                        <Landmark size={23} />
                      </div>

                      <span className="scheme-card-state">
                        {scheme.state || "All India"}
                      </span>
                    </div>

                    <h3>{scheme.title}</h3>
                    <p className="scheme-summary">
                      {textValue(scheme.summary)}
                    </p>

                    <div className="scheme-tags">
                      {schemeTags(scheme.tags).slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="scheme-details-button"
                      onClick={() =>
                        setExpandedId(expanded ? null : scheme._id)
                      }
                    >
                      {expanded ? "Hide Details" : "View Scheme Details"}
                      <ArrowUpRight size={16} />
                    </button>

                    {expanded && (
                      <div className="scheme-expanded-details">
                        <div>
                          <span>
                            <Leaf size={14} />
                            ELIGIBILITY
                          </span>
                          <p>{textValue(scheme.eligibility) || "Not specified"}</p>
                        </div>

                        <div>
                          <span>
                            <FileText size={14} />
                            BENEFITS
                          </span>
                          <p>{textValue(scheme.benefits) || "Not specified"}</p>
                        </div>

                        {scheme.applicationUrl && (
                          <a
                            className="scheme-application-link"
                            href={scheme.applicationUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Official application website
                            <ExternalLink size={15} />
                          </a>
                        )}
                      </div>
                    )}

                    {isAdmin && (
                      <div className="scheme-admin-actions">
                        <button
                          type="button"
                          onClick={() => openEdit(scheme)}
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(scheme)}
                        >
                          {scheme.isActive === false
                            ? "Activate"
                            : "Deactivate"}
                        </button>

                        <button
                          type="button"
                          className="scheme-delete"
                          onClick={() => handleDelete(scheme)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {isAdmin && showForm && (
          <div className="scheme-modal-backdrop">
            <section className="scheme-form-modal">
              <div className="scheme-form-heading">
                <div>
                  <span className="schemes-overline">
                    {editingId ? "EDIT SCHEME" : "NEW SCHEME"}
                  </span>

                  <h2>
                    {editingId ? "Update scheme." : "Add government scheme."}
                  </h2>
                </div>

                <button
                  type="button"
                  className="scheme-close-button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  <X size={19} />
                </button>
              </div>

              <form className="scheme-form" onSubmit={handleSubmit}>
                <label>
                  Scheme Title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Summary *
                  <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </label>

                <label>
                  Eligibility *
                  <textarea
                    name="eligibility"
                    value={form.eligibility}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </label>

                <label>
                  Benefits *
                  <textarea
                    name="benefits"
                    value={form.benefits}
                    onChange={handleChange}
                    rows="3"
                    required
                  />
                </label>

                <div className="scheme-form-two-columns">
                  <label>
                    State
                    <input
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="All India"
                    />
                  </label>

                  <label>
                    Tags
                    <input
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      placeholder="farmer, crop, subsidy"
                    />
                  </label>
                </div>

                <label>
                  Application URL
                  <input
                    name="applicationUrl"
                    type="url"
                    value={form.applicationUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </label>

                <label className="scheme-active-checkbox">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  Make this scheme visible to farmers
                </label>

                <div className="scheme-form-actions">
                  <button
                    type="button"
                    className="scheme-cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="scheme-primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Update Scheme"
                      : "Create Scheme"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Schemes;