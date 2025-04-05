import { db } from '../db.js';
import { ProductService } from '../services/products.js';

/**
 * Store component that displays vendor information and products
 * Supports both collapsed and expanded views
 */
export default class EsiroStore extends HTMLElement {
    /**
     * Store products data cached for this component
     * @type {Array}
     */
    #storeProducts = [];
    
    /**
     * Store ID associated with this component 
     * @type {string|null}
     */
    #storeId = null;

    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    async connectedCallback() {
        this.#storeId = this.getAttribute('store-id');
        this.renderDefault();
        
        if (this.#storeId) {
            try {
                const products = await this.loadStoreProducts(this.#storeId);
                this.#storeProducts = products;
            } catch (error) {
                console.error('Error loading store products:', error);
                this.#storeProducts = [];
            }
        }
    }
    
    /**
     * Web Component lifecycle - called when attributes change
     * @param {string} name - Attribute name
     * @param {string} oldValue - Previous value
     * @param {string} newValue - New value
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'product-count' && this.isConnected) {
            const productCountEl = this.querySelector('.product-count');
            if (productCountEl) {
                productCountEl.textContent = `${newValue} Products`;
            }
        }
    }
    
    /**
     * Web Component lifecycle - observe these attributes
     * @returns {string[]} Attributes to watch
     */
    static get observedAttributes() {
        return ['product-count', 'store-id'];
    }

    /**
     * Render the default collapsed view of the store
     */
    renderDefault() {
        const name = this.getAttribute('name') || 'Local Store';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/150';
        const productCount = this.getAttribute('product-count') || '0';
        
        this.innerHTML = `
        <div class="store-card">
            <div class="store-image">
                <img src="${image}" alt="${name}">
            </div>
            <div class="store-info">
                <h3>${name}</h3>
                <p class="product-count">${productCount} Products</p>
                <button class="visit-store">Visit Store</button>
            </div>
        </div>
        <style>
            :host {
                display: block;
                margin-bottom: 20px;
            }
            
            .store-card {
                display: flex;
                flex-direction: column;
                background-color: var(--background);
                border: 1px solid #ccc;
                border-radius: var(--border-radius);
                overflow: hidden;
                transition: transform var(--transition-speed), box-shadow var(--transition-speed);
                height: 100%;
            }
            
            .store-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
            
            .store-image {
                width: 100%;
                aspect-ratio: 1 / 1;
                overflow: hidden;
            }
            
            .store-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .store-card:hover .store-image img {
                transform: scale(1.05);
            }
            
            .store-info {
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex-grow: 1;
            }
            
            .store-info h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .product-count {
                color: var(--text-secondary);
                margin: 0;
                font-size: 14px;
            }
            
            .visit-store {
                padding: 8px 12px;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
                margin-top: auto;
                background-color: var(--primary-accent);
                color: white;
            }
        </style>`;
        
        this.querySelector(".visit-store")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.expandStore();
        });
    }

    /**
     * Load products for a specific store
     * @param {string} storeId - Store ID
     * @returns {Promise<Array>} List of products
     */
    async loadStoreProducts(storeId) {
        try {
            await db.open();
            const products = await ProductService.getProductsByStore(storeId);
            
            // Update product count in UI
            const productCountEl = this.querySelector('.product-count');
            if (productCountEl) {
                productCountEl.textContent = `${products.length} Products`;
            }
            
            return products;
        } catch (error) {
            console.error('Error loading store products:', error);
            return [];
        }
    }

    /**
     * Render the expanded view with store details and products
     */
    renderExpanded() {
        const name = this.getAttribute('name') || 'Local Store';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300';
        const id = this.#storeId;
        const description = this.getAttribute('description') || `This is a detailed description for ${name}.`;
        
        this.innerHTML = `
        <div class="store-expanded">
            <button class="close-button" aria-label="Close store details">×</button>
            <div class="store-expanded-content">
                <div class="store-expanded-image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="store-expanded-info">
                    <h2>${name}</h2>
                    <div class="store-description">
                        <p>${description}</p>
                    </div>
                    <div class="store-actions">
                        <button class="browse-products">Browse Products</button>
                        <button class="contact-store">Contact</button>
                    </div>
                    <div class="store-stats">
                        <p><strong>Products:</strong> <span class="product-count-expanded">Loading...</span></p>
                        <p><strong>Store ID:</strong> ${id}</p>
                    </div>
                    <h3>Store Products</h3>
                    <div class="store-products"></div>
                </div>
            </div>
        </div>
        <style>
            .store-expanded {
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
                .store-expanded {
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
            
            .store-expanded-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            @media (max-width: 768px) {
                .store-expanded-content {
                    grid-template-columns: 1fr;
                }
                
                .store-expanded {
                    padding: 15px;
                    padding-bottom: 80px; /* Space for bottom nav and actions */
                }
                
                .store-actions {
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
                
                .browse-products, .contact-store {
                    flex: 1;
                }
            }
            
            .store-expanded-image {
                width: 100%;
            }
            
            .store-expanded-image img {
                width: 100%;
                border-radius: var(--border-radius);
            }
            
            .store-expanded-info {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .store-expanded-info h2 {
                margin: 0;
                font-size: 24px;
            }
            
            .store-description {
                line-height: 1.5;
            }
            
            .store-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .browse-products, .contact-store {
                padding: 10px 15px;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
            }
            
            .browse-products {
                background-color: var(--primary-accent);
                color: white;
            }
            
            .contact-store {
                background-color: var(--background);
                border: 1px solid var(--primary-accent);
            }
            
            .store-stats {
                background-color: rgba(0,0,0,0.03);
                padding: 10px;
                border-radius: var(--border-radius);
            }
            
            .store-products {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
        </style>`;
        
        this.addExpandedEventListeners();
        this.closeOtherExpandedCards();

        // Render products based on cached data or load them
        if (this.#storeProducts.length > 0) {
            this.renderStoreProducts(this.#storeProducts);
        } else if (id) {
            this.loadStoreProducts(id).then(products => {
                this.#storeProducts = products;
                this.renderStoreProducts(products);
            });
        }
    }
    
    /**
     * Add event listeners for the expanded view
     * @private
     */
    addExpandedEventListeners() {
        const name = this.getAttribute('name') || 'Local Store';
        
        this.querySelector(".close-button")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseStore();
        });
        
        this.querySelector(".browse-products")?.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector('esiro-network')?.showSection('products');
        });
        
        this.querySelector(".contact-store")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.showContactForm();
        });
    }
    
    /**
     * Display a contact form for the store
     * @private
     */
    showContactForm() {
        const name = this.getAttribute('name') || 'Local Store';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'contact-form-modal';
        
        // Create form content
        modal.innerHTML = `
            <div class="contact-form-container">
                <button class="close-modal" aria-label="Close contact form">×</button>
                <h2>Contact ${name}</h2>
                <form class="store-contact-form">
                    <div class="form-group">
                        <label for="contact-name">Your Name</label>
                        <input type="text" id="contact-name" required placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label for="contact-email">Your Email</label>
                        <input type="email" id="contact-email" required placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="contact-subject">Subject</label>
                        <input type="text" id="contact-subject" required placeholder="Enter subject">
                    </div>
                    <div class="form-group">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" rows="4" required placeholder="Enter your message"></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="submit-btn">Send Message</button>
                    </div>
                </form>
            </div>
            <style>
                .contact-form-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 2000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                
                .contact-form-container {
                    background-color: var(--background);
                    border-radius: var(--border-radius);
                    padding: 25px;
                    max-width: 500px;
                    width: 100%;
                    position: relative;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .close-modal {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    font-size: 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                
                .store-contact-form {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    margin-top: 20px;
                }
                
                .form-group {
                    display: flex;
                    flex-direction: column;
                }
                
                .form-group label {
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .form-group input, .form-group textarea {
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: var(--border-radius);
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .cancel-btn {
                    padding: 10px 15px;
                    background: none;
                    border: 1px solid #ddd;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }
                
                .submit-btn {
                    padding: 10px 15px;
                    background-color: var(--primary-accent);
                    color: white;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }
            </style>
        `;
        
        // Add to DOM
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.store-contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const form = modal.querySelector('.store-contact-form');
            const name = form.querySelector('#contact-name').value;
            const email = form.querySelector('#contact-email').value;
            const subject = form.querySelector('#contact-subject').value;
            const message = form.querySelector('#contact-message').value;
            
            // In a real app, you would send these values to a server
            // For now, just show a success message
            this.showNotification(`Message sent to ${this.getAttribute('name')}!`);
            
            // Close the modal
            document.body.removeChild(modal);
        });
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
        
        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: var(--secondary-accent);
                    color: white;
                    border-radius: var(--border-radius);
                    z-index: 9999;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slide-in 0.3s ease-out forwards;
                }
                .notification.error {
                    background: #ff4b4b;
                }
                .notification.fade-out {
                    animation: fade-out 0.5s ease-out forwards;
                }
                @keyframes slide-in {
                    0% { transform: translateX(100%); opacity: 0; }
                    100% { transform: translateX(0); opacity: 1; }
                }
                @keyframes fade-out {
                    0% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(10px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
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
     * Render the products belonging to this store
     * @param {Array} products - List of products to display
     */
    renderStoreProducts(products) {
        const productGrid = this.querySelector('.store-products');
        const productCountEl = this.querySelector('.product-count-expanded');
        
        if (productCountEl) {
            productCountEl.textContent = products.length;
        }
        
        if (productGrid) {
            if (products.length > 0) {
                productGrid.innerHTML = products.map(product => `
                    <esiro-product 
                        name="${product.name}" 
                        price="$${product.price}" 
                        image="${product.image || 'https://via.placeholder.com/150'}"
                        product-id="${product.id}"
                        description="${product.description || ''}"
                        stock="${product.stock || 0}"
                        vendor-id="${product.vendorId}"
                    ></esiro-product>
                `).join('');
            } else {
                productGrid.innerHTML = '<p>No products available from this store.</p>';
            }
        }
    }

    /**
     * Handle click events on the component
     * @param {Event} event - Click event
     */
    handleClick(event) {
        // Ignore clicks on buttons that have their own handlers
        if (event.target.tagName === 'BUTTON') {
            event.stopPropagation();
        } else if (!this.classList.contains("expanded")) {
            this.expandStore();
        }
    }

    /**
     * Expand the store card to show details
     */
    expandStore() {
        this.classList.add("expanded");
        this.renderExpanded();
    }

    /**
     * Collapse the store card to default view
     */
    collapseStore() {
        this.classList.remove("expanded");
        this.renderDefault();
    }
}