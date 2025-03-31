export class HomePage extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        // Clean up any event listeners if added in the future
    }

    render() {
        this.shadowRoot.innerHTML = `
            <div class="public-home">
                <h1>Welcome to eSiro</h1>
                <div class="featured-content">
                    <div class="hero">
                        <h2>Your One-Stop Shop</h2>
                        <p>Discover amazing products from stores around you</p>
                        <button onclick="location.href='/account'">Get Started</button>
                    </div>
                    <div class="features">
                        <div class="feature">
                            <h3>Local Stores</h3>
                            <p>Connect with stores in your area</p>
                        </div>
                        <div class="feature">
                            <h3>Easy Shopping</h3>
                            <p>Order with just a few clicks</p>
                        </div>
                        <div class="feature">
                            <h3>Fast Delivery</h3>
                            <p>Get your items quickly</p>
                        </div>
                    </div>
                </div>
                <style>
                    .public-home {
                        padding: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .hero {
                        text-align: center;
                        padding: 40px 20px;
                        background: #f5f5f5;
                        border-radius: 8px;
                        margin-bottom: 40px;
                    }
                    .features {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                    }
                    .feature {
                        padding: 20px;
                        border: 1px solid #eee;
                        border-radius: 8px;
                    }
                </style>
            </div>`;
    }
}

customElements.define('esiro-home', HomePage);
