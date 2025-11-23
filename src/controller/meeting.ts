import MeetingDAO from "../daos/MeetingDAO";
import { Request, response, Response } from "express";
import UserDAO from "../daos/UserDAO";

export async function getMeetingByIdController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    const meeting = await MeetingDAO.getMeetingById(meetingId);
    if (!meeting.success) {
      return res.status(400).json({ error: "No se encuentra la reunión" });
    }
    return res
      .status(200)
      .json({ message: "Usuario encontrado", meeting: meeting.data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function getAllMeetingsController(req: Request, res: Response) {
  try {
    const meetings = await MeetingDAO.getAllMeeting();
    if (!meetings.success)
      return res
        .status(400)
        .json({ error: "No se consiguieron las reuniones" });

    return res
      .status(200)
      .json({ message: "Reuniones", meetings: meetings.data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function createMeetingController(req: Request, res: Response) {
  try {
    const { userId, description } = req.body;
    console.log("UserId: ", userId);
    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del usuario" });

    const user = await UserDAO.getUserById(userId);
    if (!user.success)
      return res.status(400).json({ error: "No se encuentra el usuario" });

    const meeting = await MeetingDAO.createMeeting({
      userId,
      description,
    });

    return res.status(201).json(meeting);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function updateMeetingController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const updates = req.body;
    const data = await MeetingDAO.updateMeeting(meetingId, updates);
    if (!data.success) {
      return res
        .status(404)
        .json({ error: "No se logró actualizar los datos a la reunión" });
    }
    return res.status(200).json({
      message: "Reunión actualizada exitosamente",
      updatedMeeting: data.updatedMeeting,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function addUserMeetingController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    const { userId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del usuario" });

    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const response = await MeetingDAO.addUserMeeting(meetingId, userId);
    if (!response.success) {
      return res
        .status(404)
        .json({ error: "No se logró agregar el usuario a la reunión" });
    }
    return res.status(200).json({
      message: "Usuario agregado exitosamente",
      meeting_participants: response.active_users,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function removeUserMeetingController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    const { userId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del usuario" });

    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const response = await MeetingDAO.removeUserMeeting(meetingId, userId);
    if (!response.success) {
      return res
        .status(404)
        .json({ error: "No se logró eliminar el usuario a la reunión" });
    }
    return res.status(200).json({
      message: "Usuario removido exitosamente",
      meeting_participants: response.active_users,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function finishMeetingController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const response = await MeetingDAO.finishMeeting(meetingId);
    if (!response.success) {
      return res.status(404).json({ error: "No se logró terminar la reunión" });
    }
    return res.status(200).json({
      message: "Reunión terminada exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}
