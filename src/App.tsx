// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import AdminPanel from "./pages/AdminPanel";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";

export default function App() {
  return (
    <>
      <Header />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/productos" replace />} />
          <Route path="/productos" element={<Home />} />
          <Route path="/product/:code" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
      <Footer />
    </>
  );
}
