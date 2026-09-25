import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { AppShell } from "./components/layout/AppShell";
import { AdminAuthProvider } from "./context/AdminAuthProvider";
import { CatalogProvider } from "./context/CatalogProvider";
import { NavProvider } from "./context/NavContext";
import { OrderProvider } from "./context/OrderContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminGroupsPage } from "./pages/admin/AdminGroupsPage";
import { AdminOptionsPage } from "./pages/admin/AdminOptionsPage";
import { AdminOverviewPage } from "./pages/admin/AdminOverviewPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminCustomizationFieldsPage } from "./pages/admin/AdminCustomizationFieldsPage";
import { CategoryPage } from "./pages/CategoryPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { CustomizePage, LegacyNecklaceCustomizeRedirect } from "./pages/CustomizePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { OrderFormPage } from "./pages/OrderFormPage";

export default function App() {
  return (
    <ToastProvider>
      <CatalogProvider>
        <AdminAuthProvider>
          <OrderProvider>
            <NavProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Navigate to="/shop/necklaces" replace />} />
                  <Route path="/customize/:necklaceId" element={<LegacyNecklaceCustomizeRedirect />} />

                  <Route element={<AppShell />}>
                    <Route path="/shop/:categoryId" element={<CategoryPage />} />
                    <Route path="/shop/:categoryId/customize/:productId" element={<CustomizePage />} />
                    <Route path="/order" element={<OrderFormPage />} />
                    <Route path="/confirmation" element={<ConfirmationPage />} />
                  </Route>

                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route element={<RequireAdmin />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminOverviewPage />} />
                      <Route path="categories" element={<AdminCategoriesPage />} />
                      <Route path="products" element={<AdminProductsPage />} />
                      <Route path="groups" element={<AdminGroupsPage />} />
                      <Route path="options" element={<AdminOptionsPage />} />
                      <Route path="customization-fields" element={<AdminCustomizationFieldsPage />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </BrowserRouter>
            </NavProvider>
          </OrderProvider>
        </AdminAuthProvider>
      </CatalogProvider>
    </ToastProvider>
  );
}
