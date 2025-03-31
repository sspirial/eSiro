export default class EsiroNav extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <nav>
            <button onclick="document.querySelector('esiro-network').showSection('stores')">
                🏪 Stores
            </button>
            <button onclick="document.querySelector('esiro-network').showSection('products')">
                📦 Products
            </button>
            <button onclick="document.querySelector('esiro-network').showSection('data')">
                📊 Data
            </button>
            <button onclick="document.querySelector('esiro-network').showSection('cart')">
                🛒 Cart
            </button>
        </nav>
        <style>
            nav button {
                display: flex;
                align-items: center;
                gap: 12px;
                width: 100%;
                padding: 12px;
                margin-bottom: 8px;
                border: none;
                background: transparent;
                color: var(--text-primary);
                transition: all var(--transition-speed);
            }
            nav button:hover {
                background: var(--primary-accent);
                transform: translateX(4px);
            }
            .nav-icon {
                width: 20px;
                height: 20px;
            }
        </style>`;
    }
}