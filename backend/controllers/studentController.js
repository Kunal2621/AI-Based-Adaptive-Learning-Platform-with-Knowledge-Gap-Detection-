const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const ai = require('../config/geminiConfig'); // Gemini connection for smart adaptive feedback

// @desc    Get live dynamic analytics and AI recommendations for Student Dashboard
// @route   GET /api/student/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;
    const studentName = req.user.name || "Learner";

    // 1. Fetch real submissions from Live Database
    const realSubmissions = await Submission.find({ student: studentId }).populate('quiz');

    // 2. Aggregate counts and averages dynamically
    const enrolledCoursesCount = await Course.countDocuments({}); // Platform live courses active count
    const quizzesTaken = realSubmissions.length;

    let totalScoreSum = 0;
    let quizHistory = [];
    let topicTracking = {};

    realSubmissions.forEach((sub, index) => {
      totalScoreSum += sub.percentage;
      
      // Build real historical track map
      quizHistory.push({
        name: sub.quiz?.title || `Quiz ${index + 1}`,
        score: sub.percentage
      });

      // Track weak categories/topics to filter knowledge gaps
      const topicName = sub.quiz?.topic || "General Core";
      if (!topicTracking[topicName]) {
        topicTracking[topicName] = { total: 0, count: 0 };
      }
      topicTracking[topicName].total += sub.percentage;
      topicTracking[topicName].count += 1;
    });

    const avgScore = quizzesTaken > 0 ? Math.round(totalScoreSum / quizzesTaken) : 0;

    // Filter weak topics where score is less than 60% (Knowledge Gaps)
    let knowledgeGapsCount = 0;
    let weakestTopic = "Advanced Core Concepts";
    let lowestScore = 100;

    // Convert topic map to array for chart binding compatibility
    let topicScores = Object.keys(topicTracking).map(topic => {
      const computedAvg = Math.round(topicTracking[topic].total / topicTracking[topic].count);
      if (computedAvg < 60) {
        knowledgeGapsCount++;
      }
      if (computedAvg < lowestScore) {
        lowestScore = computedAvg;
        weakestTopic = topic;
      }
      return { subject: topic, A: computedAvg, fullMark: 100 };
    });

    // Baseline fallbacks if new profile database has empty submissions array
    if (topicScores.length === 0) {
      topicScores = [
        { subject: "Core Domain", A: 75, fullMark: 100 },
        { subject: "Architecture", A: 80, fullMark: 100 }
      ];
    }

    const stats = {
      enrolledCourses: enrolledCoursesCount || 1,
      quizzesTaken,
      avgScore: avgScore || 0,
      knowledgeGaps: knowledgeGapsCount,
      overallProgress: avgScore ? Math.min(avgScore + 5, 95) : 50, // Floating growth index
      quizHistory: quizHistory.length > 0 ? quizHistory : [{ name: "Initial Scan", score: 0 }],
      topicScores
    };

    // 3. Fetch real live courses available for student view context
    const enrolledCourses = await Course.find().limit(3);

    // Formulate real-time recent quiz collection arrays
    const recentQuizzes = realSubmissions.slice(-2).map(sub => ({
      _id: sub._id,
      quizTitle: sub.quiz?.title || "AI Evaluation Session",
      score: sub.percentage,
      createdAt: sub.createdAt
    }));

    // 🔥 DYNAMIC AI GENERATION: Gemini diagnoses weak point patterns and builds study tips!
    let recommendations = [
      { topic: "System Onboarding", suggestion: "Welcome! Complete your first automated technical track evaluation to unlock active recommendations." }
    ];

    if (quizzesTaken > 0 && lowestScore < 75) {
      const aiPrompt = `
        You are an advanced adaptive diagnostic learning engine. 
        A student named ${studentName} completed quizzes on this platform.
        Their weakest performant module cluster topic is: "${weakestTopic}" with a performance score of ${lowestScore}%.
        
        Write a concise, precise, and practical recommendation summary (maximum 2 short sentences). 
        Address the user directly in a professional tone, advising what exact specific patterns or concepts they need to revise to bridge this knowledge gap.
      `;

      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: aiPrompt,
        });

        recommendations = [{
          topic: weakestTopic,
          suggestion: aiResponse.text.trim()
        }];
      } catch (aiErr) {
        // Safe backend fallback if API limit chokes up
        recommendations = [{
          topic: weakestTopic,
          suggestion: `Performance on ${weakestTopic} dropped below threshold benchmarks. Focus on reference architectural rules.`
        }];
      }
    }

    const notifications = [
      { _id: "n1", title: "Adaptive Diagnostic Engaged", message: `Hello ${studentName}, platform telemetry has synced your profiles successfully.` }
    ];

    // Perfect structural encapsulation mapping teammate front-end
    res.status(200).json({
      success: true,
      data: {
        stats,
        enrolledCourses,
        recentQuizzes,
        recommendations,
        notifications
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Side Aggregation Error', error: error.message });
  }
};

module.exports = { getStudentDashboard };