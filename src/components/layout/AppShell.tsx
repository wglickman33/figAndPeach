import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BP_DESKTOP_NAV } from "../../constants/breakpoints";
import { useNav } from "../../context/NavContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { CatalogNav } from "./CatalogNav";
import { MobileHeader } from "./MobileHeader";
import "./AppShell.css";

export function AppShell() {
  const isDesktop = useMediaQuery(`(min-width: ${BP_DESKTOP_NAV}px)`);
  const { drawerOpen, closeDrawer } = useNav();
  const location = useLocation();

  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (isDesktop) {
      closeDrawer();
    }
  }, [isDesktop, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  return (
    <div
      className={`app-shell${isDesktop ? " app-shell--desktop" : ""}`}
      style={
        isDesktop
          ? ({ "--catalog-nav-width": "280px" } as React.CSSProperties)
          : undefined
      }
    >
      {!isDesktop && drawerOpen && (
        <button
          type="button"
          className="app-shell__backdrop"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      )}

      <CatalogNav isDesktop={isDesktop} />

      <div className="app-shell__main">
        {!isDesktop && <MobileHeader />}
        <Outlet />
      </div>
    </div>
  );
}
