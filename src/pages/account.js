import { AuthService } from '../services/auth.js';

export class AccountPage extends HTMLElement {
    connectedCallback() {
        const user = AuthService.getUser();
        this.innerHTML = `
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
        
        this.setupEventListeners();
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
        const loginForm = this.querySelector('#loginForm');
        const logoutBtn = this.querySelector('#logout');

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
