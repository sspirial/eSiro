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
    }

    async loadData() {
        try {
            const [stores, products] = await Promise.all([
                db.stores.toArray(),
                ProductService.getProducts()
            ]);

            const storeGrid = this.querySelector('.store-grid');
            const productGrid = this.querySelector('.product-grid');

            if (storeGrid) {
                storeGrid.innerHTML = stores.map(store => `
                    <esiro-store 
                        name="${store.name}" 
                        image="${store.image}"
                        store-id="${store.id}"
                        description="${store.description}"
                    ></esiro-store>
                `).join('');
            }

            if (productGrid) {
                productGrid.innerHTML = products.map(product => `
                    <esiro-product 
                        name="${product.name}" 
                        price="$${product.price}" 
                        image="${product.image}"
                        product-id="${product.id}"
                        description="${product.description}"
                        stock="${product.stock}"
                    ></esiro-product>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}