import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

const Layout = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
      <header className="bg-white shadow-md sticky top-0 z-50" role="banner">
        <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-primary-700 hover:text-primary-800 transition-colors" aria-label="Sweet Delights Cake Shop Home">
              Sweet Delights
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Products
              </Link>
              {user && (
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                  My Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                  Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/cart" className="relative" aria-label={`Shopping cart with ${cartItemCount} items`}>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold" aria-label={`${cartItemCount} items in cart`}>
                      {cartItemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile" aria-label="View profile">
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" className="border-primary-400 text-primary-700 hover:bg-primary-50">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8" role="main">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12" role="contentinfo">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Sweet Delights</h3>
              <p className="text-gray-600">
                Handcrafted cakes made with love and the finest ingredients. Bringing sweetness to your special moments.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/products" className="text-gray-600 hover:text-primary-600 transition-colors">Browse Cakes</Link></li>
                <li><Link to="/cart" className="text-gray-600 hover:text-primary-600 transition-colors">Shopping Cart</Link></li>
                {user && <li><Link to="/orders" className="text-gray-600 hover:text-primary-600 transition-colors">My Orders</Link></li>}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-4">Contact</h3>
              <p className="text-gray-600">Email: info@sweetdelights.com</p>
              <p className="text-gray-600">Phone: (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2025 Sweet Delights Cake Shop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
