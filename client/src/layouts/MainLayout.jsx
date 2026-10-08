import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./MainLayout.css";

function MainLayout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">✦</span>
            <span>Kisan<span>Bandhu</span></span>
          </Link>

          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to={
                    user?.role === "admin"
                      ? "/admin"
                      : "/dashboard"
                  }
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  {user?.role === "admin"
                    ? "Admin"
                    : "Dashboard"}
                </NavLink>

                <button
                  type="button"
                  className="nav-logout"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  Login
                </NavLink>

                <Link to="/register" className="nav-register">
                  Get Started <span>↗</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;