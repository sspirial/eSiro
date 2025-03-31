export default class EsiroTable extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['data'];
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
                .table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .table th,
                .table td {
                    border: 1px solid #ccc;
                    padding: 8px;
                    text-align: left;
                }
            </style>
            <table class="table">
                <tr><th>ID</th><th>Name</th><th>Sales</th></tr>
                <tr><td>1</td><td>Item 1</td><td>50</td></tr>
                <tr><td>2</td><td>Item 2</td><td>70</td></tr>
                <tr><td>3</td><td>Item 3</td><td>30</td></tr>
            </table>
        `;
    }
}
