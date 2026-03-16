import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';        // ← vamos a crear esta
import Carrito from './pages/Carrito';      // ← placeholder por ahora
import Visagismo from './pages/Visagismo';  // ← placeholder por ahora
import ProductDetail from './pages/ProductDetail';

// Paginas de admin
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminUsers from './pages/Admin/AdminUsers'

import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Router>
            <Navbar />
            <Routes>
              {/* Rutas públicas */}
              <Route element={<ProtectedRoute isPublic redirectTo="/" />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Rutas principales (públicas) */}
              <Route path="/" element={<Home />} />


              {/* Rutas protegidas */}
              <Route element={<ProtectedRoute />}>
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/visagismo" element={<Visagismo />} />
                <Route path="/producto/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/confirmacion" element={<Confirmation />} />
              </Route>

              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/productos" element={<AdminProducts />} />
                <Route path="/admin/pedidos" element={<AdminOrders />} />
                <Route path="/admin/usuarios" element={<AdminUsers />} />
              </Route>

              {/* Ruta 404 (opcional) */}
              <Route path="*" element={<div className="p-10 text-center text-2xl">404 - Página no encontrada</div>} />
            </Routes>
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#fff',
                  color: '#333',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                },
                success: {
                  style: {
                    borderLeft: '5px solid #6B21A8', // morado corporativo
                  },
                  iconTheme: {
                    primary: '#D4AF37', // dorado
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;