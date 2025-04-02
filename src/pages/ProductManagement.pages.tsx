import { useState } from "react";
import Navbar from "../components/navbar";
import { useStock } from "../context/StockContext";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const ProductManagement = () => {
  const { stocks, updateStock } = useStock();
  const [products, setProducts] = useState<Product[]>([
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
  ]);

  const [editMode, setEditMode] = useState<{ [key: number]: boolean }>({});
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

  const handleEditClick = (product: Product) => {
    setEditMode((prev) => ({ ...prev, [product.id]: true }));
  };

  const handleSaveClick = (product: Product) => {
    setEditMode((prev) => ({ ...prev, [product.id]: false }));
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === product.id ? product : p))
    );
  };

  const handleCancelEdit = (productId: number) => {
    setEditMode((prev) => ({ ...prev, [productId]: false }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const newId = Math.max(...products.map((p) => p.id), 0) + 1;
    const productToAdd = {
      ...newProduct,
      id: newId,
    } as Product;

    setProducts((prev) => [...prev, productToAdd]);
    updateStock(newId, 0); // Initialize stock to 0
    setNewProduct({
      name: "",
      price: 0,
      image: "",
      description: "",
      category: "coffee",
    });
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          จัดการรายการสินค้า
        </h2>

        {/* Add New Product Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            เพิ่มสินค้าใหม่
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ชื่อสินค้า
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, name: e.target.value }))
                }
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
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="ราคา"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                รูปภาพ URL
              </label>
              <input
                type="text"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, image: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="URL รูปภาพ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ประเภท
              </label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                รายละเอียด
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="รายละเอียดสินค้า"
                rows={3}
              />
            </div>
          </div>
          <button
            onClick={handleAddProduct}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            เพิ่มสินค้า
          </button>
        </div>

        {/* Product List */}
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
                          {editMode[product.id] ? (
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) =>
                                setProducts((prev) =>
                                  prev.map((p) =>
                                    p.id === product.id
                                      ? { ...p, name: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="text-sm font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                          )}
                          {editMode[product.id] ? (
                            <textarea
                              value={product.description}
                              onChange={(e) =>
                                setProducts((prev) =>
                                  prev.map((p) =>
                                    p.id === product.id
                                      ? { ...p, description: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="text-sm text-gray-500 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded-md p-1 mt-1"
                            />
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <select
                          value={product.category}
                          onChange={(e) =>
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id
                                  ? { ...p, category: e.target.value }
                                  : p
                              )
                            )
                          }
                          className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {categories.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {
                            categories.find(
                              (cat) => cat.value === product.category
                            )?.label
                          }
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editMode[product.id] ? (
                        <input
                          type="number"
                          value={product.price}
                          onChange={(e) =>
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id
                                  ? {
                                      ...p,
                                      price: parseFloat(e.target.value) || 0,
                                    }
                                  : p
                              )
                            )
                          }
                          className="w-20 px-2 py-1 text-sm text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-white">
                          ฿{product.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editMode[product.id] ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveClick(product)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            บันทึก
                          </button>
                          <button
                            onClick={() => handleCancelEdit(product.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(product)}
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

export default ProductManagement;
