import { Link } from "react-router-dom";
import { DEFAULT_CATEGORY_ID } from "../../data/categories";
import { useNav } from "../../context/NavContext";
import { useOrder } from "../../context/OrderContext";
import { OrderCartContents } from "../OrderCartContents";
import { IconHamburger } from "../ui/IconHamburger";
import "./MobileHeader.css";

export function MobileHeader() {
  const { drawerOpen, toggleDrawer } = useNav();
  const { cartItems } = useOrder();
  const cartCount = cartItems.length;

  return (
    <header className="mobile-header">
      <button
        type="button"
        className="mobile-header__menu"
        onClick={toggleDrawer}
        aria-expanded={drawerOpen}
        aria-controls="shop-navigation"
        aria-label={drawerOpen ? "Close menu" : "Open menu"}
      >
        <IconHamburger open={drawerOpen} />
      </button>
      <div className="mobile-header__center">
        <Link to={`/shop/${DEFAULT_CATEGORY_ID}`} className="mobile-header__title">
          Fig &amp; Peach
        </Link>
      </div>
      <Link to="/order" className="mobile-header__order" aria-label="Your order">
        <OrderCartContents label="Order" count={cartCount} compact />
      </Link>
    </header>
  );
}
