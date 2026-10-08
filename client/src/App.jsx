import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Farms from "./pages/Farms";
import FarmDetails from "./pages/FarmDetails";

import Crops from "./pages/Crops";
import CropDetails from "./pages/CropDetails";

import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC WEBSITE */}

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

        </Route>

        {/* PROTECTED APPLICATION */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* FARM MANAGEMENT */}

          <Route
            path="/farms"
            element={<Farms />}
          />

          <Route
            path="/farms/:id"
            element={<FarmDetails />}
          />

          {/* CROP MANAGEMENT */}

          <Route
            path="/crops"
            element={<Crops />}
          />

          <Route
            path="/crops/:id"
            element={<CropDetails />}
          />

          {/* ADMIN */}

          <Route
            path="/admin"
            element={<Admin />}
          />

        </Route>

        {/* NOT FOUND */}

        <Route
          path="/not-found"
          element={<NotFound />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/not-found"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;