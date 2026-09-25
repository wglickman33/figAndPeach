import { Link } from "react-router-dom";
import logo from "../assets/figAndPeach.png";
import { SITE } from "../constants/config";
import "./NotFoundPage.css";

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <main className="not-found-page__panel">
        <div className="not-found-page__logo-wrap">
          <img src={logo} alt="" className="not-found-page__logo" />
        </div>
        <p className="not-found-page__brand">{SITE.name}</p>
        <p className="not-found-page__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found-page__title">Page not found</h1>
        <p className="not-found-page__copy">
          That link does not match anything here. Head back to the shop or your order.
        </p>
        <div className="not-found-page__actions">
          <Link to="/shop/necklaces" className="not-found-page__btn not-found-page__btn--primary">
            Browse shop
          </Link>
          <Link to="/order" className="not-found-page__btn not-found-page__btn--ghost">
            Your order
          </Link>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="not-found-page__btn not-found-page__btn--ghost"
          >
            Visit Instagram
          </a>
        </div>
      </main>
    </div>
  );
}
