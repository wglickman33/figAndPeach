import { Link, NavLink, Outlet } from "react-router-dom";
import logo from "../../assets/figAndPeach.png";
import { useAdminAuth } from "../../context/useAdminAuth";
import "./AdminPages.css";

const NAV_ITEMS: { to: string; label: string; end?: boolean }[] = [
  { to: "/admin", end: true, label: "Overview" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/groups", label: "Bead Types" },
  { to: "/admin/options", label: "Bead Options" },
  { to: "/admin/customization-fields", label: "Customize Fields" },
];

export function AdminLayout() {
  const { session, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <img src={logo} alt="Fig and Peach" className="admin-topbar__logo" />
          <div className="admin-topbar__titles">
            <p className="admin-topbar__site-name">Fig &amp; Peach</p>
            <h1 className="admin-topbar__admin-title">Admin</h1>
          </div>
        </div>

        <div className="admin-topbar__account">
          <div className="admin-topbar__account-text">
            <span className="admin-topbar__account-label">Signed in as</span>
            <span className="admin-topbar__email">{session?.email}</span>
          </div>
          <button
            type="button"
            className="admin-button admin-button--ghost admin-topbar__signout"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="admin-nav" aria-label="Admin sections">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end ?? false}
            className={({ isActive }) =>
              `admin-nav__link${isActive ? " admin-nav__link--active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
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
