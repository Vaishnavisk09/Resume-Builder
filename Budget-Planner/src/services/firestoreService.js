import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/config/firebase';

// In-memory fallback for environments without window.localStorage (e.g. Node tests, SSR)
const memoryStore = new Map();
function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) : null),
    setItem: (key, val) => memoryStore.set(key, String(val)),
    removeItem: (key) => memoryStore.delete(key),
    clear: () => memoryStore.clear()
  };
}

/**
 * Storage helpers for fallback sandbox / offline mode
 * Stored strictly under user-specific key to guarantee isolation: finora_data_${userId}
 */
function getLocalUserData(userId) {
  try {
    const raw = getStorage().getItem(`finora_user_data_${userId}`);
    return raw ? JSON.parse(raw) : { transactions: [], budgets: [], goals: [], settings: {} };
  } catch {
    return { transactions: [], budgets: [], goals: [], settings: {} };
  }
}

function saveLocalUserData(userId, data) {
  getStorage().setItem(`finora_user_data_${userId}`, JSON.stringify(data));
}

// ====================================================
// TRANSACTIONS CRUD (users/{userId}/transactions)
// ====================================================

export async function fetchTransactions(userId) {
  if (!userId) throw new Error('User ID is required to fetch transactions');

  if (isFirebaseConfigured && db) {
    const transactionsRef = collection(db, 'users', userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Fallback Isolated Local Store
  const userData = getLocalUserData(userId);
  return (userData.transactions || []).sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function createTransaction(userId, transactionData) {
  if (!userId) throw new Error('User ID is required');

  const cleanData = {
    title: String(transactionData.title).trim(),
    amount: Number(transactionData.amount),
    type: transactionData.type, // 'income' or 'expense'
    category: transactionData.category,
    date: transactionData.date, // ISO date string: YYYY-MM-DD
    paymentMethod: transactionData.paymentMethod || 'UPI / GPay / PhonePe',
    description: transactionData.description ? String(transactionData.description).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const colRef = collection(db, 'users', userId, 'transactions');
    const docRef = await addDoc(colRef, {
      ...cleanData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...cleanData };
  }

  // Fallback Isolated Local Store
  const userData = getLocalUserData(userId);
  const newTx = {
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...cleanData,
    createdAt: new Date().toISOString()
  };
  userData.transactions = [newTx, ...(userData.transactions || [])];
  saveLocalUserData(userId, userData);
  return newTx;
}

export async function updateTransaction(userId, transactionId, updateData) {
  if (!userId || !transactionId) throw new Error('User ID and Transaction ID are required');

  const cleanData = {
    title: String(updateData.title).trim(),
    amount: Number(updateData.amount),
    type: updateData.type,
    category: updateData.category,
    date: updateData.date,
    paymentMethod: updateData.paymentMethod || 'UPI / GPay / PhonePe',
    description: updateData.description ? String(updateData.description).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, cleanData);
    return { id: transactionId, ...cleanData };
  }

  // Fallback Isolated Local Store
  const userData = getLocalUserData(userId);
  userData.transactions = (userData.transactions || []).map(tx => {
    if (tx.id === transactionId) {
      return { ...tx, ...cleanData };
    }
    return tx;
  });
  saveLocalUserData(userId, userData);
  return { id: transactionId, ...cleanData };
}

export async function deleteTransaction(userId, transactionId) {
  if (!userId || !transactionId) throw new Error('User ID and Transaction ID are required');

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
    return true;
  }

  // Fallback Isolated Local Store
  const userData = getLocalUserData(userId);
  userData.transactions = (userData.transactions || []).filter(tx => tx.id !== transactionId);
  saveLocalUserData(userId, userData);
  return true;
}

// ====================================================
// BUDGETS CRUD (users/{userId}/budgets)
// ====================================================

export async function fetchBudgets(userId) {
  if (!userId) throw new Error('User ID is required');

  if (isFirebaseConfigured && db) {
    const colRef = collection(db, 'users', userId, 'budgets');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Fallback
  const userData = getLocalUserData(userId);
  return userData.budgets || [];
}

export async function createBudget(userId, budgetData) {
  if (!userId) throw new Error('User ID is required');

  const cleanData = {
    category: budgetData.category,
    amount: Number(budgetData.amount),
    period: budgetData.period || 'monthly',
    notes: budgetData.notes ? String(budgetData.notes).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const colRef = collection(db, 'users', userId, 'budgets');
    const docRef = await addDoc(colRef, {
      ...cleanData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...cleanData };
  }

  // Fallback
  const userData = getLocalUserData(userId);
  const newBudget = {
    id: 'budget_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...cleanData,
    createdAt: new Date().toISOString()
  };
  userData.budgets = [...(userData.budgets || []), newBudget];
  saveLocalUserData(userId, userData);
  return newBudget;
}

export async function updateBudget(userId, budgetId, budgetData) {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID are required');

  const cleanData = {
    category: budgetData.category,
    amount: Number(budgetData.amount),
    period: budgetData.period || 'monthly',
    notes: budgetData.notes ? String(budgetData.notes).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    await updateDoc(docRef, cleanData);
    return { id: budgetId, ...cleanData };
  }

  // Fallback
  const userData = getLocalUserData(userId);
  userData.budgets = (userData.budgets || []).map(b => {
    if (b.id === budgetId) {
      return { ...b, ...cleanData };
    }
    return b;
  });
  saveLocalUserData(userId, userData);
  return { id: budgetId, ...cleanData };
}

export async function deleteBudget(userId, budgetId) {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID are required');

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'budgets', budgetId);
    await deleteDoc(docRef);
    return true;
  }

  // Fallback
  const userData = getLocalUserData(userId);
  userData.budgets = (userData.budgets || []).filter(b => b.id !== budgetId);
  saveLocalUserData(userId, userData);
  return true;
}

// ====================================================
// SAVINGS GOALS CRUD (users/{userId}/goals)
// ====================================================

export async function fetchGoals(userId) {
  if (!userId) throw new Error('User ID is required');

  if (isFirebaseConfigured && db) {
    const colRef = collection(db, 'users', userId, 'goals');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  // Fallback
  const userData = getLocalUserData(userId);
  return userData.goals || [];
}

export async function createGoal(userId, goalData) {
  if (!userId) throw new Error('User ID is required');

  const cleanData = {
    title: String(goalData.title).trim(),
    targetAmount: Number(goalData.targetAmount),
    currentAmount: Number(goalData.currentAmount || 0),
    targetDate: goalData.targetDate || '',
    category: goalData.category || 'General',
    description: goalData.description ? String(goalData.description).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const colRef = collection(db, 'users', userId, 'goals');
    const docRef = await addDoc(colRef, {
      ...cleanData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...cleanData };
  }

  // Fallback
  const userData = getLocalUserData(userId);
  const newGoal = {
    id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    ...cleanData,
    createdAt: new Date().toISOString()
  };
  userData.goals = [...(userData.goals || []), newGoal];
  saveLocalUserData(userId, userData);
  return newGoal;
}

export async function updateGoal(userId, goalId, goalData) {
  if (!userId || !goalId) throw new Error('User ID and Goal ID are required');

  const cleanData = {
    title: String(goalData.title).trim(),
    targetAmount: Number(goalData.targetAmount),
    currentAmount: Number(goalData.currentAmount || 0),
    targetDate: goalData.targetDate || '',
    category: goalData.category || 'General',
    description: goalData.description ? String(goalData.description).trim() : '',
    updatedAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(docRef, cleanData);
    return { id: goalId, ...cleanData };
  }

  // Fallback
  const userData = getLocalUserData(userId);
  userData.goals = (userData.goals || []).map(g => {
    if (g.id === goalId) {
      return { ...g, ...cleanData };
    }
    return g;
  });
  saveLocalUserData(userId, userData);
  return { id: goalId, ...cleanData };
}

export async function deleteGoal(userId, goalId) {
  if (!userId || !goalId) throw new Error('User ID and Goal ID are required');

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(docRef);
    return true;
  }

  // Fallback
  const userData = getLocalUserData(userId);
  userData.goals = (userData.goals || []).filter(g => g.id !== goalId);
  saveLocalUserData(userId, userData);
  return true;
}

// ====================================================
// SETTINGS & PREFERENCES (users/{userId}/settings/preferences)
// ====================================================

export async function fetchUserPreferences(userId) {
  if (!userId) return null;

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { currency: 'INR', currencySymbol: '₹', monthlyBudgetAlert: 80 };
  }

  // Fallback
  const userData = getLocalUserData(userId);
  return userData.settings || { currency: 'INR', currencySymbol: '₹', monthlyBudgetAlert: 80 };
}

export async function updateUserPreferences(userId, prefs) {
  if (!userId) throw new Error('User ID is required');

  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'users', userId, 'settings', 'preferences');
    await setDoc(docRef, { ...prefs, updatedAt: serverTimestamp() }, { merge: true });
    return prefs;
  }

  // Fallback
  const userData = getLocalUserData(userId);
  userData.settings = { ...(userData.settings || {}), ...prefs };
  saveLocalUserData(userId, userData);
  return prefs;
}
