import admin from "../lib/firebaseAdmin";

import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import UserDAO, { User } from "./UserDAO";

const db = admin.firestore();

export interface Meeting {
  userId?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  active_users?: UserWithSocketId[] | [];
  startAt?: Timestamp | null;
  finishAt?: Timestamp | null;
  createdAt?: Timestamp | null;
}

export interface MeetingWithId extends Meeting {
  id: string;
}

export interface UserWithSocketId extends User {
  userId: string;
  socketId: string;
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

/**
 * Data Access Object (DAO) for managing Meeting documents in Firestore.
 * Provides methods to create, retrieve, update, and modify meeting data.
 */
class MeetingDAO {
  private collectionRef = db.collection("meetings");

  /**
   * Retrieves all meetings from Firestore.
   * @returns Promise with success and meeting list, or failure with error.
   */
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

  /**
   * Retrieves a meeting by its ID.
   * @param meetingId Meeting identifier.
   * @returns Promise with meeting data or failure info.
   */
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

  /**
   * Creates a new meeting in Firestore.
   * @param meetingData Data for the new meeting.
   * @returns Promise with created meeting ID or error.
   */
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

      await docRef.update({
        active_users: [],
      });

      return { success: true, id: docRef.id };
    } catch (err: any) {
      console.error("Error añadiendo documento", err);
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  /**
   * Updates an existing meeting.
   * @param meetingId ID of the meeting to update.
   * @param meetingData Fields to modify.
   * @returns Promise with updated meeting or error.
   */
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

  /**
   * Marks a meeting as finished.
   * @param meetingId ID of the meeting to close.
   * @returns Promise indicating success or error.
   */
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

  /**
   * Adds a user to a meeting's active users list.
   * @param meetingId ID of the meeting to update.
   * @param userId ID of the user joining the meeting.
   * @param socketId Socket ID associated with the user.
   * @returns Updated meeting data or an error object.
   */
  async addUserMeeting(
    meetingId: string,
    userId: string,
    socketId: string,
  ): Promise<
    { success: true; meeting: Meeting } | { success: false; error: string }
  > {
    try {
      const userRef = await UserDAO.getUserById(userId);
      const userData = userRef.data;

      await this.collectionRef.doc(meetingId).update({
        active_users: FieldValue.arrayUnion({ userId, socketId, ...userData }),
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

  /**
   * Removes a user from the `active_users` array of a meeting.
   *
   * @param {string} meetingId - ID of the meeting.
   * @param {string} userId - ID of the user to remove.
   * @param {string} socketId - Socket ID linked to the user.
   * @returns {Promise<{ success: true, meeting: Meeting } | { success: false, error: string }>}
   */
  async removeUserMeeting(
    meetingId: string,
    userId: string,
    socketId: string,
  ): Promise<
    { success: true; meeting: Meeting } | { success: false; error: string }
  > {
    try {
      const userRef = await UserDAO.getUserById(userId);
      const userData = userRef.data;

      await this.collectionRef.doc(meetingId).update({
        active_users: FieldValue.arrayRemove({ userId, socketId, ...userData }),
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

  /**
   * Updates the socketId of a specific user inside a meeting's `active_users` array.
   *
   * @param {string} meetingId - ID of the meeting.
   * @param {string} userId - ID of the user whose socket must be updated.
   * @param {string} newSocketId - New socket ID to assign.
   * @returns {Promise<{ success: true, meeting: Meeting } | { success: false, error: string }>}
   */
  async updateUserMeetingSocketId(
    meetingId: string,
    userId: string,
    newSocketId: string,
  ): Promise<
    { success: true; meeting: Meeting } | { success: false; error: string }
  > {
    try {
      const meetingSnap = await this.collectionRef.doc(meetingId).get();
      if (!meetingSnap.exists) {
        return { success: false, error: "Meeting not found" };
      }

      const meetingData = meetingSnap.data() as Meeting;
      const updatedActiveUsers = (meetingData.active_users || []).map(
        (user) => {
          if (user.userId === userId) {
            return { ...user, socketId: newSocketId };
          }
          return user;
        },
      );

      await this.collectionRef.doc(meetingId).update({
        active_users: updatedActiveUsers,
      });

      return {
        success: true,
        meeting: (
          await this.collectionRef.doc(meetingId).get()
        ).data() as Meeting,
      };
    } catch (err: any) {
      console.error(
        "Error actualizando el Socket ID del usuario en la reunión:",
        err,
      );
      return { success: false, error: err?.message ?? "Error desconocido" };
    }
  }

  /**
   * Retrieves all meetings that belong to a specific user by filtering the full meetings list.
   *
   * @param {string} userId - The ID of the user whose meetings should be returned.
   * @returns {Promise<{ success: true, data: MeetingWithId[] } | { success: false, data: null, error?: string }>}
   * Returns the list of meetings owned by the user, or an error object on failure.
   */
  async getMeetingsByUser(
    userId: string,
  ): Promise<
    | { success: true; data: MeetingWithId[] }
    | { success: false; data: null; error?: string }
  > {
    try {
      const meetings = await this.getAllMeeting();
      if (!meetings.success) {
        return { success: false, data: null };
      }

      var userMeetings: MeetingWithId[] = [];

      for (var meeting of meetings.data) {
        if (meeting.userId == userId) {
          userMeetings.push(meeting);
        }
      }

      return { success: true, data: userMeetings as MeetingWithId[] };
    } catch (err: any) {
      console.error("Error consiguiendo la reunión:", err);
      return {
        success: false,
        data: null,
        error: err?.message ?? "Error desconocido",
      };
    }
  }
}

export default new MeetingDAO();
