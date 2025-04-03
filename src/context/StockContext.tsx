import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { db } from "../configs/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

interface StockItem {
  id: number;
  stock: number;
}

interface StockContextType {
  stocks: { [key: number]: number };
  updateStock: (productId: number, quantity: number) => void;
  checkStock: (productId: number) => number;
  checkStockAvailability: (productId: number, quantity: number) => boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

export const StockProvider = ({ children }: { children: ReactNode }) => {
  const [stocks, setStocks] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      const stockDoc = await getDoc(doc(db, "stocks", "inventory"));
      if (stockDoc.exists()) {
        setStocks(stockDoc.data().stocks || {});
      } else {
        // Initialize with mock stock data if no data exists
        const initialStocks = {
          1: 50, // กาแฟลาเต้
          2: 40, // ชาเขียวนม
          3: 30, // น้ำส้ม
          4: 45, // อเมริกาโน่
          5: 35, // ชามะลิ
        };
        await setDoc(doc(db, "stocks", "inventory"), { stocks: initialStocks });
        setStocks(initialStocks);
      }
    } catch (error) {
      console.error("Error loading stock data:", error);
    }
  };

  const saveStockData = async (newStocks: { [key: number]: number }) => {
    try {
      await updateDoc(doc(db, "stocks", "inventory"), {
        stocks: newStocks,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving stock data:", error);
    }
  };

  const updateStock = async (productId: number, quantity: number) => {
    const currentStock = stocks[productId] || 0;
    const newStock = Math.max(0, currentStock - quantity);
    const newStocks = { ...stocks, [productId]: newStock };

    setStocks(newStocks);
    await saveStockData(newStocks);
  };

  const checkStock = (productId: number) => {
    return stocks[productId] || 0;
  };

  const checkStockAvailability = (productId: number, quantity: number) => {
    return (stocks[productId] || 0) >= quantity;
  };

  return (
    <StockContext.Provider
      value={{ stocks, updateStock, checkStock, checkStockAvailability }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useStock must be used within a StockProvider");
  }
  return context;
};
