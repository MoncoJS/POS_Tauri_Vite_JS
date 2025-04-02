import { useStock } from "../context/StockContext";
import { useState } from "react";
import Navbar from "../components/navbar";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const Stocks = () => {
  const { stocks, updateStock } = useStock();
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [tempStocks, setTempStocks] = useState<{ [key: number]: number }>({});

  // Mock products data (same as in Products page)
  const products: Product[] = [
    {
      id: 1,
      name: "กาแฟลาเต้",
      price: 55,
      image:
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=3337&auto=format&fit=crop",
      description: "กาแฟนมร้อน หอมกรุ่น",
      category: "coffee",
    },
    {
      id: 2,
      name: "ชาเขียวนม",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=3270&auto=format&fit=crop",
      description: "ชาเขียวนมเย็น หวานมัน",
      category: "tea",
    },
    {
      id: 3,
      name: "น้ำส้ม",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=3271&auto=format&fit=crop",
      description: "น้ำส้มคั้นสด",
      category: "juice",
    },
    {
      id: 4,
      name: "อเมริกาโน่",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=3337&auto=format&fit=crop",
      description: "กาแฟดำ รสเข้มข้น",
      category: "coffee",
    },
    {
      id: 5,
      name: "ชามะลิ",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=3270&auto=format&fit=crop",
      description: "ชามะลิหอม ชื่นใจ",
      category: "tea",
    },
  ];

  const handleEditClick = (productId: number) => {
    setEditMode((prev) => ({ ...prev, [productId]: true }));
    setTempStocks((prev) => ({ ...prev, [productId]: stocks[productId] || 0 }));
  };

  const handleSaveClick = (productId: number) => {
    const newStock = tempStocks[productId];
    if (newStock >= 0) {
      // Calculate the difference to add to stock
      const difference = newStock - (stocks[productId] || 0);
      updateStock(productId, -difference); // Negative because updateStock subtracts
      setEditMode((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleCancelClick = (productId: number) => {
    setEditMode((prev) => ({ ...prev, [productId]: false }));
  };

  const handleStockChange = (productId: number, value: string) => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0) {
      setTempStocks((prev) => ({ ...prev, [productId]: newValue }));
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return "text-red-500 dark:text-red-400";
    if (stock <= 20) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-500 dark:text-green-400";
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          จัดการสต็อกสินค้า
        </h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    สินค้า
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ราคา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    จำนวนคงเหลือ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ฿{product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <input
                          type="number"
                          min="0"
                          value={tempStocks[product.id]}
                          onChange={(e) =>
                            handleStockChange(product.id, e.target.value)
                          }
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-center dark:bg-gray-700 dark:text-white"
                        />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${getStockStatus(
                            stocks[product.id] || 0
                          )}`}
                        >
                          {stocks[product.id] || 0} ชิ้น
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editMode[product.id] ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveClick(product.id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => handleCancelClick(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(product.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stocks;
