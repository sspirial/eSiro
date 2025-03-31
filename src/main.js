import {
  EsiroCard,
  EsiroStore,
  EsiroProduct,
  EsiroHeader,
  EsiroNav,
  EsiroMain,
  EsiroTable,
  EsiroCart,
} from "./components/index.js";

import { mockStores, mockProducts, mockUsers } from "./mock-data.js";
import { RouterService } from "./services/router.js";

export default class EsiroNetwork extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTheme = 'light';
  }

  connectedCallback() {
    this.setInitialTheme();
    this.render();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Bottom nav listener
    this.shadowRoot.querySelector('.bottom-nav').addEventListener('click', (e) => {
      if (e.target.matches('button')) {
        this.showSection(e.target.dataset.section);
      }
    });

    // Get header element
    const header = this.shadowRoot.querySelector('esiro-header');
    if (header) {
      // Listen for header navigation events
      header.addEventListener('navigation', (e) => {
        const { destination } = e.detail;
        switch (destination) {
          case 'home':
            this.showSection('stores');
            break;
          case 'cart':
            this.showSection('cart');
            break;
          case 'theme':
            this.toggleTheme();
            break;
          case 'account':
            console.log('Account section - to be implemented');
            break;
        }
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    
    const root = document.documentElement;
    root.setAttribute('data-theme', this.currentTheme);

    const themeStyles = {
      light: {
        '--background': '#F4F4F4',
        '--background-secondary': '#ffffff',
        '--text-primary': 'var(--eerie-black)',
        '--text-secondary': 'var(--black)',
        '--border-color': '#dddddd',
        '--card-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)'
      },
      dark: {
        '--background': '#181818',
        '--background-secondary': '#262626',
        '--text-primary': '#f4f4f4',
        '--text-secondary': '#a5a5a5',
        '--border-color': '#444444',
        '--card-shadow': '0 2px 8px rgba(0, 0, 0, 0.4)'
      }
    };

    // Apply theme styles to document root
    Object.entries(themeStyles[this.currentTheme]).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Force header re-render
    const header = this.shadowRoot.querySelector('esiro-header');
    if (header) {
      header.render();
    }

    // Save theme preference
    localStorage.setItem('theme', this.currentTheme);
  }

  setInitialTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.currentTheme = prefersDark ? 'dark' : 'light';
    this.toggleTheme();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
        :root {
          /* Color Palette */
          --dark-moss: hsla(86, 24%, 28%, 1);
          --eerie-black: hsla(84, 12%, 8%, 1);
          --chamoisee: hsla(37, 39%, 43%, 1);
          --black: hsla(0, 0%, 0%, 1);
          --auburn: hsla(4, 66%, 36%, 1);

        /* Theme Variables - Light Mode */
        --background: #F4F4F4;
        --primary-accent: var(--chamoisee);
        --secondary-accent: var(--auburn);
        --success: var(--dark-moss);
        --text-primary: var(--eerie-black);
        --text-secondary: var(--black);
        --border-radius: 12px;
        --transition-speed: 0.3s;
      }

      body {
        background-color: var(--background);
        color: var(--text-primary);
        font-family: Arial, sans-serif;
        margin: 0;
        display: flex;
        flex-direction: column;
        height: 100vh;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
      }

      nav {
        display: flex;
        flex-direction: column;
        width: 200px;
        border-right: 1px solid #ccc;
        padding: 10px;
      }

      main {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        position: relative;
      }

      .hidden {
        display: none;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
      }

      .card {
        background-color: var(--background);
        border: 1px solid #ccc;
        padding: 10px;
        border-radius: var(--border-radius);
        cursor: pointer;
        border-color: var(--text-secondary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: transform var(--transition-speed), box-shadow var(--transition-speed);
      }

      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .expanded {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: white;
        z-index: 100;
        padding: 20px;
        overflow-y: auto;
        border: 1px solid #ccc;
        border-radius: var(--border-radius);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        border: 1px solid #ccc;
        padding: 8px;
        text-align: left;
      }

      .bottom-nav {
        display: none;
      }

      @media (max-width: 768px) {
        nav {
          display: none;
        }

        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          height: 100vh;
        }

        header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background-color: var(--background);
          z-index: 1000;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .main-container {
          display: grid;
          grid-template-columns: 15% 1fr;
          height: calc(100vh - 60px);
          margin-top: 60px;
          position: relative;
        }
        
        @media (max-width: 768px) {
          .main-container {
            grid-template-columns: 1fr;
            height: calc(100vh - 120px); /* Account for header and bottom nav */
          }
        }

        .hidden {
          display: none;
        }
    </style>
    <esiro-header></esiro-header>
    <div style="display: flex; flex: 1; overflow: hidden">
      <esiro-nav></esiro-nav>
      <esiro-main></esiro-main>
    </div>
    <div class="bottom-nav">
      <button data-section="stores">Stores</button>
      <button data-section="products">Products</button>
      <button data-section="data">Data</button>
      <button data-section="cart">Cart</button>
    </div>`;
  }

  showSection(section) {
    RouterService.navigateToSection(section);
    const esiroMain = this.shadowRoot.querySelector('esiro-main');
    if (!esiroMain) {
      console.error('esiro-main element not found in shadow DOM');
      return;
    }
    this.showMockData(section);
  }

  showMockData(section) {
    const esiroMain = this.shadowRoot.querySelector('esiro-main');
    if (!esiroMain?.shadowRoot) {
      console.error('Invalid esiro-main element or shadow DOM');
      return;
    }
    
    // First ensure the section is visible
    const sections = esiroMain.shadowRoot.querySelectorAll('section');
    sections.forEach(s => s.classList.add('hidden'));
    const targetSection = esiroMain.shadowRoot.querySelector(`#${section}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    this.populateMockData(section, esiroMain.shadowRoot);
  }

  populateMockData(section, shadowRoot) {
    let data;
    try {
      switch (section) {
        case "stores":
          data = mockStores;
          const storesSection = shadowRoot.querySelector('#stores .grid');
          if (storesSection) {
            storesSection.innerHTML = data.map(store => 
              `<esiro-store name="${store.name}"></esiro-store>`
            ).join('');
            console.log(`Populated ${data.length} stores`);
          } else {
            console.error('Stores section not found');
          }
          break;

        case "products":
          data = mockProducts;
          const productsSection = shadowRoot.querySelector('#products .grid');
          if (productsSection) {
            productsSection.innerHTML = data.map(product => `
              <esiro-product 
                name="${product.name}"
                price="${product.price}"
                store-id="${product.storeId}"
                product-id="${product.id}"
              ></esiro-product>
            `).join('');
            console.log(`Populated ${data.length} products`);
          } else {
            console.error('Products section not found');
          }
          break;

        case "data":
          data = mockUsers;
          // Handle data section if needed
          break;

        case "cart":
          data = mockProducts; // Assuming cart contains products
          // Handle cart section if needed
          break;

        default:
          data = [];
          console.warn(`Unknown section: ${section}`);
      }
      
      console.log(`Showing data for ${section}:`, data);
    } catch (error) {
      console.error('Error populating data:', error);
    }
  }
}

customElements.define("esiro-network", EsiroNetwork);
customElements.define("esiro-header", EsiroHeader);
customElements.define("esiro-nav", EsiroNav);
customElements.define("esiro-main", EsiroMain);
customElements.define("esiro-store", EsiroStore);
customElements.define("esiro-product", EsiroProduct);
customElements.define("esiro-card", EsiroCard);
customElements.define("esiro-table", EsiroTable);
customElements.define("esiro-cart", EsiroCart);
