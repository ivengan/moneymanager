import { openDB } from 'idb';

const DB_NAME = 'MoneyManagerDB';
const DB_VERSION = 1;

export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
        txStore.createIndex('date', 'date');
        txStore.createIndex('accountId', 'accountId');
      }
    },
  });
}

// SHA-256 Hashing helper
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// User setup & validation
export async function setupUserPin(pin) {
  const db = await initDB();
  const hashedPin = await hashPin(pin);
  await db.put('users', { id: 'default', pinHash: hashedPin });
}

export async function validatePin(pin) {
  const db = await initDB();
  const user = await db.get('users', 'default');
  if (!user) {
    // If no user exists, treat the first entered PIN as the setup PIN
    await setupUserPin(pin);
    return true;
  }
  const hashedPin = await hashPin(pin);
  return user.pinHash === hashedPin;
}

// Transactions
export async function addTransaction(transaction) {
  const db = await initDB();
  return db.add('transactions', {
    ...transaction,
    createdAt: new Date().toISOString()
  });
}

export async function getTransactions() {
  const db = await initDB();
  return db.getAllFromIndex('transactions', 'date');
}

