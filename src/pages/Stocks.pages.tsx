import { useState, useRef, useEffect } from "react";
import Navbar from "../components/navbar";
import { useStock } from "../context/StockContext";
import { db } from "../configs/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [tempStocks, setTempStocks] = useState<{ [key: number]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    image: "",
    description: "",
    category: "coffee",
  });

  const categories = [
    { value: "coffee", label: "กาแฟ" },
    { value: "tea", label: "ชา" },
    { value: "juice", label: "น้ำผลไม้" },
    { value: "smoothie", label: "สมูทตี้" },
    { value: "milk", label: "นม" },
  ];

  // Load products from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "products"), orderBy("createdAt", "desc")),
      (snapshot) => {
        const productsData: Product[] = [];
        snapshot.forEach((doc) => {
          productsData.push({ id: parseInt(doc.id), ...doc.data() } as Product);
        });
        setProducts(productsData);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading products:", error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (selectedProduct) {
          setSelectedProduct({
            ...selectedProduct,
            image: reader.result as string,
          });
        } else {
          setNewProduct((prev) => ({
            ...prev,
            image: reader.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveClick = async () => {
    try {
      if (selectedProduct) {
        // Update existing product
        await updateDoc(doc(db, "products", selectedProduct.id.toString()), {
          ...selectedProduct,
          updatedAt: serverTimestamp(),
        });
      } else if (newProduct.name && newProduct.price && newProduct.image) {
        // Add new product
        const newId = Math.max(...products.map((p) => p.id), 0) + 1;
        const productToAdd = {
          ...newProduct,
          id: newId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(doc(db, "products", newId.toString()), productToAdd);

        // Initialize stock for new product
        await updateDoc(doc(db, "stocks", "inventory"), {
          [`stocks.${newId}`]: 0,
          updatedAt: serverTimestamp(),
        });
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setNewProduct({
      name: "",
      price: 0,
      image: "",
      description: "",
      category: "coffee",
    });
    setIsModalOpen(false);
  };

  const handleStockChange = (productId: number, value: string) => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0) {
      setTempStocks((prev) => ({ ...prev, [productId]: newValue }));
    }
  };

  const handleStockSave = async (productId: number) => {
    try {
      const newStock = tempStocks[productId];
      if (newStock >= 0) {
        const difference = newStock - (stocks[productId] || 0);
        await updateStock(productId, -difference);
        setEditMode((prev) => ({ ...prev, [productId]: false }));
      }
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return "text-red-500 dark:text-red-400";
    if (stock <= 20) return "text-yellow-500 dark:text-yellow-400";
    return "text-green-500 dark:text-green-400";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            จัดการสต็อกสินค้า
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            เพิ่มสินค้าใหม่
          </button>
        </div>

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
                        {
                          categories.find(
                            (cat) => cat.value === product.category
                          )?.label
                        }
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
                      <div className="flex space-x-2">
                        {editMode[product.id] ? (
                          <>
                            <button
                              onClick={() => handleStockSave(product.id)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              บันทึก
                            </button>
                            <button
                              onClick={() =>
                                setEditMode((prev) => ({
                                  ...prev,
                                  [product.id]: false,
                                }))
                              }
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              ยกเลิก
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditMode((prev) => ({
                                  ...prev,
                                  [product.id]: true,
                                }));
                                setTempStocks((prev) => ({
                                  ...prev,
                                  [product.id]: stocks[product.id] || 0,
                                }));
                              }}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              แก้ไขสต็อก
                            </button>
                            <button
                              onClick={() => handleEditClick(product)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              แก้ไขข้อมูล
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Management Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    {selectedProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ชื่อสินค้า
                      </label>
                      <input
                        type="text"
                        value={selectedProduct?.name || newProduct.name}
                        onChange={(e) => {
                          if (selectedProduct) {
                            setSelectedProduct({
                              ...selectedProduct,
                              name: e.target.value,
                            });
                          } else {
                            setNewProduct((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="ชื่อสินค้า"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ราคา
                      </label>
                      <input
                        type="number"
                        value={selectedProduct?.price || newProduct.price}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          if (selectedProduct) {
                            setSelectedProduct({
                              ...selectedProduct,
                              price: value,
                            });
                          } else {
                            setNewProduct((prev) => ({
                              ...prev,
                              price: value,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="ราคา"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        รูปภาพ
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      {(selectedProduct?.image || newProduct.image) && (
                        <div className="mt-2">
                          <img
                            src={selectedProduct?.image || newProduct.image}
                            alt="Preview"
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        ประเภท
                      </label>
                      <select
                        value={selectedProduct?.category || newProduct.category}
                        onChange={(e) => {
                          if (selectedProduct) {
                            setSelectedProduct({
                              ...selectedProduct,
                              category: e.target.value,
                            });
                          } else {
                            setNewProduct((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        รายละเอียด
                      </label>
                      <textarea
                        value={
                          selectedProduct?.description || newProduct.description
                        }
                        onChange={(e) => {
                          if (selectedProduct) {
                            setSelectedProduct({
                              ...selectedProduct,
                              description: e.target.value,
                            });
                          } else {
                            setNewProduct((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="รายละเอียดสินค้า"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={handleSaveClick}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    บันทึก
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stocks;
