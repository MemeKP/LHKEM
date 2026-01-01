import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    console.log('OTP:', otpCode);
    // Verify OTP and navigate
    navigate('/');
  };

  const handleResend = () => {
    console.log('Resend OTP');
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex animate-fadeIn">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="/path/to/otp-image.jpg"
          alt={t('auth.communityName')}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">
            {t('auth.welcomeTitle')}<br />
            {t('auth.communityName')}
          </h1>
          <p className="text-lg opacity-90">
            {t('auth.welcomeDescription')}
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <button
          onClick={() => navigate('/register')}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="w-full max-w-md animate-slideUp">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.otpTitle')}</h2>
          <p className="text-gray-600 mb-8">
            {t('auth.otpDescription')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {t('auth.otp')}
              </label>
              <div className="flex gap-3 justify-center">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {t('auth.resendOtp')}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105"
            >
              {t('auth.verifyButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
