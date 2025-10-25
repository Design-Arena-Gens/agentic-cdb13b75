import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI, Product, Review } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          productsAPI.getProduct(parseInt(id!)),
          reviewsAPI.getProductReviews(parseInt(id!)),
        ]);
        setProduct(productData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        toast({
          title: 'Error',
          description: 'Failed to load product details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addToCart(product!.id, quantity);
      toast({
        title: 'Success',
        description: `Added ${quantity} ${product!.name} to cart`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      const newReview = await reviewsAPI.createReview({
        product_id: product!.id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviews([newReview, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
      toast({
        title: 'Success',
        description: 'Review submitted successfully',
      });
      
      const updatedProduct = await productsAPI.getProduct(product!.id);
      setProduct(updatedProduct);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl text-gray-600">Product not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6">
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          
          {product.review_count > 0 && (
            <div className="flex items-center gap-2" aria-label={`Rating: ${product.average_rating} out of 5 stars`}>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(product.average_rating)
                        ? 'fill-accent-500 text-accent-500'
                        : 'text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-700">{product.average_rating}</span>
              <span className="text-gray-500">({product.review_count} reviews)</span>
            </div>
          )}

          <p className="text-3xl font-bold text-primary-700">${product.price.toFixed(2)}</p>

          <div className="border-t border-b border-gray-200 py-4">
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Category:</span> {product.category}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Availability:</span>{' '}
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </p>
          </div>

          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="font-semibold text-gray-700">
                  Quantity:
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-20 text-center"
                    aria-label="Quantity"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" aria-hidden="true" />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {user && (
            <form onSubmit={handleSubmitReview} className="space-y-4 border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-800">Write a Review</h3>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating
                            ? 'fill-accent-500 text-accent-500'
                            : 'text-gray-300'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <Textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this cake..."
                  required
                  rows={4}
                  aria-required="true"
                />
              </div>

              <Button
                type="submit"
                disabled={submittingReview}
                className="bg-secondary-500 hover:bg-secondary-600 text-white"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{review.user_name}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-accent-500 text-accent-500'
                                  : 'text-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductDetailPage;
