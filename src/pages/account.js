import { AuthService } from '../services/auth.js';

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
        // Clean up any event listeners if added in the future
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
                <button id="logout">Logout</button>
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
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Implement login logic here
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('user');
                window.location.reload();
            });
        }
    }
}

customElements.define('esiro-account', AccountPage);
