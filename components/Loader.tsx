import React, { useState, useEffect } from 'react';

// Array of funny/sarcastic messages
const loadingMessages = [
  "AI से आपके लिए सवाल उधार ले रहे हैं...",
  "रोबोट को यह सोचने पर मजबूर कर रहे हैं कि वह स्मार्ट है...",
  "क्या आप जानते हैं? इंतज़ार करने से... आप इंतज़ार करते हैं।",
  "ब्रह्मांड के रहस्य सुलझा रहे हैं (या बस गूगल कर रहे हैं)...",
  "बस हो गया... शायद। AI आज थोड़ा सुस्त है।",
  "प्रश्नों को अल्फाबेटिकल ऑर्डर में लगा रहे हैं... नहीं, सच में नहीं।",
  "पिक्सेल पॉलिश कर रहे हैं ताकि सब कुछ चमकदार दिखे।",
  "थोड़ा इंतज़ार करें, AI अपनी कॉफ़ी खत्म कर रहा है।",
  "लोडिंग बार को जानबूझकर धीमा कर रहे हैं ताकि आप इसे पढ़ सकें।",
  "यदि यह बहुत अधिक समय लेता है, तो शायद आपका इंटरनेट कछुए की चाल चल रहा है।",
  "थोड़ी देर और... हम वादा करते हैं कि यह बिल्लियों के वीडियो देखने लायक है।",
  "क्या यह अभी तक लोड हो गया? नहीं? ठीक है, मैं एक झपकी ले लूँगा।",
];

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    // This simulates progress. The actual load time is unknown.
    // We'll make it progress up to 95% and then wait.
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        const next = prev + Math.random() * 5; // variable increment
        return Math.min(next, 95);
      });
    }, 400); // update every 400ms

    return () => clearInterval(progressInterval);
  }, []);

  useEffect(() => {
    // Cycle through messages every 2 seconds
    const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in w-full max-w-md">
      <svg className="animate-spin h-12 w-12 text-orange-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-xl font-semibold text-gray-700">{message}</p>
      
      <div className="w-full mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-500">{loadingMessages[currentMessageIndex]}</span>
          <span className="text-sm font-medium text-gray-700 font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-orange-100 rounded-full h-2.5">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};