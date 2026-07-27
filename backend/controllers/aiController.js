const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const ai = require("../config/geminiConfig");
const mongoose = require("mongoose");

// @desc    Automatically generate 100% Live Dynamic Quiz questions using Gemini AI
// @route   POST /api/quiz/generate
// @access  Private (Teacher or Admin)
const generateAIQuiz = async (req, res) => {
  try {
    const { title, topic, courseId, difficulty, numberOfQuestions } = req.body;
    const finalDifficulty = difficulty || "Easy";

    // 1. Authorization Guard

    if (
      !req.user ||
      !req.user.role ||
      (req.user.role.toLowerCase() !== "teacher" &&
        req.user.role.toLowerCase() !== "admin")
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Unauthorized role." });
    }

    // 2. Validate course selection
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid target course.",
      });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: "Target course not found in database.",
      });
    }

    const currentTopic = topic || courseExists.title;
    const qCount = numberOfQuestions || 10;

    // 3. Strict Prompt for Practical Code Snippets + Conceptual Theory
    const prompt = `
      You are an expert educational quiz creator.
      Generate exactly ${qCount} high-quality multiple-choice questions dynamically for the topic: "${currentTopic}".
      Target Difficulty Level: "${finalDifficulty}".

      CRITICAL QUESTION GENERATION RULES:

      1. DO NOT return pre-written, generic, or static templates.
        Every question MUST be specifically related to "${currentTopic}".

      2. Create a balanced mix of:
        - Application-based questions:
          (Examples: problem solving, real-world scenarios, case studies, calculations, analysis, practical situations depending on the topic)
        - Conceptual/Theoretical questions:
          (Examples: definitions, principles, rules, theories, comparisons, processes, important facts)

      3. Adapt the question style according to the topic:
        - For programming/technical topics:
          Include code analysis, debugging, output prediction, algorithms, architecture, and concepts.
        - For science topics:
          Include experiments, concepts, formulas, processes, and applications.
        - For humanities/social science topics:
          Include events, concepts, analysis, causes/effects, and interpretations.
        - For business/finance topics:
          Include scenarios, decision making, strategies, and calculations.
        - For any other topic:
          Generate questions appropriate for that subject domain.

      4. Questions must test understanding and reasoning, not only memorization.

      5. Each question MUST contain exactly 4 answer choices under "answerOptions".

      6. Exactly ONE option must have "isCorrect": true.
        The remaining three options must have "isCorrect": false.

      7. Every option MUST contain a detailed "rationale":
        - Explain why the correct option is correct.
        - Explain why incorrect options are wrong or less appropriate.

      7.1. Correct answers MUST be randomly distributed among A, B, C, and D.
          Do not always place the correct answer in the same position.
          The correct option position should vary randomly across all questions.
      8. Keep questions clear, accurate, and suitable for the given difficulty level.

      9. For numerical or calculation based questions:
        - Use clear mathematical formatting.
        - Keep formulas readable inside questionText.
        - Mention all required values with units.
        - Avoid confusing symbols.
        - Provide step-by-step friendly questions suitable for beginners.

      10. For code based questions:
        - Keep code snippets short and properly formatted.
        - Use simple examples.
        - Avoid complex syntax.

      11. Generate questions for any educational domain including:
        Computer Science, Engineering, Science, Mathematics, Commerce, Management, Arts, Medical or any other subject.

      12. Return ONLY a raw valid JSON array. Do not include markdown, explanations, or extra text.

      Return JSON in exactly this format:

      [
        {
          "questionText": "Question statement here",
          "answerOptions": [
            {
              "text": "Option A",
              "isCorrect": false,
              "rationale": "Explanation why this option is incorrect"
            },
            {
              "text": "Option B",
              "isCorrect": true,
              "rationale": "Explanation why this option is correct"
            },
            {
              "text": "Option C",
              "isCorrect": false,
              "rationale": "Explanation why this option is incorrect"
            },
            {
              "text": "Option D",
              "isCorrect": false,
              "rationale": "Explanation why this option is incorrect"
            }
          ],
          "hint": "A helpful hint that guides the learner without revealing the answer",
          "difficulty": "${finalDifficulty}"
        }
      ]
      `;
    // 4. Invoke Live Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Higher rate limits & faster output
      contents: prompt,
    });

    // 5. Extract raw response text safely
    let rawText = "";
    if (typeof response.text === "function") {
      rawText = response.text();
    } else if (response.text) {
      rawText = response.text;
    } else if (
      response.response &&
      typeof response.response.text === "function"
    ) {
      rawText = response.response.text();
    }

    // Clean JSON string using Regex extraction
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    } else {
      rawText = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
    }

    // Parse AI Questions Payload
    // Remove invalid control characters before JSON parsing
    rawText = rawText
      .replace(/[\u0000-\u001F]+/g, " ")
      .replace(/\\n/g, "\\n")
      .trim();

    let parsedQuestions;

    try {
      parsedQuestions = JSON.parse(rawText);
      parsedQuestions = parsedQuestions.map(q => {
    q.answerOptions.sort(() => Math.random() - 0.5);
    return q;
      });
    } catch (parseError) {
      console.log("JSON Parse Failed");
      console.log(rawText);

      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON format",
        error: parseError.message,
      });
    }

    // 6. Save Live Generated Quiz into MongoDB Atlas
    const newQuiz = await Quiz.create({
      title: title || `${currentTopic} AI Quiz`,
      topic: currentTopic,
      courseId,
      creator: req.user._id,
      questions: parsedQuestions,
      isAssigned: false,
    });

    return res.status(201).json({
      success: true,
      message: "100% Dynamic AI Quiz generated successfully!",
      data: newQuiz,
    });
  } catch (error) {
    console.error("Gemini AI Quiz Generation Error:", error);

    // Friendly message if API key hits Quota Limits
    if (
      error.message &&
      (error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("RESOURCE_EXHAUSTED"))
    ) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini AI API rate limit reached. Please update GEMINI_API_KEY in .env or try again in a minute.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error generating AI quiz.",
      error: error.message,
    });
  }
};

module.exports = { generateAIQuiz };
