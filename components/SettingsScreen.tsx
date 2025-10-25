import React, { useState } from 'react';
import { SettingsState, Category } from '../types';
import { AudioService } from '../services/audioService';

interface SettingsScreenProps {
  initialSettings: SettingsState;
  onSave: (settings: SettingsState) => void;
  onCancel: () => void;
  audioService: AudioService;
}

const categoryNames: Record<Category, string> = {
  general: 'عام',
  history: 'تاريخ',
  science: 'علوم',
  geography: 'جغرافيا',
  'art-literature': 'فن وأدب',
  sports: 'رياضة',
  islamic: 'إسلامية',
};

const AboutModal = ({ onClose, audioService }: { onClose: () => void; audioService: AudioService; }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl animate-pop-in m-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-3xl font-bold text-center text-amber-400 mb-6">حول لعبة "من سيربح المليون؟"</h3>
        <div className="space-y-6 text-right text-slate-200 text-lg max-h-[70vh] overflow-y-auto pr-2">
            <div>
                <h4 className="text-2xl font-bold text-amber-300 mb-2">الهدف من اللعبة</h4>
                <p>
                    مرحبًا بك في "من سيربح المليون؟"، التجربة الرقمية المستوحاة من البرنامج التلفزيوني العالمي الشهير. انطلق في رحلة معرفية مثيرة واختبر ثقافتك عبر 15 سؤالاً متدرج الصعوبة، من السهل إلى المليون. هدفك واضح: تسلق سلم الجوائز والوصول إلى القمة للفوز بالجائزة الكبرى!
                </p>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-amber-300 mb-2">طريقة اللعب والميزات الرئيسية</h4>
                <ul className="list-disc list-inside my-2 space-y-3">
                    <li><strong>بنك أسئلة شامل:</strong> تحتوي اللعبة على مئات الأسئلة المختارة بعناية في مجالات متنوعة تشمل العلوم، التاريخ، الجغرافيا، الفن والأدب، الرياضة، والمعلومات الإسلامية والعامة.</li>
                    <li><strong>وسائل المساعدة الاستراتيجية:</strong> تمامًا كما في البرنامج الأصلي، لديك ثلاث وسائل مساعدة ثمينة لمساعدتك في الأوقات الصعبة:
                        <ul className="list-['-_'] list-inside mt-2 mr-4 space-y-1">
                            <li><span className="font-semibold">حذف إجابتين (50:50):</span> لإزالة خيارين من الخيارات الخاطئة، مما يزيد من فرصك.</li>
                            <li><span className="font-semibold">سؤال الجمهور:</span> احصل على إحصائية حول كيفية تصويت الجمهور الافتراضي.</li>
                            <li><span className="font-semibold">اتصال بصديق:</span> اطلب نصيحة من صديق افتراضي للحصول على رأي ثانٍ.</li>
                        </ul>
                    </li>
                    <li><strong>نقاط الأمان (الضمان):</strong> لا تخرج خالي الوفاض! اللعبة تحتوي على محطتي أمان عند السؤال الخامس (1,000) والسؤال العاشر (32,000). بمجرد الوصول إلى إحدى هذه المحطات، تضمن الحصول على قيمتها حتى لو كانت إجابتك التالية خاطئة.</li>
                </ul>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-amber-300 mb-2">وضع التدريب بالذكاء الاصطناعي: قوة Gemini بين يديك</h4>
                <p>
                    هل ترغب في تحدي نفسك في موضوع معين؟ يتيح لك هذا الوضع الفريد توليد مجموعة كاملة من الأسئلة (15 سؤالاً) حول أي موضوع يخطر ببالك، مدعومًا بنموذج الذكاء الاصطناعي المتقدم Gemini من Google. ببساطة، أدخل موضوعًا مثل "تاريخ الدولة العباسية" أو "فيزياء الكم للمبتدئين"، ويمكنك حتى تحديد فئة عمرية مستهدفة لتخصيص صعوبة الأسئلة. إنها الطريقة المثلى للتعلم والمرح في آن واحد.
                </p>
            </div>
            <div>
                <h4 className="text-2xl font-bold text-amber-300 mb-2">عن المطور</h4>
                <p>تم تطوير هذه اللعبة بواسطة عبدالحميد العبري.</p>
                <p>للتواصل: <a href="mailto:alabri@gmail.com" className="text-emerald-400 hover:underline">alabri@gmail.com</a></p>
            </div>
        </div>
        <button onClick={onClose} className="mt-8 w-full py-2 bg-slate-600 hover:bg-slate-700 rounded-full text-lg">
          إغلاق
        </button>
      </div>
    </div>
);


const SettingsScreen: React.FC<SettingsScreenProps> = ({ initialSettings, onSave, onCancel, audioService }) => {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const processedValue = name === 'timerDuration' ? parseInt(value, 10) : value;
    setSettings(prev => ({ ...prev, [name]: processedValue as any }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    audioService.playClick();
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleCategoryToggle = (category: Category) => {
    audioService.playClick();
    setSettings(prev => {
        const currentCategories = prev.categories;
        let newCategories: Category[];

        if (category === 'general') {
            newCategories = ['general'];
        } else {
            const nonGeneralCategories = new Set<Category>(currentCategories.filter(c => c !== 'general'));
            
            if (nonGeneralCategories.has(category)) {
                nonGeneralCategories.delete(category);
            } else {
                nonGeneralCategories.add(category);
            }
            
            newCategories = [...nonGeneralCategories];

            if (newCategories.length === 0) {
                newCategories = ['general'];
            }
        }
        
        return { ...prev, categories: newCategories };
    });
  };
  
  const handleSave = () => {
    onSave(settings);
  };
  
  return (
    <>
      {showAboutModal && <AboutModal onClose={() => { audioService.playClick(); setShowAboutModal(false); }} audioService={audioService} />}
      <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg w-full max-w-2xl mx-auto animate-fade-in">
        <h2 className="text-4xl font-bold text-amber-400 mb-8">الإعدادات</h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="w-full space-y-6">
          {/* Difficulty Setting */}
          <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="difficulty" className="text-xl font-semibold text-slate-200">مستوى الصعوبة</label>
            <select
              id="difficulty"
              name="difficulty"
              value={settings.difficulty}
              onChange={handleSelectChange}
              onClick={() => audioService.playClick()}
              className="bg-slate-900 border border-slate-600 rounded-md p-2 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="mixed">متدرج</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>
          </div>

          {/* Category Setting */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label className="text-xl font-semibold text-slate-200 mb-4 sm:mb-0">تخصص السؤال</label>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end max-w-md">
              {Object.entries(categoryNames).map(([key, name]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleCategoryToggle(key as Category)}
                  className={`px-3 py-2 rounded-full text-base font-semibold transition-colors ${
                    settings.categories.includes(key as Category)
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Timer Setting */}
          <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="timerDuration" className="text-xl font-semibold text-slate-200">مدة المؤقت</label>
            <select
              id="timerDuration"
              name="timerDuration"
              value={settings.timerDuration}
              onChange={handleSelectChange}
              onClick={() => audioService.playClick()}
              className="bg-slate-900 border border-slate-600 rounded-md p-2 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="0">بدون وقت</option>
              <option value="30">30 ثانية</option>
              <option value="60">60 ثانية</option>
              <option value="90">90 ثانية</option>
            </select>
          </div>

          {/* Background Music Setting */}
          <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="backgroundMusicEnabled" className="text-xl font-semibold text-slate-200">موسيقى الخلفية</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                id="backgroundMusicEnabled"
                name="backgroundMusicEnabled"
                checked={settings.backgroundMusicEnabled}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Sound Effects Setting */}
          <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="soundEffectsEnabled" className="text-xl font-semibold text-slate-200">المؤثرات الصوتية</label>
             <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                id="soundEffectsEnabled"
                name="soundEffectsEnabled"
                checked={settings.soundEffectsEnabled}
                onChange={handleToggleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
          
           {/* TTS Setting */}
           <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg">
            <label htmlFor="ttsMode" className="text-xl font-semibold text-slate-200">قراءة السؤال (TTS)</label>
            <select
              id="ttsMode"
              name="ttsMode"
              value={settings.ttsMode}
              onChange={handleSelectChange}
              onClick={() => audioService.playClick()}
              className="bg-slate-900 border border-slate-600 rounded-md p-2 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="off">إيقاف</option>
              <option value="manual">يدوي (بالضغط على الأيقونة)</option>
              <option value="auto">تلقائي</option>
            </select>
          </div>


          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
             <button
              type="button"
              onClick={() => { audioService.playClick(); setShowAboutModal(true); }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
              حول اللعبة
            </button>
            <div className="flex-grow"></div>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default SettingsScreen;
