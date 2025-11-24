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
    return res.status(200).json(meeting.data);
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
      .json({ message: "Reuniones: ", meetings: meetings.data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function createMeetingController(req: Request, res: Response) {
  try {
    const { userId, socketId, description } = req.body;
    console.log("UserId: ", userId);
    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta proporcionar el id del usuario" });

    if (!socketId)
      return res
        .status(400)
        .json({ error: "Falta proporcionar el id del socket" });

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

export async function updateOrAddMeetingUser(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    const { userId, socketId } = req.body;

    if (!socketId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del socket" });

    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del usuario" });

    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const meeting = await MeetingDAO.getMeetingById(meetingId);

    if (!meeting.data?.active_users) {
      return res
        .status(400)
        .json({ error: "No se encuentra los usuarios de la reunión" });
    }

    const user_exists = meeting.data.active_users.some(
      (user) => user.userId === userId,
    );

    if (user_exists) {
      const response = await MeetingDAO.updateUserMeetingSocketId(
        meetingId,
        userId,
        socketId,
      );
      if (!response.success) {
        return res
          .status(404)
          .json({ error: "No se logró actualizar el usuario en la reunión" });
      }
      return res.status(200).json(response.meeting.active_users);
    }

    const response = await MeetingDAO.addUserMeeting(
      meetingId,
      userId,
      socketId,
    );
    if (!response.success) {
      return res
        .status(404)
        .json({ error: "No se logró agregar el usuario a la reunión" });
    }
    return res.status(200).json(response.meeting.active_users);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

export async function removeUserMeetingController(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    const { userId, socketId } = req.body;

    if (!socketId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del socket" });

    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id del usuario" });

    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });

    const response = await MeetingDAO.removeUserMeeting(
      meetingId,
      userId,
      socketId,
    );
    if (!response.success) {
      return res
        .status(404)
        .json({ error: "No se logró eliminar el usuario a la reunión" });
    }
    return res.status(200).json(response.meeting.active_users);
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

export async function getMeetingUsers(req: Request, res: Response) {
  try {
    const meetingId = req.params.meetingId;
    if (!meetingId)
      return res
        .status(400)
        .json({ error: "Falta propociar el id de la reunión" });
    const response = await MeetingDAO.getMeetingById(meetingId);
    if (!response.success) {
      return res
        .status(404)
        .json({ error: "No se encontró una reunión con ese ID" });
    }

    return res.status(200).json(response.data.active_users);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}
