export default class EsiroProduct extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    connectedCallback() {
        this.renderDefault();
    }

    renderDefault() {
        this.innerHTML = `<div class="card"><p>${this.getAttribute('name') || 'A product'}</p></div>`;
    }

    renderExpanded() {
        this.innerHTML = `<h2>Product Details</h2><p>More details about ${this.getAttribute('name') || 'the product'}...</p><button>Close</button>`;
        this.querySelector("button").addEventListener("click", () => this.collapseProduct());
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
