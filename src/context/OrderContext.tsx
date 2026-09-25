import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, FulfillmentMethod, ShippingAddress } from "../types/order";

const emptyAddress: ShippingAddress = {
  street: "",
  street2: "",
  city: "",
  state: "",
  zip: "",
};

type OrderContextValue = {
  cartItems: CartItem[];
  addCartItem: (item: Omit<CartItem, "id">) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  fulfillment: FulfillmentMethod;
  setFulfillment: (value: FulfillmentMethod) => void;
  address: ShippingAddress;
  setAddress: (value: ShippingAddress) => void;
  updateAddress: (field: keyof ShippingAddress, value: string) => void;
  specialRequests: string;
  setSpecialRequests: (value: string) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

function createCartItemId() {
  return crypto.randomUUID();
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>("pickup");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [specialRequests, setSpecialRequests] = useState("");

  function addCartItem(item: Omit<CartItem, "id">) {
    setCartItems((prev) => [...prev, { ...item, id: createCartItemId() }]);
  }

  function removeCartItem(id: string) {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearCart() {
    setCartItems([]);
  }

  function updateAddress(field: keyof ShippingAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
  }

  const value = useMemo(
    () => ({
      cartItems,
      addCartItem,
      removeCartItem,
      clearCart,
      firstName,
      setFirstName,
      lastName,
      setLastName,
      fulfillment,
      setFulfillment,
      address,
      setAddress,
      updateAddress,
      specialRequests,
      setSpecialRequests,
    }),
    [cartItems, firstName, lastName, fulfillment, address, specialRequests],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }
  return context;
}
