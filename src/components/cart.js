export default class EsiroCart extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <div class="cart-container">
            <h2>Shopping Cart</h2>
            
            <div class="cart-items">
                <div class="cart-empty">
                    <p>Your cart is empty</p>
                    <button onclick="document.querySelector('esiro-network').showSection('products')" class="shop-button">Shop Now</button>
                </div>
                
                <!-- Sample cart items (normally would be dynamically generated) -->
                <div class="cart-item">
                    <img src="https://via.placeholder.com/80" alt="Product" class="item-image">
                    <div class="item-details">
                        <h3>Sample Product</h3>
                        <p class="item-price">$19.99</p>
                    </div>
                    <div class="item-quantity">
                        <button class="quantity-btn">-</button>
                        <span>1</span>
                        <button class="quantity-btn">+</button>
                    </div>
                    <button class="remove-btn">✕</button>
                </div>
            </div>
            
            <div class="cart-summary">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$19.99</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$5.00</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$24.99</span>
                </div>
            </div>
            
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
        
        // Add event listeners
        const checkoutForm = this.querySelector('.checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Thank you for your order!');
            });
        }
    }
}