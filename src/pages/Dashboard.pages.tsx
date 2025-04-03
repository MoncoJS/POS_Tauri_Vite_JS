import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { db } from "../configs/firebase";
import { collection, onSnapshot, doc } from "firebase/firestore";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [stockLevels, setStockLevels] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        setTotalProducts(snapshot.size);
      }
    );

    const unsubscribeOrders = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        let sales = 0;
        snapshot.forEach((doc) => {
          sales += doc.data().total;
        });
        setTotalSales(sales);
      }
    );

    const unsubscribeStocks = onSnapshot(
      doc(db, "stocks", "inventory"),
      (doc) => {
        setStockLevels(doc.data()?.stocks || {});
      }
    );

    setIsLoading(false);

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeStocks();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar />
      <motion.div
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
          Dashboard Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Total Products
            </h2>
            <p className="text-4xl font-bold text-indigo-500">
              {totalProducts}
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Total Sales
            </h2>
            <p className="text-4xl font-bold text-green-500">
              ฿{totalSales.toFixed(2)}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
