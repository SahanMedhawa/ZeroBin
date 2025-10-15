import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../api/userApi";
import { getAllAreas } from "../../api/areaApi";
import { toast } from "react-toastify";
import WMARegister from "../wma/auth/WMARegister";
import { SRI_LANKAN_DISTRICTS } from "../../constants/districts";

const Register = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUser, setIsUser] = useState(true);
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const navigate = useNavigate();

  // State for user input
  const [userEntryData, setUserEntryData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    contact: "",
    area: "",
    confirmPassword: "",
  });

  const { username, email, password, address, contact, area, confirmPassword } =
    userEntryData;
  const [areas, setAreas] = useState([]); // State to store areas fetched from the API
  const [areaId, setAreaId] = useState(null); // State for storing selected area ID
  const [selectedDistrict, setSelectedDistrict] = useState(""); // State for district filter

  // Filter areas based on selected district
  const filteredAreas = useMemo(() => {
    if (!selectedDistrict) return areas;
    return areas.filter(area => area.district === selectedDistrict);
  }, [areas, selectedDistrict]);

  const fetchAllAreas = async () => {
    try {
      const res = await getAllAreas(); // Use the named export
      setAreas(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching Areas: ", error.message);
    }
  };
  useEffect(() => {
    fetchAllAreas();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    setUserEntryData({
      ...userEntryData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    // Upload image and handle registration
    try {
      const uploadedImageUrl = await uploadImage();
      setUploadImageUrl(uploadedImageUrl);

      // Assuming 'area' is now an ID/reference (e.g., from a dropdown or selection)
      const newUserEntry = {
        username,
        email,
        password,
        address,
        contact,
        area: areaId, // Make sure 'areaId' is the correct reference ID for the area
        profileImage: uploadedImageUrl,
      };

      console.log("Sending new user data:", newUserEntry);
      await AuthService.register(newUserEntry);

      toast.success("Your account has been created successfully!", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      navigate("/login");
    } catch (error) {
      console.error("Error creating account:", error);
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload to Cloudinary
  const uploadImage = async () => {
    if (!imageSelected) return null;

    const data = new FormData();
    data.append("file", imageSelected);
    data.append("upload_preset", "GarboGoUser_Preset");
    data.append("cloud_name", "dg8cpnx1m");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dg8cpnx1m/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const imageUrl = await res.json();
      return imageUrl.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };
  useEffect(() => {
    setIsUser(true); // This will trigger a re-render every time
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-400 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">0</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ZeroBin
            </h1>
          </div>
          <p className="text-gray-600 text-sm">Join us in creating a cleaner tomorrow</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-gray-200 bg-gray-50/50 p-6">
            <div className="flex space-x-2 bg-gray-200/50 rounded-xl p-1">
              <button
                onClick={() => setIsUser(true)}
                className={`px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  isUser
                    ? 'bg-white text-emerald-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Resident
              </button>
              <button
                onClick={() => setIsUser(false)}
                className={`px-8 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  !isUser
                    ? 'bg-white text-emerald-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                WMA
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {isUser && (
              <div>
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                  Create Resident Account
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          name="username"
                          id="username"
                          value={username}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          placeholder="Choose a username"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          value={address}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          placeholder="Your street address"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                          District
                        </label>
                        <select
                          name="district"
                          id="district"
                          value={selectedDistrict}
                          onChange={(e) => {
                            setSelectedDistrict(e.target.value);
                            setAreaId(null); // Reset area when district changes
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        >
                          <option value="">Select your district first</option>
                          {SRI_LANKAN_DISTRICTS.map((district) => (
                            <option key={district} value={district}>
                              {district}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-2">
                          Area {selectedDistrict && `(${filteredAreas.length} available)`}
                        </label>
                        <select
                          name="area"
                          id="area"
                          value={areaId || ""}
                          onChange={(e) => setAreaId(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          required
                          disabled={!selectedDistrict}
                        >
                          <option value="">
                            {!selectedDistrict 
                              ? "Please select a district first" 
                              : filteredAreas.length === 0 
                              ? "No areas available in this district"
                              : "Select your area"}
                          </option>
                          {filteredAreas && filteredAreas.length > 0 && 
                            filteredAreas.map((areaItem) => (
                              <option key={areaItem._id} value={areaItem._id}>
                                {areaItem.name}
                              </option>
                            ))
                          }
                        </select>
                        {!selectedDistrict && (
                          <p className="mt-1 text-xs text-gray-500">
                            Select a district to view available areas
                          </p>
                        )}
                        {selectedDistrict && filteredAreas.length === 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            No service areas available in {selectedDistrict} yet
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-5">
                      <div>
                        <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contact"
                          id="contact"
                          value={contact}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          placeholder="0771234567"
                          pattern="[0-9]{10}"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="profileImage" className="block text-sm font-semibold text-gray-700 mb-2">
                          Profile Image
                        </label>
                        <input
                          type="file"
                          name="profileImage"
                          id="profileImage"
                          onChange={(e) => setImageSelected(e.target.files[0])}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                          accept="image/*"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          id="password"
                          value={password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                          required
                        />
                      </div>
                      
                      {errorMessage && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                          <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Already have an account?{" "}
                      <a href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                        Login here
                      </a>
                    </p>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center space-x-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Creating Account...</span>
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!isUser && (
              <div>
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
                  Create WMA Account
                </h2>
                <WMARegister />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
