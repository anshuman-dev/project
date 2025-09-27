'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMiniKit } from '@/components/MiniKitProvider';
import { blockchainManager } from '@/lib/blockchain';

export default function VerifyPage() {
  const router = useRouter();
  const { miniKit, isReady } = useMiniKit();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    proof?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    txHash?: string;
  } | null>(null);

  const handleVerification = async () => {
    if (!isReady) {
      setVerificationResult({
        success: false,
        message: 'World App not detected. Please open this app in World App.',
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await miniKit.verifyWorldID();

      if (result.success) {
        // Store World ID proof for later use in registration
        localStorage.setItem('chainolympics_worldid_proof', JSON.stringify(result.proof));

        setVerificationResult({
          success: true,
          message: 'Successfully verified as human! You can now register as an athlete.',
          proof: result.proof,
        });

        // Auto-redirect to registration after 3 seconds
        setTimeout(() => {
          router.push('/register');
        }, 3000);
      } else {
        setVerificationResult({
          success: false,
          message: result.error || 'Verification failed. Please try again.',
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        message: 'Unexpected error during verification.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Human Verification
        </h1>
        <p className="text-gray-300 text-lg">
          Prove you&apos;re a real person to compete in ChainOlympics
        </p>
      </div>

      {/* Verification Process Steps */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">How it works:</h2>
        <div className="space-y-3 text-gray-300">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span>Scan with World App orb or verify with biometrics</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span>Generate zero-knowledge proof of personhood</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span>Become eligible for competition and prizes</span>
          </div>
        </div>
      </div>

      {/* Verification Button */}
      <div className="text-center mb-8">
        {!isReady ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="font-medium">World App Required</p>
            <p className="text-sm mt-2">
              This verification must be done through World App. Please open this link in World App to continue.
            </p>
          </div>
        ) : (
          <button
            onClick={handleVerification}
            disabled={isVerifying}
            className={`
              px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105
              ${isVerifying
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
              }
              text-white
            `}
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              '🌍 Verify with World ID'
            )}
          </button>
        )}
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className={`
          rounded-lg p-4 border text-center
          ${verificationResult.success
            ? 'bg-green-500/20 border-green-500 text-green-200'
            : 'bg-red-500/20 border-red-500 text-red-200'
          }
        `}>
          <div className="text-3xl mb-2">
            {verificationResult.success ? '✅' : '❌'}
          </div>
          <p className="font-medium">{verificationResult.message}</p>
          {verificationResult.success && (
            <p className="text-sm mt-2 text-green-300">
              Redirecting to athlete registration...
            </p>
          )}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">Why verification?</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p>• <strong>Fair competition:</strong> Ensures only real humans can compete</p>
          <p>• <strong>No bots:</strong> Prevents automated players from gaming the system</p>
          <p>• <strong>Prize protection:</strong> Guarantees prizes go to actual people</p>
          <p>• <strong>Privacy-first:</strong> Zero-knowledge proof protects your identity</p>
        </div>
      </div>
    </div>
  );
}