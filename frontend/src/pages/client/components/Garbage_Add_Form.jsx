import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Divider } from "@mui/material";
import { createGarbage } from "../../../api/garbageApi";
import { getAllAreas } from "../../../api/areaApi";
// import { createTransaction } from "../../../api/transactionApi";

export default function Garbage_Add_Form() {
  const [areas, setAreas] = useState([]);
  const [garbageEntryData, setGarbageEntryData] = useState({
    area: "",
    address: "",
    latitude: "",
    longitude: "",
    type: "",
    weight: "", // Add weight field
  });

  const fetchAllAreas = async () => {
    try {
      const areas = await getAllAreas();
      setAreas(areas);
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  useEffect(() => {
    fetchAllAreas();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenModal = () => setIsOpen(true);
  const handleCloseModal = () => setIsOpen(false);

  const { area, address, latitude, longitude, type, weight } = garbageEntryData;

  const [touched, setTouched] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setGarbageEntryData({
      ...garbageEntryData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newGarbageEntry = {
      area,
      address,
      latitude,
      longitude,
      type,
      weight: parseFloat(
        areas.find((a) => a._id === area)?.type === "weightBased" ? weight : 0
      ), // Set weight based on area type
    };

    // const newTransaction = {
    //   description: `Garbage Disposal Request - ${type}`,
    //   isRefund: type === "Recyclable" ? true : false,
    //   isPaid: type === "Recyclable" ? true : false,
    //   amount:
    //     areas.find((a) => a._id === area)?.type === "weightBased"
    //       ? weight * areas.find((a) => a._id === area)?.rate
    //       : areas.find((a) => a._id === area)?.rate, // Calculate amount based on weight and area rate
    // };

    try {
      // console.log(`newGarbageEntry => `, newGarbageEntry);
      // console.log(`newTransaction => `, newTransaction);
      await createGarbage(newGarbageEntry);
      // await createTransaction(newTransaction);

      toast.success("Garbage entry submitted successfully!", {
        position: "bottom-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setIsSubmit(true);
      setTimeout(() => {
        setIsOpen(false);
        window.location.reload();
      }, 3000);
    } catch (error) {
      console.error("Error submitting garbage entry:", error);
      toast.error("Failed to submit garbage entry. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    setGarbageEntryData((prevData) => ({
      ...prevData,
      date: today.toDateString(),
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGarbageEntryData((prevData) => ({
          ...prevData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, []);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-green-800 text-white rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
      >
        Make Garbage Request
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative w-[90%] max-w-2xl bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl mb-5 font-bold text-center text-gray-800">
              Garbage Disposal Request
            </h1>
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <Divider className="mb-6" />
            <br />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Area
                  </label>
                  <select
                    value={area}
                    name="area"
                    onBlur={() => handleBlur("area")}
                    onChange={handleChange}
                    className={`mt-1 p-3 w-full rounded-md border ${
                      !area && touched.area
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-green-500 focus:ring focus:ring-green-200`}
                  >
                    <option value="" disabled>
                      -- Select Area --
                    </option>
                    {areas.map((area) => (
                      <option key={area.id} value={area._id}>
                        {area.name}
                      </option>
                    ))}
                  </select>

                  {!area && touched.area && (
                    <p className="text-red-600 text-sm mt-1">* Required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Garbage Type
                  </label>
                  <select
                    value={type}
                    name="type"
                    onChange={handleChange}
                    className="mt-1 p-3 w-full rounded-md border border-gray-300 focus:border-green-500 focus:ring focus:ring-green-200"
                  >
                    <option value="default">Choose type</option>
                    <option value="Recyclable">Recyclable Waste</option>
                    <option value="Non-Recyclable">Non-Recyclable Waste</option>
                    {/* Add this option */}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  name="address"
                  onBlur={() => handleBlur("address")}
                  onChange={handleChange}
                  placeholder="Enter address"
                  className={`mt-1 p-3 w-full rounded-md border ${
                    !address && touched.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-green-500 focus:ring focus:ring-green-200`}
                />
                {!address && touched.address && (
                  <p className="text-red-600 text-sm mt-1">
                    * Address Required
                  </p>
                )}
              </div>

              {/* Show weight input if the selected area's type is weightBased */}
              {areas.find((a) => a._id === area)?.type === "weightBased" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight of Garbage (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    name="weight"
                    onBlur={() => handleBlur("weight")}
                    onChange={handleChange}
                    placeholder="Enter weight in kg"
                    className={`mt-1 p-3 w-full rounded-md border ${
                      !weight && touched.weight
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:border-green-500 focus:ring focus:ring-green-200`}
                  />
                  {!weight && touched.weight && (
                    <p className="text-red-600 text-sm mt-1">
                      * Weight Required
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={
                    !address ||
                    (areas.find((a) => a._id === area)?.type ===
                      "weightBased" &&
                      !weight)
                  }
                  className={`w-full py-3 px-4 font-semibold rounded-lg shadow-md text-white ${
                    !address ||
                    (areas.find((a) => a._id === area)?.type ===
                      "weightBased" &&
                      !weight)
                      ? "bg-gray-300"
                      : "bg-green-700 hover:bg-green-600"
                  } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50`}
                >
                  {isLoading ? "Adding..." : "Make Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
