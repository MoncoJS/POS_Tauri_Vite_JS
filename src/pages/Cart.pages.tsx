import { useCart } from "../context/CartContext";
import { useStock } from "../context/StockContext";
import { useState, useEffect } from "react";
import { db } from "../configs/firebase";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const { checkStock, updateStock, checkStockAvailability } = useStock();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuantityChange = async (
    productId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    // Check if requested quantity is available in stock
    if (checkStockAvailability(productId, newQuantity)) {
      await updateQuantity(productId, newQuantity);
      setCheckoutError(null);
    } else {
      const availableStock = checkStock(productId);
      setCheckoutError(
        `สินค้าไม่พอ มีสินค้าในสต็อกเพียง ${availableStock} ชิ้น`
      );
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // Start a transaction to ensure stock consistency
      await runTransaction(db, async (transaction) => {
        // Get current stock levels
        const stockDoc = await transaction.get(doc(db, "stocks", "inventory"));
        const currentStocks = stockDoc.data()?.stocks || {};

        // Verify all items are available
        for (const item of items) {
          const currentStock = currentStocks[item.id] || 0;
          if (currentStock < item.quantity) {
            throw new Error(`สินค้า ${item.name} มีไม่พอในสต็อก`);
          }
        }

        // Update stock levels
        const stockUpdates = items.reduce((updates, item) => {
          updates[`stocks.${item.id}`] =
            (currentStocks[item.id] || 0) - item.quantity;
          return updates;
        }, {} as { [key: string]: number });

        // Create order record
        const orderId = Date.now().toString();
        transaction.set(doc(db, "orders", orderId), {
          items,
          total: getTotal(),
          createdAt: serverTimestamp(),
          status: "completed",
        });

        // Update stock
        transaction.update(doc(db, "stocks", "inventory"), {
          ...stockUpdates,
          updatedAt: serverTimestamp(),
        });
      });

      // Clear cart after successful transaction
      await clearCart();
      setCheckoutError(null);
      alert("ชำระเงินสำเร็จ!");
    } catch (error: any) {
      console.error("Checkout error:", error);
      setCheckoutError(error.message || "เกิดข้อผิดพลาดในการชำระเงิน");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-600 dark:text-gray-400">
        <svg
          className="w-16 h-16 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2">ตะกร้าว่างเปล่า</h3>
        <p>ยังไม่มีสินค้าในตะกร้า</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        ตะกร้าสินค้า
      </h2>

      {checkoutError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {checkoutError}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => {
            const stockAvailable = checkStock(item.id);
            const hasStockIssue = item.quantity > stockAvailable;

            return (
              <div key={item.id} className="p-4 flex items-center gap-4">
                <div className="w-20 h-20 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    ฿{item.price.toFixed(2)}
                  </p>
                  {hasStockIssue && (
                    <p className="text-sm text-red-500 mt-1">
                      เหลือในสต็อก: {stockAvailable} ชิ้น
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.id,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    </button>

                    <input
                      type="number"
                      min="1"
                      max={stockAvailable}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className={`w-16 px-2 py-1 border rounded-md text-center ${
                        hasStockIssue
                          ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30"
                          : "border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      } dark:text-white`}
                    />

                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                      disabled={item.quantity >= stockAvailable}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              รวมทั้งหมด:
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ฿{getTotal().toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={
              isProcessing ||
              items.some((item) => item.quantity > checkStock(item.id))
            }
            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors duration-300 ${
              isProcessing ||
              items.some((item) => item.quantity > checkStock(item.id))
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isProcessing ? "กำลังดำเนินการ..." : "ดำเนินการชำระเงิน"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
