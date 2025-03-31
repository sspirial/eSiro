import { mockProducts } from '../mock-data.js';

export default class EsiroCart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartItems = this.getCartItems();
    }

    static get observedAttributes() {
        return ['update'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.cartItems = this.getCartItems();
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        const checkoutBtn = this.shadowRoot.querySelector('#checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.removeEventListener('click', this.handleCheckout);
        }
    }

    getCartItems() {
        // In a real app, this would come from localStorage or a state management solution
        // For now, we'll just use the first 2 mock products as demo cart items
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                return JSON.parse(savedCart);
            } catch (e) {
                console.error('Error parsing cart data:', e);
                return this.getDefaultCartItems();
            }
        }
        return this.getDefaultCartItems();
    }

    getDefaultCartItems() {
        // Default demo cart items
        return mockProducts.slice(0, 2).map(product => ({
            ...product,
            quantity: 1
        }));
    }

    saveCartItems() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    calculateTotal() {
        return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    render() {
        const hasItems = this.cartItems.length > 0;
        const total = this.calculateTotal();

        this.shadowRoot.innerHTML = `
            <style>
                .cart-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .cart-items {
                    margin-bottom: 20px;
                }
                .cart-item {
                    display: grid;
                    grid-template-columns: 1fr auto auto auto;
                    gap: 10px;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                }
                .cart-item-name {
                    font-weight: bold;
                }
                .quantity-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .quantity-btn {
                    width: 28px;
                    height: 28px;
                    background: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .quantity-btn:hover {
                    background: #e5e5e5;
                }
                .cart-item-price {
                    font-weight: bold;
                    min-width: 80px;
                    text-align: right;
                }
                .remove-btn {
                    color: #e53e3e;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                }
                .cart-summary {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 20px;
                    background: #f9f9f9;
                    border-radius: 8px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1.2em;
                    font-weight: bold;
                }
                .checkout-btn {
                    padding: 12px;
                    background: #38a169;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 1.1em;
                    cursor: pointer;
                    margin-top: 10px;
                }
                .checkout-btn:hover {
                    background: #2f855a;
                }
                .empty-cart {
                    text-align: center;
                    padding: 40px;
                    color: #718096;
                }
                form {
                    margin-top: 20px;
                    display: grid;
                    gap: 10px;
                }
                input {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
            </style>
            <div class="cart-container">
                ${hasItems ? `
                    <div class="cart-items">
                        ${this.cartItems.map((item, index) => `
                            <div class="cart-item" data-index="${index}">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="quantity-controls">
                                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="quantity-btn increase" data-index="${index}">+</button>
                                </div>
                                <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                                <button class="remove-btn" data-index="${index}">×</button>
                            </div>
                        `).join('')}
                    </div>
                    <div class="cart-summary">
                        <div class="total-row">
                            <span>Total:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button id="checkout-btn" class="checkout-btn">Proceed to Checkout</button>
                    </div>
                ` : `
                    <div class="empty-cart">
                        <h3>Your cart is empty</h3>
                        <p>Start shopping to add items to your cart</p>
                    </div>
                `}
            </div>
        `;
    }

    setupEventListeners() {
        if (this.cartItems.length === 0) return;

        // Handle quantity changes
        this.shadowRoot.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const index = parseInt(e.target.dataset.index);
                const isIncrease = e.target.classList.contains('increase');
                
                if (isIncrease) {
                    this.cartItems[index].quantity++;
                } else {
                    if (this.cartItems[index].quantity > 1) {
                        this.cartItems[index].quantity--;
                    }
                }
                
                this.saveCartItems();
                this.render();
            });
        });

        // Handle item removal
        this.shadowRoot.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const index = parseInt(e.target.dataset.index);
                this.cartItems.splice(index, 1);
                this.saveCartItems();
                this.render();
            });
        });

        // Handle checkout
        this.handleCheckout = () => {
            alert(`Checkout total: $${this.calculateTotal().toFixed(2)}`);
            // In a real app, you'd navigate to a checkout page or open a modal
        };
        
        const checkoutBtn = this.shadowRoot.querySelector('#checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', this.handleCheckout);
        }
    }
}
