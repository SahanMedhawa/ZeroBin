import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CollectorDrawer from '../components/CollectorDrawer';
import {
  getSmartDeviceById,
  updateSmartDevice,
  createTransaction,
} from '../../../api/collectorApi';
import { toast } from 'react-toastify';

const UpdateGarbage = () => {
  const [searchParams] = useSearchParams();
  const deviceId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [bin, setBin] = useState(null);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceId) {
      fetchBinDetails();
    } else {
      toast.error('No device ID provided');
      navigate('/collector/scanner');
    }
  }, [deviceId]);

  const fetchBinDetails = async () => {
    try {
      const data = await getSmartDeviceById(deviceId);
      setBin(data);
    } catch (error) {
      console.error('Error fetching bin details:', error);
      toast.error('Failed to fetch bin details');
    }
  };

  const handleMarkAsCollected = async () => {
    if (bin?.area?.type === 'weightBased' && !weight) {
      toast.error('Please enter the weight for the garbage');
      return;
    }

    setLoading(true);
    try {
      // Calculate transaction amount
      const areaType = bin.area.type;
      const garbageWeight = parseFloat(weight) || 0;
      const rate = bin.area.rate;

      let amount = areaType === 'weightBased' ? garbageWeight * rate : rate;

      // Apply 10% discount for recyclable garbage
      if (bin.type === 'Recyclable') {
        amount *= 0.9;
      }

      // Create transaction
      const newTransaction = {
        userID: bin.userId?._id,
        description: `Garbage Collection - Bin Type: ${
          bin.type === 'non-recyclable' ? 'Non-Recyclable' : 'Recyclable'
        }`,
        isRefund: false,
        isPaid: false,
        amount: amount,
      };

      await createTransaction(newTransaction);

      // Update device status
      await updateSmartDevice(deviceId, {
        garbageStatus: 'Collected',
        weight: areaType === 'weightBased' ? garbageWeight : undefined,
      });

      toast.success('Garbage marked as collected! User will be notified.');
      
      setTimeout(() => {
        navigate('/collector/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error updating garbage status:', error);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!bin) {
    return (
      <div className="flex h-screen bg-gray-50">
        <CollectorDrawer />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bin details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <CollectorDrawer />

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Garbage Collection</h1>

          {/* Smart Bin Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600">SMART BIN DETAILS</h2>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">{bin.userId?.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-semibold text-gray-800">{bin.userId?.contact || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold text-gray-800">{bin.userId?.address || 'N/A'}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Bin Type</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                    bin.type === 'non-recyclable'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  {bin.type === 'non-recyclable' ? 'NON-RECYCLABLE' : 'RECYCLABLE'}
                </span>
              </div>

              {/* Area Information */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <h3 className="font-semibold text-gray-700 mb-2">Area Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area:</span>
                    <span className="font-semibold">{bin.area?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate:</span>
                    <span className="font-semibold">LKR {bin.area?.rate}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Area Type:</span>
                    <span
                      className={`font-bold ${
                        bin.area?.type === 'flat' ? 'text-indigo-600' : 'text-teal-600'
                      }`}
                    >
                      {bin.area?.type === 'flat' ? 'FLAT RATE' : 'WEIGHT BASED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weight Input (for weight-based areas) */}
          {bin.area?.type === 'weightBased' && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Enter Garbage Weight (kg)
              </h3>
              <input
                type="number"
                step="0.1"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter weight in kilograms"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be used to calculate the collection fee
              </p>
            </div>
          )}

          {/* Current Status & Action */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Current Status:</p>
              <span
                className={`inline-block px-4 py-2 rounded-full font-bold text-lg ${
                  bin.garbageStatus === 'Collected'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                {bin.garbageStatus}
              </span>
            </div>

            {bin.garbageStatus !== 'Collected' && (
              <button
                onClick={handleMarkAsCollected}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'MARK AS COLLECTED'
                )}
              </button>
            )}

            {bin.garbageStatus === 'Collected' && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-700 font-semibold">
                    This bin has already been collected
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/collector/dashboard')}
            className="mt-6 text-green-600 hover:text-green-700 font-semibold flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateGarbage;
