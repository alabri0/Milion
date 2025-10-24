import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface AudiencePollModalProps {
  question: Question;
  onClose: () => void;
}

const AudiencePollModal: React.FC<AudiencePollModalProps> = ({ question, onClose }) => {
    const [pollResults, setPollResults] = useState<{[key: string]: number}>({});
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const generatePoll = () => {
            const results: {[key: string]: number} = {};
            const options = Object.keys(question.options);
            let remainingPercentage = 100;

            // Give correct answer a higher chance
            const correctAnswerPercentage = Math.floor(Math.random() * 40) + 40; // 40% to 79%
            results[question.answer] = correctAnswerPercentage;
            remainingPercentage -= correctAnswerPercentage;

            const otherOptions = options.filter(opt => opt !== question.answer);
            otherOptions.forEach((opt, index) => {
                if (index === otherOptions.length - 1) {
                    results[opt] = remainingPercentage;
                } else {
                    const percentage = Math.floor(Math.random() * remainingPercentage);
                    results[opt] = percentage;
                    remainingPercentage -= percentage;
                }
            });

            // Sort keys to ensure consistent animation order (A, B, C, D)
            const sortedResults: {[key: string]: number} = {};
            Object.keys(results).sort().forEach(key => {
                sortedResults[key] = results[key];
            });

            setPollResults(sortedResults);
        };

        generatePoll();
        
        // Trigger animation shortly after the component mounts
        const timer = setTimeout(() => {
            setIsAnimating(true);
        }, 100);

        return () => clearTimeout(timer);

    }, [question]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-center text-amber-400 mb-6">سؤال الجمهور</h3>
        <div className="space-y-4">
          {Object.entries(pollResults).map(([option, percentage], index) => (
            <div key={option} className="flex items-center gap-4">
              <span className="font-bold text-xl w-8">{option}:</span>
              <div className="flex-grow bg-slate-700 rounded-full h-8 overflow-hidden">
                <div
                  className="bg-emerald-600 h-8 rounded-full flex items-center justify-end px-2 transition-all duration-700 ease-out"
                  style={{
                    width: isAnimating ? `${percentage}%` : '0%',
                    transitionDelay: `${index * 150}ms`,
                  }}
                >
                  {/* FIX: Cast percentage to number for comparison. Due to TypeScript's inference on Object.entries, 'percentage' is typed as 'unknown'. */}
                  {isAnimating && (percentage as number) > 5 && (
                     <span 
                        className="font-bold opacity-0 animate-fade-in" 
                        style={{ animationDelay: `${index * 150 + 400}ms`, animationFillMode: 'forwards' }}
                     >
                        {percentage}%
                     </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-8 w-full py-2 bg-slate-600 hover:bg-slate-700 rounded-full text-lg">
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default AudiencePollModal;