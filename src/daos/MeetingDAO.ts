import admin from "../lib/firebaseAdmin";

import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { User } from "./UserDAO";

const db = admin.firestore();

export interface Meeting {
  userId?: string | null;
  socketId?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  active_users?: string[] | [];
  startAt?: Timestamp | null;
  finishAt?: Timestamp | null;
  createdAt?: Timestamp | null;
}

export interface MeetingWithId extends Meeting {
  id: string;
}

export type MeetingCreate = Omit<
  Meeting,
  "id" | "createdAt" | "startAt" | "finishAt" | "is_active" | "active_users"
>;
export type MeetingUpdate = Partial<
  Omit<
    Meeting,
    "id" | "userId" | "active_users" | "startAt" | "finishAt" | "createdAt"
  >
>;

class MeetingDAO {
  private collectionRef = db.collection("meetings");

  async getAllMeeting(): Promise<
    | { success: true; data: MeetingWithId[] }
    | { success: false; data: null; error?: string }
  > {
    try {
      const snap = await this.collectionRef.get();
      if (!snap) {
        return { success: false, data: null };
      }
      return {
        success: true,
        data: snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      };
    } catch (err: any) {
      console.error("Error consiguiendo las reuniones:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }

  async getMeetingById(
    meetingId: string,
  ): Promise<
    | { success: true; data: Meeting }
    | { success: false; data: null; error?: string }
  > {
    try {
      const snap = await this.collectionRef.doc(meetingId).get();
      if (!snap.exists) {
        return { success: false, data: null };
      }
      return { success: true, data: snap.data() as Meeting };
    } catch (err: any) {
      console.error("Error consiguiendo la reunión:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }

  async createMeeting(
    meetingData: MeetingCreate,
  ): Promise<
    { success: true; id: string } | { success: false; error: string }
  > {
    try {
      const docRef = await this.collectionRef.add({
        ...meetingData,
        is_active: true,
        startAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      } as Meeting);

      const userId = meetingData.userId;

      await this.collectionRef.doc(docRef.id).update({
        active_users: [userId],
      });

      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error("Error añadiendo documento", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async updateMeeting(
    meetingId: string,
    meetingData: MeetingUpdate,
  ): Promise<
    | { success: true; updatedMeeting: Meeting }
    | { success: false; error: string }
  > {
    try {
      await this.collectionRef.doc(meetingId).update({
        ...meetingData,
      } as Partial<Meeting>);
      return {
        success: true,
        updatedMeeting: this.collectionRef.doc(meetingId).get() as Meeting,
      };
    } catch (err: any) {
      console.error("Error actualizando documento:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async finishMeeting(
    meetingId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    try {
      await this.collectionRef.doc(meetingId).update({
        is_active: false,
        active_users: [],
        finishAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return { success: true };
    } catch (err: any) {
      console.error("Error actualizando documento:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async addUserMeeting(
    meetingId: string,
    userId: string,
  ): Promise<
    { success: true; meeting: Meeting } | { success: false; error: string }
  > {
    try {
      await this.collectionRef.doc(meetingId).update({
        active_users: FieldValue.arrayUnion(userId),
      });
      return {
        success: true,
        meeting: (
          await this.collectionRef.doc(meetingId).get()
        ).data() as Meeting,
      };
    } catch (err: any) {
      console.error("Error agregando Id de Usuario a la reunión:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async removeUserMeeting(
    meetingId: string,
    userId: string,
  ): Promise<
    { success: true; meeting: Meeting } | { success: false; error: string }
  > {
    try {
      await this.collectionRef.doc(meetingId).update({
        active_users: FieldValue.arrayRemove(userId),
      });
      return {
        success: true,
        meeting: (
          await this.collectionRef.doc(meetingId).get()
        ).data() as Meeting,
      };
    } catch (err: any) {
      console.error("Error eliminando Id de Usuario de la reunión:", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }
}

export default new MeetingDAO();
