import { ProductService } from '../services/products.js';
import { db } from '../db.js';

export default class EsiroProduct extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
        this.productData = null;
        this.storeData = null;
    }

    async connectedCallback() {
        // Get full product data if we have an ID
        const productId = this.getAttribute('product-id');
        if (productId) {
            await this.loadProductData(productId);
        }
        this.renderDefault();
    }

    async loadProductData(productId) {
        try {
            await db.open();
            this.productData = await db.products.get(productId);
            
            // If we have a vendor ID, load the store data as well
            if (this.productData && this.productData.vendorId) {
                this.storeData = await db.stores.get(this.productData.vendorId);
            }
        } catch (error) {
            console.error('Error loading product data:', error);
        }
    }

    async handleAddToCart(productId) {
        const success = await ProductService.addToCart(productId);
        if (success) {
            alert('Added to cart!');
        } else {
            alert('Failed to add to cart. Please try again.');
        }
    }

    renderDefault() {
        const name = this.getAttribute('name') || 'A product';
        const price = this.getAttribute('price') || '$0.00';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/150';
        const id = this.getAttribute('product-id');
        const vendorId = this.getAttribute('vendor-id') || (this.productData ? this.productData.vendorId : null);
        const vendorLabel = this.storeData ? `by ${this.storeData.name}` : '';
        
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
        
        this.querySelector(".add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(id);
        });
    }

    renderExpanded() {
        const name = this.getAttribute('name') || 'A product';
        const price = this.getAttribute('price') || '$0.00';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300';
        const id = this.getAttribute('product-id');
        const description = this.getAttribute('description') || '';
        const stock = this.getAttribute('stock') || '0';
        const vendorId = this.getAttribute('vendor-id') || (this.productData ? this.productData.vendorId : null);
        const vendorName = this.storeData ? this.storeData.name : 'Unknown store';
        
        this.innerHTML = `
            <div class="product-expanded">
                <button class="close-button">×</button>
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
        
        // Add event listeners
        this.querySelector(".close-button").addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseProduct();
        });
        
        this.querySelector(".add-to-cart-expanded").addEventListener("click", (e) => {
            e.stopPropagation();
            this.handleAddToCart(id);
        });
        
        this.querySelector(".buy-now").addEventListener("click", (e) => {
            e.stopPropagation();
            alert(`Proceeding to checkout for ${name}!`);
        });
        
        const storeLink = this.querySelector('.store-link');
        if (storeLink) {
            storeLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const storeId = storeLink.dataset.storeId;
                if (storeId) {
                    this.collapseProduct();
                    // Find the store component with this ID and expand it
                    setTimeout(() => {
                        const storeComponents = document.querySelectorAll(`esiro-store[store-id="${storeId}"]`);
                        if (storeComponents.length > 0) {
                            document.querySelector('esiro-network').showSection('stores');
                            storeComponents[0].expandStore();
                        }
                    }, 100);
                }
            });
        }
        
        // Hide other expanded cards to ensure only one is shown
        document.querySelectorAll('esiro-product.expanded, esiro-store.expanded').forEach(card => {
            if (card !== this) {
                if (card.tagName === 'ESIRO-PRODUCT') {
                    card.collapseProduct();
                } else if (card.tagName === 'ESIRO-STORE') {
                    card.collapseStore();
                }
            }
        });
    }

    handleClick(event) {
        if (event.target.tagName === 'BUTTON') {
            // Buttons are handled by their own event listeners
            event.stopPropagation();
        } else if (!this.classList.contains("expanded")) {
            this.expandProduct();
        }
    }

    expandProduct() {
        this.classList.add("expanded");
        this.renderExpanded();
    }

    collapseProduct() {
        this.classList.remove("expanded");
        this.renderDefault();
    }
}
