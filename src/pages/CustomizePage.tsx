import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { CustomizationFieldsForm } from "../components/customization/CustomizationFieldsForm";
import { Layout } from "../components/Layout";
import { useCatalog } from "../context/useCatalog";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../context/ToastContext";
import { fetchCustomizationFields } from "../lib/api";
import {
  buildCustomizationDetailFromFields,
  validateFieldValues,
} from "../lib/customizationFieldLogic";
import { getCategoryPath } from "../data/categories";
import type { CatalogProduct, ShopCategory } from "../types/catalog";
import type {
  CustomizationFieldDefinition,
  CustomizationFieldValues,
} from "../types/customizationFields";
import "./CustomizePage.css";

type CustomizePageContentProps = {
  category: ShopCategory;
  product: CatalogProduct;
};

function CustomizePageContent({ category, product }: CustomizePageContentProps) {
  const navigate = useNavigate();
  const { addCartItem } = useOrder();
  const { showToast } = useToast();
  const { customization } = useCatalog();

  const [fields, setFields] = useState<CustomizationFieldDefinition[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [values, setValues] = useState<CustomizationFieldValues>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFieldsLoading(true);
    void fetchCustomizationFields(category.id, product.id)
      .then((data) => {
        if (cancelled) return;
        setFields(data.fields);
        const initial: CustomizationFieldValues = {};
        for (const field of data.fields) {
          if (field.fieldType === "bead_size_then_colors") {
            initial[field.fieldKey] = { beadGroupId: "", colorIds: [] };
          } else if (field.fieldType !== "length_pills") {
            initial[field.fieldKey] = [];
          }
        }
        setValues(initial);
      })
      .catch(() => {
        if (!cancelled) setFields([]);
      })
      .finally(() => {
        if (!cancelled) setFieldsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category.id, product.id]);

  const categoryPath = getCategoryPath(category.id);

  function handleAddToOrder() {
    const validationError = validateFieldValues(fields, values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    addCartItem({
      categoryId: category.id,
      categoryName: category.name,
      productId: product.id,
      productName: product.name,
      price: product.price,
      customizationDetail: buildCustomizationDetailFromFields(fields, values, customization),
    });

    showToast(`${product.name} added to your order.`);
    navigate("/order", { replace: true });
  }

  const canAdd =
    fields.length > 0 && validateFieldValues(fields, values) === null;

  return (
    <Layout embedded compact>
      <div className="customize-page">
        <Link to={categoryPath} className="customize-page__back">
          ← Back to {category.name}
        </Link>

        <p className="customize-page__intro">
          Customize your {category.name.toLowerCase()} below, then add it to your order.
        </p>

        <div className="customize-page__product">
          <img src={product.imageUrl} alt={product.name} className="customize-page__image" />
          <div>
            <h1 className="customize-page__title">{product.name}</h1>
            <p className="customize-page__description">{product.description}</p>
            <p className="customize-page__price">${product.price.toFixed(2)}</p>
          </div>
        </div>

        <div className="customize-page__sections">
          {fieldsLoading ? (
            <p className="customize-page__intro">Loading options…</p>
          ) : (
            <CustomizationFieldsForm
              fields={fields}
              customization={customization}
              values={values}
              onChange={setValues}
            />
          )}
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="customize-page__add submit-button"
          onClick={handleAddToOrder}
          disabled={!canAdd || fieldsLoading}
        >
          Add to order
        </button>
      </div>
    </Layout>
  );
}

export function CustomizePage() {
  const { categoryId, productId } = useParams();
  const { ready, categories, products } = useCatalog();

  if (!ready) {
    return (
      <Layout embedded compact>
        <p className="customize-page__intro">Loading customization…</p>
      </Layout>
    );
  }

  const category = categoryId ? categories.find((item) => item.id === categoryId) : undefined;
  const product =
    categoryId && productId
      ? products.find((item) => item.categoryId === categoryId && item.id === productId)
      : undefined;

  if (!category || !product) {
    return <Navigate to="/shop/necklaces" replace />;
  }

  if (product.purchaseMode === "premade") {
    return <Navigate to={getCategoryPath(category.id)} replace />;
  }

  return <CustomizePageContent category={category} product={product} />;
}

export function LegacyNecklaceCustomizeRedirect() {
  const { necklaceId } = useParams();
  if (!necklaceId) {
    return <Navigate to="/shop/necklaces" replace />;
  }
  return <Navigate to={`/shop/necklaces/customize/${necklaceId}`} replace />;
}
