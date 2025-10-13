import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WmaAuthService from "../../../api/wmaApi";
import { toast } from "react-toastify";

const WMARegister = () => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [imageSelected, setImageSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadImageUrl, setUploadImageUrl] = useState("");
  const navigate = useNavigate();

  // State for user input
  const [userEntryData, setUserEntryData] = useState({
    wmaname: "",
    email: "",
    password: "",
    address: "",
    contact: "",
    authNumber: "",
    confirmPassword: "",
  });

  const {
    wmaname,
    email,
    password,
    address,
    contact,
    authNumber,
    confirmPassword,
  } = userEntryData;

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

      const newUserEntry = {
        wmaname,
        email,
        password,
        address,
        contact,
        authNumber,
        profileImage: uploadedImageUrl,
      };

      console.log("Sending new user data:", newUserEntry);
      await WmaAuthService.wmaRegister(newUserEntry);

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

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="company@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="wmaname" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="wmaname"
              id="wmaname"
              value={wmaname}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="Your company name"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
              Company Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={address}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="Company street address"
              required
            />
          </div>

          <div>
            <label htmlFor="authNumber" className="block text-sm font-semibold text-gray-700 mb-2">
              Authorization Number
            </label>
            <input
              type="text"
              name="authNumber"
              id="authNumber"
              value={authNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
              placeholder="Company authorization number"
              required
            />
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
              Company Logo
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
  );
};

export default WMARegister;
