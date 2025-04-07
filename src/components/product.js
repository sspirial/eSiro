import { ProductService } from '../services/products.js';
import { RouterService } from '../services/router.js';
import { db } from '../db.js';

/**
 * Product component that displays product details
 * Supports both collapsed and expanded views with store integration
 */
export default class EsiroProduct extends HTMLElement {
    /**
     * Cached product data for this component
     * @type {Object|null}
     */
    #productData = null;
    
    /**
     * Cached store data for this component
     * @type {Object|null}
     */
    #storeData = null;
    
    /**
     * Product ID associated with this component
     * @type {string|null}
     */
    #productId = null;

    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    async connectedCallback() {
        this.#productId = this.getAttribute('product-id');
        
        if (this.#productId) {
            await this.loadProductData(this.#productId);
        }
        
        this.renderDefault();
    }
    
    /**
     * Web Component lifecycle - observe these attributes
     * @returns {string[]} Attributes to watch
     */
    static get observedAttributes() {
        return ['product-id', 'vendor-id', 'price', 'name', 'image'];
    }
    
    /**
     * Web Component lifecycle - called when attributes change
     * @param {string} name - Attribute name
     * @param {string} oldValue - Previous value
     * @param {string} newValue - New value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'product-id' && oldValue !== newValue && this.isConnected) {
            this.#productId = newValue;
            this.loadProductData(newValue).then(() => this.renderDefault());
        }
    }

    /**
     * Load product and associated store data
     * @param {string} productId - Product ID to load
     */
    async loadProductData(productId) {
        try {
            await db.open();
            this.#productData = await db.products.get(productId);
            
            // If product has a vendor ID, load store data
            if (this.#productData?.vendorId) {
                this.#storeData = await db.stores.get(this.#productData.vendorId);
            }
        } catch (error) {
            console.error('Error loading product data:', error);
            this.#productData = null;
            this.#storeData = null;
        }
    }

    /**
     * Handle adding product to cart
     * @param {string} productId - Product ID to add
     */
    async handleAddToCart(productId) {
        try {
            const success = await ProductService.addToCart(productId);
            if (success) {
                this.showNotification('Added to cart!');
            } else {
                this.showNotification('Failed to add to cart', 'error');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.showNotification('Error adding to cart', 'error');
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
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    /**
     * Render the default collapsed view of the product
     */
    renderDefault() {
        const name = this.getAttribute('name') || this.#productData?.name || 'A product';
        const price = this.getAttribute('price') || (this.#productData ? `$${this.#productData.price}` : '$0.00');
        const image = this.getAttribute('image') || this.#productData?.image || 'https://via.placeholder.com/150';
        const id = this.#productId;
        const vendorId = this.getAttribute('vendor-id') || this.#productData?.vendorId || null;
        const vendorLabel = this.#storeData ? `by ${this.#storeData.name}` : '';
        
        this.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="vendor-label">${vendorLabel}</p>
                    <p class="price">${price}</p>
                    <button class="add-to-cart" data-product-id="${id}">Add to Cart</button>
                </div>
            </div>
            <style>
                .product-card {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--background);
                    border: 1px solid #ccc;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
                    height: 100%;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                }
                
                .product-image {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    overflow: hidden;
                }
                
                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                
                .product-card:hover .product-image img {
                    transform: scale(1.05);
                }
                
                .product-info {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex-grow: 1;
                }
                
                .product-info h3 {
                    margin: 0;
                    font-size: 16px;
                }
                
                .vendor-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin: 0;
                }
                
                .price {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--primary-accent);
                    margin: 0;
                }
                
                .add-to-cart {
                    padding: 8px 12px;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    margin-top: auto;
                    background-color: var(--primary-accent);
                    color: white;
                }
            </style>
        `;
        
        this.querySelector(".add-to-cart")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(id);
        });
    }

    /**
     * Render the expanded view with product details
     */
    renderExpanded() {
        const name = this.getAttribute('name') || this.#productData?.name || 'A product';
        const price = this.getAttribute('price') || (this.#productData ? `$${this.#productData.price}` : '$0.00');
        const image = this.getAttribute('image') || this.#productData?.image || 'https://via.placeholder.com/300';
        const id = this.#productId;
        const description = this.getAttribute('description') || this.#productData?.description || '';
        const stock = this.getAttribute('stock') || this.#productData?.stock || '0';
        const vendorId = this.getAttribute('vendor-id') || this.#productData?.vendorId || null;
        const vendorName = this.#storeData?.name || 'Unknown store';
        
        this.innerHTML = `
            <div class="product-expanded">
                <button class="close-button" aria-label="Close product details">×</button>
                <div class="product-expanded-content">
                    <div class="product-expanded-image">
                        <img src="${image}" alt="${name}">
                    </div>
                    <div class="product-expanded-info">
                        <h2>${name}</h2>
                        <p class="vendor-label">Sold by: <a href="#" class="store-link" data-store-id="${vendorId}">${vendorName}</a></p>
                        <p class="price">${price}</p>
                        <div class="product-stats">
                            <p><strong>ID:</strong> ${id}</p>
                            <p><strong>Stock:</strong> ${stock} units</p>
                        </div>
                        <div class="product-description">
                            <h3>Description</h3>
                            <p>${description || 'No description available.'}</p>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart-expanded" data-product-id="${id}">Add to Cart</button>
                            <button class="buy-now">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .product-expanded {
                    position: fixed;
                    top: 60px; /* Account for header */
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: calc(100vh - 60px);
                    background: var(--background);
                    padding: 20px;
                    overflow-y: auto;
                    z-index: 1000;
                    box-sizing: border-box;
                }
                
                @media (max-width: 768px) {
                    .product-expanded {
                        bottom: 60px; /* Account for bottom nav */
                        height: calc(100vh - 120px);
                    }
                }
                
                .close-button {
                    position: sticky;
                    top: 0;
                    right: 0;
                    float: right;
                    font-size: 24px;
                    background: var(--background);
                    border: none;
                    cursor: pointer;
                    z-index: 1001;
                    padding: 5px 10px;
                    margin-bottom: 10px;
                }
                
                .product-expanded-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                @media (max-width: 768px) {
                    .product-expanded-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .product-expanded {
                        padding: 15px;
                        padding-bottom: 80px; /* Space for bottom nav and actions */
                    }
                    
                    .product-actions {
                        position: sticky;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        display: flex;
                        padding: 10px;
                        background: var(--background);
                        border-top: 1px solid #ccc;
                        z-index: 101;
                        margin: 0 -15px;
                        margin-top: 20px;
                    }
                    
                    .add-to-cart-expanded, .buy-now {
                        flex: 1;
                    }
                }
                
                .product-expanded-image {
                    width: 100%;
                }
                
                .product-expanded-image img {
                    width: 100%;
                    border-radius: var(--border-radius);
                }
                
                .product-expanded-info {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .product-expanded-info h2 {
                    margin: 0;
                    font-size: 24px;
                }
                
                .product-expanded-info .price {
                    font-size: 22px;
                }
                
                .vendor-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                
                .store-link {
                    color: var(--primary-accent);
                    text-decoration: none;
                }
                
                .store-link:hover {
                    text-decoration: underline;
                }
                
                .product-stats {
                    background-color: rgba(0,0,0,0.03);
                    padding: 10px;
                    border-radius: var(--border-radius);
                }
                
                .product-description {
                    line-height: 1.5;
                }
                
                .product-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .add-to-cart-expanded, .buy-now {
                    padding: 10px 15px;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }
                
                .add-to-cart-expanded {
                    background-color: var(--primary-accent);
                    color: white;
                }
                
                .buy-now {
                    background-color: var(--secondary-accent);
                    color: white;
                }
            </style>
        `;
        
        this.querySelector(".add-to-cart-expanded")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(id);
        });
        
        this.querySelector(".buy-now")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleBuyNow(id);
        });
        
        this.querySelector(".close-button")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseProduct();
        });
        
        this.addExpandedEventListeners();
        this.closeOtherExpandedCards();
    }
    
    /**
     * Handle buy now to proceed directly to checkout
     * @param {string} productId - Product ID to buy
     */
    async handleBuyNow(productId) {
        try {
            // Add product to cart first
            const success = await ProductService.addToCart(productId);
            if (success) {
                // Navigate to checkout
                RouterService.navigate('/eSiro/cart');
                this.showNotification('Proceeding to checkout!');
            } else {
                this.showNotification('Failed to process purchase', 'error');
            }
        } catch (error) {
            console.error('Error processing purchase:', error);
            this.showNotification('Error processing purchase', 'error');
        }
    }
    
    /**
     * Add event listeners for the expanded view
     * @private
     */
    addExpandedEventListeners() {
        const name = this.getAttribute('name') || this.#productData?.name || 'A product';
        const id = this.#productId;
        
        this.querySelector(".close-button")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseProduct();
        });
        
        this.querySelector(".add-to-cart-expanded")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(id);
        });
        
        this.querySelector(".buy-now")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleBuyNow(id);
        });
        
        const storeLink = this.querySelector('.store-link');
        if (storeLink) {
            storeLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const storeId = storeLink.dataset.storeId;
                if (storeId) {
                    this.collapseProduct();
                    // Navigate to store
                    this.navigateToStore(storeId);
                }
            });
        }
    }
    
    /**
     * Navigate to a store component
     * @param {string} storeId - Store ID to navigate to
     * @private
     */
    navigateToStore(storeId) {
        RouterService.navigate('/eSiro/stores');
        setTimeout(() => {
            const storeComponents = document.querySelectorAll(`esiro-store[store-id="${storeId}"]`);
            if (storeComponents.length > 0 && typeof storeComponents[0].expandStore === 'function') {
                storeComponents[0].expandStore();
            }
        }, 100);
    }
    
    /**
     * Close any other expanded cards to ensure only one is shown
     * @private
     */
    closeOtherExpandedCards() {
        document.querySelectorAll('esiro-product.expanded, esiro-store.expanded').forEach(card => {
            if (card !== this) {
                if (card.tagName === 'ESIRO-PRODUCT' && typeof card.collapseProduct === 'function') {
                    card.collapseProduct();
                } else if (card.tagName === 'ESIRO-STORE' && typeof card.collapseStore === 'function') {
                    card.collapseStore();
                }
            }
        });
    }

    /**
     * Handle click events on the component
     * @param {Event} event - Click event
     */
    handleClick(event) {
        if (event.target.tagName === 'BUTTON') {
            // Buttons are handled by their own event listeners
            event.stopPropagation();
        } else if (!this.classList.contains("expanded")) {
            this.expandProduct();
        }
    }

    /**
     * Expand the product card to show details
     */
    expandProduct() {
        this.classList.add("expanded");
        this.renderExpanded();
    }

    /**
     * Collapse the product card to default view
     */
    collapseProduct() {
        this.classList.remove("expanded");
        this.renderDefault();
    }
}
