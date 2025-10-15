import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserDrawer from "../components/UserDrawer";
import { 
  createGrievance, 
  validateGrievanceForm, 
  getSeverityColor 
} from "../../../api/grievanceApi";
import { getUserBin } from "../../../api/garbageApi";
import { toast } from "react-toastify";

const CreateGrievance = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    binId: '',
    severity: '',
    description: ''
  });
  
  // UI state
  const [userBin, setUserBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [characterCount, setCharacterCount] = useState(0);

  useEffect(() => {
    loadUserBin();
  }, []);

  const loadUserBin = async () => {
    try {
      setLoading(true);
      const bin = await getUserBin();
      
      if (bin && bin.binId) {
        setUserBin(bin);
        setFormData(prev => ({
          ...prev,
          binId: bin.binId
        }));
      } else {
        // Don't redirect immediately, show a helpful message instead
        setUserBin(null);
        toast.info("Please register your smart bin first to create grievances");
      }
    } catch (error) {
      console.error("Error loading user bin:", error);
      toast.error("Failed to load bin information. Please register a bin first.");
      navigate("/user/my-bin");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'description') {
      setCharacterCount(value.length);
    }

    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateGrievanceForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setSubmitting(true);
      const response = await createGrievance(formData);
      
      if (response.success) {
        toast.success("Grievance submitted successfully! We'll review it shortly.");
        navigate("/user/grievances");
      }
    } catch (error) {
      console.error("Error creating grievance:", error);
      toast.error(error.response?.data?.message || "Failed to submit grievance");
    } finally {
      setSubmitting(false);
    }
  };

  const severityOptions = [
    {
      value: 'Low',
      label: 'Low Priority',
      description: 'Minor issues that can wait',
      icon: '🟢',
      color: 'text-green-600 border-green-200 hover:border-green-400'
    },
    {
      value: 'Medium',
      label: 'Medium Priority',
      description: 'Issues that need attention soon',
      icon: '🟡',
      color: 'text-yellow-600 border-yellow-200 hover:border-yellow-400'
    },
    {
      value: 'High',
      label: 'High Priority',
      description: 'Urgent issues requiring quick action',
      icon: '🟠',
      color: 'text-orange-600 border-orange-200 hover:border-orange-400'
    },
    {
      value: 'Critical',
      label: 'Critical Priority',
      description: 'Emergency issues needing immediate attention',
      icon: '🔴',
      color: 'text-red-600 border-red-200 hover:border-red-400'
    }
  ];

  if (loading) {
    return (
      <UserDrawer>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bin information...</p>
          </div>
        </div>
      </UserDrawer>
    );
  }

  // No bin registered state
  if (!userBin) {
    return (
      <UserDrawer>
        <div className="bg-gray-50 min-h-screen py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Smart Bin Registered</h2>
              <p className="text-gray-600 mb-6">
                You need to register a smart bin before you can create grievances about collection issues.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/user/my-bin")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Register Smart Bin</span>
                </button>
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mx-auto block"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </UserDrawer>
    );
  }

  return (
    <UserDrawer>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Collection Issue</h1>
          <p className="text-gray-600">
            Let us know about any problems with your garbage collection service
          </p>
        </div>

        {/* Bin Information Card */}
        {userBin && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Your Registered Bin
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Bin ID</p>
                <p className="font-semibold text-gray-900">{userBin.binId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Fill Level</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(userBin.sensorData?.fillLevel)}`}>
                  {userBin.sensorData?.fillLevel} ({userBin.sensorData?.fillPercentage}%)
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-gray-700">{userBin.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="text-gray-700">{userBin.area?.name}, {userBin.area?.district}</p>
              </div>
            </div>
          </div>
        )}

        {/* Grievance Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Grievance Details</h2>
            <p className="text-sm text-gray-600 mt-1">
              Please provide details about the issue you're experiencing
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Issue Priority Level *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {severityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors ${
                      formData.severity === option.value
                        ? `ring-2 ring-blue-500 border-blue-500 bg-blue-50`
                        : `border-gray-200 hover:border-gray-300`
                    } ${option.color}`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={option.value}
                      checked={formData.severity === option.value}
                      onChange={(e) => handleInputChange('severity', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-start w-full">
                      <div className="text-2xl mr-3">{option.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                      {formData.severity === option.value && (
                        <svg className="w-5 h-5 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Issue Description *
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Please describe the issue in detail. Include when it occurred, what happened, and any other relevant information..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Be specific about the issue to help us resolve it quickly
                </p>
                <p className={`text-sm ${characterCount > 450 ? 'text-red-600' : 'text-gray-500'}`}>
                  {characterCount}/500 characters
                </p>
              </div>
            </div>

            {/* Common Issues Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Common Issues Include:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Bin not collected on scheduled day</li>
                <li>• Bin damaged or missing</li>
                <li>• Collector didn't empty the bin completely</li>
                <li>• Bin sensor showing incorrect fill level</li>
                <li>• Collection truck missed your area</li>
                <li>• Spillage or mess left after collection</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.severity || !formData.description.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Submit Grievance</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-700 mb-1">Response Time:</p>
              <ul className="space-y-1">
                <li>• Critical issues: Within 2 hours</li>
                <li>• High priority: Within 8 hours</li>
                <li>• Medium priority: Within 24 hours</li>
                <li>• Low priority: Within 72 hours</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">What happens next?</p>
              <ul className="space-y-1">
                <li>• Your grievance will be reviewed by our team</li>
                <li>• We'll assign it to the appropriate collector</li>
                <li>• You'll receive updates on the resolution</li>
                <li>• We'll notify you when it's resolved</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Contact Support:</p>
              <ul className="space-y-1">
                <li>• Email: support@zerobin.com</li>
                <li>• Phone: +94 11 234 5678</li>
                <li>• Live Chat: Available 24/7</li>
                <li>• Response time: Within 2 hours</li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </div>
    </UserDrawer>
  );
};

export default CreateGrievance;
