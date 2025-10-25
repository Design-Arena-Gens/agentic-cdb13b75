import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, productsAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [orders, products, users] = await Promise.all([
          adminAPI.getAllOrders(),
          productsAPI.getProducts({ page: 1, page_size: 1000 }),
          adminAPI.getAllUsers(),
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.total,
          totalUsers: users.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingCart className="w-5 h-5 text-primary-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
            <Package className="w-5 h-5 text-secondary-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="w-5 h-5 text-accent-600" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Add, edit, or remove products from your catalog.</p>
            <Link to="/admin/products">
              <Button className="w-full bg-primary-500 hover:bg-primary-600">
                Manage Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View and update order statuses.</p>
            <Link to="/admin/orders">
              <Button className="w-full bg-secondary-500 hover:bg-secondary-600">
                Manage Orders
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View all registered users.</p>
            <Link to="/admin/users">
              <Button className="w-full bg-accent-500 hover:bg-accent-600">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
