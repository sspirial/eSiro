export default class EsiroStore extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    connectedCallback() {
        this.renderDefault();
    }

    renderDefault() {
        const name = this.getAttribute('name') || 'Local Store';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/150';
        
        this.innerHTML = `
        <div class="store-card">
            <div class="store-image">
                <img src="${image}" alt="${name}">
            </div>
            <div class="store-info">
                <h3>${name}</h3>
                <button class="visit-store">Visit Store</button>
            </div>
        </div>
        <style>
            :host {
                display: block;
                margin-bottom: 20px;
            }
            
            .store-card {
                display: flex;
                flex-direction: column;
                background-color: var(--background);
                border: 1px solid #ccc;
                border-radius: var(--border-radius);
                overflow: hidden;
                transition: transform var(--transition-speed), box-shadow var(--transition-speed);
                height: 100%;
            }
            
            .store-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
            }
            
            .store-image {
                width: 100%;
                aspect-ratio: 1 / 1;
                overflow: hidden;
            }
            
            .store-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }
            
            .store-card:hover .store-image img {
                transform: scale(1.05);
            }
            
            .store-info {
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                flex-grow: 1;
            }
            
            .store-info h3 {
                margin: 0;
                font-size: 16px;
            }
            
            .visit-store {
                padding: 8px 12px;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
                margin-top: auto;
                background-color: var(--primary-accent);
                color: white;
            }
        </style>`;
        
        this.querySelector(".visit-store").addEventListener("click", (e) => {
            e.stopPropagation();
            this.expandStore();
        });
    }

    renderExpanded() {
        const name = this.getAttribute('name') || 'Local Store';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300';
        
        this.innerHTML = `
        <div class="store-expanded">
            <button class="close-button">×</button>
            <div class="store-expanded-content">
                <div class="store-expanded-image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="store-expanded-info">
                    <h2>${name}</h2>
                    <div class="store-description">
                        <p>This is a detailed description for ${name}. Here you would find all the details about the store, its location, opening hours, and other important information.</p>
                    </div>
                    <div class="store-actions">
                        <button class="browse-products">Browse Products</button>
                        <button class="contact-store">Contact</button>
                    </div>
                </div>
            </div>
        </div>
        <style>
            .store-expanded {
                position: fixed;
                top: 60px; /* Account for header */
                left: 0;
                right: 0;
                bottom: 0;
                height: calc(100vh - 60px);
                background: var(--background);
                padding: 20px;
                overflow-y: auto;
                z-index: 1000;
                box-sizing: border-box;
            }
            
            @media (max-width: 768px) {
                .store-expanded {
                    bottom: 60px; /* Account for bottom nav */
                    height: calc(100vh - 120px);
                }
            }
            
            .close-button {
                position: sticky;
                top: 0;
                right: 0;
                float: right;
                font-size: 24px;
                background: var(--background);
                border: none;
                cursor: pointer;
                z-index: 1001;
                padding: 5px 10px;
                margin-bottom: 10px;
            }
            
            .store-expanded-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            @media (max-width: 768px) {
                .store-expanded-content {
                    grid-template-columns: 1fr;
                }
                
                .store-expanded {
                    padding: 15px;
                    padding-bottom: 80px; /* Space for bottom nav and actions */
                }
                
                .store-actions {
                    position: sticky;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    padding: 10px;
                    background: var(--background);
                    border-top: 1px solid #ccc;
                    z-index: 101;
                    margin: 0 -15px;
                    margin-top: 20px;
                }
                
                .browse-products, .contact-store {
                    flex: 1;
                }
            }
            
            .store-expanded-image {
                width: 100%;
            }
            
            .store-expanded-image img {
                width: 100%;
                border-radius: var(--border-radius);
            }
            
            .store-expanded-info {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .store-expanded-info h2 {
                margin: 0;
                font-size: 24px;
            }
            
            .store-description {
                line-height: 1.5;
            }
            
            .store-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .browse-products, .contact-store {
                padding: 10px 15px;
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
            }
            
            .browse-products {
                background-color: var(--primary-accent);
                color: white;
            }
            
            .contact-store {
                background-color: var(--background);
                border: 1px solid var(--primary-accent);
            }
        </style>`;
        
        // Add event listeners
        this.querySelector(".close-button").addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseStore();
        });
        
        this.querySelector(".browse-products").addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelector('esiro-network').showSection('products');
        });
        
        this.querySelector(".contact-store").addEventListener("click", (e) => {
            e.stopPropagation();
            alert(`Contact form for ${name} would open here.`);
        });
        
        // Hide other expanded cards to ensure only one is shown
        document.querySelectorAll('esiro-product.expanded, esiro-store.expanded').forEach(card => {
            if (card !== this) {
                if (card.tagName === 'ESIRO-PRODUCT') {
                    card.collapseProduct();
                } else if (card.tagName === 'ESIRO-STORE') {
                    card.collapseStore();
                }
            }
        });
    }

    handleClick(event) {
        if (event.target.tagName === 'BUTTON') {
            event.stopPropagation();
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