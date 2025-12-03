import ChatDAO from "../daos/ChatDAO";
import { Request, Response } from "express";
import MeetingDAO from "../daos/MeetingDAO";

/**
 * Saves a new chat message for a given meeting.
 *
 * This controller validates the provided meeting ID, ensures that the meeting exists,
 * checks whether a chat document already exists for that meeting, and if not, creates one.
 * Then it stores the new message through `ChatDAO.saveMessage`.
 *
 * @param {Request} req - Express request object containing `meetId` and `message` in the body.
 * @param {Response} res - Express response object used to send the API response.
 *
 * @returns {Promise<Response>} A JSON response that includes:
 *  - `201` and a success flag when the message is successfully saved.
 *  - `400` if the meeting ID is missing or if the meeting does not exist.
 *  - `500` if an unexpected server error occurs.
 *
 * @throws {Error} Returns a generic or specific error message based on the caught exception.
 */

export async function saveMessageController(req: Request, res: Response) {
  try {
    const { meetId, message } = req.body;
    if (!meetId) {
      return res
        .status(400)
        .json({ error: "Falta proporcionar el id de la reunión" });
    }

    const meeting = await MeetingDAO.getMeetingById(meetId);

    if (!meeting.success) {
      return res
        .status(400)
        .json({ error: "No se encuentra una reunión con ese id" });
    }

    const chat = await ChatDAO.getChatById(meetId);
    if (!chat.success) {
      await ChatDAO.createChat({
        meetId,
        ai_summary: null,
      });

      const updatedChat = await ChatDAO.saveMessage(meetId, message);
      return res.status(201).json(updatedChat.success);
    }

    const updatedChat = await ChatDAO.saveMessage(meetId, message);

    return res.status(201).json(updatedChat.success);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Retrieves the chat associated with a specific meeting ID.
 *
 * This controller extracts the `meetId` from the request parameters and attempts
 * to fetch the corresponding chat using `ChatDAO.getChatById`. If found, the chat
 * data is returned; otherwise, an error response is sent.
 *
 * @param {Request} req - Express request object containing the meeting ID in `req.params.meetId`.
 * @param {Response} res - Express response object used to send the result back to the client.
 *
 * @returns {Promise<Response>} A JSON response with:
 *  - `200` and the chat data if retrieval is successful.
 *  - `400` if the chat does not exist for the provided meeting ID.
 *  - `500` if an unexpected server error occurs.
 */

export async function getChatbyIdController(req: Request, res: Response) {
  try {
    const meetId = req.params.meetId;
    const chat = await ChatDAO.getChatById(meetId);
    if (!chat.success) {
      return res.status(400).json({ error: "No se encuentra el chat" });
    }
    return res.status(200).json(chat.data);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Retrieves all chat sessions associated with a specific user.
 *
 * This controller extracts the `userId` from the request parameters and requests
 * all related chats through `ChatDAO.getChatsByUser`. It returns the chat list if
 * found, or an appropriate error message otherwise.
 *
 * @param {Request} req - Express request object containing the user ID in `req.params.userId`.
 * @param {Response} res - Express response object used to send the response back to the client.
 *
 * @returns {Promise<Response>} A JSON response that includes:
 *  - `200` with the list of chats when the operation is successful.
 *  - `400` if the user ID is missing or no chats are found for the user.
 *  - `500` if an unexpected server error occurs.
 */

export async function getChatsByUserController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Falta proporcionar el id del usuario" });
    }

    const userChats = await ChatDAO.getChatsByUser(userId);

    if (!userChats.success) {
      return res
        .status(400)
        .json({ error: "No se encontraron chats con ese id de usuario" });
    }

    return res.status(200).json(userChats);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}
