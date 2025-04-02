import { useState } from "react";
import Navbar from "../components/navbar";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

const Products = () => {
  // Mock products data - replace with your actual data
  const products: Product[] = [
    {
      id: 1,
      name: "กาแฟลาเต้",
      price: 55,
      image:
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=3337&auto=format&fit=crop",
      description: "กาแฟนมร้อน หอมกรุ่น",
    },
    {
      id: 2,
      name: "ชาเขียวนม",
      price: 45,
      image:
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?q=80&w=3270&auto=format&fit=crop",
      description: "ชาเขียวนมเย็น หวานมัน",
    },
    {
      id: 3,
      name: "น้ำส้ม",
      price: 35,
      image:
        "https://images.unsplash.com/photo-1613478223719-2ab802602423?q=80&w=3271&auto=format&fit=crop",
      description: "น้ำส้มคั้นสด",
    },
    // Add more products as needed
  ];

  // State for quantity of each product
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const handleQuantityChange = (productId: number, value: string) => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0) {
      setQuantities((prev) => ({
        ...prev,
        [productId]: newValue,
      }));
    }
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id];
    console.log(`Adding ${quantity} x ${product.name} to cart`);
    // Add your cart logic here
  };

  return (
    <div>
      <Navbar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {product.description}
              </p>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                ฿{product.price.toFixed(2)}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  จำนวน:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantities[product.id]}
                  onChange={(e) =>
                    handleQuantityChange(product.id, e.target.value)
                  }
                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-center dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
