import admin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const idToken = authorization.split("Bearer ")[1];

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Guarda el usuario decodificado en la request
    (req as any).user = decodedToken;

    next(); // 🔥 Continua hacia la ruta
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}
