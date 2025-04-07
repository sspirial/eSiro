import { db } from '../db.js';
import { AuthService } from '../services/auth.js';
import { RouterService } from '../services/router.js';

/**
 * Cart component for displaying and managing shopping cart
 * Handles item display, quantity updates, and checkout flow
 */
export default class EsiroCart extends HTMLElement {
    /**
     * Items in the cart
     * @type {Array}
     */
    #cartItems = [];

    constructor() {
        super();
    }

    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    async connectedCallback() {
        try {
            await this.loadCartItems();
            this.render();
        } catch (error) {
            console.error('Error initializing cart:', error);
            this.#cartItems = [];
            this.render();
        }
    }

    /**
     * Load cart items with associated product data
     */
    async loadCartItems() {
        try {
            await db.open(); // Ensure database is open
            
            const userId = this.getCurrentUserId();
            const cartItems = await db.cart
                .where('userId')
                .equals(userId)
                .toArray();

            if (cartItems.length === 0) {
                this.#cartItems = [];
                return;
            }

            // Get product data for cart items
            const productIds = cartItems.map(item => item.productId);
            const products = await db.products.bulkGet(productIds);

            // Combine cart items with product data
            this.#cartItems = cartItems.map((item, index) => ({
                ...item,
                ...products[index]
            }));
        } catch (error) {
            console.error('Error loading cart items:', error);
            this.#cartItems = [];
        }
    }
    
    /**
     * Get current user ID
     * @returns {string} User ID
     * @private
     */
    getCurrentUserId() {
        const user = AuthService.getUser();
        return user?.id || 'current-user';
    }

    /**
     * Render the cart UI
     */
    render() {
        this.innerHTML = `
        <div class="cart-container">
            <h2>Shopping Cart</h2>
            
            <div class="cart-items">
                ${this.#cartItems.length === 0 ? this.renderEmptyCart() : this.renderCartItems()}
            </div>
            
            ${this.#cartItems.length > 0 ? this.renderCartSummary() : ''}
            
            ${this.#cartItems.length > 0 ? this.renderCheckoutForm() : ''}
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

    /**
     * Render empty cart state
     * @returns {string} HTML for empty cart
     * @private
     */
    renderEmptyCart() {
        return `
            <div class="cart-empty">
                <p>Your cart is empty</p>
                <button class="shop-button">
                    Shop Now
                </button>
            </div>
        `;
    }

    /**
     * Render cart items
     * @returns {string} HTML for cart items
     * @private
     */
    renderCartItems() {
        return this.#cartItems.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image || 'https://via.placeholder.com/150'}" alt="${item.name}" class="item-image">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">KES ${item.price}</p>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn" data-action="decrease" aria-label="Decrease quantity">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-action="increase" aria-label="Increase quantity">+</button>
                </div>
                <button class="remove-btn" aria-label="Remove item">✕</button>
            </div>
        `).join('');
    }

    /**
     * Render cart summary with totals
     * @returns {string} HTML for cart summary
     * @private
     */
    renderCartSummary() {
        const subtotal = this.calculateSubtotal();
        const shipping = 500.00; // Fixed shipping cost in KES
        const total = subtotal + shipping;

        return `
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>KES ${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>KES ${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>KES ${total.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Calculate cart subtotal
     * @returns {number} Subtotal amount
     * @private
     */
    calculateSubtotal() {
        return this.#cartItems.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0);
    }

    /**
     * Render checkout form
     * @returns {string} HTML for checkout form
     * @private
     */
    renderCheckoutForm() {
        return `
            <form class="checkout-form">
                <h3>Proceed to Pay</h3>
                <div class="form-row">
                    <input type="tel" placeholder="Phone Number (e.g., 0712345678)" 
                           pattern="^(?:254|\+254|0)?(7[0-9]{8})$"
                           title="Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)"
                           required aria-label="Phone Number">
                    <small class="phone-hint">Format: 07XXXXXXXX or +254XXXXXXXXX</small>
                </div>
                <button type="submit" class="checkout-button">Pay</button>
            </form>
        `;
    }

    /**
     * Set up event listeners for cart actions
     * @private
     */
    setupEventListeners() {
        // Shop button for empty cart
        const shopButton = this.querySelector('.shop-button');
        if (shopButton) {
            shopButton.addEventListener('click', () => {
                RouterService.navigate('/eSiro/products');
            });
        }

        // Checkout form
        const checkoutForm = this.querySelector('.checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', this.handleCheckout.bind(this));
        }

        // Quantity buttons
        const quantityButtons = this.querySelectorAll('.quantity-btn');
        quantityButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                this.handleQuantityChange(e);
            });
        });

        // Remove buttons
        const removeButtons = this.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default button behavior
                e.stopPropagation(); // Stop event bubbling
                this.handleRemoveItem(e);
            });
        });
    }

    /**
     * Handle checkout form submission
     * @param {Event} event - Form submission event
     * @private
     */
    handleCheckout(event) {
        event.preventDefault();
        
        // Validate Kenyan phone number
        const phoneInput = event.target.querySelector('input[type="tel"]');
        const phoneNumber = phoneInput.value.trim();
        const kenyanPhoneRegex = /^(?:254|\+254|0)?(7[0-9]{8})$/;
        
        if (!kenyanPhoneRegex.test(phoneNumber)) {
            this.showNotification('Please enter a valid Kenyan phone number', 'error');
            phoneInput.focus();
            return;
        }
        
        this.createOrder()
            .then(() => {
                this.showNotification('Thank you for your order!');
                this.clearCart();
            })
            .catch(error => {
                console.error('Checkout error:', error);
                this.showNotification('An error occurred during checkout', 'error');
            });
    }

    /**
     * Create an order from cart items
     * @returns {Promise<string>} Order ID
     * @private
     */
    async createOrder() {
        try {
            const userId = this.getCurrentUserId();
            const subtotal = this.calculateSubtotal();
            const shipping = 500.00;
            const total = subtotal + shipping;
            
            // Create order
            const orderId = crypto.randomUUID();
            await db.orders.add({
                id: orderId,
                userId,
                total,
                status: 'pending',
                date: new Date().toISOString(),
                ownerId: userId
            });
            
            // Create order items
            const orderItems = this.#cartItems.map(item => ({
                id: crypto.randomUUID(),
                orderId,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                ownerId: userId
            }));
            
            await db.orderItems.bulkAdd(orderItems);
            
            return orderId;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    /**
     * Clear all items from cart
     * @private
     */
    async clearCart() {
        try {
            const userId = this.getCurrentUserId();
            await db.cart.where('userId').equals(userId).delete();
            this.#cartItems = [];
            this.render();
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }

    /**
     * Handle quantity change button clicks
     * @param {Event} event - Click event
     * @private
     */
    async handleQuantityChange(event) {
        const itemId = event.target.closest('.cart-item').dataset.id;
        const action = event.target.dataset.action;
        await this.updateQuantity(itemId, action);
    }
    
    /**
     * Handle remove item button clicks
     * @param {Event} event - Click event
     * @private
     */
    async handleRemoveItem(event) {
        const itemId = event.target.closest('.cart-item').dataset.id;
        await this.removeItem(itemId);
    }

    /**
     * Update quantity of cart item
     * @param {string} itemId - Cart item ID
     * @param {string} action - 'increase' or 'decrease'
     * @private
     */
    async updateQuantity(itemId, action) {
        try {
            const item = this.#cartItems.find(i => i.id === itemId);
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
            this.showNotification('Error updating quantity', 'error');
        }
    }

    /**
     * Remove item from cart
     * @param {string} itemId - Cart item ID
     * @private
     */
    async removeItem(itemId) {
        try {
            await db.cart.delete(itemId);
            await this.loadCartItems();
            this.render();
        } catch (error) {
            console.error('Error removing item:', error);
            this.showNotification('Error removing item', 'error');
        }
    }
    
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} [type='success'] - Notification type (success/error)
     * @private
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.setAttribute('role', 'alert');
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}