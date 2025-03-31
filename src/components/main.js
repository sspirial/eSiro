export default class EsiroMain extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['section'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        // Ensure initial visibility - show stores by default
        setTimeout(() => {
            const storesSection = this.shadowRoot.querySelector('#stores');
            if (storesSection) {
                storesSection.classList.remove('hidden');
            }
        }, 100);
    }

    disconnectedCallback() {
        // Clean up any event listeners if added in the future
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            main {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                position: relative;
            }
            .hidden {
                display: none;
            }
            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
            }
            section {
                width: 100%;
                height: 100%;
            }
        </style>
        <main>
            <section id="stores" class="hidden">
                <h2>Available Stores</h2>
                <div class="grid">
                    <!-- Store components will be dynamically added here -->
                </div>
            </section>
            <section id="products" class="hidden">
                <h2>Available Products</h2>
                <div class="grid">
                    <!-- Product components will be dynamically added here -->
                </div>
            </section>
            <section id="data" class="hidden">
                <h2>User Data</h2>
                <esiro-table></esiro-table>
            </section>
            <section id="cart" class="hidden">
                <h2>Your Cart</h2>
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
