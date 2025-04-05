import { db } from '../db.js';

export default class EsiroCart extends HTMLElement {
    constructor() {
        super();
        this.cartItems = [];
    }

    async connectedCallback() {
        try {
            await db.open(); // Ensure database is open
            await this.loadCartItems();
            this.render();
        } catch (error) {
            console.error('Error initializing cart:', error);
            this.cartItems = [];
            this.render();
        }
    }

    async loadCartItems() {
        try {
            const userId = 'current-user';
            const cartItems = await db.cart
                .where('userId')
                .equals(userId)
                .toArray();

            if (cartItems.length === 0) {
                this.cartItems = [];
                return;
            }

            const productIds = cartItems.map(item => item.productId);
            const products = await db.products
                .bulkGet(productIds);

            this.cartItems = cartItems.map((item, index) => ({
                ...item,
                ...products[index]
            }));
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.cartItems = [];
        }
    }

    render() {
        this.innerHTML = `
        <div class="cart-container">
            <h2>Shopping Cart</h2>
            
            <div class="cart-items">
                ${this.cartItems.length === 0 ? this.renderEmptyCart() : this.renderCartItems()}
            </div>
            
            ${this.cartItems.length > 0 ? this.renderCartSummary() : ''}
            
            ${this.cartItems.length > 0 ? this.renderCheckoutForm() : ''}
        </div>
        
        <style>
            :host {
                display: block;
                width: 100%;
            }
            
            .cart-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .cart-items {
                margin: 20px 0;
                border: 1px solid #eee;
                border-radius: var(--border-radius);
                padding: 20px;
                background-color: var(--background);
            }
            
            .cart-empty {
                text-align: center;
                padding: 40px 0;
            }
            
            .shop-button {
                margin-top: 10px;
                padding: 10px 20px;
                background-color: var(--primary-accent);
                color: white;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
            }
            
            .cart-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #eee;
            }
            
            .item-image {
                width: 80px;
                height: 80px;
                object-fit: cover;
                border-radius: var(--border-radius);
                margin-right: 15px;
            }
            
            .item-details {
                flex: 1;
            }
            
            .item-details h3 {
                margin: 0 0 5px 0;
                font-size: 16px;
            }
            
            .item-price {
                color: var(--primary-accent);
                font-weight: bold;
                margin: 0;
            }
            
            .item-quantity {
                display: flex;
                align-items: center;
                margin: 0 20px;
            }
            
            .quantity-btn {
                width: 30px;
                height: 30px;
                border: 1px solid #ddd;
                background: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
            
            .item-quantity span {
                margin: 0 10px;
            }
            
            .remove-btn {
                border: none;
                background: none;
                color: #999;
                cursor: pointer;
                font-size: 18px;
            }
            
            .cart-summary {
                margin: 20px 0;
                border: 1px solid #eee;
                border-radius: var(--border-radius);
                padding: 20px;
                background-color: var(--background);
            }
            
            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            
            .summary-row.total {
                font-weight: bold;
                font-size: 18px;
                border-bottom: none;
            }
            
            .checkout-form {
                margin-top: 20px;
                border: 1px solid #eee;
                border-radius: var(--border-radius);
                padding: 20px;
                background-color: var(--background);
            }
            
            .form-row {
                margin-bottom: 15px;
            }
            
            .form-row.double {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .checkout-form input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: var(--border-radius);
                box-sizing: border-box;
            }
            
            .checkout-button {
                width: 100%;
                padding: 12px;
                background-color: var(--secondary-accent);
                color: white;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-weight: bold;
                margin-top: 10px;
            }
            
            @media (max-width: 768px) {
                .cart-container {
                    padding-bottom: calc(60px + 20px); /* Bottom nav height + padding */
                }

                .checkout-button {
                    margin-bottom: 60px; /* Ensure button is visible above nav */
                }
            }
        </style>`;
        
        this.setupEventListeners();
    }

    renderEmptyCart() {
        return `
            <div class="cart-empty">
                <p>Your cart is empty</p>
                <button onclick="document.querySelector('esiro-network').showSection('products')" class="shop-button">
                    Shop Now
                </button>
            </div>
        `;
    }

    renderCartItems() {
        return this.cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="remove-btn">✕</button>
            </div>
        `).join('');
    }

    renderCartSummary() {
        const subtotal = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 5.00; // Example shipping cost
        const total = subtotal + shipping;

        return `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    renderCheckoutForm() {
        return `
            <form class="checkout-form">
                <h3>Shipping Information</h3>
                <div class="form-row">
                    <input type="text" placeholder="Full Name" required>
                </div>
                <div class="form-row">
                    <input type="text" placeholder="Address" required>
                </div>
                <div class="form-row double">
                    <input type="text" placeholder="City" required>
                    <input type="text" placeholder="Postal Code" required>
                </div>
                <div class="form-row">
                    <input type="email" placeholder="Email Address" required>
                </div>
                <div class="form-row">
                    <input type="tel" placeholder="Phone Number" required>
                </div>
                <button type="submit" class="checkout-button">Proceed to Checkout</button>
            </form>
        `;
    }

    setupEventListeners() {
        const checkoutForm = this.querySelector('.checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your order!');
            });
        }

        const quantityButtons = this.querySelectorAll('.quantity-btn');
        quantityButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const action = e.target.dataset.action;
                await this.updateQuantity(itemId, action);
            });
        });

        const removeButtons = this.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                await this.removeItem(itemId);
            });
        });
    }

    async updateQuantity(itemId, action) {
        try {
            const item = this.cartItems.find(i => i.id === itemId);
            if (!item) return;

            const newQuantity = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
            
            if (newQuantity > 0) {
                await db.cart.update(itemId, { quantity: newQuantity });
                await this.loadCartItems();
                this.render();
            } else {
                await this.removeItem(itemId);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    }

    async removeItem(itemId) {
        try {
            await db.cart.delete(itemId);
            await this.loadCartItems();
            this.render();
        } catch (error) {
            console.error('Error removing item:', error);
        }
    }
}