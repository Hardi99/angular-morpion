import { Injectable } from '@angular/core';
import { initializeApp, FirebaseOptions } from 'firebase/app';
import { doc, Firestore, getDoc, getFirestore, onSnapshot, setDoc, Unsubscribe } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
  useFactory: () => new FirestoreService(firebaseConfig)
})

export class FirestoreService {
  db: Firestore;
  constructor(firebaseConfig: FirebaseOptions) { 
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  /* Nous avons ci-dessous 3 méthodes qui traitent la donnée 1 pour l'écrire, 1 pour la lire et 1 pour l'écouter */

  async writeData(path: string, data: Record<string, any>): Promise<void> {
    await setDoc(doc(this.db, path), data);
  }

  async readData(path: string): Promise<any> {
    const snap = await getDoc(doc(this.db, path));
    return snap.exists() ? snap.data() : null;
  }

  onData(path: string, callback: (data: Record<string, any>) => void): Unsubscribe {
    return onSnapshot(doc(this.db, path), (doc) => {
      if (doc.exists()) callback(doc.data())
    });
  }
}

export interface PieceMove {
  id: string;
  from?: {x: number, y: number};
  to: {x: number, y: number};
  type: 'square' | 'circle' | null;
}

export const firebaseConfig = {
  apiKey: "AIzaSyAK_aQ1uJcV6I5ekUlHlV0bqFQylvHDSFY",
  authDomain: "angular-morpion.firebaseapp.com",
  projectId: "angular-morpion",
  storageBucket: "angular-morpion.firebasestorage.app",
  messagingSenderId: "290089299819",
  appId: "1:290089299819:web:2e046ad3edb574715ae62e",
};