export default class EsiroNav extends HTMLElement {
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
        this.setupEventListeners();
    }

    disconnectedCallback() {
        // Clean up any event listeners if added in the future
    }

    render() {
        this.shadowRoot.innerHTML = `
        <nav>
            <button data-section="stores">
                🏪 Stores
            </button>
            <button data-section="products">
                📦 Products
            </button>
            <button data-section="data">
                📊 Data
            </button>
            <button data-section="cart">
                🛒 Cart
            </button>
        </nav>
        <style>
            nav {
                display: flex;
                flex-direction: column;
                width: 200px;
                border-right: 1px solid #ccc;
                padding: 10px;
            }
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
                cursor: pointer;
            }
            
            nav button:hover,
            nav button.active {
                background: var(--primary-accent);
                color: white;
                transform: translateX(4px);
            }

            @media (max-width: 768px) {
                nav button {
                    margin-bottom: 0;
                    justify-content: center;
                    transform: none !important;
                }

                nav button:hover,
                nav button.active {
                    transform: none !important;
                    border-top: 3px solid var(--primary-accent);
                    padding-top: 9px;
                }
            }
            @media (max-width: 768px) {
                nav {
                    display: none;
                }
            }
        </style>`;
    }
}
