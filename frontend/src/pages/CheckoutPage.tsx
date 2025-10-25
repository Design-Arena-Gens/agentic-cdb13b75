import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ordersAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy');

const CheckoutForm = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, refreshCart } = useCart();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!shippingAddress.trim()) {
      newErrors.shippingAddress = 'Shipping address is required';
    } else if (shippingAddress.trim().length < 10) {
      newErrors.shippingAddress = 'Please enter a complete address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    try {
      setProcessing(true);

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      await ordersAPI.createOrder({
        shipping_address: shippingAddress,
        phone: phone,
        payment_method_id: paymentMethod!.id,
      });

      await refreshCart();

      toast({
        title: 'Success',
        description: 'Order placed successfully!',
      });

      navigate('/orders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    required
                    rows={3}
                    aria-required="true"
                    aria-invalid={!!errors.shippingAddress}
                    aria-describedby={errors.shippingAddress ? 'shippingAddress-error' : undefined}
                  />
                  {errors.shippingAddress && (
                    <p id="shippingAddress-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.shippingAddress}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 border border-gray-300 rounded-md">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Your payment information is secure and encrypted.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white text-lg py-6"
                  disabled={processing || !stripe}
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
