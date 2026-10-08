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
  CircleDollarSign,
  Coins,
  Edit3,
  Leaf,
  MapPin,
  Plus,
  Receipt,
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
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../services/expenseService";

import {
  createHarvest,
  deleteHarvest,
  getHarvests,
  updateHarvest,
} from "../services/harvestService";

import { getFarms } from "../services/farmService";

import {
  getCrops,
} from "../services/cropService";

import "./Expenses.css";

const emptyExpenseForm = {
  farmId: "",
  cropId: "",
  category: "seeds",
  amount: "",
  expenseDate: "",
  description: "",
  receiptUrl: "",
};

const emptyHarvestForm = {
  farmId: "",
  cropId: "",
  harvestDate: "",
  quantityValue: "",
  quantityUnit: "quintal",
  salePricePerUnit: "",
  buyerName: "",
  notes: "",
};

const expenseCategories = [
  {
    value: "seeds",
    label: "Seeds",
  },
  {
    value: "fertilizer",
    label: "Fertilizer",
  },
  {
    value: "pesticide",
    label: "Pesticide",
  },
  {
    value: "labour",
    label: "Labour",
  },
  {
    value: "irrigation",
    label: "Irrigation",
  },
  {
    value: "machinery",
    label: "Machinery",
  },
  {
    value: "transport",
    label: "Transport",
  },
  {
    value: "other",
    label: "Other",
  },
];

function extractList(
  response,
  key
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    key &&
    Array.isArray(response?.[key])
  ) {
    return response[key];
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(response?.data?.[key])
  ) {
    return response.data[key];
  }

  return [];
}

function formatDate(date) {
  if (!date) {
    return "Not specified";
  }

  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatCurrency(value) {
  const numericValue =
    Number(value) || 0;

  return numericValue.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
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

function Expenses() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [activeTab, setActiveTab] =
    useState("expenses");

  const [expenses, setExpenses] =
    useState([]);

  const [harvests, setHarvests] =
    useState([]);

  const [farms, setFarms] =
    useState([]);

  const [crops, setCrops] =
    useState([]);

  const [expenseForm, setExpenseForm] =
    useState(
      emptyExpenseForm
    );

  const [harvestForm, setHarvestForm] =
    useState(
      emptyHarvestForm
    );

  const [showExpenseForm, setShowExpenseForm] =
    useState(false);

  const [showHarvestForm, setShowHarvestForm] =
    useState(false);

  const [
    editingExpenseId,
    setEditingExpenseId,
  ] = useState(null);

  const [
    editingHarvestId,
    setEditingHarvestId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const expenseFormRef =
    useRef(null);

  const harvestFormRef =
    useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        expensesResponse,
        harvestsResponse,
        farmsResponse,
        cropsResponse,
      ] = await Promise.all([
        getExpenses(),
        getHarvests(),
        getFarms(),
        getCrops(),
      ]);

      setExpenses(
        extractList(
          expensesResponse,
          "expenses"
        )
      );

      setHarvests(
        extractList(
          harvestsResponse,
          "harvests"
        )
      );

      setFarms(
        extractList(
          farmsResponse,
          "farms"
        )
      );

      setCrops(
        extractList(
          cropsResponse,
          "crops"
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load financial records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFarmName = (
    farmId
  ) => {
    const id =
      getIdValue(farmId);

    const farm = farms.find(
      (item) =>
        getIdValue(item._id) ===
        id
    );

    return (
      farm?.name ||
      "Unknown Farm"
    );
  };

  const getCropName = (
    cropId
  ) => {
    if (!cropId) {
      return "All Crops";
    }

    const id =
      getIdValue(cropId);

    const crop = crops.find(
      (item) =>
        getIdValue(item._id) ===
        id
    );

    return (
      crop?.name ||
      "Unknown Crop"
    );
  };

  const resetForms = () => {
    setExpenseForm(
      emptyExpenseForm
    );

    setHarvestForm(
      emptyHarvestForm
    );

    setEditingExpenseId(null);
    setEditingHarvestId(null);

    setShowExpenseForm(false);
    setShowHarvestForm(false);
  };

  const openCreateExpenseForm =
    () => {
      setError("");
      setSuccess("");

      setExpenseForm({
        ...emptyExpenseForm,
        farmId:
          farms[0]?._id || "",
      });

      setEditingExpenseId(null);

      setShowExpenseForm(true);
      setShowHarvestForm(false);

      setActiveTab("expenses");
    };

  const openCreateHarvestForm =
    () => {
      setError("");
      setSuccess("");

      setHarvestForm({
        ...emptyHarvestForm,
        farmId:
          farms[0]?._id || "",
        cropId:
          crops[0]?._id || "",
      });

      setEditingHarvestId(null);

      setShowHarvestForm(true);
      setShowExpenseForm(false);

      setActiveTab("harvests");
    };

  const openEditExpenseForm =
    (expense) => {
      setError("");
      setSuccess("");

      setActiveTab("expenses");

      setEditingExpenseId(
        expense._id
      );

      setExpenseForm({
        farmId:
          getIdValue(
            expense.farmId
          ),

        cropId:
          getIdValue(
            expense.cropId
          ),

        category:
          expense.category ||
          "other",

        amount:
          expense.amount !==
            undefined &&
          expense.amount !==
            null
            ? String(
                expense.amount
              )
            : "",

        expenseDate:
          expense.expenseDate
            ? expense.expenseDate.substring(
                0,
                10
              )
            : "",

        description:
          expense.description ||
          "",

        receiptUrl:
          expense.receiptUrl ||
          "",
      });

      setShowExpenseForm(true);
      setShowHarvestForm(false);
    };

  const openEditHarvestForm =
    (harvest) => {
      setError("");
      setSuccess("");

      setActiveTab("harvests");

      setEditingHarvestId(
        harvest._id
      );

      setHarvestForm({
        farmId:
          getIdValue(
            harvest.farmId
          ),

        cropId:
          getIdValue(
            harvest.cropId
          ),

        harvestDate:
          harvest.harvestDate
            ? harvest.harvestDate.substring(
                0,
                10
              )
            : "",

        quantityValue:
          harvest.quantity
            ?.value !==
            undefined &&
          harvest.quantity
            ?.value !==
            null
            ? String(
                harvest.quantity.value
              )
            : "",

        quantityUnit:
          harvest.quantity
            ?.unit ||
          "quintal",

        salePricePerUnit:
          harvest.salePricePerUnit !==
            undefined &&
          harvest.salePricePerUnit !==
            null
            ? String(
                harvest.salePricePerUnit
              )
            : "",

        buyerName:
          harvest.buyerName ||
          "",

        notes:
          harvest.notes ||
          "",
      });

      setShowHarvestForm(true);
      setShowExpenseForm(false);
    };

  const scrollToForm = (
    ref
  ) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  useEffect(() => {
    if (showExpenseForm) {
      scrollToForm(
        expenseFormRef
      );
    }
  }, [
    showExpenseForm,
    editingExpenseId,
  ]);

  useEffect(() => {
    if (showHarvestForm) {
      scrollToForm(
        harvestFormRef
      );
    }
  }, [
    showHarvestForm,
    editingHarvestId,
  ]);

  useEffect(() => {
    const editExpenseId =
      searchParams.get(
        "editExpense"
      );

    const editHarvestId =
      searchParams.get(
        "editHarvest"
      );

    if (
      editExpenseId &&
      expenses.length
    ) {
      const expense =
        expenses.find(
          (item) =>
            String(
              item._id
            ) ===
            String(
              editExpenseId
            )
        );

      if (expense) {
        openEditExpenseForm(
          expense
        );

        setSearchParams(
          {},
          {
            replace: true,
          }
        );

        return;
      }
    }

    if (
      editHarvestId &&
      harvests.length
    ) {
      const harvest =
        harvests.find(
          (item) =>
            String(
              item._id
            ) ===
            String(
              editHarvestId
            )
        );

      if (harvest) {
        openEditHarvestForm(
          harvest
        );

        setSearchParams(
          {},
          {
            replace: true,
          }
        );
      }
    }
  }, [
    expenses,
    harvests,
    searchParams,
    setSearchParams,
  ]);

  const handleExpenseChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setExpenseForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const handleHarvestChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setHarvestForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const handleExpenseSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !expenseForm.farmId ||
        !expenseForm.amount ||
        !expenseForm.expenseDate
      ) {
        setError(
          "Please fill in the required expense fields."
        );

        return;
      }

      const amount =
        Number(
          expenseForm.amount
        );

      if (
        Number.isNaN(amount) ||
        amount <= 0
      ) {
        setError(
          "Expense amount must be greater than zero."
        );

        return;
      }

      const expenseData = {
        farmId:
          expenseForm.farmId,

        category:
          expenseForm.category,

        amount,

        expenseDate:
          expenseForm.expenseDate,
      };

      if (
        expenseForm.cropId
      ) {
        expenseData.cropId =
          expenseForm.cropId;
      }

      if (
        expenseForm.description.trim()
      ) {
        expenseData.description =
          expenseForm.description.trim();
      }

      if (
        expenseForm.receiptUrl.trim()
      ) {
        expenseData.receiptUrl =
          expenseForm.receiptUrl.trim();
      }

      try {
        setSaving(true);

        if (editingExpenseId) {
          await updateExpense(
            editingExpenseId,
            expenseData
          );

          setSuccess(
            "Expense updated successfully."
          );
        } else {
          await createExpense(
            expenseData
          );

          setSuccess(
            "Expense added successfully."
          );
        }

        setExpenseForm(
          emptyExpenseForm
        );

        setEditingExpenseId(
          null
        );

        setShowExpenseForm(
          false
        );

        await loadData();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to save the expense."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleHarvestSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        !harvestForm.farmId ||
        !harvestForm.cropId ||
        !harvestForm.harvestDate ||
        !harvestForm.quantityValue ||
        !harvestForm.salePricePerUnit
      ) {
        setError(
          "Please fill in the required harvest fields."
        );

        return;
      }

      const quantity =
        Number(
          harvestForm.quantityValue
        );

      const salePrice =
        Number(
          harvestForm.salePricePerUnit
        );

      if (
        Number.isNaN(
          quantity
        ) ||
        quantity <= 0
      ) {
        setError(
          "Harvest quantity must be greater than zero."
        );

        return;
      }

      if (
        Number.isNaN(
          salePrice
        ) ||
        salePrice <= 0
      ) {
        setError(
          "Sale price must be greater than zero."
        );

        return;
      }

      const harvestData = {
        farmId:
          harvestForm.farmId,

        cropId:
          harvestForm.cropId,

        harvestDate:
          harvestForm.harvestDate,

        quantity: {
          value:
            quantity,

          unit:
            harvestForm.quantityUnit,
        },

        salePricePerUnit:
          salePrice,
      };

      if (
        harvestForm.buyerName.trim()
      ) {
        harvestData.buyerName =
          harvestForm.buyerName.trim();
      }

      if (
        harvestForm.notes.trim()
      ) {
        harvestData.notes =
          harvestForm.notes.trim();
      }

      try {
        setSaving(true);

        if (editingHarvestId) {
          await updateHarvest(
            editingHarvestId,
            harvestData
          );

          setSuccess(
            "Harvest updated successfully."
          );
        } else {
          await createHarvest(
            harvestData
          );

          setSuccess(
            "Harvest added successfully."
          );
        }

        setHarvestForm(
          emptyHarvestForm
        );

        setEditingHarvestId(
          null
        );

        setShowHarvestForm(
          false
        );

        await loadData();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to save the harvest."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDeleteExpense =
    async (expense) => {
      const confirmed =
        window.confirm(
          `Delete this ${expense.category} expense of ₹${expense.amount}?`
        );

      if (!confirmed) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        await deleteExpense(
          expense._id
        );

        setSuccess(
          "Expense deleted successfully."
        );

        await loadData();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to delete the expense."
        );
      }
    };

  const handleDeleteHarvest =
    async (harvest) => {
      const confirmed =
        window.confirm(
          `Delete this harvest record for ${getCropName(
            harvest.cropId
          )}?`
        );

      if (!confirmed) {
        return;
      }

      setError("");
      setSuccess("");

      try {
        await deleteHarvest(
          harvest._id
        );

        setSuccess(
          "Harvest deleted successfully."
        );

        await loadData();
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to delete the harvest."
        );
      }
    };

  const totalExpenses =
    expenses.reduce(
      (
        total,
        expense
      ) =>
        total +
        (Number(
          expense.amount
        ) || 0),
      0
    );

  const totalRevenue =
    harvests.reduce(
      (
        total,
        harvest
      ) =>
        total +
        (Number(
          harvest.grossRevenue
        ) || 0),
      0
    );

  const calculatedProfit =
    totalRevenue -
    totalExpenses;

  return (
    <div className="expenses-page">

      {/* TOP BAR */}

      <header className="expenses-topbar">

        <div className="expenses-topbar-inner">

          <Link
            to="/dashboard"
            className="expenses-back"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>

          <Link
            to="/"
            className="expenses-logo"
          >
            <span className="expenses-logo-mark">
              ✦
            </span>

            <span>
              Kisan<span>Bandhu</span>
            </span>
          </Link>

          <div></div>

        </div>

      </header>

      <main className="expenses-content">

        {/* INTRO */}

        <section className="expenses-intro">

          <div>

            <span className="expenses-overline">
              • FINANCIAL MANAGEMENT
            </span>

            <h1>
              Know where
              <br />
              <em>every rupee goes.</em>
            </h1>

            <p>
              Record your farming expenses,
              harvest revenue and understand the
              real picture of your farm's finances.
            </p>

          </div>

          <button
            type="button"
            className="add-expense-main-button"
            onClick={
              activeTab ===
              "expenses"
                ? openCreateExpenseForm
                : openCreateHarvestForm
            }
          >
            <Plus size={19} />

            {activeTab ===
            "expenses"
              ? "Add Expense"
              : "Add Harvest"}

          </button>

        </section>

        {/* MESSAGES */}

        {success && (
          <div className="financial-message success-financial-message">

            <Check size={18} />

            {success}

          </div>
        )}

        {error && (
          <div className="financial-message error-financial-message">
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="financial-summary-grid">

          <div className="financial-summary-card">

            <div className="financial-summary-icon">
              <Receipt size={21} />
            </div>

            <span>
              TOTAL EXPENSES
            </span>

            <strong>
              ₹
              {formatCurrency(
                totalExpenses
              )}
            </strong>

            <p>
              {expenses.length} recorded
              expense
              {expenses.length ===
              1
                ? ""
                : "s"}
            </p>

          </div>

          <div className="financial-summary-card">

            <div className="financial-summary-icon">
              <Coins size={21} />
            </div>

            <span>
              HARVEST REVENUE
            </span>

            <strong>
              ₹
              {formatCurrency(
                totalRevenue
              )}
            </strong>

            <p>
              {harvests.length} harvest
              {harvests.length ===
              1
                ? ""
                : "s"}{" "}
              recorded
            </p>

          </div>

          <div className="financial-summary-card profit-summary-card">

            <div className="financial-summary-icon">
              <CircleDollarSign
                size={21}
              />
            </div>

            <span>
              CALCULATED PROFIT
            </span>

            <strong>
              ₹
              {formatCurrency(
                calculatedProfit
              )}
            </strong>

            <p>
              Revenue minus expenses
            </p>

          </div>

        </section>

        {/* TABS */}

        <div className="financial-tabs">

          <button
            type="button"
            className={
              activeTab ===
              "expenses"
                ? "financial-tab active"
                : "financial-tab"
            }
            onClick={() => {
              setActiveTab(
                "expenses"
              );

              setShowHarvestForm(
                false
              );
            }}
          >
            <Receipt size={16} />
            Expenses
          </button>

          <button
            type="button"
            className={
              activeTab ===
              "harvests"
                ? "financial-tab active"
                : "financial-tab"
            }
            onClick={() => {
              setActiveTab(
                "harvests"
              );

              setShowExpenseForm(
                false
              );
            }}
          >
            <Wheat size={16} />
            Harvests
          </button>

          <Link
            to="/profit-analysis"
            className="financial-profit-link"
          >
            Profit Analysis
            <ArrowUpRight
              size={15}
            />
          </Link>

        </div>

        {/* EXPENSE FORM */}

        {activeTab ===
          "expenses" &&
          showExpenseForm && (
            <section
              ref={expenseFormRef}
              className="financial-form-card"
            >

              <div className="financial-form-header">

                <div>

                  <span className="expenses-overline">
                    {editingExpenseId
                      ? "EDIT EXPENSE"
                      : "NEW EXPENSE"}
                  </span>

                  <h2>
                    {editingExpenseId
                      ? "Update the expense."
                      : "Record an expense."}
                  </h2>

                </div>

                <button
                  type="button"
                  className="financial-close-button"
                  onClick={
                    resetForms
                  }
                >
                  <X size={19} />
                </button>

              </div>

              {farms.length ===
              0 ? (
                <div className="financial-no-data">

                  <Leaf
                    size={24}
                  />

                  <div>

                    <h3>
                      Add a farm first.
                    </h3>

                    <p>
                      Expenses must belong to
                      an active farm.
                    </p>

                    <Link
                      to="/farms"
                      className="financial-go-link"
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
                  className="financial-form"
                  onSubmit={
                    handleExpenseSubmit
                  }
                >

                  <div className="financial-form-section">

                    <span className="financial-form-section-title">
                      EXPENSE INFORMATION
                    </span>

                    <div className="financial-form-grid">

                      <div className="financial-field">

                        <label>
                          Farm *
                        </label>

                        <select
                          name="farmId"
                          value={
                            expenseForm.farmId
                          }
                          onChange={
                            handleExpenseChange
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
                                {
                                  farm.name
                                }
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      <div className="financial-field">

                        <label>
                          Crop
                        </label>

                        <select
                          name="cropId"
                          value={
                            expenseForm.cropId
                          }
                          onChange={
                            handleExpenseChange
                          }
                        >

                          <option value="">
                            All / No specific crop
                          </option>

                          {crops
                            .filter(
                              (crop) =>
                                !expenseForm.farmId ||
                                getIdValue(
                                  crop.farmId
                                ) ===
                                  String(
                                    expenseForm.farmId
                                  )
                            )
                            .map(
                              (crop) => (
                                <option
                                  key={
                                    crop._id
                                  }
                                  value={
                                    crop._id
                                  }
                                >
                                  {
                                    crop.name
                                  }
                                </option>
                              )
                            )}

                        </select>

                      </div>

                      <div className="financial-field">

                        <label>
                          Category *
                        </label>

                        <select
                          name="category"
                          value={
                            expenseForm.category
                          }
                          onChange={
                            handleExpenseChange
                          }
                        >

                          {expenseCategories.map(
                            (
                              category
                            ) => (
                              <option
                                key={
                                  category.value
                                }
                                value={
                                  category.value
                                }
                              >
                                {
                                  category.label
                                }
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      <div className="financial-field">

                        <label>
                          Amount (₹) *
                        </label>

                        <input
                          name="amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 3500"
                          value={
                            expenseForm.amount
                          }
                          onChange={
                            handleExpenseChange
                          }
                        />

                      </div>

                      <div className="financial-field">

                        <label>
                          Expense Date *
                        </label>

                        <div className="financial-date-input">

                          <CalendarDays
                            size={16}
                          />

                          <input
                            name="expenseDate"
                            type="date"
                            value={
                              expenseForm.expenseDate
                            }
                            onChange={
                              handleExpenseChange
                            }
                          />

                        </div>

                      </div>

                      <div className="financial-field">

                        <label>
                          Receipt URL
                        </label>

                        <input
                          name="receiptUrl"
                          type="url"
                          placeholder="Optional receipt link"
                          value={
                            expenseForm.receiptUrl
                          }
                          onChange={
                            handleExpenseChange
                          }
                        />

                      </div>

                      <div className="financial-field financial-field-full">

                        <label>
                          Description
                        </label>

                        <textarea
                          name="description"
                          rows="4"
                          placeholder="What was this expense for?"
                          value={
                            expenseForm.description
                          }
                          onChange={
                            handleExpenseChange
                          }
                        ></textarea>

                      </div>

                    </div>

                  </div>

                  <div className="financial-form-actions">

                    <button
                      type="button"
                      className="financial-cancel-button"
                      onClick={
                        resetForms
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="financial-save-button"
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? "Saving..."
                        : editingExpenseId
                        ? "Update Expense"
                        : "Add Expense"}

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

        {/* HARVEST FORM */}

        {activeTab ===
          "harvests" &&
          showHarvestForm && (
            <section
              ref={harvestFormRef}
              className="financial-form-card"
            >

              <div className="financial-form-header">

                <div>

                  <span className="expenses-overline">
                    {editingHarvestId
                      ? "EDIT HARVEST"
                      : "NEW HARVEST"}
                  </span>

                  <h2>
                    {editingHarvestId
                      ? "Update the harvest."
                      : "Record a harvest."}
                  </h2>

                </div>

                <button
                  type="button"
                  className="financial-close-button"
                  onClick={
                    resetForms
                  }
                >
                  <X size={19} />
                </button>

              </div>

              {farms.length ===
                0 ||
              crops.length ===
                0 ? (
                <div className="financial-no-data">

                  <Wheat
                    size={24}
                  />

                  <div>

                    <h3>
                      You need a farm and crop first.
                    </h3>

                    <p>
                      A harvest must be linked to
                      both an active farm and crop.
                    </p>

                    <Link
                      to={
                        farms.length ===
                        0
                          ? "/farms"
                          : "/crops"
                      }
                      className="financial-go-link"
                    >
                      Go to{" "}
                      {farms.length ===
                      0
                        ? "Farms"
                        : "Crops"}
                      <ArrowUpRight
                        size={15}
                      />
                    </Link>

                  </div>

                </div>
              ) : (
                <form
                  className="financial-form"
                  onSubmit={
                    handleHarvestSubmit
                  }
                >

                  <div className="financial-form-section">

                    <span className="financial-form-section-title">
                      HARVEST INFORMATION
                    </span>

                    <div className="financial-form-grid">

                      <div className="financial-field">

                        <label>
                          Farm *
                        </label>

                        <select
                          name="farmId"
                          value={
                            harvestForm.farmId
                          }
                          onChange={
                            handleHarvestChange
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
                                {
                                  farm.name
                                }
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      <div className="financial-field">

                        <label>
                          Crop *
                        </label>

                        <select
                          name="cropId"
                          value={
                            harvestForm.cropId
                          }
                          onChange={
                            handleHarvestChange
                          }
                        >

                          <option value="">
                            Select Crop
                          </option>

                          {crops
                            .filter(
                              (crop) =>
                                !harvestForm.farmId ||
                                getIdValue(
                                  crop.farmId
                                ) ===
                                  String(
                                    harvestForm.farmId
                                  )
                            )
                            .map(
                              (crop) => (
                                <option
                                  key={
                                    crop._id
                                  }
                                  value={
                                    crop._id
                                  }
                                >
                                  {
                                    crop.name
                                  }
                                </option>
                              )
                            )}

                        </select>

                      </div>

                      <div className="financial-field">

                        <label>
                          Harvest Date *
                        </label>

                        <div className="financial-date-input">

                          <CalendarDays
                            size={16}
                          />

                          <input
                            name="harvestDate"
                            type="date"
                            value={
                              harvestForm.harvestDate
                            }
                            onChange={
                              handleHarvestChange
                            }
                          />

                        </div>

                      </div>

                      <div className="financial-field">

                        <label>
                          Quantity *
                        </label>

                        <input
                          name="quantityValue"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 40"
                          value={
                            harvestForm.quantityValue
                          }
                          onChange={
                            handleHarvestChange
                          }
                        />

                      </div>

                      <div className="financial-field">

                        <label>
                          Quantity Unit *
                        </label>

                        <select
                          name="quantityUnit"
                          value={
                            harvestForm.quantityUnit
                          }
                          onChange={
                            handleHarvestChange
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

                      <div className="financial-field">

                        <label>
                          Sale Price / Unit (₹) *
                        </label>

                        <input
                          name="salePricePerUnit"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g. 2400"
                          value={
                            harvestForm.salePricePerUnit
                          }
                          onChange={
                            handleHarvestChange
                          }
                        />

                      </div>

                      <div className="financial-field">

                        <label>
                          Buyer Name
                        </label>

                        <input
                          name="buyerName"
                          type="text"
                          placeholder="Optional buyer name"
                          value={
                            harvestForm.buyerName
                          }
                          onChange={
                            handleHarvestChange
                          }
                        />

                      </div>

                      <div className="financial-field financial-field-full">

                        <label>
                          Notes
                        </label>

                        <textarea
                          name="notes"
                          rows="4"
                          placeholder="Add useful harvest notes..."
                          value={
                            harvestForm.notes
                          }
                          onChange={
                            handleHarvestChange
                          }
                        ></textarea>

                      </div>

                    </div>

                  </div>

                  <div className="financial-revenue-preview">

                    <div>
                      <span>
                        ESTIMATED GROSS REVENUE
                      </span>

                      <strong>
                        ₹
                        {formatCurrency(
                          (
                            Number(
                              harvestForm.quantityValue
                            ) ||
                            0
                          ) *
                            (
                              Number(
                                harvestForm.salePricePerUnit
                              ) ||
                              0
                            )
                        )}
                      </strong>
                    </div>

                    <Coins
                      size={31}
                    />

                  </div>

                  <div className="financial-form-actions">

                    <button
                      type="button"
                      className="financial-cancel-button"
                      onClick={
                        resetForms
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="financial-save-button"
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? "Saving..."
                        : editingHarvestId
                        ? "Update Harvest"
                        : "Add Harvest"}

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

        {/* RECORDS */}

        <section className="financial-records-section">

          <div className="financial-records-header">

            <div>

              <span className="expenses-overline">
                {activeTab ===
                "expenses"
                  ? "EXPENSE RECORDS"
                  : "HARVEST RECORDS"}
              </span>

              <h2>
                {activeTab ===
                "expenses"
                  ? `${expenses.length} ${
                      expenses.length ===
                      1
                        ? "expense"
                        : "expenses"
                    }`
                  : `${harvests.length} ${
                      harvests.length ===
                      1
                        ? "harvest"
                        : "harvests"
                    }`}
              </h2>

            </div>

            <button
              type="button"
              className="records-add-button"
              onClick={
                activeTab ===
                "expenses"
                  ? openCreateExpenseForm
                  : openCreateHarvestForm
              }
            >
              <Plus size={16} />
              Add{" "}
              {activeTab ===
              "expenses"
                ? "Expense"
                : "Harvest"}
            </button>

          </div>

          {loading ? (
            <div className="financial-empty-state">

              <div className="financial-empty-icon">
                🌱
              </div>

              <h3>
                Loading financial records...
              </h3>

              <p>
                Fetching your farming transactions.
              </p>

            </div>
          ) : activeTab ===
            "expenses" ? (
            expenses.length ===
            0 ? (
              <div className="financial-empty-state">

                <div className="financial-empty-icon">
                  <Receipt
                    size={29}
                  />
                </div>

                <h3>
                  No expenses recorded yet.
                </h3>

                <p>
                  Start recording your farming costs
                  to understand where your money goes.
                </p>

                <button
                  type="button"
                  className="financial-empty-button"
                  onClick={
                    openCreateExpenseForm
                  }
                >
                  <Plus size={16} />
                  Add First Expense
                </button>

              </div>
            ) : (
              <div className="financial-records-grid">

                {expenses.map(
                  (expense) => (
                    <article
                      key={
                        expense._id
                      }
                      className="financial-record-card"
                    >

                      <div className="record-card-top">

                        <div className="record-card-icon expense-icon">
                          <Receipt
                            size={19}
                          />
                        </div>

                        <span className="record-card-category">
                          {
                            expense.category
                          }
                        </span>

                      </div>

                      <div className="record-card-amount">
                        ₹
                        {formatCurrency(
                          expense.amount
                        )}
                      </div>

                      <div className="record-card-meta">

                        <div>
                          <MapPin
                            size={14}
                          />

                          {
                            getFarmName(
                              expense.farmId
                            )
                          }
                        </div>

                        <div>
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            expense.expenseDate
                          )}
                        </div>

                      </div>

                      {expense.cropId && (
                        <div className="record-card-crop">
                          <Leaf
                            size={13}
                          />
                          {
                            getCropName(
                              expense.cropId
                            )
                          }
                        </div>
                      )}

                      {expense.description && (
                        <p className="record-card-description">
                          {
                            expense.description
                          }
                        </p>
                      )}

                      <div className="record-card-actions">

                        <button
                          type="button"
                          onClick={() =>
                            openEditExpenseForm(
                              expense
                            )
                          }
                        >
                          <Edit3
                            size={14}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="record-delete-button"
                          onClick={() =>
                            handleDeleteExpense(
                              expense
                            )
                          }
                        >
                          <Trash2
                            size={14}
                          />
                          Delete
                        </button>

                      </div>

                    </article>
                  )
                )}

              </div>
            )
          ) : harvests.length ===
            0 ? (
            <div className="financial-empty-state">

              <div className="financial-empty-icon">
                <Wheat
                  size={29}
                />
              </div>

              <h3>
                No harvests recorded yet.
              </h3>

              <p>
                Record your harvest to calculate
                actual farming revenue.
              </p>

              <button
                type="button"
                className="financial-empty-button"
                onClick={
                  openCreateHarvestForm
                }
              >
                <Plus size={16} />
                Add First Harvest
              </button>

            </div>
          ) : (
            <div className="financial-records-grid">

              {harvests.map(
                (harvest) => (
                  <article
                    key={
                      harvest._id
                    }
                    className="financial-record-card harvest-record-card"
                  >

                    <div className="record-card-top">

                      <div className="record-card-icon harvest-icon">
                        <Wheat
                          size={19}
                        />
                      </div>

                      <span className="record-card-category">
                        HARVEST
                      </span>

                    </div>

                    <div className="record-card-amount">
                      ₹
                      {formatCurrency(
                        harvest.grossRevenue
                      )}
                    </div>

                    <div className="record-card-meta">

                      <div>
                        <MapPin
                          size={14}
                        />

                        {
                          getFarmName(
                            harvest.farmId
                          )
                        }
                      </div>

                      <div>
                        <CalendarDays
                          size={14}
                        />

                        {formatDate(
                          harvest.harvestDate
                        )}
                      </div>

                    </div>

                    <div className="record-card-crop">
                      <Leaf
                        size={13}
                      />

                      {
                        getCropName(
                          harvest.cropId
                        )
                      }
                    </div>

                    <div className="harvest-record-details">

                      <div>
                        <span>
                          QUANTITY
                        </span>

                        <strong>
                          {
                            harvest.quantity
                              ?.value
                          }{" "}
                          {
                            harvest.quantity
                              ?.unit
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          PRICE / UNIT
                        </span>

                        <strong>
                          ₹
                          {formatCurrency(
                            harvest.salePricePerUnit
                          )}
                        </strong>
                      </div>

                    </div>

                    {harvest.buyerName && (
                      <p className="record-card-description">
                        Buyer:{" "}
                        {
                          harvest.buyerName
                        }
                      </p>
                    )}

                    <div className="record-card-actions">

                      <button
                        type="button"
                        onClick={() =>
                          openEditHarvestForm(
                            harvest
                          )
                        }
                      >
                        <Edit3
                          size={14}
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="record-delete-button"
                        onClick={() =>
                          handleDeleteHarvest(
                            harvest
                          )
                        }
                      >
                        <Trash2
                          size={14}
                        />
                        Delete
                      </button>

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

export default Expenses;