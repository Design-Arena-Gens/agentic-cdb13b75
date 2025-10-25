import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, Product } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Star, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await productsAPI.getProducts({ page: 1, page_size: 6 });
        setFeaturedProducts(data.items);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100 rounded-lg shadow-lg" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Welcome to Sweet Delights
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover our handcrafted cakes made with love and the finest ingredients. Perfect for every celebration!
        </p>
        <Link to="/products">
          <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white text-lg px-8 py-6">
            Browse Our Collection
            <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
          </Button>
        </Link>
      </section>

      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Featured Cakes
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-48 bg-gray-200 rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary-300">
                <CardHeader className="p-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-xl mb-2 text-gray-800">{product.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary-700">${product.price.toFixed(2)}</span>
                    {product.review_count > 0 && (
                      <div className="flex items-center gap-1" aria-label={`Rating: ${product.average_rating} out of 5 stars`}>
                        <Star className="w-4 h-4 fill-accent-500 text-accent-500" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">{product.average_rating}</span>
                        <span className="text-sm text-gray-500">({product.review_count})</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Link to={`/products/${product.id}`} className="w-full">
                    <Button className="w-full bg-secondary-500 hover:bg-secondary-600 text-white">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/products">
            <Button variant="outline" size="lg" className="border-primary-400 text-primary-700 hover:bg-primary-50">
              View All Products
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-8" aria-labelledby="about-heading">
        <h2 id="about-heading" className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Why Choose Sweet Delights?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl" role="img" aria-label="Fresh ingredients">🥚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Fresh Ingredients</h3>
            <p className="text-gray-600">We use only the finest, freshest ingredients in every cake we bake.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl" role="img" aria-label="Handcrafted">👨‍🍳</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Handcrafted</h3>
            <p className="text-gray-600">Each cake is lovingly handcrafted by our expert bakers.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl" role="img" aria-label="Fast delivery">🚚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Delivery</h3>
            <p className="text-gray-600">Quick and reliable delivery to ensure your cake arrives fresh.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
