import { NavLink } from "react-router-dom";
import logo from "../../assets/figAndPeach.png";
import { DEFAULT_CATEGORY_ID } from "../../data/categories";
import { useCatalog } from "../../context/useCatalog";
import { SITE } from "../../constants/config";
import { useNav } from "../../context/NavContext";
import { useOrder } from "../../context/OrderContext";
import { OrderCartContents } from "../OrderCartContents";
import { IconClose } from "../ui/IconClose";
import "./CatalogNav.css";

type CatalogNavProps = {
  isDesktop: boolean;
};

export function CatalogNav({ isDesktop }: CatalogNavProps) {
  const { drawerOpen, closeDrawer } = useNav();
  const { cartItems } = useOrder();
  const { categories } = useCatalog();
  const cartCount = cartItems.length;

  function handleNavClick() {
    if (!isDesktop) {
      closeDrawer();
    }
  }

  const navClassName = [
    "catalog-nav",
    isDesktop ? "catalog-nav--desktop" : "catalog-nav--drawer",
    !isDesktop && drawerOpen ? "catalog-nav--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav id="shop-navigation" className={navClassName} aria-label="Shop categories">
      <div className="catalog-nav__inner">
        <div className={`catalog-nav__brand${!isDesktop ? " catalog-nav__brand--drawer" : ""}`}>
          <NavLink to={`/shop/${DEFAULT_CATEGORY_ID}`} className="catalog-nav__logo-link" onClick={handleNavClick}>
            <img src={logo} alt={SITE.name} className="catalog-nav__logo" />
          </NavLink>
          {!isDesktop && (
            <button
              type="button"
              className="catalog-nav__close"
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              <IconClose />
            </button>
          )}
          {isDesktop && <p className="catalog-nav__toc-title">Table of Contents</p>}
        </div>

        <ul className="catalog-nav__list">
          {categories.map((category) => (
            <li key={category.id}>
              <NavLink
                to={`/shop/${category.id}`}
                className={({ isActive }) =>
                  `catalog-nav__link${isActive ? " catalog-nav__link--active" : ""}`
                }
                onClick={handleNavClick}
              >
                {category.name}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="catalog-nav__footer">
          <NavLink
            to="/order"
            className={({ isActive }) =>
              `catalog-nav__order${isActive ? " catalog-nav__order--active" : ""}`
            }
            onClick={handleNavClick}
          >
            <OrderCartContents label="Your Order" count={cartCount} />
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
