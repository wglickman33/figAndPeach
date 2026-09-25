import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProductPicker } from "../components/ProductPicker";
import { useCatalog } from "../context/useCatalog";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import { getCustomizePath } from "../data/categories";
import type { CatalogProduct } from "../types/catalog";
import "./CategoryPage.css";

export function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { ready, categories, productsForCategory } = useCatalog();
  const { addCartItem } = useOrder();
  const { showToast } = useToast();

  const category = categoryId ? categories.find((item) => item.id === categoryId) : undefined;

  if (!ready) {
    return (
      <Layout embedded>
        <p className="category-page__intro">Loading shop…</p>
      </Layout>
    );
  }

  if (!category) {
    return <Navigate to="/shop/necklaces" replace />;
  }

  const products = productsForCategory(category.id);

  function handleProductClick(product: CatalogProduct) {
    if (product.purchaseMode === "premade") {
      addCartItem({
        categoryId: category!.id,
        categoryName: category!.name,
        productId: product.id,
        productName: product.name,
        price: product.price,
        customizationDetail: "As shown",
      });
      showToast(`${product.name} added to your order.`);
      navigate("/order");
      return;
    }

    navigate(getCustomizePath(category!.id, product.id));
  }

  return (
    <Layout embedded>
      <div className="category-page">
        <header className="category-page__header">
          <h1 className="category-page__title">{category.name}</h1>
          <p className="category-page__intro">
            Tap a customizable item to choose options, or add a ready-made piece straight to your
            order.
          </p>
        </header>

        <ProductPicker
          title={category.name}
          products={products}
          onProductClick={handleProductClick}
        />
      </div>
    </Layout>
  );
}
