import React, { useState, useEffect } from 'react'
import WMADrawer from "../components/WMADrawer"
import WmaAuthService from "../../../api/wmaApi"
import { useNavigate } from 'react-router-dom';
import { getAllSchedules, deleteSchedule } from '../../../api/scheduleApi';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from '@mui/icons-material/Group';
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { ToastContainer, toast } from "react-toastify";
import { deleteCollector, getAllCollectorsInWma } from '../../../api/collectorApi';
// MUI
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function ViewCollectors() {
  const [collectors, setCollectors] = useState([]);
  const [currentWma, setCurrentWma] = useState([]);
  const [filteredCollectors, setFilteredCollectors] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedCollectorId, setSelectedCollectorId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const navigate = useNavigate();


  const fetchCurrentWma = async () => {
    try {
      const res = await WmaAuthService.getCurrentWmaDetails();
      setCurrentWma(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching WMAs: ", error.message);
    }
  };

  useEffect(() => {
    fetchCurrentWma();
  }, [])

  const fetchAllCollectorsInWma = async (currentWma) => {
    try {
      const res = await getAllCollectorsInWma(currentWma._id);
      setCollectors(res);
      setFilteredCollectors(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching collectors: ", error.message);
    }
  };

  useEffect(() => {
    if (currentWma._id) {
      fetchAllCollectorsInWma(currentWma);
    }
    // fetchAllCollectorsInWma(currentWma);
  }, [currentWma])

  const handleClickOpen = (id) => {
    setSelectedCollectorId(id);
    setOpen(true);
  };

  const handleEditClick = (collector) => {
    navigate("/wma/collectors/update", { state: { collector } });
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteCollector = async () => {
    if (selectedCollectorId) {
      try {
        await deleteCollector(selectedCollectorId);
        setCollectors((currentCollector) =>
          currentCollector.filter((collector) => collector._id !== selectedCollectorId)
        );
        handleClose();
        toast.success("Collector Deleted Successfully!", {
          position: "bottom-right",
          autoClose: 3000,
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
        alert(error.message);
      }
    }
  };

  const filterCollectors = () => {
    let filtered = collectors;
    if (statusFilter) {
      filtered = filtered.filter((collector) => collector.statusOfCollector === statusFilter);
    }

    if (searchFilter !== "") {
      filtered = filtered.filter((collector) =>
        collector.collectorName.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    setFilteredCollectors(filtered);
  };

  useEffect(() => {
    filterCollectors();
  }, [statusFilter, searchFilter, collectors]);

  return (
    <WMADrawer>
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
      <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent mb-2">
            Collector Management
          </h1>
          <p className="text-gray-600">Manage your authorized collectors</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
              <h1 className="text-gray-600 font-semibold mb-3">Total Collectors</h1>
              <div className="flex justify-start items-center">
                <div className="flex justify-center items-center bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full aspect-square h-[60px]">
                  <GroupIcon sx={{ fontSize: 30, color: 'white' }}/>
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent ml-4">{collectors.length}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
              <h1 className="text-gray-600 font-semibold mb-3">Available Collectors</h1>
              <div className="flex justify-start items-center">
                <div className="flex justify-center items-center bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full aspect-square h-[60px]">
                  <GroupAddIcon sx={{ fontSize: 30, color: 'white' }}/>
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent ml-4">{collectors.filter((collector) => collector.statusOfCollector === 'Available').length}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
              <h1 className="text-gray-600 font-semibold mb-3">Unavailable Collectors</h1>
              <div className="flex justify-start items-center">
                <div className="flex justify-center items-center bg-gradient-to-r from-red-500 to-rose-600 rounded-full aspect-square h-[60px]">
                  <GroupRemoveIcon sx={{ fontSize: 30, color: 'white' }}/>
                </div>
                <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent ml-4">{collectors.filter((collector) => collector.statusOfCollector === 'Not-Available').length}</span>
              </div>
            </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Authorized Collectors Under {currentWma.wmaname}</h1>
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <input onChange={(e) => setSearchFilter(e.target.value)} type='text' placeholder='Search Collector...' className="py-3 px-4 border-2 rounded-xl border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none w-full md:w-[40%] transition-all"/>
          <div className="flex justify-end items-center gap-4 w-full md:w-auto">
              <FormControl className="w-44">
                <InputLabel id="type-filter-label">Filter By Status</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={statusFilter}
                  label="Filter By Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Not-Available">Not-available</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                className="!bg-gradient-to-r !from-purple-600 !to-indigo-700 !rounded-xl !px-6 !py-3 !normal-case !font-semibold"
                onClick={() =>{navigate("/wma/collectors/create")}}
              >
                + Add Collector
              </Button>
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-3">
                Name
              </th>
              {/* <th scope="col" className="px-5 py-3">
                WMA
              </th> */}
              <th scope="col" className="px-3 py-3">
                Truck No
              </th>
              <th scope="col" className="px-5 py-3">
                NIC
              </th>
              <th scope="col" className="px-5 py-3">
                Contact
              </th>
              <th scope="col" className="px-5 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only"></span>
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredCollectors.length > 0 ? (
              filteredCollectors
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((collector) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700"
                    key={collector._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-2 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                    <div className=' flex justify-start items-center'>
                    <img className=' rounded-full h-[35px]' src={collector.profileImage ? collector.profileImage : 'https://img.icons8.com/ios-filled/100/40C057/user-male-circle.png' } alt="Collector Profile" />
                      <span className=' pl-3'>{collector.collectorName}</span>
                    </div>
                    </th>
                    {/* <td className="px-5 py-4">
                        {collector.wmaId? collector.wmaId.wmaname : "No wma assigned"}
                    </td> */}
                    <td className="px-5 py-4">{collector.truckNumber}</td>
                    <td className="px-5 py-4">
                      {collector.collectorNIC}
                    </td>
                    <td className="px-5 py-4">
                      {collector.contactNo}
                    </td>
                    <td className="px-5 py-4 capitalize flex justify-start items-center">
                      <div className={` h-[20px] rounded-full aspect-square ${collector.statusOfCollector === 'Available'? ' bg-green-600/50': 'bg-red-500/50'} flex justify-center items-center`}>
                        <div className={` h-[15px] rounded-full aspect-square ${collector.statusOfCollector === 'Available'? ' bg-green-600': 'bg-red-500'} border-2 border-white`}></div>
                      </div>
                      <span className=' px-2'>
                        {collector.statusOfCollector}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="outlined"
                        size="small"
                        className="!border-purple-500 !text-purple-600 hover:!bg-purple-50 !rounded-lg !min-w-0 !p-2"
                        onClick={() => handleEditClick(collector)}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <Button
                        variant="outlined"
                        size="small"
                        className="!border-red-500 !text-red-600 hover:!bg-red-50 !rounded-lg !min-w-0 !p-2"
                        onClick={() => handleClickOpen(collector._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="">
                <td className="w-full text-lg text-red-600 py-7 font-semibold text-center col-span-5">
                  No collectors found!
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
            The selected schedule will be deleted and cannot be
            retrieved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteCollector} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      </div>
      </div>
    </WMADrawer>
  )
}

export default ViewCollectors