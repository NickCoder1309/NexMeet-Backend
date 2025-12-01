import MeetingDAO from "../daos/MeetingDAO";
import { Request, response, Response } from "express";
import UserDAO from "../daos/UserDAO";
import ChatDAO, { ChatMessage } from "../daos/ChatDAO";
import { generarResumen } from "../service/summaryAI";

/**
 * Retrieves a meeting by its ID and returns it to the client.
 *
 *
 * @async
 * @function getMeetingByIdController
 * @param {Request} req - Express request object containing `meetingId` in `req.params`.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response containing the meeting data or an error message.
 *
 * @example
 * // Example Express route:
 * router.get("/meetings/:meetingId", getMeetingByIdController);
 */
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

/**
 * Retrieves all meetings and returns them to the client.
 *
 * @async
 * @function getAllMeetingsController
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response containing all meetings or an error message.
 *
 * @example
 * // Example Express route:
 * router.get("/meetings", getAllMeetingsController);
 */
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

/**
 * Creates a new meeting for a given user and returns the created record.
 *
 * @async
 * @function createMeetingController
 * @param {Request} req - Express request object containing `userId` and optional `description` in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response containing the newly created meeting or an error message.
 *
 * @example
 * // Example Express route:
 * router.post("/meetings/start", createMeetingController);
 */
export async function createMeetingController(req: Request, res: Response) {
  try {
    const { userId, description } = req.body;
    if (!userId)
      return res
        .status(400)
        .json({ error: "Falta proporcionar el id del usuario" });

    const user = await UserDAO.getUserById(userId);
    if (!user.success)
      return res.status(400).json({ error: "No se encuentra el usuario" });

    const meeting = await MeetingDAO.createMeeting({
      userId,
      description: description ?? null,
    });

    return res.status(201).json(meeting);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Updates an existing meeting using the provided meeting ID and update payload.
 *
 * @async
 * @function updateMeetingController
 * @param {Request} req - Express request object containing the meeting ID in `req.params` and update data in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response with the updated meeting or an error message.
 *
 * @example
 * // Example Express route:
 * router.put("/meetings/update/:meetingId", updateMeetingController);
 */
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

/**
 * Adds a user to a meeting or updates the user's socket ID if they are already registered.
 *
 * - If the user exists, their socket ID is updated via
 *   `MeetingDAO.updateUserMeetingSocketId`.
 * - If the user does not exist, they are added using `MeetingDAO.addUserMeeting`.
 *
 * @async
 * @function updateOrAddMeetingUser
 * @param {Request} req - Express request object containing `meetingId` in `req.params` and `userId`, `socketId` in the body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response with the updated list of active users or an error message.
 *
 * @example
 * // Example Express route:
 * router.put("/meetings/updateOrAddMeetingUser/:meetingId", updateOrAddMeetingUser);
 */
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

/**
 * Removes a user from a meeting and returns the updated list of active users.
 *
 * @async
 * @function removeUserMeetingController
 * @param {Request} req - Express request containing `meetingId` in `req.params` and `userId`, `socketId` in the request body.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response with the updated list of active users or an error message.
 *
 * @example
 * // Example Express route:
 * router.put("/meetings/removeUser/:meetingId", removeUserMeetingController);
 */
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

/**
 * Marks a meeting as finished and returns a confirmation message.
 *
 * @async
 * @function finishMeetingController
 * @param {Request} req - Express request object containing `meetingId` in `req.params`.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response confirming the meeting was finished or an error message.
 *
 * @example
 * // Example Express route:
 * router.post("/meetings/finish/:meetingId", finishMeetingController);
 */
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

    const chat = await ChatDAO.getChatById(meetingId);

    if (!chat.success) {
      return res.status(400).json({ error: "No se encuentra el chat" });
    }

    const summary = await generarResumen(chat.data.messages as ChatMessage[]);

    if (!summary) {
      return res
        .status(400)
        .json({ error: "No se generó el resumen del chat" });
    }

    const updatedChat = await ChatDAO.addSummary(meetingId, summary);

    if (!summary) {
      return res
        .status(404)
        .json({ error: "No se puedo agregar el resumen al chat" });
    }

    return res.status(200).json({
      message: "Reunión terminada exitosamente",
      ai_summary: updatedChat.data?.ai_summary,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Retrieves the list of users currently associated with a meeting.
 *
 * @async
 * @function getMeetingUsers
 * @param {Request} req - Express request object containing `meetingId` in `req.params`.
 * @param {Response} res - Express response object.
 * @returns {Promise<Response>} HTTP response containing the list of active users or an error message.
 *
 * @example
 * // Example Express route:
 * router.get("/meetings/getMeetingUsers/:meetingId", getMeetingUsers);
 */

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
