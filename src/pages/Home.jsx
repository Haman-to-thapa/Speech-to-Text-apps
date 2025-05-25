import SpeechComponent from '../components/SpeechComponent';
import {
  MicrophoneIcon,
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

const Home = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                <MicrophoneIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transform Speech
              </span>
              <br />
              <span className="text-gray-900">into Perfect Text</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Try our live speech recognition and see the magic happen
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">


            </div>
          </div>

          {/* Main Speech Component */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-2xl font-bold text-white text-center">
                  Live Speech Recognition
                </h2>
                <p className="text-blue-100 text-center mt-1">
                  Click start and begin speaking to see the magic happen
                </p>
              </div>
              <div className="p-6">
                <SpeechComponent />
              </div>
            </div>
          </div>
        </div>
      </div>



    </div>
  );
};

export default Home;
