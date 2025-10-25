from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class OrderStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.USER

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: int
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(gt=0)
    image_url: str
    category: str
    stock: int = Field(ge=0)

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    category: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)

class Product(ProductBase):
    id: int
    created_at: datetime
    average_rating: float = 0.0
    review_count: int = 0

class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewCreate(ReviewBase):
    product_id: int

class Review(ReviewBase):
    id: int
    product_id: int
    user_id: int
    user_name: str
    created_at: datetime

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int = Field(gt=0)

class CartItem(CartItemBase):
    id: int
    user_id: int
    product: Product

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    price: float

class OrderItem(OrderItemBase):
    id: int
    product_name: str

class OrderBase(BaseModel):
    shipping_address: str
    phone: str

class OrderCreate(OrderBase):
    payment_method_id: str

class Order(OrderBase):
    id: int
    user_id: int
    status: OrderStatus
    total_amount: float
    items: List[OrderItem]
    created_at: datetime

class PaginatedProducts(BaseModel):
    items: List[Product]
    total: int
    page: int
    page_size: int
    total_pages: int

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
