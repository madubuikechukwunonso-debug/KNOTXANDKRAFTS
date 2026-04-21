import { Routes, Route } from 'react-router'
import { CartProvider } from './hooks/useCart'
import Home from './pages/Home'
import Login from './pages/Login'
import Shop from './pages/Shop'
import Booking from './pages/Booking'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'
import Account from './pages/Account'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  )
}
