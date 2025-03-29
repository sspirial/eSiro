import Dexie from "dexie";
import { dexieCloud } from "dexie-cloud-addon";

var db = new Dexie("esiro-network", {addons: [dexieCloud]});

db.version(1).stores({
    names: '@id, name'
})

db.cloud.configure({
    databaseUrl: import.meta.env.VITE_DATABASE_URL,
    requireAuth: true
})

export { db };