import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/useAdminAuth";
import "./AdminPages.css";

export function AdminLayout() {
  const { session, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <header className="admin-shell__header">
        <div>
          <p className="admin-shell__eyebrow">Fig &amp; Peach</p>
          <h1 className="admin-shell__title">Admin</h1>
        </div>
        <div className="admin-shell__meta">
          <span className="admin-shell__email">{session?.email}</span>
          <button type="button" className="admin-button admin-button--ghost" onClick={() => void logout()}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Admin sections">
        <NavLink to="/admin" end className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}>
          Overview
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/groups"
          className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
        >
          Bead types
        </NavLink>
        <NavLink
          to="/admin/options"
          className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
        >
          Bead options
        </NavLink>
        <NavLink
          to="/admin/customization-fields"
          className={({ isActive }) => `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`}
        >
          Customize fields
        </NavLink>
        <Link to="/shop/necklaces" className="admin-nav__link admin-nav__link--shop">
          View shop
        </Link>
      </nav>

      <main className="admin-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
