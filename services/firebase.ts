import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração do Firebase com suporte a variáveis de ambiente
// Mantém valores padrão para facilitar o desenvolvimento
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCXUCGaP3M0j3cPVlrSVFcz57ylHV3afvU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pixai-app-d8041.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pixai-app-d8041",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pixai-app-d8041.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "358145475484",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:358145475484:web:014e0cb4c76aca626b3e59"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);