import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { id, email } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Team ID is required" });
    }

    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.createdBy !== email) {
      return res.status(403).json({
        error: "Forbidden: You are not authorized to delete this team",
      });
    }
    await prisma.team.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
