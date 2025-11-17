import UserDAO from "../daos/UserDAO";
import { Request, Response } from "express";

export async function registerUser(req: Request, res: Response) {
  try {
    const { name, age, photoURL } = req.body;

    if (!name) return res.status(400).json({ error: "Falta proporcionar el nombre" });
    if (age === undefined || age === null)
      return res.status(400).json({ error: "Falta proporcionar la edad" });

    const int_age = Number(age);
    if (Number.isNaN(int_age)) return res.status(400).json({ error: "Digite un número válido" });
    if (int_age <= 0 || int_age > 100)
      return res.status(400).json({ error: "La edad debe ser un número entre 0 y 100" });

    const decoded = (req as any).user;

    const existingUserSnapshot = await UserDAO.getByEmail(decoded.email);
    if (existingUserSnapshot) {
      return res.status(200).json({
        success: true,
        message: "El usuario ya existe",
        id: existingUserSnapshot.id,
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
    return res.status(500).json({ error: error instanceof Error ? error.message : "Error inesperado" });
  }
}

export async function getUserByIdController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await UserDAO.getUserById(userId);
    if (!user.success) return res.status(400).json({ error: "No se encuentra el usuario" });

    return res.status(200).json({ message: "Usuario encontrado", user: user.data });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Error inesperado" });
  }
}

export async function getAllUsersController(req: Request, res: Response) {
  try {
    const data = await UserDAO.getAllUsers();
    if (!data.success) return res.status(400).json({ error: "No se consiguieron los usuarios" });

    return res.status(200).json({ message: "Usuarios", users: data.users });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Error inesperado" });
  }
}

export async function updateUserController(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ error: "Falta el id del usuario" });

    const updates = req.body;
    const updatedUser = await UserDAO.updateUser(userId, updates);

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Error inesperado" });
  }
}

export async function deleteUserById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const user = await UserDAO.getUserById(userId);
    if (!user.success) return res.status(404).json({ error: "El usuario no existe" });

    await UserDAO.deleteUser(userId);
    return res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Error inesperado" });
  }
}
