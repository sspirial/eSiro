import { db, initializeDatabase } from './db.js';
import { EsiroCard, EsiroStore, EsiroProduct, EsiroHeader, EsiroNav, EsiroMain, EsiroTable, EsiroCart } from "./components/index.js";

export default class EsiroNetwork extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    try {
      await initializeDatabase(); // Initialize database first
      this.render();
      
      // Set initial active section
      setTimeout(() => {
        this.showSection('products');
      }, 100);
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  render() {
    this.innerHTML = `
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

        [data-theme="dark"] {
          --background: var(--eerie-black);
          --primary-accent: var(--chamoisee);
          --secondary-accent: var(--auburn);
          --success: var(--dark-moss);
          --text-primary: #F4F4F4;
          --text-secondary: #A5A5A5;
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
          height: calc(100vh - 60px); /* Full height minus header */
          margin-top: 60px;
          position: relative;
        }
        
        esiro-nav {
          height: 100%;
          background-color: var(--background);
          box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
          transition: background-color var(--transition-speed);
          z-index: 900;
        }

        esiro-nav nav {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        esiro-nav nav button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          esiro-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60px;
            display: flex;
            background-color: var(--background);
            box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.15);
            z-index: 900;
            padding: 0;
          }

          esiro-nav nav {
            flex-direction: row;
            justify-content: space-evenly; /* Ensure even spacing */
            align-items: center;
            width: 100%;
            padding: 0;
            box-sizing: border-box;
          }

          esiro-nav nav button {
            flex: 1; /* Ensure all buttons take equal space */
            text-align: center;
          }

          .main-container {
            grid-template-columns: 1fr;
            height: calc(100vh - 120px); /* Account for header and bottom nav */
            margin-bottom: 60px; /* Space for bottom nav */
          }
        }

        .hidden {
          display: none;
        }
    </style>

    <header>
        <esiro-header></esiro-header>
    </header>
    <div class="main-container">
        <esiro-nav></esiro-nav>
        <esiro-main></esiro-main>
    </div>
    `;
  }

  showSection(section) {
    // Get all sections in the main element
    const sections = document.querySelectorAll("main section");
    
    // Hide all sections first
    sections.forEach((sec) => sec.classList.add("hidden"));
    
    // Show the requested section
    const sectionToShow = document.getElementById(section);
    if (sectionToShow) {
      sectionToShow.classList.remove("hidden");
      
      // Update the active state in navigation
      const nav = document.querySelector('esiro-nav');
      if (nav) {
        const buttons = nav.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active'));
        const activeButton = nav.querySelector(`button[data-section="${section}"]`);
        if (activeButton) {
          activeButton.classList.add('active');
        }
      }
    }
  }
}

customElements.define("esiro-network", EsiroNetwork);
customElements.define("esiro-store", EsiroStore);
customElements.define("esiro-product", EsiroProduct);
customElements.define("esiro-header", EsiroHeader);
customElements.define("esiro-nav", EsiroNav);
customElements.define("esiro-main", EsiroMain);
customElements.define("esiro-card", EsiroCard);
customElements.define("esiro-table", EsiroTable);
customElements.define("esiro-cart", EsiroCart);
