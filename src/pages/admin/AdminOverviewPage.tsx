import { useCatalog } from "../../context/useCatalog";
import { AdminPageIntro } from "../../components/admin/AdminPageIntro";
import "./AdminPages.css";

export function AdminOverviewPage() {
  const { online, error, categories, products, customization } = useCatalog();

  const activeProducts = products.length;
  const optionCount = customization.options.length;

  return (
    <section className="admin-panel admin-panel--overview">
      <AdminPageIntro
        title="Overview"
        lede="This is your control panel for the Fig & Peach shop. Use the menu above to add jewelry for sale, photos for customization, and the steps customers see when they personalize an item."
      />

      <div className="admin-stats admin-stats--cards">
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Shop status</p>
          <p className={`admin-stat-card__value ${online ? "admin-stat-card__ok" : "admin-stat-card__warn"}`}>
            {online ? "Connected" : "Offline"}
          </p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Categories</p>
          <p className="admin-stat-card__value">{categories.length}</p>
          <p className="admin-stat-card__hint">Sections in the shop menu</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Products</p>
          <p className="admin-stat-card__value">{activeProducts}</p>
          <p className="admin-stat-card__hint">Items customers can buy</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Bead types</p>
          <p className="admin-stat-card__value">{customization.groups.length}</p>
          <p className="admin-stat-card__hint">Groups like bead sizes or clasps</p>
        </div>
        <div className="admin-stat-card">
          <p className="admin-stat-card__label">Bead options</p>
          <p className="admin-stat-card__value">{optionCount}</p>
          <p className="admin-stat-card__hint">Photos inside each group</p>
        </div>
      </div>

      {!online && error && <p className="admin-error">{error}</p>}

      <div className="admin-callout admin-callout--guide">
        <h3 className="admin-subheading">Suggested order when setting up the shop</h3>
        <ol className="admin-steps">
          <li>
            <strong>Categories</strong>: Add or reorder sections (Necklaces, Scrunchies, etc.) in the
            shop sidebar.
          </li>
          <li>
            <strong>Bead Types</strong>: Create folders for customization (bead sizes, clasps, colors).
          </li>
          <li>
            <strong>Bead Options</strong>: Upload each photo into the right group (download from Google
            Drive to your computer first, then upload here).
          </li>
          <li>
            <strong>Customize Fields</strong>: Choose what customers pick for each category (length,
            clasp, colors, and so on). Usually set once per category.
          </li>
          <li>
            <strong>Products</strong>: Add each piece for sale with photo, price, and whether it is
            ready-made or customizable.
          </li>
        </ol>
      </div>
    </section>
  );
}
