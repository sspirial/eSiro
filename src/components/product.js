import { mockProducts } from '../mock-data.js';

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
        // Clean up any event listeners if added in the future
    }

    renderDefault() {
        const product = mockProducts.find(product => product.name === this.getAttribute('name'));
        this.shadowRoot.innerHTML = `
            <style>
                .card {
                    padding: 16px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            </style>
            <div class="card">
                <p>${product ? product.name : 'A product'}</p>
                <p>${product ? `$${product.price}` : ''}</p>
            </div>
        `;
    }

    renderExpanded() {
        const product = mockProducts.find(product => product.name === this.getAttribute('name'));
        this.shadowRoot.innerHTML = `
            <h2>Product Details</h2>
            <p>More details about ${product ? product.name : 'the product'}...</p>
            <p>Price: ${product ? `$${product.price}` : ''}</p>
            <button>Close</button>
        `;
        this.shadowRoot.querySelector("button").addEventListener("click", () => this.collapseProduct());
    }

    handleClick(event) {
        if (event.target.tagName === 'BUTTON') {
            event.stopPropagation();
            this.collapseProduct();
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
