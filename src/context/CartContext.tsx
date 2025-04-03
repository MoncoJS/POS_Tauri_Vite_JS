import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { db } from "../configs/firebase";
import { collection, doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth } from "../configs/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: { id: number; name: string; price: number; image: string },
    quantity: number
  ) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadCartData(user.uid);
      } else {
        setUserId(null);
        setItems([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCartData = async (uid: string) => {
    try {
      const cartDoc = await getDoc(doc(db, `carts/${uid}`));
      if (cartDoc.exists()) {
        setItems(cartDoc.data().items || []);
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  const saveCartData = async (newItems: CartItem[]) => {
    if (!userId) return;

    try {
      await setDoc(doc(db, "carts", userId), {
        items: newItems,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving cart data:", error);
    }
  };

  const addToCart = async (
    product: { id: number; name: string; price: number; image: string },
    quantity: number
  ) => {
    const newItems = [...items];
    const existingItem = newItems.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      newItems.push({ ...product, quantity });
    }

    setItems(newItems);
    await saveCartData(newItems);
  };

  const removeFromCart = async (productId: number) => {
    const newItems = items.filter((item) => item.id !== productId);
    setItems(newItems);
    await saveCartData(newItems);
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity < 1) return;

    const newItems = items.map((item) =>
      item.id === productId ? { ...item, quantity } : item
    );
    setItems(newItems);
    await saveCartData(newItems);
  };

  const clearCart = async () => {
    setItems([]);
    if (userId) {
      try {
        await deleteDoc(doc(db, "carts", userId));
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
  };

  const getTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
