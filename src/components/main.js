import { db } from '../db.js';
import { ProductService } from '../services/products.js';

export default class EsiroMain extends HTMLElement {
    async connectedCallback() {
        await this.render();
        await this.loadData();
    }

    render() {
        this.innerHTML = `
        <main>
            <section id="stores" class="hidden">
                <div class="store-grid"></div>
            </section>
            <section id="products" class="hidden">
                <div class="product-filters">
                    <select id="storeFilter" class="store-filter">
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
                height: 100%;
                overflow-y: auto;
                padding: 20px;
                box-sizing: border-box;
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
                    padding: 15px;
                    padding-bottom: 75px; /* Ensure bottom content isn't hidden behind nav */
                }
                
                .product-grid, .store-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
            }
        </style>`;
        
        // Set up filter listeners
        this.addEventListener('storeFilterChange', this.handleStoreFilterChange.bind(this));
    }

    async loadData() {
        try {
            const [stores, products] = await Promise.all([
                db.stores.toArray(),
                ProductService.getProducts()
            ]);

            // First, update store product counts
            for (const store of stores) {
                const productCount = products.filter(p => p.vendorId === store.id).length;
                await db.stores.update(store.id, { 
                    ...store, 
                    productCount 
                });
                
                // Update the store object in our array
                store.productCount = productCount;
            }

            this.populateStoreGrid(stores);
            this.populateProductGrid(products);
            this.populateStoreFilter(stores);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    populateStoreGrid(stores) {
        const storeGrid = this.querySelector('.store-grid');
        if (storeGrid) {
            storeGrid.innerHTML = stores.map(store => `
                <esiro-store 
                    name="${store.name}" 
                    image="${store.image}"
                    store-id="${store.id}"
                    description="${store.description || ''}"
                    product-count="${store.productCount || 0}"
                ></esiro-store>
            `).join('');
        }
    }
    
    populateProductGrid(products, storeFilter = '') {
        const productGrid = this.querySelector('.product-grid');
        if (productGrid) {
            // Filter products if storeFilter is specified
            const filteredProducts = storeFilter 
                ? products.filter(product => product.vendorId === storeFilter)
                : products;
                
            productGrid.innerHTML = filteredProducts.map(product => `
                <esiro-product 
                    name="${product.name}" 
                    price="$${product.price}" 
                    image="${product.image}"
                    product-id="${product.id}"
                    description="${product.description || ''}"
                    stock="${product.stock || 0}"
                    vendor-id="${product.vendorId || ''}"
                ></esiro-product>
            `).join('');
            
            // Show empty state if no products
            if (filteredProducts.length === 0) {
                productGrid.innerHTML = `
                    <div class="empty-state">
                        <p>No products found${storeFilter ? ' for this store' : ''}.</p>
                    </div>
                `;
            }
        }
    }
    
    populateStoreFilter(stores) {
        const storeFilter = this.querySelector('#storeFilter');
        if (storeFilter) {
            // Keep the "All Stores" option and add store options
            const currentOptions = storeFilter.innerHTML;
            storeFilter.innerHTML = currentOptions + stores.map(store => `
                <option value="${store.id}">${store.name} (${store.productCount || 0})</option>
            `).join('');
            
            // Add event listener
            storeFilter.addEventListener('change', (e) => {
                const storeId = e.target.value;
                this.dispatchEvent(new CustomEvent('storeFilterChange', { 
                    detail: { storeId } 
                }));
            });
        }
    }
    
    async handleStoreFilterChange(event) {
        const storeId = event.detail.storeId;
        const products = await ProductService.getProducts();
        this.populateProductGrid(products, storeId);
    }
}