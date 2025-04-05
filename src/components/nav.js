/**
 * Navigation component for application section navigation
 * Supports both desktop sidebar and mobile bottom navigation
 */
export default class EsiroNav extends HTMLElement {
    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    /**
     * Web Component lifecycle - called when component is removed from DOM
     */
    disconnectedCallback() {
        window.removeEventListener('resize', this.handleResize);
    }

    /**
     * Render the navigation component
     */
    render() {
        this.innerHTML = `
        <nav aria-label="Main navigation">
            <div class="nav-buttons">
                <button data-section="stores" aria-label="Stores section">
                    <span class="nav-icon material-icons">storefront</span>
                    <span class="nav-text">Stores</span>
                </button>
                <button data-section="products" aria-label="Products section">
                    <span class="nav-icon material-icons">inventory_2</span>
                    <span class="nav-text">Products</span>
                </button>
                <button data-section="data" aria-label="Data section">
                    <span class="nav-icon material-icons">monitoring</span>
                    <span class="nav-text">Data</span>
                </button>
                <button data-section="cart" aria-label="Shopping cart">
                    <span class="nav-icon material-icons">shopping_cart</span>
                    <span class="nav-text">Cart</span>
                    <span class="cart-badge" aria-hidden="true"></span>
                </button>
            </div>
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
                overflow-y: auto; /* Keep this to allow scrolling if needed */
                z-index: 98;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                padding: 15px 0;
                overflow-x: hidden; /* Prevent horizontal scrolling */
            }
            
            /* Container for nav buttons to prevent unwanted scroll */
            nav .nav-buttons {
                display: flex;
                flex-direction: column;
                width: 100%;
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
                    flex-direction: row;
                    justify-content: space-around;
                    border-right: none;
                    border-top: 1px solid #ccc;
                    overflow: hidden;
                    background-color: var(--background);
                    padding: 0;
                    z-index: 1000; /* Ensure it's above other elements */
                }
                
                nav .nav-buttons {
                    flex-direction: row;
                    width: 100%;
                    height: 100%;
                    justify-content: space-around;
                }
                
                nav button {
                    flex: 1;
                    width: auto;
                    max-width: 25%;
                }
            }
            
            nav button {
                display: flex;
                align-items: center;
                width: 100%;
                padding: 12px 16px;
                margin-bottom: 8px;
                border: none;
                background: transparent;
                color: var(--text-primary);
                transition: all var(--transition-speed);
                cursor: pointer;
                /* Fix icon and text alignment */
                gap: 12px;
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
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    height: 100%;
                    transform: none !important;
                }

                nav button:hover,
                nav button.active {
                    transform: none !important;
                    border-top: 3px solid var(--primary-accent);
                    padding-top: 9px;
                }
            }

            .nav-icon {
                flex-shrink: 0; /* Prevent icon from shrinking */
                display: inline-flex; /* Better icon alignment */
                justify-content: center;
                align-items: center;
                font-size: 1.5rem;
                width: 24px; /* Fixed width for icon */
            }
            
            .nav-text {
                font-size: 0.8rem;
                /* Remove margin-left since we're using gap */
                white-space: nowrap; /* Prevent text wrapping */
            }
            
            .cart-badge {
                position: absolute;
                top: 5px;
                right: 5px;
                background-color: var(--secondary-accent);
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .cart-badge.visible {
                opacity: 1;
            }
            
            @media (max-width: 768px) {
                .cart-badge {
                    top: 2px;
                    right: calc(50% - 18px);
                }
            }
        </style>`;
    }

    /**
     * Set up event listeners for navigation
     * @private
     */
    setupEventListeners() {
        const buttons = this.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', this.handleNavClick.bind(this));
        });

        // Listen for cart updates
        window.addEventListener('cart-updated', this.updateCartBadge.bind(this));
        
        // Set initial cart badge state
        this.updateCartBadge();
        
        // Set initial active state
        this.setInitialActiveSection();
        
        // Listen for network section changes
        document.addEventListener('section-changed', this.handleSectionChange.bind(this));
    }
    
    /**
     * Handle navigation button clicks
     * @param {Event} event - Click event
     * @private
     */
    handleNavClick(event) {
        const button = event.currentTarget;
        const section = button.dataset.section;
        
        // Remove active class from all buttons
        this.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        
        // Navigate to section
        const network = document.querySelector('esiro-network');
        if (network && typeof network.showSection === 'function') {
            network.showSection(section);
        }
    }
    
    /**
     * Handle window resize events
     * @private
     */
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        this.classList.toggle('mobile', isMobile);
        
        const buttons = this.querySelectorAll('button');
        buttons.forEach(button => {
            const iconEl = button.querySelector('.nav-icon');
            const textEl = button.querySelector('.nav-text');
            
            if (isMobile) {
                // Reorganize for mobile
                button.setAttribute('aria-label', textEl.textContent);
                iconEl.setAttribute('aria-hidden', 'true');
            } else {
                // Restore for desktop
                button.removeAttribute('aria-label');
                iconEl.removeAttribute('aria-hidden');
            }
        });
    }
    
    /**
     * Set the initial active section
     * @private
     */
    setInitialActiveSection() {
        const initialSection = document.querySelector('main section:not(.hidden)');
        if (initialSection) {
            const sectionId = initialSection.id;
            const activeButton = this.querySelector(`button[data-section="${sectionId}"]`);
            if (activeButton) {
                activeButton.classList.add('active');
                activeButton.setAttribute('aria-pressed', 'true');
            }
        } else {
            // If no section is visible, default to stores
            const storesButton = this.querySelector('button[data-section="stores"]');
            if (storesButton) {
                storesButton.classList.add('active');
                storesButton.setAttribute('aria-pressed', 'true');
            }
        }
    }
    
    /**
     * Handle section change events
     * @param {CustomEvent} event - Section change event
     * @private
     */
    handleSectionChange(event) {
        if (event.detail && event.detail.section) {
            const section = event.detail.section;
            
            // Update active button
            this.querySelectorAll('button').forEach(btn => {
                const isActive = btn.dataset.section === section;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }
    }
    
    /**
     * Update the cart badge with current item count
     * @private
     */
    async updateCartBadge() {
        try {
            // Get cart items count
            const cartBadge = this.querySelector('.cart-badge');
            if (!cartBadge) return;
            
            const db = await import('../db.js').then(module => module.db);
            await db.open();
            
            // Get current user ID
            const auth = await import('../services/auth.js').then(module => module.AuthService);
            const userId = auth.getUser()?.id || 'current-user';
            
            // Count cart items
            const count = await db.cart.where('userId').equals(userId).count();
            
            if (count > 0) {
                cartBadge.textContent = count > 9 ? '9+' : count;
                cartBadge.classList.add('visible');
            } else {
                cartBadge.classList.remove('visible');
            }
        } catch (error) {
            console.error('Error updating cart badge:', error);
        }
    }
}