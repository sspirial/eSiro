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
        this.removeEventListeners();
    }

    render(user) {
        this.shadowRoot.innerHTML = `
            <div class="account-page">
                <h1>${user ? 'My Account' : 'Sign In'}</h1>
                ${user ? this.renderUserAccount(user) : this.renderLoginAndRegister()}
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
                        margin-bottom: 20px;
                    }
                    input {
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: var(--border-radius);
                    }
                    button {
                        padding: 12px;
                        background: var(--primary-accent);
                        color: white;
                        border: none;
                        border-radius: var(--border-radius);
                        cursor: pointer;
                        font-weight: bold;
                        transition: all var(--transition-speed);
                    }
                    button:hover {
                        background: var(--secondary-accent);
                    }
                    .account-details {
                        padding: 20px;
                        border: 1px solid #eee;
                        border-radius: var(--border-radius);
                    }
                    .tabs {
                        display: flex;
                        margin-bottom: 20px;
                    }
                    .tab {
                        padding: 10px 20px;
                        cursor: pointer;
                        border-bottom: 2px solid transparent;
                    }
                    .tab.active {
                        border-bottom: 2px solid var(--primary-accent);
                        font-weight: bold;
                    }
                    .tab-content {
                        display: none;
                    }
                    .tab-content.active {
                        display: block;
                    }
                    .error-message {
                        color: #e53e3e;
                        margin-top: 10px;
                    }
                    .success-message {
                        color: #38a169;
                        margin-top: 10px;
                    }
                </style>
            </div>`;
    }

    renderUserAccount(user) {
        return `
            <div class="account-details">
                <h2>Welcome, ${user.name}</h2>
                <p>Email: ${user.email}</p>
                <p>Role: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                
                <div class="user-stats">
                    <p>Favorite Stores: ${user.favoriteStores.length}</p>
                    <p>Recent Orders: ${user.recentOrders.length}</p>
                </div>
                
                ${AuthService.isVendor() ? this.renderVendorContent() : this.renderBuyerContent()}
                
                <button id="personal-home-btn">Go to Dashboard</button>
                <button id="logout-btn">Logout</button>
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

    renderLoginAndRegister() {
        return `
            <div class="auth-container">
                <div class="tabs">
                    <div class="tab active" data-tab="login">Login</div>
                    <div class="tab" data-tab="register">Register</div>
                </div>
                
                <div class="tab-content active" id="login-tab">
                    <form id="login-form">
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Sign In</button>
                    </form>
                    <div id="login-error" class="error-message"></div>
                </div>
                
                <div class="tab-content" id="register-tab">
                    <form id="register-form">
                        <input type="text" name="name" placeholder="Full Name" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
                        <button type="submit">Create Account</button>
                    </form>
                    <div id="register-error" class="error-message"></div>
                    <div id="register-success" class="success-message"></div>
                </div>
            </div>`;
    }

    setupEventListeners() {
        // If user is logged in
        const logoutBtn = this.shadowRoot.querySelector('#logout-btn');
        const personalHomeBtn = this.shadowRoot.querySelector('#personal-home-btn');
        
        if (logoutBtn) {
            this.handleLogout = () => {
                AuthService.logout();
                RouterService.navigate('/');
                this.render(null);
                this.setupEventListeners();
            };
            logoutBtn.addEventListener('click', this.handleLogout);
        }
        
        if (personalHomeBtn) {
            this.handlePersonalHome = () => {
                RouterService.navigate('/personal-home');
            };
            personalHomeBtn.addEventListener('click', this.handlePersonalHome);
        }
        
        // If user is not logged in
        const tabs = this.shadowRoot.querySelectorAll('.tab');
        const loginForm = this.shadowRoot.querySelector('#login-form');
        const registerForm = this.shadowRoot.querySelector('#register-form');
        
        if (tabs.length) {
            this.handleTabClick = (e) => {
                const tabName = e.target.dataset.tab;
                
                // Update tab active state
                tabs.forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update content visibility
                this.shadowRoot.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                this.shadowRoot.querySelector(`#${tabName}-tab`).classList.add('active');
            };
            
            tabs.forEach(tab => {
                tab.addEventListener('click', this.handleTabClick);
            });
        }
        
        if (loginForm) {
            this.handleLogin = (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const email = formData.get('email');
                const password = formData.get('password');
                
                const result = AuthService.login(email, password);
                
                if (result.success) {
                    RouterService.navigate('/personal-home');
                } else {
                    const errorDiv = this.shadowRoot.querySelector('#login-error');
                    errorDiv.textContent = result.message;
                }
            };
            loginForm.addEventListener('submit', this.handleLogin);
        }
        
        if (registerForm) {
            this.handleRegister = (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                
                const errorDiv = this.shadowRoot.querySelector('#register-error');
                const successDiv = this.shadowRoot.querySelector('#register-success');
                
                errorDiv.textContent = '';
                successDiv.textContent = '';
                
                if (password !== confirmPassword) {
                    errorDiv.textContent = 'Passwords do not match';
                    return;
                }
                
                const result = AuthService.register({ name, email, password });
                
                if (result.success) {
                    successDiv.textContent = 'Account created successfully! Redirecting...';
                    registerForm.reset();
                    
                    setTimeout(() => {
                        RouterService.navigate('/personal-home');
                    }, 1500);
                } else {
                    errorDiv.textContent = result.message;
                }
            };
            registerForm.addEventListener('submit', this.handleRegister);
        }
    }

    removeEventListeners() {
        const logoutBtn = this.shadowRoot.querySelector('#logout-btn');
        const personalHomeBtn = this.shadowRoot.querySelector('#personal-home-btn');
        const tabs = this.shadowRoot.querySelectorAll('.tab');
        const loginForm = this.shadowRoot.querySelector('#login-form');
        const registerForm = this.shadowRoot.querySelector('#register-form');
        
        if (logoutBtn && this.handleLogout) {
            logoutBtn.removeEventListener('click', this.handleLogout);
        }
        
        if (personalHomeBtn && this.handlePersonalHome) {
            personalHomeBtn.removeEventListener('click', this.handlePersonalHome);
        }
        
        if (tabs.length && this.handleTabClick) {
            tabs.forEach(tab => {
                tab.removeEventListener('click', this.handleTabClick);
            });
        }
        
        if (loginForm && this.handleLogin) {
            loginForm.removeEventListener('submit', this.handleLogin);
        }
        
        if (registerForm && this.handleRegister) {
            registerForm.removeEventListener('submit', this.handleRegister);
        }
    }
}

customElements.define('esiro-account', AccountPage);
