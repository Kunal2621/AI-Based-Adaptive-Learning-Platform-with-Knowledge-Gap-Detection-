import React from "react";
import {
  Brain,
  BookOpen,
  BarChart3,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: <Brain size={22} />,
    title: "AI Personalized Learning",
    description: "Adaptive learning paths based on student performance.",
  },
  {
    icon: <BookOpen size={22} />,
    title: "Smart Quiz Generation",
    description: "Automatically generate quizzes using AI.",
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Performance Analytics",
    description: "Track progress with detailed reports and insights.",
  },
  {
    icon: <Sparkles size={22} />,
    title: "Knowledge Gap Detection",
    description: "Identify weak topics and improve learning outcomes.",
  },
];

const LeftPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#5B4BDB] to-[#7C3AED] text-white px-10 py-8 flex-col justify-center">

      <h1 className="text-4xl xl:text-5xl font-bold mb-4">
        Knowledge Guru
      </h1>

      <p className="text-lg text-purple-100 leading-8 mb-10">
        AI-Based Adaptive Learning Platform with Knowledge Gap Detection.
        Learn smarter, practice better, and improve continuously with AI.
      </p>

      <div className="space-y-5">
        {features.map((item, index) => (
          <div key={index} className="flex gap-4">

            <div className="bg-white/20 rounded-xl p-2.5">
              {item.icon}
            </div>

            <div>
              <h3 className="font-semibold text-base">
                {item.title}
              </h3>

              <p className="text-purple-100 text-xs mt-1 leading-5">
                {item.description}
              </p>
            </div>

          </div>
        ))}
      </div>

      <div className="mt-8 bg-white/10 rounded-xl p-4 backdrop-blur-md">

        <div className="flex items-center gap-2 mb-2">

          <CheckCircle size={20} />

          <span className="font-semibold">
            Trusted Learning Experience
          </span>

        </div>

        <p className="text-sm text-purple-100">
          Personalized recommendations, AI-generated quizzes,
          teacher analytics, and student performance tracking —
          all in one intelligent platform.
        </p>

      </div>

    </div>
  );
};

export default LeftPanel;