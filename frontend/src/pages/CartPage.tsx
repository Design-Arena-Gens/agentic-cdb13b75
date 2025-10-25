import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, updateCartItem, removeFromCart, loading } = useCart();
  const { toast } = useToast();

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    try {
      await updateCartItem(id, quantity);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update cart',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeFromCart(id);
      toast({
        title: 'Success',
        description: 'Item removed from cart',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to view your cart.</p>
            <Button onClick={() => navigate('/login')} className="bg-primary-500 hover:bg-primary-600">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious cakes to your cart!</p>
            <Button onClick={() => navigate('/products')} className="bg-primary-500 hover:bg-primary-600">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {item.product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                    <p className="text-xl font-bold text-primary-700">
                      ${item.product.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 1;
                          if (newQuantity >= 1 && newQuantity <= item.product.stock) {
                            handleUpdateQuantity(item.id, newQuantity);
                          }
                        }}
                        className="w-16 text-center"
                        aria-label="Quantity"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </div>

                    <p className="text-lg font-semibold text-gray-800">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-6"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
