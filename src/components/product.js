export default class EsiroProduct extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('click', this.handleClick.bind(this));
    }

    connectedCallback() {
        this.renderDefault();
    }

    renderDefault() {
        const name = this.getAttribute('name') || 'A product';
        const price = this.getAttribute('price') || '$0.00';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/150';
        
        this.innerHTML = `
            <div class="product-card">
                <div class="product-image">
                    <img src="${image}" alt="${name}">
                </div>
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="price">${price}</p>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
            <style>
                .product-card {
                    display: flex;
                    flex-direction: column;
                    background-color: var(--background);
                    border: 1px solid #ccc;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                    transition: transform var(--transition-speed), box-shadow var(--transition-speed);
                    height: 100%;
                }
                
                .product-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
                }
                
                .product-image {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    overflow: hidden;
                }
                
                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                
                .product-card:hover .product-image img {
                    transform: scale(1.05);
                }
                
                .product-info {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    flex-grow: 1;
                }
                
                .product-info h3 {
                    margin: 0;
                    font-size: 16px;
                }
                
                .price {
                    font-size: 18px;
                    font-weight: bold;
                    color: var(--primary-accent);
                    margin: 0;
                }
                
                .add-to-cart {
                    padding: 8px 12px;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    margin-top: auto;
                }
            </style>
        `;
        
        this.querySelector(".add-to-cart").addEventListener("click", (e) => {
            e.stopPropagation();
            alert(`Added ${name} to cart!`);
        });
    }

    renderExpanded() {
        const name = this.getAttribute('name') || 'A product';
        const price = this.getAttribute('price') || '$0.00';
        const image = this.getAttribute('image') || 'https://via.placeholder.com/300';
        
        this.innerHTML = `
            <div class="product-expanded">
                <button class="close-button">×</button>
                <div class="product-expanded-content">
                    <div class="product-expanded-image">
                        <img src="${image}" alt="${name}">
                    </div>
                    <div class="product-expanded-info">
                        <h2>${name}</h2>
                        <p class="price">${price}</p>
                        <div class="product-description">
                            <p>This is a detailed description for ${name}. Here you would find all the specifications, features, and other important details about the product.</p>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart-expanded">Add to Cart</button>
                            <button class="buy-now">Buy Now</button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .product-expanded {
                    position: fixed; /* Changed from absolute to fixed */
                    top: 60px; /* Account for header */
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: calc(100vh - 60px);
                    background: var(--background);
                    padding: 20px;
                    overflow-y: auto;
                    z-index: 1000; /* Increased z-index to ensure it's on top */
                    box-sizing: border-box;
                }
                
                @media (max-width: 768px) {
                    .product-expanded {
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
                
                .product-expanded-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                @media (max-width: 768px) {
                    .product-expanded-content {
                        grid-template-columns: 1fr;
                    }
                    
                    .product-expanded {
                        padding: 15px;
                        padding-bottom: 80px; /* Space for bottom nav and actions */
                    }
                    
                    .product-actions {
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
                    
                    .add-to-cart-expanded, .buy-now {
                        flex: 1;
                    }
                }
                
                .product-expanded-image {
                    width: 100%;
                }
                
                .product-expanded-image img {
                    width: 100%;
                    border-radius: var(--border-radius);
                }
                
                .product-expanded-info {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .product-expanded-info h2 {
                    margin: 0;
                    font-size: 24px;
                }
                
                .product-expanded-info .price {
                    font-size: 22px;
                }
                
                .product-description {
                    line-height: 1.5;
                }
                
                .product-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                
                .add-to-cart-expanded, .buy-now {
                    padding: 10px 15px;
                    border: none;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                }
                
                .buy-now {
                    background-color: var(--secondary-accent);
                }
            </style>
        `;
        
        // Add event listeners
        this.querySelector(".close-button").addEventListener("click", (e) => {
            e.stopPropagation();
            this.collapseProduct();
        });
        
        this.querySelector(".add-to-cart-expanded").addEventListener("click", (e) => {
            e.stopPropagation();
            alert(`Added ${name} to cart!`);
        });
        
        this.querySelector(".buy-now").addEventListener("click", (e) => {
            e.stopPropagation();
            alert(`Proceeding to checkout for ${name}!`);
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
            // Buttons are handled by their own event listeners
            event.stopPropagation();
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
