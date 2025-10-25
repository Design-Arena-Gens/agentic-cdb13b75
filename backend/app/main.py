from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List, Optional
import stripe
import os

from app.models import (
    User, UserCreate, UserLogin, Token, Product, ProductCreate, ProductUpdate,
    Review, ReviewCreate, CartItem, CartItemCreate, CartItemUpdate,
    Order, OrderCreate, OrderStatus, PaginatedProducts, UserUpdate, UserRole
)
from app.auth import (
    authenticate_user, create_access_token, get_current_user, 
    get_current_admin_user, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.database import db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy_key")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    if any(u["email"] == user_data.email for u in db.users.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_dict = {
        "id": db.user_id_counter,
        "email": user_data.email,
        "hashed_password": get_password_hash(user_data.password),
        "full_name": user_data.full_name,
        "role": user_data.role,
        "created_at": datetime.utcnow()
    }
    
    db.users[db.user_id_counter] = user_dict
    db.user_id_counter += 1
    
    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        role=user_dict["role"],
        created_at=user_dict["created_at"]
    )

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

@app.put("/api/auth/me", response_model=User)
async def update_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    if user_update.email and user_update.email != current_user["email"]:
        if any(u["email"] == user_update.email for u in db.users.values()):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
        current_user["email"] = user_update.email
    
    if user_update.full_name:
        current_user["full_name"] = user_update.full_name
    
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        created_at=current_user["created_at"]
    )

@app.get("/api/products", response_model=PaginatedProducts)
async def get_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None
):
    products_list = list(db.products.values())
    
    if category:
        products_list = [p for p in products_list if p["category"] == category]
    
    if search:
        search_lower = search.lower()
        products_list = [
            p for p in products_list 
            if search_lower in p["name"].lower() or search_lower in p["description"].lower()
        ]
    
    total = len(products_list)
    total_pages = (total + page_size - 1) // page_size
    
    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_products = products_list[start_idx:end_idx]
    
    products_with_ratings = []
    for product in paginated_products:
        product_reviews = [r for r in db.reviews.values() if r["product_id"] == product["id"]]
        avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
        
        products_with_ratings.append(Product(
            id=product["id"],
            name=product["name"],
            description=product["description"],
            price=product["price"],
            image_url=product["image_url"],
            category=product["category"],
            stock=product["stock"],
            created_at=product["created_at"],
            average_rating=round(avg_rating, 1),
            review_count=len(product_reviews)
        ))
    
    return PaginatedProducts(
        items=products_with_ratings,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: int):
    if product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = db.products[product_id]
    product_reviews = [r for r in db.reviews.values() if r["product_id"] == product_id]
    avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
    
    return Product(
        id=product["id"],
        name=product["name"],
        description=product["description"],
        price=product["price"],
        image_url=product["image_url"],
        category=product["category"],
        stock=product["stock"],
        created_at=product["created_at"],
        average_rating=round(avg_rating, 1),
        review_count=len(product_reviews)
    )

@app.post("/api/products", response_model=Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: dict = Depends(get_current_admin_user)
):
    product_dict = {
        "id": db.product_id_counter,
        "name": product_data.name,
        "description": product_data.description,
        "price": product_data.price,
        "image_url": product_data.image_url,
        "category": product_data.category,
        "stock": product_data.stock,
        "created_at": datetime.utcnow()
    }
    
    db.products[db.product_id_counter] = product_dict
    db.product_id_counter += 1
    
    return Product(**product_dict, average_rating=0.0, review_count=0)

@app.put("/api/products/{product_id}", response_model=Product)
async def update_product(
    product_id: int,
    product_update: ProductUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    if product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = db.products[product_id]
    
    if product_update.name is not None:
        product["name"] = product_update.name
    if product_update.description is not None:
        product["description"] = product_update.description
    if product_update.price is not None:
        product["price"] = product_update.price
    if product_update.image_url is not None:
        product["image_url"] = product_update.image_url
    if product_update.category is not None:
        product["category"] = product_update.category
    if product_update.stock is not None:
        product["stock"] = product_update.stock
    
    product_reviews = [r for r in db.reviews.values() if r["product_id"] == product_id]
    avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
    
    return Product(**product, average_rating=round(avg_rating, 1), review_count=len(product_reviews))

@app.delete("/api/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    current_user: dict = Depends(get_current_admin_user)
):
    if product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    del db.products[product_id]
    
    reviews_to_delete = [r_id for r_id, r in db.reviews.items() if r["product_id"] == product_id]
    for r_id in reviews_to_delete:
        del db.reviews[r_id]
    
    return None

@app.get("/api/products/{product_id}/reviews", response_model=List[Review])
async def get_product_reviews(product_id: int):
    if product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_reviews = [r for r in db.reviews.values() if r["product_id"] == product_id]
    
    reviews_with_user = []
    for review in product_reviews:
        user = db.users.get(review["user_id"])
        user_name = user["full_name"] if user else "Unknown User"
        
        reviews_with_user.append(Review(
            id=review["id"],
            product_id=review["product_id"],
            user_id=review["user_id"],
            user_name=user_name,
            rating=review["rating"],
            comment=review["comment"],
            created_at=review["created_at"]
        ))
    
    return sorted(reviews_with_user, key=lambda x: x.created_at, reverse=True)

@app.post("/api/reviews", response_model=Review, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user)
):
    if review_data.product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    existing_review = next(
        (r for r in db.reviews.values() 
         if r["product_id"] == review_data.product_id and r["user_id"] == current_user["id"]),
        None
    )
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    review_dict = {
        "id": db.review_id_counter,
        "product_id": review_data.product_id,
        "user_id": current_user["id"],
        "rating": review_data.rating,
        "comment": review_data.comment,
        "created_at": datetime.utcnow()
    }
    
    db.reviews[db.review_id_counter] = review_dict
    db.review_id_counter += 1
    
    return Review(
        **review_dict,
        user_name=current_user["full_name"]
    )

@app.get("/api/cart", response_model=List[CartItem])
async def get_cart(current_user: dict = Depends(get_current_user)):
    user_cart_items = [
        item for item in db.cart_items.values() 
        if item["user_id"] == current_user["id"]
    ]
    
    cart_items_with_products = []
    for item in user_cart_items:
        product = db.products.get(item["product_id"])
        if product:
            product_reviews = [r for r in db.reviews.values() if r["product_id"] == product["id"]]
            avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
            
            cart_items_with_products.append(CartItem(
                id=item["id"],
                product_id=item["product_id"],
                quantity=item["quantity"],
                user_id=item["user_id"],
                product=Product(**product, average_rating=round(avg_rating, 1), review_count=len(product_reviews))
            ))
    
    return cart_items_with_products

@app.post("/api/cart", response_model=CartItem, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    cart_item_data: CartItemCreate,
    current_user: dict = Depends(get_current_user)
):
    if cart_item_data.product_id not in db.products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = db.products[cart_item_data.product_id]
    if product["stock"] < cart_item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available"
        )
    
    existing_item = next(
        (item for item in db.cart_items.values()
         if item["user_id"] == current_user["id"] and item["product_id"] == cart_item_data.product_id),
        None
    )
    
    if existing_item:
        new_quantity = existing_item["quantity"] + cart_item_data.quantity
        if product["stock"] < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough stock available"
            )
        existing_item["quantity"] = new_quantity
        
        product_reviews = [r for r in db.reviews.values() if r["product_id"] == product["id"]]
        avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
        
        return CartItem(
            id=existing_item["id"],
            product_id=existing_item["product_id"],
            quantity=existing_item["quantity"],
            user_id=existing_item["user_id"],
            product=Product(**product, average_rating=round(avg_rating, 1), review_count=len(product_reviews))
        )
    
    cart_item_dict = {
        "id": db.cart_item_id_counter,
        "product_id": cart_item_data.product_id,
        "quantity": cart_item_data.quantity,
        "user_id": current_user["id"]
    }
    
    db.cart_items[db.cart_item_id_counter] = cart_item_dict
    db.cart_item_id_counter += 1
    
    product_reviews = [r for r in db.reviews.values() if r["product_id"] == product["id"]]
    avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
    
    return CartItem(
        **cart_item_dict,
        product=Product(**product, average_rating=round(avg_rating, 1), review_count=len(product_reviews))
    )

@app.put("/api/cart/{cart_item_id}", response_model=CartItem)
async def update_cart_item(
    cart_item_id: int,
    cart_item_update: CartItemUpdate,
    current_user: dict = Depends(get_current_user)
):
    if cart_item_id not in db.cart_items:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item = db.cart_items[cart_item_id]
    
    if cart_item["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    product = db.products.get(cart_item["product_id"])
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["stock"] < cart_item_update.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Not enough stock available"
        )
    
    cart_item["quantity"] = cart_item_update.quantity
    
    product_reviews = [r for r in db.reviews.values() if r["product_id"] == product["id"]]
    avg_rating = sum(r["rating"] for r in product_reviews) / len(product_reviews) if product_reviews else 0.0
    
    return CartItem(
        **cart_item,
        product=Product(**product, average_rating=round(avg_rating, 1), review_count=len(product_reviews))
    )

@app.delete("/api/cart/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    cart_item_id: int,
    current_user: dict = Depends(get_current_user)
):
    if cart_item_id not in db.cart_items:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    cart_item = db.cart_items[cart_item_id]
    
    if cart_item["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    del db.cart_items[cart_item_id]
    return None

@app.post("/api/orders", response_model=Order, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user)
):
    user_cart_items = [
        item for item in db.cart_items.values()
        if item["user_id"] == current_user["id"]
    ]
    
    if not user_cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    total_amount = 0.0
    order_items_data = []
    
    for cart_item in user_cart_items:
        product = db.products.get(cart_item["product_id"])
        if not product:
            continue
        
        if product["stock"] < cart_item["quantity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for {product['name']}"
            )
        
        item_total = product["price"] * cart_item["quantity"]
        total_amount += item_total
        
        order_items_data.append({
            "product_id": product["id"],
            "product_name": product["name"],
            "quantity": cart_item["quantity"],
            "price": product["price"]
        })
    
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),
            currency="usd",
            payment_method=order_data.payment_method_id,
            confirm=True,
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"}
        )
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment failed: {str(e)}"
        )
    
    order_dict = {
        "id": db.order_id_counter,
        "user_id": current_user["id"],
        "status": OrderStatus.PENDING,
        "total_amount": total_amount,
        "shipping_address": order_data.shipping_address,
        "phone": order_data.phone,
        "created_at": datetime.utcnow()
    }
    
    db.orders[db.order_id_counter] = order_dict
    order_id = db.order_id_counter
    db.order_id_counter += 1
    
    order_items = []
    for item_data in order_items_data:
        order_item_dict = {
            "id": db.order_item_id_counter,
            "order_id": order_id,
            "product_id": item_data["product_id"],
            "product_name": item_data["product_name"],
            "quantity": item_data["quantity"],
            "price": item_data["price"]
        }
        
        db.order_items[db.order_item_id_counter] = order_item_dict
        db.order_item_id_counter += 1
        
        product = db.products[item_data["product_id"]]
        product["stock"] -= item_data["quantity"]
        
        order_items.append(order_item_dict)
    
    cart_item_ids = [item["id"] for item in user_cart_items]
    for cart_item_id in cart_item_ids:
        del db.cart_items[cart_item_id]
    
    return Order(
        id=order_dict["id"],
        user_id=order_dict["user_id"],
        status=order_dict["status"],
        total_amount=order_dict["total_amount"],
        shipping_address=order_dict["shipping_address"],
        phone=order_dict["phone"],
        items=order_items,
        created_at=order_dict["created_at"]
    )

@app.get("/api/orders", response_model=List[Order])
async def get_orders(current_user: dict = Depends(get_current_user)):
    user_orders = [
        order for order in db.orders.values()
        if order["user_id"] == current_user["id"]
    ]
    
    orders_with_items = []
    for order in user_orders:
        order_items = [
            item for item in db.order_items.values()
            if item["order_id"] == order["id"]
        ]
        
        orders_with_items.append(Order(
            **order,
            items=order_items
        ))
    
    return sorted(orders_with_items, key=lambda x: x.created_at, reverse=True)

@app.get("/api/orders/{order_id}", response_model=Order)
async def get_order(
    order_id: int,
    current_user: dict = Depends(get_current_user)
):
    if order_id not in db.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = db.orders[order_id]
    
    if order["user_id"] != current_user["id"] and current_user["role"] != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    order_items = [
        item for item in db.order_items.values()
        if item["order_id"] == order_id
    ]
    
    return Order(**order, items=order_items)

@app.get("/api/admin/orders", response_model=List[Order])
async def get_all_orders(current_user: dict = Depends(get_current_admin_user)):
    orders_with_items = []
    for order in db.orders.values():
        order_items = [
            item for item in db.order_items.values()
            if item["order_id"] == order["id"]
        ]
        
        orders_with_items.append(Order(
            **order,
            items=order_items
        ))
    
    return sorted(orders_with_items, key=lambda x: x.created_at, reverse=True)

@app.put("/api/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: OrderStatus,
    current_user: dict = Depends(get_current_admin_user)
):
    if order_id not in db.orders:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order = db.orders[order_id]
    order["status"] = status
    
    order_items = [
        item for item in db.order_items.values()
        if item["order_id"] == order_id
    ]
    
    return Order(**order, items=order_items)

@app.get("/api/admin/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(get_current_admin_user)):
    users = [
        User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            created_at=user["created_at"]
        )
        for user in db.users.values()
    ]
    return sorted(users, key=lambda x: x.created_at, reverse=True)

@app.get("/api/categories")
async def get_categories():
    categories = set(product["category"] for product in db.products.values())
    return sorted(list(categories))
