import { decode } from "node:querystring";
import UserDAO from "../daos/UserDAO";
import { Request, Response } from "express";

/**
 * Registers a new user in the system.
 *
 * This controller validates the request body fields (`name`, `age`, `photoURL`)
 * and checks whether the user already exists based on the email extracted from
 * the decoded authentication token (`req.user`). If the user does not exist, the
 * function creates a new user using `UserDAO.createUser`.
 *
 * @param {Request} req - Express request object containing the user's data in the body
 * and the decoded token payload in `req.user`.
 * @param {Response} res - Express response object used to send the API response.
 *
 * @returns {Promise<Response>} A JSON response that includes:
 *  - `201` with the created user object when registration is successful.
 *  - `200` if the user already exists in the database.
 *  - `400` when required fields are missing or invalid.
 *  - `500` for unexpected server errors.
 *
 * @throws {Error} Returns a specific or generic error message if an exception occurs.
 */

export async function registerUser(req: Request, res: Response) {
  try {
    const { name, age, photoURL } = req.body;

    if (!name)
      return res.status(400).json({ error: "Falta proporcionar el nombre" });
    if (age === undefined || age === null)
      return res.status(400).json({ error: "Falta proporcionar la edad" });

    const int_age = Number(age);
    if (Number.isNaN(int_age))
      return res.status(400).json({ error: "Digite un número válido" });
    if (int_age <= 0 || int_age > 100)
      return res
        .status(400)
        .json({ error: "La edad debe ser un número entre 0 y 100" });

    const decoded = (req as any).user;
    console.log("Email: ", decoded.email);
    const existingUserSnapshot = await UserDAO.getUserByEmail(decoded.email);
    if (existingUserSnapshot.success) {
      return res.status(200).json({
        success: true,
        message: "El usuario ya existe",
      });
    }

    const userCreated = await UserDAO.createUser({
      name,
      email: decoded.email,
      age: int_age,
      photoURL: photoURL ?? null,
    });

    return res.status(201).json(userCreated);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Retrieves a user by its ID.
 *
 * This controller extracts the `userId` parameter from the request URL
 * and uses `UserDAO.getUserById` to fetch the corresponding user.
 * If no user is found, it responds with a 400 status code.
 *
 * @param {Request} req - Express request object, containing the `userId`
 * in the URL parameters (req.params.userId).
 * @param {Response} res - Express response object used to return the API response.
 *
 * @returns {Promise<Response>} A JSON response with:
 *  - `200` and the user data when the user is found.
 *  - `400` if the user does not exist.
 *  - `500` for unexpected server errors.
 *
 * @throws {Error} Returns a specific or generic error message if an exception occurs.
 */

export async function getUserByIdController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await UserDAO.getUserById(userId);
    if (!user.success)
      return res.status(400).json({ error: "No se encuentra el usuario" });

    return res
      .status(200)
      .json({ message: "Usuario encontrado", user: user.data });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Retrieves all users stored in the system.
 *
 * This controller calls `UserDAO.getAllUsers()` to fetch the full list
 * of users. If the operation is unsuccessful, it returns a 400 status code.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the response.
 *
 * @returns {Promise<Response>} A JSON response with:
 *  - `200` and the list of users when the retrieval is successful.
 *  - `400` if the users could not be retrieved.
 *  - `500` for unexpected server errors.
 *
 * @throws {Error} Returns a specific or generic error message if an exception occurs.
 */

export async function getAllUsersController(req: Request, res: Response) {
  try {
    const data = await UserDAO.getAllUsers();
    if (!data.success)
      return res.status(400).json({ error: "No se consiguieron los usuarios" });

    return res.status(200).json({ message: "Usuarios", users: data.users });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Updates an existing user by applying the provided fields.
 *
 * This controller extracts the `userId` from the URL parameters and uses
 * the request body as the update payload. It calls `UserDAO.updateUser`
 * to apply the changes in the database.
 *
 * @param {Request} req - Express request object. Must include `userId` as a route parameter and update fields in the body.
 * @param {Response} res - Express response object used to send the result.
 *
 * @returns {Promise<Response>} A JSON response containing:
 *  - `200` and the updated user data if the update succeeds.
 *  - `400` if the userId is missing.
 *  - `500` if an unexpected server error occurs.
 *
 * @throws {Error} Sends a specific or generic error message if an exception is thrown.
 */
export async function updateUserController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json({ error: "Falta el id del usuario" });

    const updates = req.body;
    const updatedUser = await UserDAO.updateUser(userId, updates);

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}

/**
 * Deletes a user by their unique identifier.
 *
 * This controller retrieves the `userId` from the request parameters,
 * verifies that the user exists through `UserDAO.getUserById`, and if so,
 * proceeds to delete the user using `UserDAO.deleteUser`.
 *
 * @param {Request} req - Express request object containing `userId` as a route parameter.
 * @param {Response} res - Express response object used to return the operation result.
 *
 * @returns {Promise<Response>} A JSON response with:
 *  - `200` if the user was successfully deleted.
 *  - `404` if the user does not exist.
 *  - `500` if an unexpected server error occurs.
 *
 * @throws {Error} Returns a specific or generic error message if an exception is thrown.
 */
export async function deleteUserById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await UserDAO.getUserById(userId);
    if (!user.success)
      return res.status(404).json({ error: "El usuario no existe" });

    await UserDAO.deleteUser(userId);
    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error inesperado",
    });
  }
}
