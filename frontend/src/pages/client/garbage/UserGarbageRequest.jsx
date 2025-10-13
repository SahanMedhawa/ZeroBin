import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteGarbage, getUserAllGarbages } from "../../../api/garbageApi";
// import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import { ToastContainer, toast } from "react-toastify";
// MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import UserDrawer from "../components/UserDrawer";
import Garbage_Add_Form from "../components/Garbage_Add_Form";
import { set } from "mongoose";

const UserGarbageRequest = () => {
  const [garbages, setGarbages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedGarbageId, setSelectedGarbageId] = useState(null);
  // const navigate = useNavigate();

  const fetchAllGarbages = async () => {
    try {
      const res = await getUserAllGarbages(); // Call the API to fetch garbages
      setGarbages(res); // Assuming setGarbages is your state setter for garbage data
    } catch (error) {
      // alert(error.message);
      toast.error(error.message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      console.error("Error fetching garbages: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllGarbages();
  }, []);

  const handleClickOpen = (id) => {
    // console.log(`id => `, id);
    setSelectedGarbageId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteGarbage = async () => {
    if (selectedGarbageId) {
      try {
        await deleteGarbage(selectedGarbageId);

        // Refresh the garbage list after successful deletion
        const updatedGarbages = await getUserAllGarbages();
        setGarbages(updatedGarbages);

        handleClose();
        toast.success("Garbage Request Deleted Successfully!", {
          position: "bottom-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error("Error deleting garbage: ", error);
        toast.error("Failed to delete garbage request. Please try again.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
    }
  };

  function getStatusClassName(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Collected":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-red-100 text-red-800";
      default:
        return "";
    }
  }

  function getTypeClassName(type) {
    switch (type) {
      case "Organic":
        return "bg-green-100 text-green-800";
      case "Recyclable":
        return "bg-blue-100 text-blue-800";
      case "Non-Recyclable":
        return "bg-orange-100 text-orange-800";
      case "Hazardous":
        return "bg-red-100 text-red-800";
      case "E-Waste":
        return "bg-purple-100 text-purple-800";
      default:
        return "";
    }
  }

  return (
    <>
      <UserDrawer>
        <div className="flex justify-end mb-2">
          <Garbage_Add_Form />
        </div>
        <div className="mb-28 shadow-md rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
            <caption className="p-5 text-lg font-semibold text-left rtl:text-right text-[#48752c] bg-white :text-white :bg-gray-800">
              Excessive Garbage Disposal Requests
            </caption>
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Area
                </th>
                <th scope="col" className="px-6 py-3">
                  Area Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3">
                  Type
                </th>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Date Requested
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-5 py-3">
                  <span className="sr-only"></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {garbages.length > 0 ? (
                garbages
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by createdAt in descending order
                  .map((garbage) => (
                    <tr
                      className="bg-white border-b :bg-gray-800 :border-gray-700"
                      key={garbage._id}
                    >
                      <td className="px-6 py-4">{garbage.area.name}</td>
                      <td className="px-6 py-4">
                        {garbage.area.type === "weightBased"
                          ? "Weight"
                          : "Flat"}{" "}
                        &nbsp;
                        <span className="bg-gray-500 py-1 px-2 text-[12px] rounded-xl font-semibold text-white">
                          LKR&nbsp;{garbage.area.rate}
                        </span>
                      </td>
                      <td className={`px-5 py-4 font-semibold text-green-600 `}>
                        LKR&nbsp;
                        {garbage.weight
                          ? garbage.weight *
                            garbage.area.rate *
                            (garbage.type === "Recyclable" ? 0.9 : 1)
                          : garbage.area.rate *
                            (garbage.type === "Recyclable" ? 0.9 : 1)}
                        .00
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getTypeClassName(
                            garbage.type
                          )}`}
                        >
                          {garbage.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">{garbage.address}</td>
                      <td className="px-6 py-4">
                        {new Date(garbage.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <span
                          className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getStatusClassName(
                            garbage.status
                          )}`}
                        >
                          {garbage.status}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        {garbage.status === "Pending" && (
                          <a
                            onClick={() => handleClickOpen(garbage._id)}
                            className="font-medium text-red-600 :text-blue-500 cursor-pointer"
                          >
                            <DeleteIcon />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="w-full text-md text-gray-600 font-semibold text-center py-4"
                  >
                    No garbage requests found!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              The selected garbage disposal request will be deleted and cannot
              be retrieved.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleDeleteGarbage} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </UserDrawer>
      <ToastContainer />
    </>
  );
};

export default UserGarbageRequest;
