import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/config/firebase';

/**
 * Human-friendly Firebase Authentication error parser
 */
export function getAuthErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.';
  const code = error.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please log in instead.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access is temporarily disabled. Please reset your password or try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in your Firebase console. Please enable it under Authentication -> Sign-in method.';
    default:
      return error.message || 'Authentication error. Please try again.';
  }
}

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

// Local mock storage key for fallback demo mode if Firebase is unconfigured
const DEMO_USER_KEY = 'finora_demo_user_session';
const DEMO_ACCOUNTS_KEY = 'finora_demo_registered_accounts';

/**
 * Register user with Email and Password
 */
export async function registerUser({ name, email, password }) {
  if (isFirebaseConfigured && auth && db) {
    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // 2. Update display name
    await updateProfile(user, {
      displayName: name.trim()
    });

    // 3. Create user profile document in Firestore: users/{userId}/profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: name.trim(),
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
      currency: 'INR',
      currencySymbol: '₹'
    }, { merge: true });

    return {
      uid: user.uid,
      email: user.email,
      displayName: name.trim()
    };
  }

  // Fallback demo mode when Firebase config is missing
  return mockRegister({ name, email, password });
}

/**
 * Sign in with Email and Password
 */
export async function loginUser({ email, password }) {
  if (isFirebaseConfigured && auth) {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    // Fetch user profile from Firestore if available
    let profileData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || email.split('@')[0]
    };

    if (db) {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          profileData = { ...profileData, ...docSnap.data() };
        }
      } catch (err) {
        console.warn('Could not fetch Firestore user profile doc:', err);
      }
    }

    return profileData;
  }

  // Fallback demo mode
  return mockLogin({ email, password });
}

/**
 * Sign out
 */
export async function logoutUser() {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
    return;
  }
  getStorage().removeItem(DEMO_USER_KEY);
}

/**
 * Send password reset email
 */
export async function sendResetPassword(email) {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email.trim());
    return;
  }

  // Mock demo response
  await new Promise(r => setTimeout(r, 100));
  return true;
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let profile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };

        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userSnap.exists()) {
              profile = { ...profile, ...userSnap.data() };
            }
          } catch (err) {
            console.warn('Error reading user profile:', err);
          }
        }
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  // Fallback demo mode
  const saved = getStorage().getItem(DEMO_USER_KEY);
  if (saved) {
    try {
      callback(JSON.parse(saved));
    } catch {
      callback(null);
    }
  } else {
    callback(null);
  }
  return () => {};
}

// ==========================================
// Fallback Mock Auth for offline / unconfigured demo
// ==========================================
function getStoredAccounts() {
  try {
    return JSON.parse(getStorage().getItem(DEMO_ACCOUNTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts) {
  getStorage().setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

async function mockRegister({ name, email, password }) {
  await new Promise(r => setTimeout(r, 50));
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  if (accounts.some(a => a.email === normalizedEmail)) {
    const err = new Error('An account with this email address already exists. Please log in instead.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const newUid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  const newAccount = {
    uid: newUid,
    displayName: name.trim(),
    email: normalizedEmail,
    password, // Demo only
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  const sessionUser = { uid: newUid, displayName: newAccount.displayName, email: normalizedEmail };
  getStorage().setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}

async function mockLogin({ email, password }) {
  await new Promise(r => setTimeout(r, 50));
  const accounts = getStoredAccounts();
  const normalizedEmail = email.trim().toLowerCase();
  const account = accounts.find(a => a.email === normalizedEmail);

  if (!account || account.password !== password) {
    const err = new Error('Invalid email or password. Please check your credentials and try again.');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const sessionUser = { uid: account.uid, displayName: account.displayName, email: account.email };
  getStorage().setItem(DEMO_USER_KEY, JSON.stringify(sessionUser));
  return sessionUser;
}
