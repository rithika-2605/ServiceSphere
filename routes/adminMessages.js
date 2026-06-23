// routes/adminMessages.js
import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

// GET messages as JSON
router.get("/admin/messages", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ submittedAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// DELETE a message
router.delete("/admin/messages/delete", async (req, res) => {
  try {
    const { messageId } = req.body;
    await ContactMessage.findByIdAndDelete(messageId);
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
});

export default router;
