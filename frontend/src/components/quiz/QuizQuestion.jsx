/**
 * QuizQuestion
 * Props:
 *   question        – question object directly pulled from the active MongoDB schema index
 *   questionNumber  – 1-based sequential tracking count
 *   totalQuestions  – length validation variable bound
 *   selectedAnswer  – raw selected options key mapping parameters string
 *   onAnswer        – custom execution hook parameter: (questionId, textValue) => void
 */
export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}) {
  if (!question) return null;

  // FIXED: Pulling 'answerOptions' from target Mongoose model properties instead of 'options'
  const { _id, questionText, answerOptions = [], topic = "General Architecture" } = question;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5 shadow-sm">
      {/* Structural Metadata Rows */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-full border border-purple-100">
          Q {questionNumber} of {totalQuestions}
        </span>
        {topic && (
          <span className="px-2 py-1 bg-gray-50 border text-gray-500 rounded-full font-medium">
            {topic}
          </span>
        )}
      </div>

      {/* Question context display heading */}
      <p className="text-base font-semibold leading-relaxed text-gray-800">
        {questionText}
      </p>

      {/* MCQ Multi Option Interactivity Loops Matrix Grid */}
      <div className="space-y-3">
        {answerOptions.map((opt, idx) => {
          // FIXED: Safeguarding object loop fields unpacking opt.text accurately
          const optionText = opt.text || "";
          const isSelected = selectedAnswer === optionText;

          return (
            <button
              key={opt._id || idx}
              type="button"
              onClick={() => onAnswer(_id, optionText)}
              className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 group text-sm ${
                isSelected
                  ? "border-purple-600 bg-purple-50/40"
                  : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/10"
              }`}
            >
              {/* Alpha Enumerator Character Circle Box */}
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                  isSelected
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-700"
                }`}
              >
                {String.fromCharCode(65 + idx)}
              </span>

              {/* Functional Dynamic Label String displays values */}
              <span className={`flex-1 leading-normal ${isSelected ? "text-purple-900 font-semibold" : "text-gray-700"}`}>
                {optionText}
              </span>

              {/* Status Checked vector overlays */}
              {isSelected && (
                <span className="text-purple-600 bg-purple-100/50 p-1 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}