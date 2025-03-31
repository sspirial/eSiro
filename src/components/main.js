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
        </style>
        <main>
            <section id="stores" class="hidden">
                <div class="grid">
                    <esiro-store></esiro-store>
                    <esiro-store></esiro-store>
                    <esiro-store></esiro-store>
                </div>
            </section>
            <section id="products" class="hidden">
                <div class="grid">
                    <esiro-product></esiro-product>
                    <esiro-product></esiro-product>
                    <esiro-product></esiro-product>
                </div>
            </section>
            <section id="data" class="hidden">
                <esiro-table></esiro-table>
            </section>
            <section id="cart" class="hidden">
                <esiro-cart></esiro-cart>
            </section>
        </main>`;
    }
}
