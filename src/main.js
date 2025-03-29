import { liveQuery } from "dexie";
import { db } from "./db";

globalThis.observables = {
  names: liveQuery(() => db.names.toArray()),
};

// Subscribe
const subscription = observables.names.subscribe({
  next: (result) => console.log("Got result:", JSON.stringify(result)),
  error: (error) => console.error(error),
});

db.names.add({
  id: 1, name: 'malgljoisdj'
})

// Unsubscribe
subscription.unsubscribe();
