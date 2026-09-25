import { Link } from "react-router-dom";
import { useCatalog } from "../../context/useCatalog";
import "./AdminPages.css";

export function AdminOverviewPage() {
  const { online, error, categories, products, customization } = useCatalog();

  return (
    <section className="admin-panel">
      <h2 className="admin-heading">Overview</h2>
      <p className="admin-muted">
        Manage shop products and bead/clasp inventory used on the customize pages.
      </p>

      <dl className="admin-stats">
        <div>
          <dt>API</dt>
          <dd>{online ? "Connected" : "Offline"}</dd>
        </div>
        <div>
          <dt>Shop categories</dt>
          <dd>{categories.length}</dd>
        </div>
        <div>
          <dt>Products</dt>
          <dd>{products.length}</dd>
        </div>
        <div>
          <dt>Customization groups</dt>
          <dd>{customization.groups.length}</dd>
        </div>
        <div>
          <dt>Customization options</dt>
          <dd>{customization.options.length}</dd>
        </div>
      </dl>

      {!online && error && <p className="admin-error">{error}</p>}

      <div className="admin-actions">
        <Link to="/admin/categories" className="admin-button">
          Table of Contents
        </Link>
        <Link to="/admin/products" className="admin-button admin-button--ghost">
          Products
        </Link>
        <Link to="/admin/groups" className="admin-button admin-button--ghost">
          Bead types
        </Link>
        <Link to="/admin/options" className="admin-button admin-button--ghost">
          Bead options
        </Link>
        <Link to="/admin/customization-fields" className="admin-button admin-button--ghost">
          Customize fields
        </Link>
      </div>
    </section>
  );
}
