import { NavLink, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "./pages/NotFoundPage";
import { VehicleDetailPage } from "./pages/VehicleDetailPage";
import { VehicleListPage } from "./pages/VehicleListPage";

export function App() {
  return (
    <>
      <header className="app-header">
        <div className="container app-header__inner">
          <span className="app-header__title">Fuhrpark</span>
          <nav className="app-header__nav">
            <NavLink to="/" end>
              Fahrzeuge
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container app-main">
        <Routes>
          <Route path="/" element={<VehicleListPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}
