import { AuthService } from '../services/auth.js';
import { ThemeService } from '../services/theme.js';

export default class EsiroHeader extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupNavigation();
    }

    render() {
        this.innerHTML = `<header>
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
            }
            .search-icon {
                position: absolute;
                left: 12px;
                font-size: 16px;
                pointer-events: none;
            }
            input {
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
        this.querySelector('#logo').addEventListener('click', (e) => {
            e.preventDefault();
            if (AuthService.isLoggedIn()) {
                window.location.href = '/personal-home';
            } else {
                window.location.href = '/';
            }
        });

        this.querySelector('#account').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/account';
        });

        this.querySelector('#theme-toggle').addEventListener('click', () => {
            ThemeService.toggleTheme();
        });
    }
}