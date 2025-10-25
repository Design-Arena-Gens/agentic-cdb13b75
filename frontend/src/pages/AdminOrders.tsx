import { useEffect, useState } from 'react';
import { adminAPI, Order } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../components/ui/use-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, status: Order['status']) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-xl text-gray-600">No orders found</p>
          </CardContent>
        </Card>
      ) : (
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
                    <h3 className="font-semibold text-gray-700 mb-2">Customer ID</h3>
                    <p className="text-gray-600 text-sm">{order.user_id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Contact</h3>
                    <p className="text-gray-600 text-sm">{order.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Shipping Address</h3>
                  <p className="text-gray-600 text-sm">{order.shipping_address}</p>
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

                <div className="border-t border-gray-200 pt-4">
                  <label htmlFor={`status-${order.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value as Order['status'])}
                  >
                    <SelectTrigger id={`status-${order.id}`} className="w-full md:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
