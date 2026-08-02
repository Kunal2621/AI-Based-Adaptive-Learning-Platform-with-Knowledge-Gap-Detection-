import React from 'react';

/**
 * QuizQuestion Component
 * Handles index-based selections and safe option extraction for any quiz schema.
 */
export default function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}) {
  if (!question) return null;

  // Extract question properties with fallback schemas
  const { _id, questionText, topic = "General Architecture" } = question;
  const rawOptions = question.answerOptions || question.options || [];

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

      {/* Question Heading */}
      <p className="text-base font-semibold leading-relaxed text-gray-800">
        {questionText || question.question || "Question Text Missing"}
      </p>

      {/* MCQ Options Grid */}
      <div className="space-y-3">
        {rawOptions.length === 0 ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
            ⚠️ No options found for this question.
          </div>
        ) : (
          rawOptions.map((opt, idx) => {
            // Extract option text whether opt is Object or String
            const optionText = typeof opt === "string" ? opt : (opt?.text || opt?.optionText || "");
            
            // Safe index matching
            const isSelected = selectedAnswer === idx || Number(selectedAnswer) === idx;

            return (
              <button
                key={opt._id || idx}
                type="button"
                onClick={() => onAnswer(_id, idx)} // Always pass index (0, 1, 2)
                className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 group text-sm cursor-pointer ${
                  isSelected
                    ? "border-purple-600 bg-purple-50/40"
                    : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/10"
                }`}
              >
                {/* Alpha Enumerator Box (A, B, C, D) */}
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isSelected
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-700"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>

                {/* Option Label Text */}
                <span className={`flex-1 leading-normal ${isSelected ? "text-purple-900 font-semibold" : "text-gray-700"}`}>
                  {optionText}
                </span>

                {/* Selected Checkmark Vector Icon */}
                {isSelected && (
                  <span className="text-purple-600 bg-purple-100/50 p-1 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}