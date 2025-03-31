import Dexie from "dexie";
import { dexieCloud } from "dexie-cloud-addon";
import { mockStores, mockProducts, mockUsers } from './mock-data.js';

var db = new Dexie("esiro-network", {addons: [dexieCloud]});

db.version(2).stores({
    names: '@id, name',
    realms: '@realmId'
});

const databaseUrl = import.meta.env.VITE_DATABASE_URL;
if (!databaseUrl) {
    throw new Error("VITE_DATABASE_URL is not defined in the environment variables.");
}

db.cloud.configure({
    databaseUrl: databaseUrl,
    requireAuth: true,
    onAuthSuccess: async () => {
        await insertMockData();
    }
});

async function insertMockData() {
    await db.names.bulkPut(mockStores.map(store => ({ id: store.id, name: store.name })));
    await db.names.bulkPut(mockProducts.map(product => ({ id: product.id, name: product.name })));
    await db.names.bulkPut(mockUsers.map(user => ({ id: user.id, name: user.name })));
}

export { db };
