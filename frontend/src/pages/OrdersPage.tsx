import { useEffect, useState } from 'react';
import { ordersAPI, Order } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Package } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                  <p className="text-gray-600 text-sm">{order.shipping_address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Contact</h3>
                  <p className="text-gray-600 text-sm">{order.phone}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Items</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product_name} x {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-primary-700">
                  ${order.total_amount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
