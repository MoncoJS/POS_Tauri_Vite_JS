import { createContext, useContext, useState, ReactNode } from "react";

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
  // Initialize with mock stock data
  const [stocks, setStocks] = useState<{ [key: number]: number }>({
    1: 50, // กาแฟลาเต้
    2: 40, // ชาเขียวนม
    3: 30, // น้ำส้ม
    4: 45, // อเมริกาโน่
    5: 35, // ชามะลิ
  });

  const updateStock = (productId: number, quantity: number) => {
    setStocks((prevStocks) => ({
      ...prevStocks,
      [productId]: Math.max(0, (prevStocks[productId] || 0) - quantity),
    }));
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
