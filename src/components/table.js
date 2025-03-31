export default class EsiroTable extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `<table class="table">
            <tr><th>ID</th><th>Name</th><th>Sales</th></tr>
            <tr><td>1</td><td>Item 1</td><td>50</td></tr>
            <tr><td>2</td><td>Item 2</td><td>70</td></tr>
            <tr><td>3</td><td>Item 3</td><td>30</td></tr>
        </table>`;
    }
}