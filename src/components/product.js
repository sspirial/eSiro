import { mockProducts } from '../mock-data.js';
import { NotificationService } from '../services/notification.js';

export default class EsiroProduct extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.addEventListener('click', this.handleClick.bind(this));
    }

    static get observedAttributes() {
        return ['name'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.renderDefault();
        }
    }

    connectedCallback() {
        this.renderDefault();
    }

    disconnectedCallback() {
        // Clean up event listeners
        this.removeEventListener('click', this.handleClick);
    }

    renderDefault() {
        const productName = this.getAttribute('name');
        const product = mockProducts.find(product => product.name === productName);
        
        if (!product) {
            console.warn(`Product with name "${productName}" not found in mock data`);
        }
        
        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    padding: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: transform 0.3s, box-shadow 0.3s;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                h3 {
                    margin-top: 0;
                    margin-bottom: 8px;
                }
                .price {
                    font-weight: bold;
                    color: #2a5;
                    font-size: 1.1em;
                }
            </style>
            <div class="card">
                <h3>${product ? product.name : 'Unknown Product'}</h3>
                <p class="price">${product ? `$${product.price.toFixed(2)}` : ''}</p>
                <p>Store ID: ${product ? product.storeId : 'N/A'}</p>
            </div>
        `;
    }

    renderExpanded() {
        const productName = this.getAttribute('name');
        const product = mockProducts.find(product => product.name === productName);
        
        this.shadowRoot.innerHTML = `
            <style>
                .expanded-card {
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }
                h2 {
                    margin-top: 0;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 10px;
                }
                .info-row {
                    margin: 12px 0;
                }
                .label {
                    font-weight: bold;
                }
                .price {
                    font-size: 1.5em;
                    font-weight: bold;
                    color: #2a5;
                    margin: 12px 0;
                }
                button {
                    padding: 8px 16px;
                    background-color: #4299e1;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 16px;
                    margin-right: 8px;
                }
                .buy-btn {
                    background-color: #38a169;
                }
                button:hover {
                    filter: brightness(1.1);
                }
            </style>
            <div class="expanded-card">
                <h2>${product ? product.name : 'Unknown Product'}</h2>
                <div class="price">${product ? `$${product.price.toFixed(2)}` : ''}</div>
                <div class="info-row">
                    <span class="label">Product ID:</span> ${product ? product.id : 'N/A'}
                </div>
                <div class="info-row">
                    <span class="label">Store ID:</span> ${product ? product.storeId : 'N/A'}
                </div>
                <div class="actions">
                    <button class="buy-btn" id="add-to-cart">Add to Cart</button>
                    <button id="close-btn">Close</button>
                </div>
            </div>
        `;
        
        // Add event listener to close button
        this.shadowRoot.querySelector("#close-btn").addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseProduct();
        });

        // Add event listener for adding to cart
        this.shadowRoot.querySelector("#add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation();
            this.addToCart(product);
        });
    }

    handleClick(event) {
        if (event.target.closest('button')) {
            // If a button was clicked, let its own event handler handle it
            return;
        }
        
        if (!this.classList.contains("expanded")) {
            this.expandProduct();
        }
    }

    expandProduct() {
        console.log('Expanding product:', this.getAttribute('name'));
        this.classList.add("expanded");
        this.renderExpanded();
    }

    collapseProduct() {
        console.log('Collapsing product');
        this.classList.remove("expanded");
        this.renderDefault();
    }

    addToCart(product) {
        if (!product) return;
        
        // Get current cart items from localStorage
        let cartItems = [];
        try {
            const savedCart = localStorage.getItem('cart');
            cartItems = savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Error parsing cart data:', e);
            cartItems = [];
        }
        
        // Check if product already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
            // Increment quantity if already in cart
            cartItems[existingItemIndex].quantity = (cartItems[existingItemIndex].quantity || 1) + 1;
        } else {
            // Add new item with quantity 1
            cartItems.push({
                ...product,
                quantity: 1
            });
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        // Show notification using notification service
        NotificationService.success(`${product.name} added to cart!`);
        
        // Refresh any cart components that might be on the page
        document.querySelectorAll('esiro-cart').forEach(cart => {
            cart.setAttribute('update', Date.now().toString());
        });
    }
}
