import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Copy } from 'lucide-react';

const SpeechComponent = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update interim results immediately for live feedback
        setInterimTranscript(interimTranscript);

        // Add final results to the permanent transcript
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
          setInterimTranscript(''); // Clear interim when we get final result
        }
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && speechSupported) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcript);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4">
        {!isListening ? (
          <button onClick={startListening} className="btn-primary flex items-center space-x-2">
            <Mic size={20} />
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2"
          >
            <MicOff size={20} />
            <span>Stop Recording</span>
          </button>
        )}

        {transcript && (
          <>
            <button onClick={clearTranscript} className="btn-secondary">Clear</button>
            <button onClick={copyToClipboard} className="btn-secondary flex items-center space-x-1">
              <Copy size={16} />
              <span>Copy</span>
            </button>
          </>
        )}
      </div>

      {isListening && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Listening...</span>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border rounded-lg p-6 min-h-[200px]">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Live Transcription</h3>
        <div className="text-gray-900 leading-relaxed">
          {/* Final transcript in black */}
          {transcript && <span className="text-gray-900">{transcript}</span>}

          {/* Interim transcript in blue italic for live feedback */}
          {interimTranscript && (
            <span className="text-blue-600 italic font-medium">{interimTranscript}</span>
          )}

          {/* Placeholder text when nothing is transcribed */}
          {!transcript && !interimTranscript && (
            <span className="text-gray-400">
              {speechSupported
                ? "Click 'Start Recording' and speak. Your speech will appear here in real-time."
                : "Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari."
              }
            </span>
          )}
        </div>
      </div>

      {/* Tips for live transcription */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Live Transcription Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Blue italic text</strong> shows live speech as you speak</li>
          <li>• <strong>Black text</strong> shows finalized transcription</li>
          <li>• Speak clearly and pause briefly between sentences</li>
          <li>• Works best in Chrome, Edge, and Safari browsers</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechComponent;
