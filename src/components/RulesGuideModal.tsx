import React from 'react';
import { X, BookOpen, Star, Sparkles, Swords, Crown } from 'lucide-react';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">लूडो के नियम (Game Rules)</h2>
              <p className="text-xs text-slate-500">क्लासिक 4-प्लेयर लूडो गाइड</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 max-h-[60vh] overflow-y-auto pr-1">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/50">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">1. पासे में 6 आना:</span>
              <p className="mt-0.5 text-slate-600">
                पासे में 6 आने पर आप अपने यार्ड से नई गोटी बाहर निकाल सकते हैं या किसी खुली गोटी को 6 कदम आगे बढ़ा सकते हैं। 6 आने पर आपको <strong>अतिरिक्त चाल (Extra Turn)</strong> मिलती है!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/70 border border-red-200/50">
            <Swords className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">2. गोटी काटना (Capture / Kill):</span>
              <p className="mt-0.5 text-slate-600">
                यदि आपकी गोटी किसी विरोधी खिलाड़ी की गोटी वाले सामान्य वर्ग पर रुकती है, तो विरोधी की गोटी कटकर वापस यार्ड में चली जाती है, और आपको <strong>एक बोनस रोल</strong> मिलता है!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/50">
            <Star className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">3. सुरक्षित स्थान (Safe Star Spots):</span>
              <p className="mt-0.5 text-slate-600">
                बोर्ड पर स्टार (⭐) बने 8 स्थान सुरक्षित होते हैं (प्रत्येक खिलाड़ी का शुरुआती वर्ग और 8वां वर्ग)। यहाँ किसी भी खिलाड़ी की गोटी नहीं काटी जा सकती।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-200/50">
            <Crown className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">4. होम और जीत का नियम:</span>
              <p className="mt-0.5 text-slate-600">
                अपने रंगीन होम कॉरिडोर से होते हुए सेंटर ट्रायंगल में जाने के लिए पासे में <strong>सटीक अंक</strong> आना आवश्यक है। जो खिलाड़ी सबसे पहले अपनी चारों गोटियों को होम पहुंचाता है, वह विजेता बनता है!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            समझ गया (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
