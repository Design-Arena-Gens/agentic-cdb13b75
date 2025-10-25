import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI, Product } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Star, Search } from 'lucide-react';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentCategory = searchParams.get('category') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          productsAPI.getProducts({
            page: currentPage,
            page_size: 12,
            category: currentCategory || undefined,
            search: searchQuery || undefined,
          }),
          productsAPI.getCategories(),
        ]);
        setProducts(productsData.items);
        setTotalPages(productsData.total_pages);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, currentCategory, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('search', searchQuery);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Our Cakes</h1>
        
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2" role="search">
            <Input
              type="search"
              placeholder="Search for cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              aria-label="Search for cakes"
            />
            <Button type="submit" className="bg-primary-500 hover:bg-primary-600" aria-label="Search">
              <Search className="w-4 h-4 mr-2" aria-hidden="true" />
              Search
            </Button>
          </form>

          <Select value={currentCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-48" aria-label="Filter by category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
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
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600">No cakes found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-primary-300">
                <CardHeader className="p-0">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 text-gray-800">{product.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-bold text-primary-700">${product.price.toFixed(2)}</span>
                    {product.review_count > 0 && (
                      <div className="flex items-center gap-1" aria-label={`Rating: ${product.average_rating} out of 5 stars`}>
                        <Star className="w-4 h-4 fill-accent-500 text-accent-500" aria-hidden="true" />
                        <span className="text-sm font-medium text-gray-700">{product.average_rating}</span>
                        <span className="text-sm text-gray-500">({product.review_count})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </p>
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

          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 mt-8" aria-label="Pagination">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => handlePageChange(page)}
                        className={currentPage === page ? 'bg-primary-500 hover:bg-primary-600' : ''}
                        aria-label={`Page ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
