import admin from "../lib/firebaseAdmin";

import { FieldValue, type Timestamp } from "firebase-admin/firestore";

const db = admin.firestore();

export interface Chat {
  meetId?: string | null;
  ai_summary?: string | null;
  messages?: ChatMessage[] | null;
  createdAt?: Timestamp | null;
}

export type ChatMessage = {
  name: string;
  message: string;
  timestamp?: string;
};

export type ChatCreate = Omit<Chat, "messages" | "createdAt">;

class ChatDAO {
  private collectionRef = db.collection("chat");

  async createChat(
    chatData: ChatCreate,
  ): Promise<
    { success: true; id: string } | { success: false; error: string }
  > {
    try {
      const docRef = await this.collectionRef.doc(chatData.meetId as string);

      await docRef.set({
        ...chatData,
        messages: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error("Error añadiendo documento", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  async saveMessage(
    meetId: string,
    message: ChatMessage,
  ): Promise<
    | { success: true; data: Chat }
    | { success: false; data: null; error?: string }
  > {
    try {
      await this.collectionRef.doc(meetId).update({
        messages: FieldValue.arrayUnion(message),
      });

      const updatedChat = await this.collectionRef.doc(meetId).get();

      return {
        success: true,
        data: updatedChat.data() as Chat,
      };
    } catch (err: any) {
      console.error("Error agregando mensaje:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }

  async getChatById(
    meetId: string,
  ): Promise<
    | { success: true; data: Chat }
    | { success: false; data: null; error?: string }
  > {
    try {
      const chatRef = await this.collectionRef.doc(meetId).get();

      if (!chatRef.exists) {
        return { success: false, data: null };
      }

      return { success: true, data: chatRef.data() as Chat };
    } catch (err: any) {
      console.error("Error consiguiendo el documento:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }

  async addSummary(
    meetId: string,
    ai_summary: string,
  ): Promise<
    | { success: true; data: Chat }
    | { success: false; data: null; error?: string }
  > {
    try {
      await this.collectionRef.doc(meetId).update({
        ai_summary: ai_summary,
      });

      const updatedChat = await this.collectionRef.doc(meetId).get();

      return {
        success: true,
        data: updatedChat.data() as Chat,
      };
    } catch (err: any) {
      console.error("Error agregando resumen:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }
}

export default new ChatDAO();
