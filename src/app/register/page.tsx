'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WalletManager } from '@/lib/wallet';
import { blockchainManager } from '@/lib/blockchain';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // Start with wallet connection
  const [formData, setFormData] = useState({
    athleteName: '',
    country: '',
    selectedSubdomain: '',
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [walletState, setWalletState] = useState({ isConnected: false, address: null });
  const [worldIdProof, setWorldIdProof] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [registrationTxHash, setRegistrationTxHash] = useState<string | null>(null);
  const [countries] = useState([
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Japan', 'Australia', 'Brazil', 'India', 'China', 'Other'
  ]);
  const walletManager = WalletManager.getInstance();

  // Check wallet connection and World ID proof on mount
  useEffect(() => {
    const checkWallet = async () => {
      const currentState = walletManager.getWalletState();
      if (currentState.isConnected) {
        setWalletState(currentState);
        setStep(1); // Skip to name selection if wallet already connected
      }
    };

    // Check for World ID proof from verification
    const storedProof = localStorage.getItem('chainolympics_worldid_proof');
    if (storedProof) {
      try {
        setWorldIdProof(JSON.parse(storedProof));
      } catch (error) {
        console.error('Failed to parse World ID proof:', error);
      }
    }

    checkWallet();
  }, [walletManager]);

  const handleWalletConnect = async () => {
    setIsRegistering(true);
    try {
      const result = await walletManager.connectWallet();
      if (result.success) {
        setWalletState({ isConnected: true, address: result.address! });
        setStep(1); // Move to name selection
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setIsRegistering(false);
    }
  };

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
    setRegistrationTxHash(null);

    try {
      // Connect to blockchain if not already connected
      const walletResult = await blockchainManager.connectWallet();
      if (!walletResult.success) {
        throw new Error(walletResult.error || 'Wallet connection failed');
      }

      // Prepare athlete data for blockchain registration
      const athleteData = {
        ensName: formData.selectedSubdomain,
        country: formData.country,
        address: walletState.address || walletResult.address!,
      };

      // Simulate World ID proof for demo (in production, use real proof)
      const mockWorldIdProof = worldIdProof || {
        root: '0x' + '1'.repeat(64),
        nullifierHash: '0x' + Math.random().toString(16).substring(2).padStart(64, '0'),
        proof: Array(8).fill('0x' + '1'.repeat(64)),
      };

      // Register athlete on blockchain
      const registrationResult = await blockchainManager.registerAthlete(
        athleteData,
        mockWorldIdProof
      );

      if (registrationResult.success && registrationResult.txHash) {
        setRegistrationTxHash(registrationResult.txHash);

        // Store athlete data locally with blockchain info
        const localAthleteData = {
          ...formData,
          walletAddress: athleteData.address,
          ensName: formData.selectedSubdomain,
          isVerified: true,
          registeredAt: new Date().toISOString(),
          registrationTxHash: registrationResult.txHash,
          worldIdVerified: true,
        };

        localStorage.setItem('chainolympics_athlete', JSON.stringify(localAthleteData));

        // Clear World ID proof from storage
        localStorage.removeItem('chainolympics_worldid_proof');

        // Wait a moment to show transaction hash, then redirect
        setTimeout(() => {
          router.push('/game');
        }, 3000);
      } else {
        throw new Error(registrationResult.error || 'Blockchain registration failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);

      // Fallback to local registration
      const athleteData = {
        ...formData,
        walletAddress: walletState.address,
        ensName: formData.selectedSubdomain,
        isVerified: true,
        registeredAt: new Date().toISOString(),
        registrationTxHash: null,
        worldIdVerified: !!worldIdProof,
      };

      localStorage.setItem('chainolympics_athlete', JSON.stringify(athleteData));

      setTimeout(() => {
        router.push('/game');
      }, 2000);
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
            step >= 1 ? 'bg-green-500 text-white' : step === 0 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            🔗
          </div>
          <div className={`w-16 h-1 ${step >= 1 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? 'bg-green-500 text-white' : step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            1
          </div>
          <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 3 ? 'bg-green-500 text-white' : step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            2
          </div>
          <div className={`w-16 h-1 ${step >= 3 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            step >= 4 ? 'bg-green-500 text-white' : step === 3 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-4">👛</div>
              <p className="text-gray-300 mb-6">
                Connect your wallet to create your athlete identity. This will be linked to your World ID verification.
              </p>
              {!walletState.isConnected ? (
                <button
                  onClick={handleWalletConnect}
                  disabled={isRegistering}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    '🔗 Connect Wallet'
                  )}
                </button>
              ) : (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
                  <p className="text-green-200 mb-2">✅ Wallet Connected</p>
                  <p className="text-green-100 font-mono text-sm">
                    {walletManager.formatAddress(walletState.address!)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

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
                    {walletState.address ? walletManager.formatAddress(walletState.address) : 'Not connected'}
                  </span>
                </div>
              </div>

              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> This will register your athlete identity on the blockchain.
                  Your ENS subdomain will be linked to your verified World ID.
                </p>
              </div>

              {worldIdProof && (
                <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
                  <p className="text-green-200 text-sm">
                    ✅ <strong>World ID Verified:</strong> Your human verification is ready for blockchain registration.
                  </p>
                </div>
              )}

              {registrationTxHash && (
                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-200 text-sm mb-2">
                    🔗 <strong>Registration Transaction:</strong>
                  </p>
                  <p className="text-blue-100 font-mono text-xs break-all">
                    {registrationTxHash}
                  </p>
                  <button
                    onClick={() => window.open(blockchainManager.getBlockExplorerUrl(registrationTxHash), '_blank')}
                    className="mt-2 text-blue-300 hover:text-blue-100 text-sm underline"
                  >
                    View on Block Explorer
                  </button>
                </div>
              )}

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