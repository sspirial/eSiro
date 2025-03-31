export default class EsiroStore extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    connectedCallback() {
        this.renderDefault();
    }

    renderDefault() {
        this.innerHTML = `<div class="card"><p>A store</p></div>`;
    }

    renderExpanded() {
        this.innerHTML = `<h2>Store Details</h2><p>More details about this store...</p><button>Close</button>`;
        this.querySelector("button").addEventListener("click", () => this.collapseStore());
    }

    handleClick(event) {
        if (event.target.tagName === 'BUTTON') {
            event.stopPropagation();
            this.collapseStore();
        } else if (!this.classList.contains("expanded")) {
            this.expandStore();
        }
    }

    expandStore() {
        this.classList.add("expanded");
        this.renderExpanded();
    }

    collapseStore() {
        this.classList.remove("expanded");
        this.renderDefault();
    }
}