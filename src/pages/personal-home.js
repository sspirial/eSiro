import { AuthService } from '../services/auth.js';

export class PersonalHomePage extends HTMLElement {
    connectedCallback() {
        const user = AuthService.getUser();
        if (!user) {
            window.location.href = '/account';
            return;
        }

        this.innerHTML = `
            <div class="personal-home">
                <h1>Welcome back, ${user.name}</h1>
                <div class="dashboard">
                    <div class="quick-actions">
                        <button onclick="document.querySelector('esiro-network').showSection('stores')">Browse Stores</button>
                        <button onclick="document.querySelector('esiro-network').showSection('cart')">View Cart</button>
                    </div>
                    <div class="recent-orders">
                        <h2>Recent Orders</h2>
                        <div class="order-list">
                            <!-- Placeholder for orders -->
                            <p>No recent orders</p>
                        </div>
                    </div>
                    <div class="favorites">
                        <h2>Favorite Stores</h2>
                        <div class="store-list">
                            <!-- Placeholder for favorite stores -->
                            <p>No favorite stores yet</p>
                        </div>
                    </div>
                </div>
                <style>
                    .personal-home {
                        padding: 20px;
                    }
                    .dashboard {
                        display: grid;
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .quick-actions {
                        display: flex;
                        gap: 10px;
                    }
                    .recent-orders, .favorites {
                        border: 1px solid #eee;
                        padding: 20px;
                        border-radius: 8px;
                    }
                </style>
            </div>`;
    }
}

customElements.define('esiro-personal-home', PersonalHomePage);
