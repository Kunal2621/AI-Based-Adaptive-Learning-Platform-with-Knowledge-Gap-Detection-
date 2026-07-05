import {
  BookOpen,
  GraduationCap,
  Trophy,
  AlertTriangle,
  Brain,
  FileText,
  UserPlus,
  Clock,
  Flame,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const getNotificationIcon = (type) => {
  switch (type) {
    case "COURSE_STARTED":
      return <BookOpen className="w-6 h-6 text-blue-600" />;

    case "COURSE_COMPLETED":
      return <GraduationCap className="w-6 h-6 text-green-600" />;

    case "LOW_SCORE":
      return <AlertTriangle className="w-6 h-6 text-red-600" />;

    case "HIGH_SCORE":
      return <Trophy className="w-6 h-6 text-yellow-500" />;

    case "KNOWLEDGE_GAP":
      return <Brain className="w-6 h-6 text-purple-600" />;

    case "ASSIGNMENT":
      return <FileText className="w-6 h-6 text-indigo-600" />;

    case "ENROLLED":
      return <UserPlus className="w-6 h-6 text-cyan-600" />;

    case "INACTIVE":
      return <Clock className="w-6 h-6 text-red-500" />;

    case "STREAK":
      return <Flame className="w-6 h-6 text-orange-500" />;

    case "HELP":
      return <HelpCircle className="w-6 h-6 text-pink-600" />;

    case "AI_LEVEL":
      return <TrendingUp className="w-6 h-6 text-violet-600" />;

    case "QUIZ_PASS":
      return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;

    default:
      return <BookOpen className="w-6 h-6 text-gray-600" />;
  }
};