import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface PhoneFriendModalProps {
  question: Question;
  onClose: () => void;
}

const RESPONSES = [
    "أنا شبه متأكد أنها {ANSWER}",
    "أعتقد أن الإجابة هي {ANSWER}",
    "لست متأكداً تماماً، لكني أميل إلى {ANSWER}",
    "سؤال صعب... ربما {ANSWER}؟",
    "بكل ثقة، الجواب هو {ANSWER}!",
];

const PhoneFriendModal: React.FC<PhoneFriendModalProps> = ({ question, onClose }) => {
    const [friendResponse, setFriendResponse] = useState(" أفكر...");
    const [isThinking, setIsThinking] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            const randomResponseTemplate = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
            
            // Give a higher chance of being correct
            const isCorrect = Math.random() > 0.2; // 80% chance of being correct
            const answerKey = isCorrect 
                ? question.answer 
                : Object.keys(question.options).filter(o => o !== question.answer)[Math.floor(Math.random() * 3)];
            
            const answerText = question.options[answerKey];

            setFriendResponse(randomResponseTemplate.replace('{ANSWER}', `"${answerText}"`));
            setIsThinking(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [question]);


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center animate-pop-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-center text-amber-400 mb-6">اتصال بصديق</h3>
        <div className="h-24 flex items-center justify-center p-4 bg-slate-900 rounded-lg">
            {isThinking ? (
                 <div className="animate-pulse text-slate-300 text-xl">...الصديق يفكر</div>
            ) : (
                <p className="text-xl text-white">{friendResponse}</p>
            )}
        </div>
        <button onClick={onClose} disabled={isThinking} className="mt-8 w-full py-2 bg-slate-600 hover:bg-slate-700 rounded-full text-lg disabled:opacity-50 disabled:cursor-wait">
          شكراً لك، إغلاق
        </button>
      </div>
    </div>
  );
};

export default PhoneFriendModal;