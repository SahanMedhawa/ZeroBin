import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import CollectorDrawer from '../components/CollectorDrawer';
import { toast } from 'react-toastify';

const CollectorScanner = () => {
  const [manualId, setManualId] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [scanner, setScanner] = useState(null);
  const navigate = useNavigate();

  // Check if camera is available (without requesting permissions)
  useEffect(() => {
    const checkCameraAvailability = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setCameraError(true);
        }
      } catch (error) {
        console.error('Error checking camera availability:', error);
      }
    };

    checkCameraAvailability();
  }, []);

  useEffect(() => {
    if (scanning && !scanner) {
      console.log('Starting QR scanner...');
      
      // Clear any existing content in the QR reader
      const qrReaderElement = document.getElementById('qr-reader');
      if (qrReaderElement) {
        qrReaderElement.innerHTML = '';
      }
      
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        },
        false
      );

      html5QrcodeScanner.render(
        (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          toast.success('QR Code scanned successfully!');
          html5QrcodeScanner.clear();
          setScanning(false);
          setScanner(null);
          navigate(`/collector/updateGarbage?id=${decodedText}`);
        },
        (error) => {
          console.log('Scanner error:', error);
          // Handle camera permission errors
          if (error.includes('Permission denied') || error.includes('NotAllowedError')) {
            console.log('Camera permission denied');
            setCameraError(true);
            setScanning(false);
            setScanner(null);
            toast.error('Camera permission denied. Please enable camera access in your browser settings.');
          } else if (error.includes('NotFoundError') || error.includes('NotReadableError')) {
            console.log('Camera not found');
            setCameraError(true);
            setScanning(false);
            setScanner(null);
            toast.error('Camera not found or not accessible. Please check your camera connection.');
          } else if (error.includes('NotSupportedError')) {
            console.log('Camera not supported');
            setCameraError(true);
            setScanning(false);
            setScanner(null);
            toast.error('Camera not supported in this browser. Please try Chrome or Edge.');
          }
          // Silent handling for other errors (normal scanning operation)
        }
      );

      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error('Error clearing scanner:', err));
      }
    };
  }, [scanning, navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) {
      toast.error('Please enter a device ID');
      return;
    }
    navigate(`/collector/updateGarbage?id=${manualId}`);
  };

  const toggleScanner = () => {
    if (scanning && scanner) {
      console.log('Stopping scanner...');
      scanner.clear().then(() => {
        setScanning(false);
        setScanner(null);
        setCameraError(false);
      });
    } else {
      console.log('Starting scanner...');
      setScanning(true);
      setCameraError(false);
    }
  };

  const resetCameraPermissions = async () => {
    try {
      console.log('Requesting camera permissions...');
      // Try to get camera permissions explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      // If successful, stop the stream and reset state
      stream.getTracks().forEach(track => track.stop());
      setCameraError(false);
      toast.success('Camera permissions granted! You can now start scanning.');
      console.log('Camera permissions granted successfully');
    } catch (error) {
      console.error('Camera permission error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please enable camera access in your browser settings and refresh the page.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please connect a camera and try again.');
      } else {
        toast.error('Camera not accessible. Please check your camera connection.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Scan Smart Bin</h1>

          {/* QR Code Scanner Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                   <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold text-gray-800">QR Code Scanner</h2>
                     <div className="flex gap-2">
                       <button
                         onClick={toggleScanner}
                         className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                           scanning
                             ? 'bg-red-600 hover:bg-red-700 text-white'
                             : 'bg-green-600 hover:bg-green-700 text-white'
                         }`}
                       >
                         {scanning ? 'Stop Scanner' : 'Start Scanner'}
                       </button>
                       <button
                         onClick={() => {
                           console.log('Current state:', { scanning, scanner, cameraError });
                           console.log('QR reader element:', document.getElementById('qr-reader'));
                           
                           // Test camera access directly
                           navigator.mediaDevices.getUserMedia({ video: true })
                             .then(stream => {
                               console.log('Camera test successful:', stream);
                               stream.getTracks().forEach(track => track.stop());
                               toast.success('Camera is working!');
                             })
                             .catch(err => {
                               console.log('Camera test failed:', err);
                               toast.error('Camera test failed: ' + err.message);
                             });
                         }}
                         className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
                       >
                         Test Camera
                       </button>
                     </div>
                   </div>

                   {scanning && !cameraError && (
                     <div className="relative">
                       <div id="qr-reader" className="w-full max-w-lg mx-auto" style={{ minHeight: '300px' }}></div>
                       <div className="mt-4 text-center">
                         <p className="text-gray-600">
                           Point your camera at the QR code on the smart bin
                         </p>
                         <p className="text-sm text-gray-500 mt-2">
                           If the camera doesn't appear, check your browser permissions
                         </p>
                       </div>
                     </div>
                   )}

            {cameraError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-700 font-semibold mb-2">Camera Access Denied</p>
                    <p className="text-red-600 text-sm mb-4">
                      Camera permissions were denied. To use the QR scanner, you need to enable camera access.
                    </p>
                    <div className="space-y-3">
                      <button
                        onClick={resetCameraPermissions}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Try Again
                      </button>
                      <div className="text-xs text-red-600">
                        <p className="font-semibold mb-1">How to enable camera permissions:</p>
                        <div className="space-y-2">
                          <div>
                            <p className="font-medium">Chrome/Edge:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Click the camera icon in the address bar</li>
                              <li>Select "Allow" for camera access</li>
                              <li>Or go to Settings → Privacy → Site Settings → Camera</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium">Firefox:</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>Click the shield icon in the address bar</li>
                              <li>Select "Allow" for camera access</li>
                              <li>Or go to about:preferences#privacy → Permissions</li>
                            </ul>
                          </div>
                          <p className="text-red-500 font-medium">After changing permissions, refresh this page and try again.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!scanning && !cameraError && (
              <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-gray-600">Click "Start Scanner" to begin scanning</p>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Manual Entry</h2>
            <p className="text-gray-600 mb-4">
              Enter the device ID manually if you can't scan the QR code
            </p>
            
            <form onSubmit={handleManualSubmit}>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter Device ID (e.g., 507f1f77bcf86cd799439011)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
              <div className="flex">
                <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-blue-700 font-semibold mb-1">How to use:</p>
                  <ul className="text-blue-600 text-sm space-y-1 list-disc list-inside">
                    <li>Scan the QR code on the smart bin using the scanner</li>
                    <li>Or manually enter the device ID found on the bin label</li>
                    <li>The system will load the bin details for collection</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Scans (Optional - can be implemented later) */}
          <div className="mt-6 bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Tips</h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ensure good lighting when scanning QR codes
              </p>
              <p className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Hold your device steady and centered over the QR code
              </p>
              <p className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Use manual entry if the QR code is damaged or unreadable
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorScanner;
