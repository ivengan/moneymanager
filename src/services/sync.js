import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getTransactions } from './db';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let db;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization skipped. Check your .env config.", error);
}

// Background Sync function
export async function syncLocalToCloud() {
  if (!db || !navigator.onLine) {
    console.log('Skipping sync: Offline or Firebase not configured.');
    return;
  }

  try {
    const localTransactions = await getTransactions();
    
    // In a production app, we'd track which transactions are already synced
    // Here we assume we push everything that hasn't been pushed (mocked logic)
    const transactionsRef = collection(db, 'transactions');
    
    for (const tx of localTransactions) {
      // Only push if it has an ID but hasn't been synced (we would normally add a synced: true flag locally)
      if (!tx.syncedToCloud) {
        await addDoc(transactionsRef, { ...tx, syncedToCloud: true });
        // Update local IndexedDB to mark as synced
        // (Omitted the local update call for brevity in this mock)
      }
    }
    console.log('Successfully synced local transactions to Firebase!');
  } catch (err) {
    console.error('Error during background sync:', err);
  }
}

// Listen for online events to trigger background sync
window.addEventListener('online', () => {
  console.log('Internet connection restored. Triggering background sync...');
  syncLocalToCloud();
});
