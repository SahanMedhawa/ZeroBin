import React, { useState, useEffect } from "react";
import WMADrawer from "../components/WMADrawer";
import AuthService from "../../../api/wmaApi";
import { ToastContainer, toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router";

import wma from "../../../assets/company.png";
import email from "../../../assets/icons/email.png";
import phone from "../../../assets/icons/phone.png";
import address from "../../../assets/icons/location.png";
import dropdown from "../../../assets/icons/dropdown.png";
import editprofile from "../../../assets/icons/editprofile.png";

const WMAProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const [imageSelected, setImageSelected] = useState("");

  const [isToggleDropdownforInformation, setToggleDropdownforInformation] =
    useState(true);
  const [updateProfile, setUpdateProfile] = useState({
    wmaname: "",
    contact: "",
    address: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const wmaProfile = await AuthService.getCurrentWmaDetails();
        setProfile(wmaProfile);
        setUpdateProfile({
          wmaname: wmaProfile.wmaname || "",
          contact: wmaProfile.contact || "",
          authNumber: wmaProfile.authNumber || "",
          address: wmaProfile.address || "",
          profileImage: wmaProfile.profileImage || "",
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  // if (error) return <div>Error: {error}</div>;
  // if (!profile) return <div>Loading...</div>;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateProfile((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const toggleDropdownforInformation = () => {
    setToggleDropdownforInformation(!isToggleDropdownforInformation);
  };

  const uploadImage = async () => {
    const data = new FormData();
    data.append("file", imageSelected);
    data.append("upload_preset", "GarboGoUser_Preset");
    data.append("cloud_name", "dg8cpnx1m");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dg8cpnx1m/image/upload",
      {
        method: "POST",
        body: data,
      }
    );
    const imageUrl = await res.json();
    return imageUrl.url;
  };

  const handleUpdate = async () => {
    console.log("Profile to update:", updateProfile);
    setIsLoading(true);

    try {
      let profileImageUrl = updateProfile.profileImage;

      if (imageSelected) {
        profileImageUrl = await uploadImage();
      }

      const updatedProfileData = {
        ...updateProfile,
        profileImage: profileImageUrl || updateProfile.profileImage, // Keep old image if no new image is uploaded
      };

      const response = await AuthService.updateWma(updatedProfileData);
      toast.success("✓ Profile updated successfully!", {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      // setToggleDropdownforInformation(false);

      setProfile((prevProfile) => ({
        ...prevProfile,
        ...updatedProfileData,
      }));

      setIsLoading(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("✕ Failed to update profile", {
        position: "bottom-right",
        autoClose: 4000,
        theme: "light",
      });
      setIsLoading(false);
    }
  };

  return (
    <WMADrawer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
            WMA Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your authority information</p>
        </div>

          {/* Profile Card */}
          <div className="bg-white shadow-xl rounded-2xl p-8 mb-6">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="flex flex-col md:flex-row gap-8 flex-1">
                <div className="flex justify-center md:justify-start">
                  <img
                    src={profile?.profileImage || wma}
                    alt="Profile Picture"
                    className="w-32 h-32 rounded-full border-4 border-purple-200 shadow-lg object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
                    {profile?.wmaname}
                  </h2>
                  <div className="flex items-center gap-3 text-gray-600">
                    <img
                      src={address}
                      alt="Location"
                      className="w-5 h-5"
                    />
                    <span>{profile?.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <img
                      src={email}
                      alt="Email"
                      className="w-5 h-5"
                    />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <img
                      src={phone}
                      alt="Phone"
                      className="w-5 h-5"
                    />
                    <span>{profile?.contact}</span>
                  </div>
                </div>
              </div>
              
              <div className="relative flex flex-col items-end justify-between">
                <div
                  onClick={toggleDropdownforInformation}
                  className="bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 w-14 h-14 flex items-center justify-center rounded-full cursor-pointer transition-all shadow-lg"
                >
                  <img
                    src={editprofile}
                    alt="edit"
                    className="w-7 h-7"
                  />
                </div>
                <div className="flex flex-col items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-center rounded-2xl shadow-lg">
                  <h1 className="text-3xl font-bold text-amber-300">
                    {profile?.authNumber}
                  </h1>
                  <h2 className="text-sm text-white mt-1">Auth Number</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Update Information Card */}
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800">
                Update Personal Information
              </h2>
              <img
                src={dropdown}
                alt="dropdown"
                className={`w-6 h-6 cursor-pointer transition-transform duration-300 ${
                  isToggleDropdownforInformation ? "rotate-180" : "rotate-0"
                }`}
                onClick={toggleDropdownforInformation}
              />
            </div>
              {isToggleDropdownforInformation && (
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="wmaname"
                      value={updateProfile.wmaname}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Current Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={updateProfile.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Upload Profile Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      id="image"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100 file:cursor-pointer"
                      onChange={(e) => setImageSelected(e.target.files[0])}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
                      onClick={handleUpdate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Updating...' : 'Update Information'}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="!bg-white !shadow-2xl !rounded-2xl !border-l-4 !border-purple-500"
          bodyClassName="text-gray-800 font-medium"
          progressClassName="!bg-gradient-to-r !from-purple-600 !to-indigo-700"
          closeButton={
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              ✕
            </button>
          }
        />
      </WMADrawer>
  );
};

export default WMAProfile;
