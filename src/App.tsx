import Layout from "./layouts/index.layout";
import Dashboard from "./pages/Dashboard.pages";
import Products from "./pages/Product.pages";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { StockProvider } from "./context/StockContext";
import Cart from "./pages/Cart.pages";
import Stocks from "./pages/Stocks.pages";

function App() {
  return (
    <StockProvider>
      <CartProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </StockProvider>
  );
}

export default App;
