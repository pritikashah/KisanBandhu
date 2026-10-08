import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Leaf,
  MapPin,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Wheat,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getCrops,
} from "../services/cropService";

import {
  getFarms,
} from "../services/farmService";

import {
  getOverallProfit,
  getFarmProfit,
  getCropProfit,
} from "../services/profitService";

import "./ProfitAnalysis.css";

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
    key &&
    Array.isArray(
      response?.data?.[key]
    )
  ) {
    return response.data[key];
  }

  return [];
}

function getNumericValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const parsed = Number(
      value
    );

    return Number.isFinite(
      parsed
    )
      ? parsed
      : null;
  }

  if (
    typeof value === "object"
  ) {
    if (
      value.$numberDecimal !==
      undefined
    ) {
      const parsed = Number(
        value.$numberDecimal
      );

      return Number.isFinite(
        parsed
      )
        ? parsed
        : null;
    }

    if (
      value.value !== undefined
    ) {
      const parsed = getNumericValue(
        value.value
      );

      if (
        parsed !== null
      ) {
        return parsed;
      }
    }
  }

  return null;
}

function findNumericField(
  source,
  possibleKeys
) {
  if (
    source === null ||
    source === undefined ||
    typeof source !== "object"
  ) {
    return null;
  }

  for (
    const key of possibleKeys
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        source,
        key
      )
    ) {
      const numeric =
        getNumericValue(
          source[key]
        );

      if (
        numeric !== null
      ) {
        return numeric;
      }
    }
  }

  for (
    const value of Object.values(
      source
    )
  ) {
    if (
      value &&
      typeof value === "object"
    ) {
      const nested =
        findNumericField(
          value,
          possibleKeys
        );

      if (
        nested !== null
      ) {
        return nested;
      }
    }
  }

  return null;
}

function normalizeProfitData(
  response
) {
  const revenue =
    findNumericField(
      response,
      [
        "revenue",
        "totalRevenue",
        "grossRevenue",
        "harvestRevenue",
      ]
    ) ?? 0;

  const expenses =
    findNumericField(
      response,
      [
        "expenses",
        "totalExpenses",
        "expenseTotal",
        "totalExpense",
      ]
    ) ?? 0;

  /*
   * Always calculate profit ourselves.
   * This guarantees:
   *
   * Revenue - Expenses = Profit
   */
  const profit =
    revenue -
    expenses;

  return {
    revenue,
    expenses,
    profit,
  };
}

function formatCurrency(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

function truncateName(
  name,
  maxLength = 16
) {
  if (
    !name ||
    name.length <=
      maxLength
  ) {
    return name;
  }

  return `${name.slice(
    0,
    maxLength
  )}…`;
}

function ProfitAnalysis() {
  const [farms, setFarms] =
    useState([]);

  const [crops, setCrops] =
    useState([]);

  const [overallProfit, setOverallProfit] =
    useState({
      revenue: 0,
      expenses: 0,
      profit: 0,
    });

  const [farmProfits, setFarmProfits] =
    useState([]);

  const [cropProfits, setCropProfits] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadProfitData =
    async () => {
      try {
        setLoading(true);
        setError("");

        const [
          farmsResponse,
          cropsResponse,
          overallResponse,
        ] = await Promise.all([
          getFarms(),
          getCrops(),
          getOverallProfit(),
        ]);

        const farmList =
          extractList(
            farmsResponse,
            "farms"
          );

        const cropList =
          extractList(
            cropsResponse,
            "crops"
          );

        setFarms(
          farmList
        );

        setCrops(
          cropList
        );

        /*
         * Normalize overall profit.
         */
        setOverallProfit(
          normalizeProfitData(
            overallResponse
          )
        );

        /*
         * Calculate every farm's
         * revenue, expenses and profit.
         */
        const farmResults =
          await Promise.all(
            farmList.map(
              async (farm) => {
                try {
                  const response =
                    await getFarmProfit(
                      farm._id
                    );

                  const values =
                    normalizeProfitData(
                      response
                    );

                  return {
                    farmId:
                      farm._id,

                    name:
                      farm.name,

                    revenue:
                      values.revenue,

                    expenses:
                      values.expenses,

                    profit:
                      values.profit,
                  };
                } catch {
                  return {
                    farmId:
                      farm._id,

                    name:
                      farm.name,

                    revenue: 0,

                    expenses: 0,

                    profit: 0,
                  };
                }
              }
            )
          );

        /*
         * Calculate every crop's
         * revenue, expenses and profit.
         */
        const cropResults =
          await Promise.all(
            cropList.map(
              async (crop) => {
                try {
                  const response =
                    await getCropProfit(
                      crop._id
                    );

                  const values =
                    normalizeProfitData(
                      response
                    );

                  return {
                    cropId:
                      crop._id,

                    name:
                      crop.name,

                    revenue:
                      values.revenue,

                    expenses:
                      values.expenses,

                    profit:
                      values.profit,
                  };
                } catch {
                  return {
                    cropId:
                      crop._id,

                    name:
                      crop.name,

                    revenue: 0,

                    expenses: 0,

                    profit: 0,
                  };
                }
              }
            )
          );

        setFarmProfits(
          farmResults
        );

        setCropProfits(
          cropResults
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to load profit analysis."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProfitData();
  }, []);

  const revenue =
    overallProfit.revenue;

  const expenses =
    overallProfit.expenses;

  const profit =
    overallProfit.profit;

  const chartData =
    farmProfits.map(
      (farm) => ({
        name:
          truncateName(
            farm.name
          ),

        Revenue:
          farm.revenue,

        Expenses:
          farm.expenses,

        Profit:
          farm.profit,
      })
    );

  return (
    <div className="profit-page">

      {/* TOP BAR */}

      <header className="profit-topbar">

        <div className="profit-topbar-inner">

          <Link
            to="/expenses"
            className="profit-back"
          >
            <ArrowLeft size={17} />
            Financial Records
          </Link>

          <Link
            to="/"
            className="profit-logo"
          >
            <span>
              ✦
            </span>

            Kisan<span>Bandhu</span>
          </Link>

          <div></div>

        </div>

      </header>

      <main className="profit-content">

        {/* INTRO */}

        <section className="profit-intro">

          <div>

            <span className="profit-overline">
              • PROFIT ANALYSIS
            </span>

            <h1>
              See the bigger
              <br />
              <em>picture.</em>
            </h1>

            <p>
              Understand how your harvest revenue
              compares with the expenses recorded
              across your farms and crops.
            </p>

          </div>

          <button
            type="button"
            className="profit-refresh-button"
            onClick={
              loadProfitData
            }
            disabled={
              loading
            }
          >
            <RefreshCw
              size={16}
            />

            Refresh Analysis
          </button>

        </section>

        {error && (
          <div className="profit-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="profit-loading">

            <div className="profit-loading-icon">
              🌱
            </div>

            <h2>
              Calculating your farm finances...
            </h2>

            <p>
              Gathering revenue and expense records.
            </p>

          </div>
        ) : (
          <>
            {/* MAIN METRICS */}

            <section className="profit-main-metrics">

              <div className="profit-main-card revenue-card">

                <div className="profit-main-icon">
                  <WalletCards
                    size={23}
                  />
                </div>

                <span>
                  HARVEST REVENUE
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    revenue
                  )}
                </strong>

                <p>
                  Actual revenue from recorded
                  harvests
                </p>

              </div>

              <div className="profit-main-card expense-card">

                <div className="profit-main-icon">
                  <TrendingDown
                    size={23}
                  />
                </div>

                <span>
                  TOTAL EXPENSES
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    expenses
                  )}
                </strong>

                <p>
                  Recorded farming expenses
                </p>

              </div>

              <div className="profit-main-card profit-card">

                <div className="profit-main-icon">
                  <CircleDollarSign
                    size={23}
                  />
                </div>

                <span>
                  NET PROFIT
                </span>

                <strong>
                  ₹
                  {formatCurrency(
                    profit
                  )}
                </strong>

                <p>
                  Revenue minus recorded expenses
                </p>

              </div>

            </section>

            {/* FORMULA */}

            <section className="profit-formula-section">

              <div className="profit-formula-icon">

                <BarChart3
                  size={22}
                />

              </div>

              <div>

                <span>
                  PROFIT CALCULATION
                </span>

                <h2>
                  Revenue − Expenses = Profit
                </h2>

                <p>
                  KisanBandhu calculates profit using
                  actual harvest revenue and recorded
                  farming expenses.
                </p>

              </div>

              <div className="profit-formula-result">

                <small>
                  CURRENT PROFIT
                </small>

                <strong>
                  ₹
                  {formatCurrency(
                    profit
                  )}
                </strong>

              </div>

            </section>

            {/* CHART */}

            <section className="profit-chart-section">

              <div className="profit-section-heading">

                <div>

                  <span className="profit-overline">
                    FARM-WISE PERFORMANCE
                  </span>

                  <h2>
                    Where your farms stand.
                  </h2>

                </div>

                <p>
                  Compare revenue, expenses and profit
                  for every active farm.
                </p>

              </div>

              {chartData.length ===
              0 ? (
                <div className="profit-empty-chart">

                  <MapPin
                    size={28}
                  />

                  <h3>
                    Add a farm to see the analysis.
                  </h3>

                  <p>
                    Farm-wise financial comparison will
                    appear here once records exist.
                  </p>

                </div>
              ) : (
                <div className="profit-chart-container">

                  <ResponsiveContainer
                    width="100%"
                    height={390}
                  >

                    <BarChart
                      data={
                        chartData
                      }
                      margin={{
                        top: 15,
                        right: 20,
                        left: 5,
                        bottom: 5,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 11,
                        }}
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        formatter={(
                          value,
                          name
                        ) =>
                          [
                            `₹${formatCurrency(
                              value
                            )}`,
                            name,
                          ]
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="Expenses"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="Profit"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                      <Bar
                        dataKey="Revenue"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>
              )}

            </section>

            {/* FARM BREAKDOWN */}

            <section className="profit-farm-section">

              <div className="profit-section-heading">

                <div>

                  <span className="profit-overline">
                    FARM BREAKDOWN
                  </span>

                  <h2>
                    Every farm,
                    <br />
                    one clear picture.
                  </h2>

                </div>

              </div>

              <div className="profit-farm-grid">

                {farmProfits.map(
                  (farm) => (
                    <article
                      key={
                        farm.farmId
                      }
                      className="profit-farm-card"
                    >

                      <div className="profit-farm-card-top">

                        <div className="profit-farm-icon">

                          <MapPin
                            size={19}
                          />

                        </div>

                        <span>
                          FARM
                        </span>

                      </div>

                      <h3>
                        {
                          farm.name
                        }
                      </h3>

                      <div className="profit-farm-numbers">

                        <div>

                          <span>
                            REVENUE
                          </span>

                          <strong>
                            ₹
                            {formatCurrency(
                              farm.revenue
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            EXPENSES
                          </span>

                          <strong>
                            ₹
                            {formatCurrency(
                              farm.expenses
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            PROFIT
                          </span>

                          <strong>
                            ₹
                            {formatCurrency(
                              farm.profit
                            )}
                          </strong>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>

            </section>

            {/* CROP BREAKDOWN */}

            <section className="profit-crop-section">

              <div className="profit-section-heading">

                <div>

                  <span className="profit-overline">
                    CROP BREAKDOWN
                  </span>

                  <h2>
                    Your crops,
                    <br />
                    measured clearly.
                  </h2>

                </div>

              </div>

              {cropProfits.length ===
              0 ? (
                <div className="profit-empty-chart">

                  <Leaf
                    size={28}
                  />

                  <h3>
                    No crops found.
                  </h3>

                  <p>
                    Add crops and harvest records to see
                    crop-wise profitability.
                  </p>

                </div>
              ) : (
                <div className="profit-crop-grid">

                  {cropProfits.map(
                    (crop) => (
                      <article
                        key={
                          crop.cropId
                        }
                        className="profit-crop-card"
                      >

                        <div className="profit-crop-card-top">

                          <div className="profit-crop-icon">

                            <Wheat
                              size={19}
                            />

                          </div>

                          <span>
                            CROP
                          </span>

                        </div>

                        <h3>
                          {
                            crop.name
                          }
                        </h3>

                        <div className="profit-crop-values">

                          <div>

                            <span>
                              REVENUE
                            </span>

                            <strong>
                              ₹
                              {formatCurrency(
                                crop.revenue
                              )}
                            </strong>

                          </div>

                          <div>

                            <span>
                              EXPENSES
                            </span>

                            <strong>
                              ₹
                              {formatCurrency(
                                crop.expenses
                              )}
                            </strong>

                          </div>

                          <div>

                            <span>
                              PROFIT
                            </span>

                            <strong>
                              ₹
                              {formatCurrency(
                                crop.profit
                              )}
                            </strong>

                          </div>

                        </div>

                      </article>
                    )
                  )}

                </div>
              )}

            </section>

            {/* FOOTER ACTION */}

            <section className="profit-footer-action">

              <div>

                <TrendingUp
                  size={26}
                />

                <div>

                  <span>
                    KEEP YOUR RECORDS CURRENT
                  </span>

                  <h3>
                    Better records. Better decisions.
                  </h3>

                </div>

              </div>

              <Link
                to="/expenses"
                className="profit-records-button"
              >
                Manage Financial Records
                <ArrowUpRight
                  size={16}
                />
              </Link>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default ProfitAnalysis;