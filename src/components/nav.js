export default class EsiroNav extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `
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
            :host {
                display: block;
                height: 100%;
            }
            
            nav {
                position: fixed;
                top: 60px;
                left: 0;
                bottom: 0;
                width: 15%;
                background-color: var(--background);
                border-right: 1px solid #ccc;
                overflow-y: auto;
                z-index: 98;
                box-sizing: border-box;
            }

            @media (max-width: 768px) {
                nav {
                    position: fixed;
                    top: auto;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    width: 100%;
                    height: 60px;
                    display: flex;
                    justify-content: space-around;
                    border-right: none;
                    border-top: 1px solid #ccc;
                    overflow: hidden;
                    background-color: var(--background);
                }
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
        </style>`;
    }

    setupEventListeners() {
        const buttons = this.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = button.dataset.section;
                // Remove active class from all buttons
                buttons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Navigate to section
                document.querySelector('esiro-network').showSection(section);
            });
        });

        // Set initial active state
        const initialSection = document.querySelector('main section:not(.hidden)');
        if (initialSection) {
            const sectionId = initialSection.id;
            const activeButton = this.querySelector(`button[data-section="${sectionId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
            }
        }
    }
}