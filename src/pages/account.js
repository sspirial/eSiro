import { AuthService } from '../services/auth.js';
import { RouterService } from '../services/router.js';

export class AccountPage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['user'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        const user = AuthService.getUser();
        this.render(user);
        this.setupEventListeners();
    }

    disconnectedCallback() {
        const loginForm = this.shadowRoot.querySelector('#loginForm');
        const logoutBtn = this.shadowRoot.querySelector('#logout');

        if (loginForm) {
            loginForm.removeEventListener('submit', this.handleLogin);
        }

        if (logoutBtn) {
            logoutBtn.removeEventListener('click', this.handleLogout);
        }
    }

    render(user) {
        this.shadowRoot.innerHTML = `
            <div class="account-page">
                <h1>My Account</h1>
                ${user ? this.renderUserAccount(user) : this.renderLogin()}
                <style>
                    .account-page {
                        padding: 20px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    form {
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    input {
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    button {
                        padding: 10px;
                        background: #4299e1;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    .account-details {
                        padding: 20px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                    }
                </style>
            </div>`;
    }

    renderUserAccount(user) {
        return `
            <div class="account-details">
                <h2>Account Details</h2>
                <p>Name: ${user.name}</p>
                <p>Email: ${user.email}</p>
                ${AuthService.isVendor() ? this.renderVendorContent() : this.renderBuyerContent()}
                <button id="logout">Logout</button>
            </div>`;
    }

    renderVendorContent() {
        return `
            <div class="vendor-content">
                <h3>Vendor Dashboard</h3>
                <p>Manage your store and products here.</p>
                <!-- Add more vendor-specific content here -->
            </div>`;
    }

    renderBuyerContent() {
        return `
            <div class="buyer-content">
                <h3>Buyer Dashboard</h3>
                <p>View your orders and favorite stores here.</p>
                <!-- Add more buyer-specific content here -->
            </div>`;
    }

    renderLogin() {
        return `
            <div class="login-form">
                <form id="loginForm">
                    <input type="email" placeholder="Email" required>
                    <input type="password" placeholder="Password" required>
                    <button type="submit">Login</button>
                </form>
            </div>`;
    }

    setupEventListeners() {
        const loginForm = this.shadowRoot.querySelector('#loginForm');
        const logoutBtn = this.shadowRoot.querySelector('#logout');

        if (loginForm) {
            this.handleLogin = (e) => {
                e.preventDefault();
                // Implement login logic here
                RouterService.navigate('/personal-home');
            };
            loginForm.addEventListener('submit', this.handleLogin);
        }

        if (logoutBtn) {
            this.handleLogout = () => {
                localStorage.removeItem('user');
                RouterService.navigate('/');
            };
            logoutBtn.addEventListener('click', this.handleLogout);
        }
    }
}

customElements.define('esiro-account', AccountPage);
