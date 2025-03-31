export default class EsiroMain extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <main>
            <section id="stores" class="hidden">
                <div class="store-grid">
                    <esiro-store name="Fashion Store" image="https://via.placeholder.com/150"></esiro-store>
                    <esiro-store name="Grocery Market" image="https://via.placeholder.com/150"></esiro-store>
                    <esiro-store name="Electronics Shop" image="https://via.placeholder.com/150"></esiro-store>
                    <esiro-store name="Bookstore" image="https://via.placeholder.com/150"></esiro-store>
                </div>
            </section>
            <section id="products" class="hidden">
                <div class="product-grid">
                    <esiro-product name="Product 1" price="$19.99" image="https://via.placeholder.com/150"></esiro-product>
                    <esiro-product name="Product 2" price="$24.99" image="https://via.placeholder.com/150"></esiro-product>
                    <esiro-product name="Product 3" price="$15.99" image="https://via.placeholder.com/150"></esiro-product>
                    <esiro-product name="Product 4" price="$29.99" image="https://via.placeholder.com/150"></esiro-product>
                    <esiro-product name="Product 5" price="$34.99" image="https://via.placeholder.com/150"></esiro-product>
                    <esiro-product name="Product 6" price="$12.99" image="https://via.placeholder.com/150"></esiro-product>
                </div>
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
}