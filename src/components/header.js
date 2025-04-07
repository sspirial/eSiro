import { AuthService } from '../services/auth.js';
import { ThemeService } from '../services/theme.js';
import { RouterService } from '../services/router.js';

/**
 * Header component for application navigation and global actions
 * Handles theme toggling, search, and user navigation
 */
export default class EsiroHeader extends HTMLElement {
    /**
     * Web Component lifecycle - called when component is added to DOM
     */
    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.updateThemeIcon();
    }

    /**
     * Render the header component UI
     */
    render() {
        this.innerHTML = `
        <div class="header-container">
            <a href="#" id="logo" aria-label="eSiro Home">
                <span class="logo-text">eSiro</span>
            </a>
            <div class="search-container">
                <span class="fas fa-search search-icon" aria-hidden="true"></span>
                <input type="text" id="search-input" placeholder="Search..." aria-label="Search products and stores">
            </div>
            <div class="header-actions">
                <button id="theme-toggle" aria-label="Toggle dark/light theme">
                    <span class="fas fa-moon"></span>
                </button>
                <button id="cart-button" aria-label="Shopping cart">
                    <span class="fas fa-shopping-cart"></span>
                </button>
                <a href="#" id="account" aria-label="Account">
                    <span class="fas fa-user"></span>
                </a>
            </div>
        </div>
        
        <!-- Floating action button for search on mobile -->
        <button class="search-fab" aria-label="Search">
            <span class="fas fa-search"></span>
        </button>
        
        <!-- Modal search for mobile -->
        <div class="search-modal" aria-hidden="true">
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <span class="fas fa-search search-icon" aria-hidden="true"></span>
                    <input type="text" id="modal-search-input" placeholder="Search..." aria-label="Search products and stores">
                    <button class="close-search-modal" aria-label="Close search">
                        <span class="fas fa-times"></span>
                    </button>
                </div>
            </div>
        </div>
        <style>
            :host {
                display: block;
                width: 100%;
            }
            
            .header-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                padding: 0 2%;
                box-sizing: border-box;
                height: 60px; /* Fixed height for better alignment */
                background-color: var(--header-background); /* Use shared variable */
            }
            
            #logo {
                text-decoration: none; /* Remove underline from logo link */
                display: flex;
                align-items: center;
                height: 100%;
            }
            
            .logo-text {
                font-size: 26px;
                font-weight: 600;
                font-family: 'Poppins', 'Segoe UI', sans-serif;
                letter-spacing: -0.5px;
                color: var(--primary-accent);
                transition: transform var(--transition-speed);
            }
            
            #logo:hover .logo-text {
                transform: scale(1.05);
            }
            
            .search-container {
                position: relative;
                display: flex;
                align-items: center;
                margin: 0 20px;
                flex: 1;
                max-width: 500px;
            }
            
            .search-icon {
                position: absolute;
                left: 12px;
                font-size: 20px;
                pointer-events: none;
                z-index: 1; /* Ensure search icon appears above other elements */
            }
            
            .search-container input {
                width: 100%;
                padding: 10px 10px 10px 40px;
                border: 1px solid var(--text-secondary);
                border-radius: var(--border-radius);
                font-size: 15px;
                transition: all 0.2s ease;
            }
            
            .search-container input:focus {
                outline: none;
                border-color: var(--primary-accent);
                box-shadow: 0 0 0 2px rgba(var(--primary-accent-rgb, 0, 123, 255), 0.2);
            }
            
            .header-actions {
                display: flex;
                gap: 16px;
                align-items: center;
            }
            #theme-toggle, #account, #cart-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                transition: transform var(--transition-speed);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .fas {
                font-size: 24px;
            }
            #theme-toggle:hover, #account:hover, #cart-button:hover {
                transform: scale(1.1);
            }
            
            #login-status {
                display: none; /* Hide login status completely */
            }
            
            .login-button, .logout-button {
                display: none; /* Hide login/logout buttons */
            }
            
            /* Hide FAB on large screens */
            .search-fab {
                display: none;
            }
            
            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 1001;
            }
            
            .search-modal-content {
                background-color: var(--background);
                border-radius: var(--border-radius);
                width: 90%;
                max-width: 400px;
                padding: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .search-modal-header {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            #modal-search-input {
                flex: 1;
                padding: 10px;
                padding-left: 40px;
                border: 1px solid var(--text-secondary);
                border-radius: var(--border-radius);
                font-size: 15px;
            }
            
            .close-search-modal {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--text-secondary);
            }
            
            @media (max-width: 768px) {
                .search-container {
                    display: none; /* Hide the main search bar on mobile */
                }
                
                #login-status {
                    display: none; /* Hide login status on mobile */
                }
                
                .search-fab {
                    position: fixed;
                    bottom: 80px; /* Position above the bottom nav */
                    right: 20px;
                    background-color: var(--primary-accent);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    z-index: 99;
                }
            }

            // Ensure header icons are visible in both light and dark themes
            .header-actions .fas {
                color: var(--text-primary); /* Use theme-based text color */
                transition: color 0.3s ease; /* Smooth transition for theme changes */
            }
        </style>`;
    }

    /**
     * Set up event listeners for all interactive elements
     * @private
     */
    setupEventListeners() {
        // Logo navigation
        this.querySelector('#logo')?.addEventListener('click', this.handleLogoClick.bind(this));

        // Theme toggle
        this.querySelector('#theme-toggle')?.addEventListener('click', this.handleThemeToggle.bind(this));

        // Cart navigation
        this.querySelector('#cart-button')?.addEventListener('click', this.handleCartClick.bind(this));

        // Account navigation
        this.querySelector('#account')?.addEventListener('click', this.handleAccountClick.bind(this));
        
        // Search functionality
        const searchInput = this.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', this.handleSearch.bind(this));
        }

        // Floating action button for search
        const searchFab = this.querySelector('.search-fab');
        if (searchFab) {
            searchFab.addEventListener('click', this.openSearchModal.bind(this));
        }

        // Close search modal
        const closeSearchModal = this.querySelector('.close-search-modal');
        if (closeSearchModal) {
            closeSearchModal.addEventListener('click', this.closeSearchModal.bind(this));
        }

        // Modal search input
        const modalSearchInput = this.querySelector('#modal-search-input');
        if (modalSearchInput) {
            modalSearchInput.addEventListener('keydown', this.handleSearch.bind(this));
        }
    }
    
    /**
     * Handle logo click for navigation
     * @param {Event} event - Click event
     * @private
     */
    handleLogoClick(event) {
        event.preventDefault();
        RouterService.navigate('/eSiro/');
    }
    
    /**
     * Handle theme toggle
     * @private
     */
    handleThemeToggle() {
        ThemeService.toggleTheme();
        this.updateThemeIcon();
    }
    
    /**
     * Update theme icon based on current theme
     * @private
     */
    updateThemeIcon() {
        const themeToggle = this.querySelector('#theme-toggle');
        if (themeToggle) {
            const isDarkTheme = ThemeService.getCurrentTheme() === 'dark';
            const iconElement = themeToggle.querySelector('.fas');
            if (iconElement) {
                iconElement.className = isDarkTheme ? 'fas fa-sun' : 'fas fa-moon';
                themeToggle.setAttribute('aria-label', 
                    isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme');
                
                // Update icon color for visibility
                iconElement.style.color = isDarkTheme ? '#FFD700' : '#212529';
            }
        }
    }
    
    /**
     * Handle cart button click
     * @param {Event} event - Click event
     * @private
     */
    handleCartClick(event) {
        event.preventDefault();
        const network = document.querySelector('esiro-network');
        if (network && typeof network.showSection === 'function') {
            network.showSection('cart');
        }
    }
    
    /**
     * Handle account link click
     * @param {Event} event - Click event
     * @private
     */
    handleAccountClick(event) {
        event.preventDefault();
        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.innerHTML = '<esiro-account></esiro-account>';
        }
    }
    
    /**
     * Handle search input
     * @param {KeyboardEvent} event - Keyboard event
     * @private
     */
    handleSearch(event) {
        if (event.key === 'Enter') {
            const searchTerm = event.target.value.trim();
            if (searchTerm) {
                this.performSearch(searchTerm);
            }
        }
    }
    
    /**
     * Perform search with given term
     * @param {string} searchTerm - Search query
     * @private
     */
    async performSearch(searchTerm) {
        try {
            // Dispatch search event that can be handled by other components
            const searchEvent = new CustomEvent('esiro-search', {
                bubbles: true,
                detail: { searchTerm }
            });
            this.dispatchEvent(searchEvent);
            
            // Navigate to products section
            const network = document.querySelector('esiro-network');
            if (network && typeof network.showSection === 'function') {
                network.showSection('products');
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    /**
     * Open search modal
     * @private
     */
    openSearchModal() {
        const searchModal = this.querySelector('.search-modal');
        if (searchModal) {
            searchModal.style.display = 'flex';
            searchModal.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Close search modal
     * @private
     */
    closeSearchModal() {
        const searchModal = this.querySelector('.search-modal');
        if (searchModal) {
            searchModal.style.display = 'none';
            searchModal.setAttribute('aria-hidden', 'true');
        }
    }
}