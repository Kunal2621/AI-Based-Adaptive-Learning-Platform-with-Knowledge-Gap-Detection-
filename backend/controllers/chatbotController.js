const ChatSession = require('../models/ChatSession');
const ai = require('../config/geminiConfig');

// @desc    List the logged-in student's chat sessions (sidebar list)
// @route   GET /api/chatbot/sessions
// @access  Private (Student)
const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ student: req.user._id })
      .select('sessionTitle createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single chat session with full message history
// @route   GET /api/chatbot/sessions/:id
// @access  Private (Student)
const getSessionById = async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, student: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Chat session not found' });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message to the AI tutor, creating a session if needed
// @route   POST /api/chatbot/message
// @access  Private (Student)
const postMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    let session = sessionId
      ? await ChatSession.findOne({ _id: sessionId, student: req.user._id })
      : null;

    if (!session) {
      session = await ChatSession.create({
        student: req.user._id,
        sessionTitle: message.slice(0, 50),
        messages: [],
      });
    }

    session.messages.push({ role: 'user', content: message, timestamp: new Date() });

    // Build lightweight conversation context for Gemini
    const history = session.messages
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
      .join('\n');

    let replyText;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Knowledge Guru AI, a friendly and precise learning tutor. Continue this conversation and answer the student's latest message clearly and helpfully.\n\n${history}\n\nTutor:`,
      });
      replyText = response.text.trim();
    }catch (aiErr) {
      console.error('❌ Gemini API call failed:', aiErr);
      replyText = "Sorry, I'm having trouble reaching the AI service right now. Please try again in a moment.";
    }

    const timestamp = new Date();
    session.messages.push({ role: 'assistant', content: replyText, timestamp });
    await session.save();

    res.status(200).json({
      success: true,
      data: { sessionId: session._id, message: replyText, timestamp },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a chat session
// @route   DELETE /api/chatbot/sessions/:id
// @access  Private (Student)
const deleteSession = async (req, res) => {
  try {
    await ChatSession.deleteOne({ _id: req.params.id, student: req.user._id });
    res.status(200).json({ success: true, message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSessions, getSessionById, postMessage, deleteSession };
