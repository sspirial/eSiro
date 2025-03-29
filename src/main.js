import { liveQuery } from "dexie";
import { db } from "./db";

globalThis.observables = {
  names: liveQuery(() => db.names.toArray()),
};
globalThis.db = db

console.log(globalThis)

class EsiroNetwork extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        ul { list-style: none; padding: 0; }
      </style>
      <h1>Names:</h1><ul id="names-list"></ul>`;
  }
  
  connectedCallback() {
    this.subscription = observables.names.subscribe({
      next: (result) => this.renderNames(result),
      error: (error) => console.error(error),
    });
  }
  
  disconnectedCallback() {
    this.subscription.unsubscribe();
  }
  
  renderNames(names) {
    const namesList = this.shadowRoot.getElementById('names-list');
    if (namesList) {
      namesList.innerHTML = names.map(name => `<li>${name.name}</li>`).join('');
    }
  }
}

customElements.define('esiro-network', EsiroNetwork)
