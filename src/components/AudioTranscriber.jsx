import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon, DocumentTextIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useUploadAndTranscribeMutation } from '../store/api/transcriptionApi';

const AudioTranscriber = ({ file, onTranscriptionComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  const audioRef = useRef(null);

  const [uploadAndTranscribe, { isLoading: isProcessing }] = useUploadAndTranscribeMutation();


  useEffect(() => {
    initializeAudio();
    return () => {
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [file]);

  const initializeAudio = () => {
    if (audioRef.current) return;

    const audio = new Audio();
    const fileURL = URL.createObjectURL(file);
    audio.src = fileURL;
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
  };

  const processAudioFile = async () => {
    setError('');
    setTranscript('');

    try {
      const result = await uploadAndTranscribe(file).unwrap();

      const fileInfo = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type || 'audio file',
        duration: duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : 'Unknown'
      };

      const formattedResult = `File: ${fileInfo.name}
Size: ${fileInfo.size} MB
Duration: ${fileInfo.duration}

${result.transcription}`;

      setTranscript(formattedResult);

      if (onTranscriptionComplete) {
        onTranscriptionComplete(formattedResult);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      setError(error.message || 'Transcription failed');
      // Fallback to demo mode on error
      await processDemoMode();
    }
  };







  const processDemoMode = async () => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    const fileInfo = {
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type || 'audio file',
      duration: duration ? `${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}` : 'Unknown'
    };

    const demoTranscription = `File: ${fileInfo.name}
Size: ${fileInfo.size} MB
Duration: ${fileInfo.duration}

Demo transcription - API temporarily unavailable.`;

    setTranscript(demoTranscription);
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Audio Transcription</h3>
        <div className="text-sm text-gray-500">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* File Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3">
          <DocumentTextIcon className="h-8 w-8 text-blue-500" />
          <div>
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || 'Audio file'}
            </p>
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={isPlaying ? pauseAudio : playAudio}
          disabled={isProcessing}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white p-3 rounded-full transition-colors duration-200"
        >
          {isPlaying ? (
            <PauseIcon className="h-6 w-6" />
          ) : (
            <PlayIcon className="h-6 w-6" />
          )}
        </button>

        <button
          onClick={stopAudio}
          disabled={isProcessing}
          className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white p-3 rounded-full transition-colors duration-200"
        >
          <StopIcon className="h-6 w-6" />
        </button>

        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-200"
              style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>

        <button
          onClick={processAudioFile}
          disabled={isProcessing}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          {isProcessing ? 'Processing...' : 'Transcribe Audio'}
        </button>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <div>
              <h4 className="font-medium text-blue-900">Processing...</h4>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            <p className="text-red-700 font-medium">Error</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}



      {/* Transcription Output */}
      <div className="bg-gray-50 border rounded-lg p-4 min-h-[200px]">
        <h4 className="font-medium text-gray-900 mb-3">Results</h4>
        <div className="text-gray-900 leading-relaxed">
          {transcript ? (
            <pre className="whitespace-pre-wrap font-sans">{transcript}</pre>
          ) : (
            <span className="text-gray-400">
              No transcription yet.
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {transcript && (
        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => navigator.clipboard.writeText(transcript)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Copy
          </button>
          <button
            onClick={() => setTranscript('')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Clear
          </button>
          <button
            onClick={() => {
              const element = document.createElement('a');
              const file = new Blob([transcript], { type: 'text/plain' });
              element.href = URL.createObjectURL(file);
              element.download = `transcription-${file.name.split('.')[0]}.txt`;
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
};

export default AudioTranscriber;
