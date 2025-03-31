export default class EsiroCart extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['name', 'address'];
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
                form {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                input, button {
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    background-color: #4299e1;
                    color: white;
                    cursor: pointer;
                }
            </style>
            <form>
                <input type="text" placeholder="Name" required>
                <input type="text" placeholder="Address" required>
                <button type="submit">Checkout</button>
            </form>
        `;
    }
}
