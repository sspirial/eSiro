import { db } from '../db.js';
import { ProductService } from '../services/products.js';

/**
 * Main component for handling the central content area
 * Manages product and store listings with filtering capabilities
 */
export default class EsiroMain extends HTMLElement {
    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    async connectedCallback() {
        try {
            await this.render();
            await this.loadData();
            this.addEventListener('storeFilterChange', this.handleStoreFilterChange.bind(this));
        } catch (error) {
            console.error('Error initializing main component:', error);
            this.renderErrorState();
        }
    }

    /**
     * Render the main component structure
     */
    render() {
        this.innerHTML = `
        <main>
            <section id="stores" class="hidden">
                <div class="store-grid"></div>
            </section>
            <section id="products" class="hidden">
                <div class="product-filters">
                    <select id="storeFilter" class="store-filter" aria-label="Filter products by store">
                        <option value="">All Stores</option>
                    </select>
                </div>
                <div class="product-grid"></div>
            </section>
            <section id="data" class="hidden">
                <esiro-table></esiro-table>
            </section>
            <section id="cart" class="hidden">
                <esiro-cart></esiro-cart>
            </section>
        </main>
        <style>
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            
            main {
                width: 100%;
                height: calc(100vh - 60px); /* Adjust height to account for header and nav */
                overflow-y: auto;
                padding: 20px; /* Remove bottom padding to avoid overlap with nav */
                box-sizing: border-box;
                background-color: var(--background);
                color: var(--text-primary);
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            section {
                width: 100%;
                box-sizing: border-box;
                padding-bottom: 20px;
            }

            .product-grid, .store-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                gap: 20px;
                width: 100%;
                box-sizing: border-box;
            }
            
            .product-filters {
                margin-bottom: 20px;
                display: flex;
                gap: 10px;
            }
            
            .store-filter {
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: var(--border-radius);
                background-color: var(--background);
            }

            @media (max-width: 768px) {
                main {
                    height: calc(100vh - 120px); /* Adjust height for header and bottom nav */
                    padding: 15px;
                }
                
                .product-grid, .store-grid {
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
            }
        </style>`;
    }
    
    /**
     * Render error state when initialization fails
     * @private
     */
    renderErrorState() {
        const main = this.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="error-state">
                    <h2>Something went wrong</h2>
                    <p>There was an error loading the application data. Please try again.</p>
                    <button id="retryButton">Retry</button>
                </div>
            `;
            
            this.querySelector('#retryButton')?.addEventListener('click', () => {
                this.render();
                this.loadData();
            });
        }
    }

    /**
     * Load stores and products data
     */
    async loadData() {
        try {
            // Load stores and products in parallel
            const [stores, products] = await Promise.all([
                db.stores.toArray(),
                ProductService.getProducts()
            ]);

            // Update store product counts
            await this.updateStoreProductCounts(stores, products);

            // Populate UI with data
            this.populateStoreGrid(stores);
            this.populateProductGrid(products);
            this.populateStoreFilter(stores);
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }
    
    /**
     * Update store product counts
     * @param {Array} stores - Store data
     * @param {Array} products - Product data
     * @private
     */
    async updateStoreProductCounts(stores, products) {
        try {
            for (const store of stores) {
                // Count products for this store
                const productCount = products.filter(p => p.vendorId === store.id).length;
                
                // Update in database
                await db.stores.update(store.id, { 
                    ...store, 
                    productCount 
                });
                
                // Update in our array
                store.productCount = productCount;
            }
        } catch (error) {
            console.error('Error updating store product counts:', error);
        }
    }
    
    /**
     * Populate the store grid with store components
     * @param {Array} stores - Store data
     */
    populateStoreGrid(stores) {
        const storeGrid = this.querySelector('.store-grid');
        if (storeGrid) {
            if (stores.length === 0) {
                storeGrid.innerHTML = this.renderEmptyState('No stores available');
                return;
            }
            
            storeGrid.innerHTML = stores.map(store => `
                <esiro-store 
                    name="${this.sanitizeAttribute(store.name)}" 
                    image="${this.sanitizeAttribute(store.image)}"
                    store-id="${this.sanitizeAttribute(store.id)}"
                    description="${this.sanitizeAttribute(store.description || '')}"
                    product-count="${store.productCount || 0}"
                ></esiro-store>
            `).join('');
        }
    }
    
    /**
     * Populate the product grid with product components
     * @param {Array} products - Product data
     * @param {string} [storeFilter=''] - Optional store ID to filter by
     */
    populateProductGrid(products, storeFilter = '') {
        const productGrid = this.querySelector('.product-grid');
        if (productGrid) {
            // Filter products if store filter is specified
            const filteredProducts = storeFilter 
                ? products.filter(product => product.vendorId === storeFilter)
                : products;
            
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = this.renderEmptyState(`No products found${storeFilter ? ' for this store' : ''}`);
                return;
            }
                
            productGrid.innerHTML = filteredProducts.map(product => `
                <esiro-product 
                    name="${this.sanitizeAttribute(product.name)}" 
                    price="$${product.price}" 
                    image="${this.sanitizeAttribute(product.image)}"
                    product-id="${this.sanitizeAttribute(product.id)}"
                    description="${this.sanitizeAttribute(product.description || '')}"
                    stock="${product.stock || 0}"
                    vendor-id="${this.sanitizeAttribute(product.vendorId || '')}"
                ></esiro-product>
            `).join('');
        }
    }
    
    /**
     * Render empty state message
     * @param {string} message - Message to display
     * @returns {string} HTML for empty state
     * @private
     */
    renderEmptyState(message) {
        return `
            <div class="empty-state">
                <p>${message}</p>
            </div>
        `;
    }
    
    /**
     * Sanitize attribute values to prevent XSS
     * @param {string} value - Attribute value to sanitize
     * @returns {string} Sanitized value
     * @private
     */
    sanitizeAttribute(value) {
        if (!value) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    /**
     * Populate the store filter dropdown
     * @param {Array} stores - Store data
     */
    populateStoreFilter(stores) {
        const storeFilter = this.querySelector('#storeFilter');
        if (storeFilter) {
            // Keep the "All Stores" option and add store options
            const options = stores.map(store => `
                <option value="${this.sanitizeAttribute(store.id)}">${this.sanitizeAttribute(store.name)} (${store.productCount || 0})</option>
            `).join('');
            
            // Append new options after the "All Stores" option
            const currentOption = storeFilter.querySelector('option');
            if (currentOption) {
                currentOption.insertAdjacentHTML('afterend', options);
            } else {
                storeFilter.innerHTML = `<option value="">All Stores</option>${options}`;
            }
            
            // Add event listener for filter changes
            storeFilter.addEventListener('change', (e) => {
                const storeId = e.target.value;
                this.dispatchEvent(new CustomEvent('storeFilterChange', { 
                    detail: { storeId } 
                }));
            });
        }
    }
    
    /**
     * Handle store filter change events
     * @param {CustomEvent} event - Filter change event
     */
    async handleStoreFilterChange(event) {
        try {
            const storeId = event.detail.storeId;
            const products = await ProductService.getProducts();
            this.populateProductGrid(products, storeId);
        } catch (error) {
            console.error('Error handling store filter change:', error);
        }
    }
}