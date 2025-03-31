import { AuthService } from '../services/auth.js';
import { ThemeService } from '../services/theme.js';
import { RouterService } from '../services/router.js';

export default class EsiroHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['theme'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
        this.setupNavigation();
    }

    disconnectedCallback() {
        this.shadowRoot.querySelector('#logo').removeEventListener('click', this.handleLogoClick);
        this.shadowRoot.querySelector('#account').removeEventListener('click', this.handleAccountClick);
        this.shadowRoot.querySelector('#theme-toggle').removeEventListener('click', this.handleThemeToggle);
    }

    render() {
        this.shadowRoot.innerHTML = `<header>
            <a href="#" id="logo">
                <img src="./eSiro-app-logo.png" alt="eSiro logo" class="logo-img">
            </a>
            <div class="search-container">
                <span class="search-icon">🔍</span>
                <input type="text" placeholder="Search...">
            </div>
            <div class="header-actions">
                <button id="theme-toggle">🌓</button>
                <a href="#" id="account">👤</a>
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
            }
            .search-icon {
                position: absolute;
                left: 12px;
                font-size: 16px;
                pointer-events: none;
            }
            input {
                width: 100%;
                padding: 8px 8px 8px 40px;
                border: 1px solid var(--text-secondary);
                border-radius: var(--border-radius);
            }
            .header-actions {
                display: flex;
                gap: 16px;
                align-items: center;
            }
            #theme-toggle, #account {
                font-size: 24px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                transition: transform var(--transition-speed);
            }
            #theme-toggle:hover, #account:hover {
                transform: scale(1.1);
            }
        </style>`;
    }

    setupNavigation() {
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
        };

        this.shadowRoot.querySelector('#logo').addEventListener('click', this.handleLogoClick);
        this.shadowRoot.querySelector('#account').addEventListener('click', this.handleAccountClick);
        this.shadowRoot.querySelector('#theme-toggle').addEventListener('click', this.handleThemeToggle);
    }
}
