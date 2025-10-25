from datetime import datetime
from typing import Dict, List, Optional
from app.models import UserRole, OrderStatus

class InMemoryDatabase:
    def __init__(self):
        self.users: Dict[int, dict] = {}
        self.products: Dict[int, dict] = {}
        self.reviews: Dict[int, dict] = {}
        self.cart_items: Dict[int, dict] = {}
        self.orders: Dict[int, dict] = {}
        self.order_items: Dict[int, dict] = {}
        
        self.user_id_counter = 1
        self.product_id_counter = 1
        self.review_id_counter = 1
        self.cart_item_id_counter = 1
        self.order_id_counter = 1
        self.order_item_id_counter = 1
        
        self._seed_data()
    
    def _seed_data(self):
        admin_user = {
            "id": self.user_id_counter,
            "email": "admin@cakeshop.com",
            "hashed_password": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIBx5QH9Oa",
            "full_name": "Admin User",
            "role": UserRole.ADMIN,
            "created_at": datetime.utcnow()
        }
        self.users[self.user_id_counter] = admin_user
        self.user_id_counter += 1
        
        sample_products = [
            {
                "id": self.product_id_counter,
                "name": "Chocolate Fudge Cake",
                "description": "Rich and moist chocolate cake with creamy fudge frosting. Perfect for chocolate lovers!",
                "price": 35.99,
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
                "category": "Chocolate",
                "stock": 15,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 1,
                "name": "Vanilla Dream Cake",
                "description": "Classic vanilla sponge cake with smooth vanilla buttercream. A timeless favorite!",
                "price": 29.99,
                "image_url": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500",
                "category": "Vanilla",
                "stock": 20,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 2,
                "name": "Red Velvet Delight",
                "description": "Luxurious red velvet cake with cream cheese frosting. Elegant and delicious!",
                "price": 39.99,
                "image_url": "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500",
                "category": "Red Velvet",
                "stock": 12,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 3,
                "name": "Strawberry Shortcake",
                "description": "Light and fluffy cake layered with fresh strawberries and whipped cream.",
                "price": 32.99,
                "image_url": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500",
                "category": "Fruit",
                "stock": 18,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 4,
                "name": "Lemon Bliss Cake",
                "description": "Tangy lemon cake with zesty lemon frosting. Refreshingly delicious!",
                "price": 31.99,
                "image_url": "https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=500",
                "category": "Fruit",
                "stock": 14,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 5,
                "name": "Carrot Cake Supreme",
                "description": "Moist carrot cake with walnuts and cream cheese frosting. A healthy indulgence!",
                "price": 34.99,
                "image_url": "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500",
                "category": "Specialty",
                "stock": 10,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 6,
                "name": "Tiramisu Cake",
                "description": "Italian-inspired coffee-soaked cake with mascarpone cream. Sophisticated and delicious!",
                "price": 42.99,
                "image_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
                "category": "Specialty",
                "stock": 8,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 7,
                "name": "Black Forest Cake",
                "description": "Chocolate cake with cherries and whipped cream. A German classic!",
                "price": 38.99,
                "image_url": "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=500",
                "category": "Chocolate",
                "stock": 11,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 8,
                "name": "Coconut Paradise Cake",
                "description": "Tropical coconut cake with coconut frosting and shredded coconut topping.",
                "price": 33.99,
                "image_url": "https://images.unsplash.com/photo-1588195538326-c5b1e5b027ab?w=500",
                "category": "Specialty",
                "stock": 16,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 9,
                "name": "Funfetti Birthday Cake",
                "description": "Colorful vanilla cake with rainbow sprinkles. Perfect for celebrations!",
                "price": 30.99,
                "image_url": "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500",
                "category": "Vanilla",
                "stock": 25,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 10,
                "name": "Salted Caramel Cake",
                "description": "Decadent caramel cake with salted caramel buttercream. Sweet and salty perfection!",
                "price": 40.99,
                "image_url": "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500",
                "category": "Specialty",
                "stock": 9,
                "created_at": datetime.utcnow()
            },
            {
                "id": self.product_id_counter + 11,
                "name": "Matcha Green Tea Cake",
                "description": "Delicate matcha-flavored cake with white chocolate frosting. Unique and elegant!",
                "price": 36.99,
                "image_url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500",
                "category": "Specialty",
                "stock": 13,
                "created_at": datetime.utcnow()
            }
        ]
        
        for product in sample_products:
            self.products[product["id"]] = product
        
        self.product_id_counter += len(sample_products)
        
        sample_reviews = [
            {
                "id": 1,
                "product_id": 1,
                "user_id": 1,
                "rating": 5,
                "comment": "Absolutely delicious! The chocolate flavor is rich and the texture is perfect.",
                "created_at": datetime.utcnow()
            },
            {
                "id": 2,
                "product_id": 1,
                "user_id": 1,
                "rating": 4,
                "comment": "Great cake, everyone at the party loved it!",
                "created_at": datetime.utcnow()
            },
            {
                "id": 3,
                "product_id": 2,
                "user_id": 1,
                "rating": 5,
                "comment": "Classic vanilla done right. Highly recommend!",
                "created_at": datetime.utcnow()
            }
        ]
        
        for review in sample_reviews:
            self.reviews[review["id"]] = review
        
        self.review_id_counter = len(sample_reviews) + 1

db = InMemoryDatabase()
