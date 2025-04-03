import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/navbar";
import { db } from "../configs/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

const Products = () => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products from Firestore with real-time updates
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
        setError("ไม่สามารถโหลดข้อมูลสินค้าได้");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Category name mapping
  const categoryNames: { [key: string]: string } = {
    all: "ทั้งหมด",
    coffee: "กาแฟ",
    tea: "ชา",
    juice: "น้ำผลไม้",
  };

  // Category color mapping
  const categoryColors: {
    [key: string]: { bg: string; text: string; badge: string };
  } = {
    coffee: {
      bg: "bg-amber-50 dark:bg-amber-900/10",
      text: "text-amber-600 dark:text-amber-400",
      badge: "bg-amber-100 dark:bg-amber-900/30",
    },
    tea: {
      bg: "bg-emerald-50 dark:bg-emerald-900/10",
      text: "text-emerald-600 dark:text-emerald-400",
      badge: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    juice: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      text: "text-orange-600 dark:text-orange-400",
      badge: "bg-orange-100 dark:bg-orange-900/30",
    },
  };

  // State for quantity of each product
  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  // Update quantities when products change
  useEffect(() => {
    setQuantities(
      products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
    );
  }, [products]);

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
    if (quantity > 0) {
      addToCart(product, quantity);
      setQuantities((prev) => ({
        ...prev,
        [product.id]: 1,
      }));
    }
  };

  // Get unique categories from products
  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      {/* Category Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {categoryNames[category] || category}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
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
              {/* Category Badge */}
              <div
                className={`absolute top-3 left-3 px-2 py-1 rounded-md ${
                  categoryColors[product.category]?.badge || "bg-gray-100"
                } ${categoryColors[product.category]?.text || "text-gray-600"}`}
              >
                {categoryNames[product.category] || product.category}
              </div>
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
                  value={quantities[product.id] || 1}
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
