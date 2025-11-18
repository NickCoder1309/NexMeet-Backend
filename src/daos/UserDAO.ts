import admin from "../lib/firebaseAdmin";

import type { Timestamp } from "firebase/firestore";

const db = admin.firestore();

export interface User {
  name?: string | null;
  email?: string | null;
  age?: number | null;
  photoURL?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UserUpdate = Partial<Omit<User, "id" | "createdAt">>;

class UserDAO {
  private collectionRef = db.collection("users");

  async getUserById(
    id: string,
  ): Promise<
    | { success: true; data: User }
    | { success: false; data: null; error?: string }
  > {
    try {
      const snap = await this.collectionRef.doc(id).get();
      if (!snap.exists) {
        return { success: false, data: null };
      }
      return { success: true, data: snap.data() as User };
    } catch (err: any) {
      console.error("Error consiguiendo documento:", err);
      return { success: false, data: null, error: err?.message };
    }
  }

  async getUserByEmail(
    email: string,
  ): Promise<
    | { success: true; id: string; data: User }
    | { success: false; id: null; data: null; error?: string }
  > {
    try {
      const snap = await this.collectionRef
        .where("email", "==", email)
        .limit(1)
        .get();

      if (snap.empty) {
        return { success: false, id: null, data: null };
      }

      const doc = snap.docs[0];
      return { success: true, id: doc.id, data: doc.data() as User };
    } catch (err: any) {
      console.error("Error consiguiendo usuario:", err);
      return { success: false, id: null, data: null, error: err?.message };
    }
  }

  async getAllUsers(): Promise<
    { success: true; users: any[] } | { success: false; error: string }
  > {
    try {
      const snap = await this.collectionRef.get();

      if (snap.empty) {
        return { success: true, users: [] };
      }
      const users = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, users };
    } catch (err: any) {
      console.error("Error consiguiendo usuarios:", err);
      return { success: false, error: err?.message || "Error desconocido" };
    }
  }

  async createUser(
    userData: UserCreate,
  ): Promise<
    { success: true; id: string } | { success: false; error: string }
  > {
    try {
      const docRef = await this.collectionRef.add({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      } as User);
      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error("Error añadiendo documento:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async updateUser(
    id: string,
    userData: UserUpdate,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await this.collectionRef.doc(id).update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      } as Partial<User>);
      return { success: true };
    } catch (err: any) {
      console.error("Error actualizando documento:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async deleteUser(
    id: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await this.collectionRef.doc(id).delete();
      return { success: true };
    } catch (err: any) {
      console.error("Error eliminando documento:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }
}

export default new UserDAO();
