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
            <button data-section="stores" aria-label="Stores section">
                <span class="nav-icon fas fa-store"></span>
                <span class="nav-text">Stores</span>
            </button>
            <button data-section="products" aria-label="Products section">
                <span class="nav-icon fas fa-box"></span>
                <span class="nav-text">Products</span>
            </button>
            <button data-section="data" aria-label="Data section">
                <span class="nav-icon fas fa-chart-line"></span>
                <span class="nav-text">Data</span>
            </button>
            <button data-section="cart" aria-label="Shopping cart">
                <span class="nav-icon fas fa-shopping-cart"></span>
                <span class="nav-text">Cart</span>
                <span class="cart-badge" aria-hidden="true"></span>
            </button>
        </nav>
        <style>
            :host {
                display: block;
                position: fixed;
                z-index: 1000;
                background-color: var(--header-background); /* Use shared variable for header and nav */
                box-sizing: border-box;
                align-items: flex-start; /* Align buttons compactly at the top */
            }

            nav {
                display: flex;
                flex-direction: column;
                align-items: flex-start; /* Align buttons compactly at the top */
                padding: 10px; /* Add padding for better spacing */
            }

            /* Large screens: Side rail */
            @media (min-width: 769px) {
                :host {
                    top: 0;
                    left: 0;
                    bottom: 0;
                    width: 15%; /* Fixed width for side rail */
                    height: 100%;
                    border-right: 1px solid #ccc;
                }

                nav {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    justify-content: flex-start;
                    padding: 15px 0;
                }

                nav button {
                    height: 40px; /* Set a fixed height for buttons */
                    padding: 8px 12px; /* Adjust padding for better spacing */
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                nav button .nav-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0; /* Prevent icon from shrinking */
                    width: 24px; /* Ensure consistent width */
                    height: 24px; /* Ensure consistent height */
                }

                nav button .nav-text {
                    font-size: 1rem;
                    white-space: nowrap; /* Prevent text wrapping */
                }
            }

            /* Small screens: Bottom navigation bar */
            @media (max-width: 768px) {
                :host {
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 60px; /* Fixed height for bottom bar */
                    border-top: 1px solid #ccc;
                }

                nav {
                    display: flex;
                    flex-direction: row;
                    justify-content: space-around;
                    height: 100%;
                }

                nav button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    gap: 4px;
                    text-align: center;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                nav button {
                    height: 40px; /* Maintain compact height */
                    padding: 8px 12px; /* Adjust padding for better spacing */
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 8px;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: background-color 0.3s ease, color 0.3s ease;
                }

                nav button:hover,
                nav button.active {
                    color: var(--primary-accent);
                }

                .nav-icon {
                    font-size: 1.5rem;
                    width: 24px; /* Ensure consistent width */
                    height: 24px; /* Ensure consistent height */
                }

                .nav-text {
                    font-size: 0.8rem;
                }
            }

            // Adjust button alignment to line up on the left
            nav button {
                justify-content: flex-start; /* Align buttons to the left */
                text-align: left; /* Ensure text aligns to the left */
                padding-left: 16px; /* Add padding for better spacing */
            }

            // Ensure buttons are properly aligned to the left
            nav button {
                display: flex;
                align-items: center;
                justify-content: flex-start; /* Align content to the left */
                text-align: left; /* Align text to the left */
                padding-left: 16px; /* Add padding for spacing */
                width: 100%; /* Ensure buttons take full width */
                box-sizing: border-box; /* Include padding in width calculation */
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