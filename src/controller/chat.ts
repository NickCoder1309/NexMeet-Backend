import ChatDAO from "../daos/ChatDAO";
import { Request, Response } from "express";
import MeetingDAO from "../daos/MeetingDAO";

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
