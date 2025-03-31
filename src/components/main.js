export default class EsiroMain extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <main>
            <section id="stores" class="hidden">
                <div class="grid">
                    <esiro-store></esiro-store>
                    <esiro-store></esiro-store>
                    <esiro-store></esiro-store>
                </div>
            </section>
            <section id="products" class="hidden">
                <div class="grid">
                    <esiro-product></esiro-product>
                    <esiro-product></esiro-product>
                    <esiro-product></esiro-product>
                </div>
            </section>
            <section id="data" class="hidden">
                <esiro-table></esiro-table>
            </section>
            <section id="cart" class="hidden">
                <esiro-cart></esiro-cart>
            </section>
        </main>`;
    }
}