'use client';

import { useState } from 'react';

export default function TestQRPage() {
  const [appId] = useState('app_0fd177fa7f5e7b015d8b424c4faac8ec');
  const [qrUrl, setQrUrl] = useState('');

  const generateQR = () => {
    // Generate QR code for World App testing as per documentation
    const qrData = `https://worldcoin.org/mini-app?app_id=${appId}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    setQrUrl(qrApiUrl);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-6">
          World App Testing
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App ID
            </label>
            <input
              type="text"
              value={appId}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <button
            onClick={generateQR}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Generate QR Code
          </button>

          {qrUrl && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Scan with World App
              </h3>
              <img
                src={qrUrl}
                alt="World App QR Code"
                className="mx-auto border border-gray-200 rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-4">
                1. Open World App on your phone<br />
                2. Scan this QR code<br />
                3. Confirm the prompt to open ChainOlympics
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Testing Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Make sure World App is installed on your mobile device</li>
              <li>• Use your phone's camera to scan the QR code</li>
              <li>• Confirm the prompt in World App to launch the mini app</li>
              <li>• Test all features: World ID verification, game play, ENS registration</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Production URL:</h4>
            <p className="text-sm text-blue-700">
              Once deployed on Netlify, replace the domain in the QR generation
              to point to your production URL for final testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}