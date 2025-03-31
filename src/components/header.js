import { AuthService } from '../services/auth.js';
import { ThemeService } from '../services/theme.js';
import { RouterService } from '../services/router.js';

export default class EsiroHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['theme', 'user'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        // Initialize theme when component is connected
        ThemeService.init();
        this.render();
        this.setupEventListeners();
    }

    disconnectedCallback() {
        this.removeEventListeners();
    }

    render() {
        const isLoggedIn = AuthService.isLoggedIn();
        const user = AuthService.getUser();
        const cartItemCount = this.getCartItemCount();

        this.shadowRoot.innerHTML = `
        <header>
            <a href="#" id="logo">
                <img src="./eSiro-app-logo.png" alt="eSiro logo" class="logo-img">
            </a>
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search for stores or products..." id="search-input">
            </div>
            <div class="header-actions">
                <button id="theme-toggle" title="Toggle theme">
                    ${document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'}
                </button>
                <a href="#" id="cart-link" title="View cart">
                    🛒 ${cartItemCount > 0 ? `<span class="badge">${cartItemCount}</span>` : ''}
                </a>
                <a href="#" id="account" title="${isLoggedIn ? 'My Account' : 'Sign In'}">
                    ${isLoggedIn ? `<span class="user-avatar">${user.name.charAt(0)}</span>` : '👤'}
                </a>
            </div>
        </header>
        <style>
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                background: var(--background);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .logo-img {
                height: 32px;
                transition: transform var(--transition-speed);
            }
            .logo-img:hover {
                transform: scale(1.05);
            }
            .search-container {
                position: relative;
                display: flex;
                align-items: center;
                flex: 1;
                margin: 0 16px;
                max-width: 600px;
            }
            .search-icon {
                position: absolute;
                left: 12px;
                color: var(--text-secondary);
                font-size: 16px;
                pointer-events: none;
            }
            input {
                width: 100%;
                padding: 10px 10px 10px 40px;
                border: 1px solid var(--text-secondary);
                border-radius: var(--border-radius);
                background: var(--background);
                color: var(--text-primary);
            }
            input:focus {
                outline: none;
                border-color: var(--primary-accent);
                box-shadow: 0 0 0 2px rgba(var(--primary-accent-rgb), 0.2);
            }
            .header-actions {
                display: flex;
                gap: 16px;
                align-items: center;
            }
            #theme-toggle, #account, #cart-link {
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                transition: transform var(--transition-speed);
                color: var(--text-primary);
                position: relative;
                text-decoration: none;
            }
            #theme-toggle:hover, #account:hover, #cart-link:hover {
                transform: scale(1.1);
            }
            .badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--secondary-accent);
                color: white;
                border-radius: 50%;
                font-size: 12px;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .user-avatar {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background-color: var(--primary-accent);
                color: white;
                border-radius: 50%;
                font-weight: bold;
                font-size: 16px;
            }
            @media (max-width: 768px) {
                .search-container {
                    display: none;
                }
            }
        </style>`;
    }

    setupEventListeners() {
        const logo = this.shadowRoot.querySelector('#logo');
        const account = this.shadowRoot.querySelector('#account');
        const themeToggle = this.shadowRoot.querySelector('#theme-toggle');
        const cartLink = this.shadowRoot.querySelector('#cart-link');
        const searchInput = this.shadowRoot.querySelector('#search-input');

        this.handleLogoClick = (e) => {
            e.preventDefault();
            if (AuthService.isLoggedIn()) {
                RouterService.navigate('/personal-home');
            } else {
                RouterService.navigate('/');
            }
        };

        this.handleAccountClick = (e) => {
            e.preventDefault();
            RouterService.navigate('/account');
        };

        this.handleThemeToggle = () => {
            ThemeService.toggleTheme();
            this.render(); // Re-render to update theme icon
        };

        this.handleCartClick = (e) => {
            e.preventDefault();
            document.querySelector('esiro-network').showSection('cart');
        };

        this.handleSearch = (e) => {
            if (e.key === 'Enter') {
                const searchQuery = e.target.value.trim();
                if (searchQuery) {
                    alert(`Searching for: ${searchQuery}`);
                    // Implement search functionality here
                }
            }
        };

        logo.addEventListener('click', this.handleLogoClick);
        account.addEventListener('click', this.handleAccountClick);
        themeToggle.addEventListener('click', this.handleThemeToggle);
        cartLink.addEventListener('click', this.handleCartClick);
        searchInput.addEventListener('keypress', this.handleSearch);
    }

    removeEventListeners() {
        const logo = this.shadowRoot.querySelector('#logo');
        const account = this.shadowRoot.querySelector('#account');
        const themeToggle = this.shadowRoot.querySelector('#theme-toggle');
        const cartLink = this.shadowRoot.querySelector('#cart-link');
        const searchInput = this.shadowRoot.querySelector('#search-input');

        if (logo) logo.removeEventListener('click', this.handleLogoClick);
        if (account) account.removeEventListener('click', this.handleAccountClick);
        if (themeToggle) themeToggle.removeEventListener('click', this.handleThemeToggle);
        if (cartLink) cartLink.removeEventListener('click', this.handleCartClick);
        if (searchInput) searchInput.removeEventListener('keypress', this.handleSearch);
    }

    getCartItemCount() {
        try {
            const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
            return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        } catch (e) {
            console.error('Error parsing cart data:', e);
            return 0;
        }
    }
}
