const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const ai = require('../config/geminiConfig');

// @desc    Submit quiz answers, auto-grade, and perform AI knowledge-gap analysis
// @route   POST /api/submissions/submit
// @access  Private (Student)
const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers array: [{ questionId, selectedOptionText }]

    // 1. Fetch the original quiz question bank
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    let correctCount = 0;
    const evaluatedAnswers = [];
    const incorrectQuestionsContext = [];

    // 2. Loop through quiz questions and cross-verify with student selections
    quiz.questions.forEach((question) => {
      const studentAnswer = answers.find(ans => ans.questionId === question._id.toString());
      const selectedText = studentAnswer ? studentAnswer.selectedOptionText : 'No Answer Provided';
      
      // Find matching option details in our question bank
      const targetOption = question.answerOptions.find(opt => opt.text === selectedText);
      const isCorrect = targetOption ? targetOption.isCorrect : false;

      if (isCorrect) {
        correctCount++;
      } else {
        // Collect context on missed questions to pipe into the Gemini gap analysis engine
        incorrectQuestionsContext.push({
          questionText: question.questionText,
          selectedText: selectedText,
          hintProvided: question.hint,
          optionsConfig: question.answerOptions
        });
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOptionText: selectedText,
        isCorrect: isCorrect
      });
    });

    const totalQuestions = quiz.questions.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(2);

    // 3. Adaptive Engine: Formulate prompt if student missed items
    let gapAnalysisText = "Perfect score! You have completely mastered this evaluation track.";

    if (incorrectQuestionsContext.length > 0) {
      const prompt = `
        You are an adaptive AI learning assistant. A student just completed a technical evaluation on the topic: "${quiz.topic}".
        They scored ${correctCount} out of ${totalQuestions} (${percentage}%).
        
        Analyze their incorrect responses below and write a highly constructive, personalized, and encouraging diagnostic summary in clean, concise English. 
        Identify their exact technical knowledge gap and explicitly suggest what concepts they need to re-study.
        
        Incorrect Responses Context:
        ${JSON.stringify(incorrectQuestionsContext, null, 2)}
        
        Provide only the clean paragraph feedback text without markdown containers or JSON formatting. Keep it within 3-4 professional sentences.
      `;

      // Invoke Gemini to generate context-specific diagnosis
      const response = await ai.models.generateContent({
        model: '',
        contents: prompt,
      });

      gapAnalysisText = response.text.trim();
    }

    // 4. Persist the grading and gap analysis profile directly to MongoDB
    const newSubmission = await Submission.create({
      student: req.user._id,
      quiz: quizId,
      courseId: quiz.courseId,
      answers: evaluatedAnswers,
      score: correctCount,
      totalQuestions: totalQuestions,
      percentage: parseFloat(percentage),
      knowledgeGapFeedback: gapAnalysisText
    });

    res.status(201).json({
      success: true,
      message: 'Evaluation graded and diagnostic profile compiled successfully.',
      data: newSubmission
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error processing grading profile.', error: error.message });
  }
};



// @desc    Get comprehensive dashboard analytics for the logged-in student
// @route   GET /api/submissions/dashboard
// @access  Private (Student)
const getStudentDashboard = async (req, res) => {
  try {
    // 1. Fetch all previous submissions belonging to this student
    const history = await Submission.find({ student: req.user._id })
      .populate('quiz', 'title topic')
      .sort({ createdAt: -1 }); // Latest test first

    if (!history || history.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No simulation history found yet. Take your first quiz to unlock insights!',
        analytics: { totalQuizzesTaken: 0, overallAverageScore: 0, knowledgeGaps: [] }
      });
    }

    // 2. Compute performance metrics
    const totalQuizzesTaken = history.length;
    let totalPercentageSum = 0;
    const knowledgeGaps = [];

    history.forEach((sub) => {
      totalPercentageSum += sub.percentage;
      
      // If student scored less than 70%, extract their AI feedback as a priority weak zone
      if (sub.percentage < 70 && sub.knowledgeGapFeedback) {
        knowledgeGaps.push({
          quizTitle: sub.quiz ? sub.quiz.title : 'Deleted Evaluation Track',
          topic: sub.quiz ? sub.quiz.topic : 'General Technical Domain',
          scoreAchieved: `${sub.score}/${sub.totalQuestions}`,
          percentage: sub.percentage,
          diagnosticFeedback: sub.knowledgeGapFeedback,
          dateEvaluated: sub.createdAt
        });
      }
    });

    const overallAverageScore = (totalPercentageSum / totalQuizzesTaken).toFixed(2);

    res.status(200).json({
      success: true,
      count: totalQuizzesTaken,
      analytics: {
        totalQuizzesTaken,
        overallAverageScore: parseFloat(overallAverageScore),
        performanceStatus: overallAverageScore >= 75 ? 'Excellent' : overallAverageScore >= 50 ? 'Needs Improvement' : 'Critical Focus Required',
        knowledgeGaps // Array of all topics where student is struggling
      },
      history // Send complete detailed log for historical tables
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error pulling dashboard analytics matrix.', error: error.message });
  }
};

module.exports = { submitQuiz, getStudentDashboard };

