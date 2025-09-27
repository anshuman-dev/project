'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ENS_CONFIG } from '@/lib/config';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    athleteName: '',
    country: '',
    selectedSubdomain: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [countries] = useState([
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Japan', 'Australia', 'Brazil', 'India', 'China', 'Other'
  ]);

  const handleAthleteNameChange = (name: string) => {
    const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    setFormData({
      ...formData,
      athleteName: name,
      selectedSubdomain: subdomain ? `${subdomain}.athlete.eth` : '',
    });
  };

  const handleRegistration = async () => {
    setIsRegistering(true);

    try {
      // Simulate ENS registration process
      // In real implementation, this would interact with ENS contracts
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Store athlete data locally for demo
      const athleteData = {
        ...formData,
        walletAddress: ENS_CONFIG.WALLET_ADDRESS,
        ensName: formData.selectedSubdomain,
        isVerified: true,
        registeredAt: new Date().toISOString(),
      };

      localStorage.setItem('chainolympics_athlete', JSON.stringify(athleteData));

      // Redirect to game
      router.push('/game');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Athlete Registration
        </h1>
        <p className="text-gray-300 text-lg">
          Create your athlete identity with ENS
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 3 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 1: Choose Your Athlete Name</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Athlete Name</label>
                <input
                  type="text"
                  value={formData.athleteName}
                  onChange={(e) => handleAthleteNameChange(e.target.value)}
                  placeholder="Enter your athlete name"
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {formData.selectedSubdomain && (
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-200 text-sm mb-1">Your ENS subdomain will be:</p>
                  <p className="text-blue-100 font-bold">{formData.selectedSubdomain}</p>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.athleteName || !formData.selectedSubdomain}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 2: Select Your Country</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Representing Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select your country</option>
                  {countries.map(country => (
                    <option key={country} value={country} className="bg-gray-800">
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.country}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 3: Confirm Registration</h2>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Athlete Name:</span>
                  <span className="text-white font-medium">{formData.athleteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">ENS Domain:</span>
                  <span className="text-white font-medium">{formData.selectedSubdomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Country:</span>
                  <span className="text-white font-medium">{formData.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Wallet:</span>
                  <span className="text-white font-medium text-sm">
                    {ENS_CONFIG.WALLET_ADDRESS.slice(0, 6)}...{ENS_CONFIG.WALLET_ADDRESS.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> This will register your athlete identity on the blockchain.
                  Your ENS subdomain will be linked to your verified World ID.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={isRegistering}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRegistration}
                  disabled={isRegistering}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors"
                >
                  {isRegistering ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Registering...</span>
                    </div>
                  ) : (
                    'Register Athlete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Benefits Section */}
      <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Your Athlete Benefits</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• <strong>Permanent Identity:</strong> Your ENS name is yours forever</p>
          <p>• <strong>Reputation Building:</strong> Track wins and achievements</p>
          <p>• <strong>Cross-Platform:</strong> Use your athlete identity across dApps</p>
          <p>• <strong>Prize Eligibility:</strong> Qualified for all ChainOlympics competitions</p>
        </div>
      </div>
    </div>
  );
}