import { AuthService } from '../services/auth.js';
import { mockUsers, mockStores, mockProducts } from '../mock-data.js';
import { RouterService } from '../services/router.js';

export class PersonalHomePage extends HTMLElement {
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
        if (!user) {
            RouterService.navigate('/account');
            return;
        }

        this.render(user);
    }

    disconnectedCallback() {
        // Clean up any event listeners if added in the future
    }

    render(user) {
        const recentOrders = this.getRecentOrders(user);
        const favoriteStores = this.getFavoriteStores(user);

        this.shadowRoot.innerHTML = `
            <div class="personal-home">
                <h1>Welcome back, ${user.name}</h1>
                <div class="dashboard">
                    <div class="quick-actions">
                    </div>
                    <div class="recent-orders">
                        <h2>Recent Orders</h2>
                        <div class="order-list">
                            ${recentOrders.length > 0 ? recentOrders.map(order => `<p>${order.name} - $${order.price}</p>`).join('') : '<p>No recent orders</p>'}
                        </div>
                    </div>
                    <div class="favorites">
                        <h2>Favorite Stores</h2>
                        <div class="store-list">
                            ${favoriteStores.length > 0 ? favoriteStores.map(store => `<p>${store.name} - ${store.location}</p>`).join('') : '<p>No favorite stores yet</p>'}
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

    getRecentOrders(user) {
        return mockProducts.filter(product => user.recentOrders.includes(product.id));
    }

    getFavoriteStores(user) {
        return mockStores.filter(store => user.favoriteStores.includes(store.id));
    }
}

customElements.define('esiro-personal-home', PersonalHomePage);
