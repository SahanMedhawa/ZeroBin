import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import WMADrawer from "../components/WMADrawer"
import WmaAuthService from "../../../api/wmaApi"
import { deleteSchedule, getAllSchedulesInWma } from '../../../api/scheduleApi';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
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
import { getAllAreas } from '../../../api/areaApi';

export default function ViewSchedules() {
    const [schedules, setSchedules] = useState([]);  
  const [currentWma, setCurrentWma] = useState([]);
    const [areas, setAreas] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    // const [typeFilter, setTypeFilter] = useState("");
    const [areaFilter, setAreaFilter] = useState("");
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

    const fetchAllSchedulesInWma = async (currentWma) => {
      try {
        const res = await getAllSchedulesInWma(currentWma._id);
        setSchedules(res);
        setFilteredSchedules(res);
      } catch (error) {
        alert(error.message);
        console.error("Error fetching schedules: ", error.message);
      }
    };
  
    useEffect(() => {
      if (currentWma._id) {
        fetchAllSchedulesInWma(currentWma);
      }
      // fetchAllCollectorsInWma(currentWma);
    }, [currentWma])

    // const fetchAllSchedules = async () => {
    //     try {
    //       const res = await getAllSchedules();
    //       setSchedules(res);
    //     } catch (error) {
    //       alert(error.message);
    //       console.error("Error fetching schedules: ", error.message);
    //     }
    // };

    const fetchAllAreas = async () => {
      try {
        const res = await getAllAreas();
        setAreas(res);
      } catch (error) {
        alert(error.message);
        console.error("Error fetching areas: ", error.message);
      }
    };
    
    useEffect(() => {
        // fetchAllSchedules();
        fetchAllAreas();
    }, []);

    function getStatusClassName(status) {
        switch (status) {
          case "Pending":
            return "bg-yellow-300/70 text-yellow-900";
          case "Completed":
            return "bg-green-300/70 text-green-900";
          case "In Progress":
            return "bg-red-300/70 text-red-900";
          default:
            return "";
        }
    }

    const handleEditClick = (schedule) => {
        navigate("/wma/schedules/update", { state: { schedule } });
      };

    const handleClickOpen = (id) => {
      setSelectedScheduleId(id);
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };
  
    const handleDeleteSchedule = async () => {
      if (selectedScheduleId) {
        try {
          await deleteSchedule(selectedScheduleId);
          setSchedules((currentSchedule) =>
            currentSchedule.filter((schedule) => schedule._id !== selectedScheduleId)
          );
          handleClose();
          toast.success("✓ Schedule deleted successfully!", {
            position: "bottom-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        } catch (error) {
          toast.error("✕ Failed to delete schedule", {
            position: "bottom-right",
            autoClose: 3000,
            theme: "light",
          });
        }
      }
    };

    const filterSchedules = () => {
      let filtered = schedules;
      if (statusFilter) {
        filtered = filtered.filter((schedule) => schedule.status === statusFilter);
      }
      // if (typeFilter) {
      //   filtered = filtered.filter((schedule) => schedule.type === typeFilter);
      // }
  
      if (areaFilter !== "") {
        filtered = filtered.filter(
          (schedule) => schedule.area?.name === areaFilter
        );
      }
  
      // console.log(`areaFilter => `, areaFilter);
      setFilteredSchedules(filtered);
    };
  
    useEffect(() => {
      filterSchedules();
    }, [statusFilter, areaFilter, schedules]);

  return (
    <WMADrawer>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 p-6">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">
              Schedule Management
            </h1>
            <p className="text-gray-600 mt-2">View and manage collection schedules</p>
          </div>
          <button
            onClick={() => navigate('/wma/schedules/create')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Schedule
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
          <div className="flex flex-wrap items-center gap-4">
            <FormControl className="w-44">
              <InputLabel id="status-filter-label">Filter By Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                className="!rounded-xl bg-white"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="w-44">
              <InputLabel id="area-filter-label">Filter By Area</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                label="Area"
                onChange={(e) => setAreaFilter(e.target.value)}
                className="!rounded-xl bg-white"
              >
                <MenuItem value={""}>All Areas</MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area._id} value={area.name}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900">
            <tr>
              <th scope="col" className="px-5 py-4 font-semibold">
                Waste Management Authority
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Collector
              </th>
              <th scope="col" className="px-3 py-4 font-semibold">
                Area
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Scheduled Date
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Scheduled Time
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                Status
              </th>
              <th scope="col" className="px-4 py-4 font-semibold">
                <span className="sr-only">Edit</span>
              </th>
              <th scope="col" className="px-5 py-4 font-semibold">
                <span className="sr-only">Delete</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSchedules.length > 0 ? (
              filteredSchedules
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((schedule) => (
                  <tr
                    className="bg-white border-b hover:bg-purple-50 transition-colors"
                    key={schedule._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 font-medium text-gray-900"
                    >
                      {schedule.wmaId ?  schedule.wmaId.wmaname : "No WMA assigned"}
                    </th>
                    <td className="px-5 py-4 text-gray-700">
                        {schedule.collectorId? schedule.collectorId.collectorName : "No collector assigned"}
                    </td>
                    <td className="px-5 py-4 text-gray-700">{schedule.area? schedule.area.name : "No area assigned"}</td>
                    <td className="px-5 py-4 text-gray-700">
                      {new Date(schedule.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-gray-700">
                      {schedule.time}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`font-semibold text-xs px-3 py-1.5 rounded-lg ${getStatusClassName(
                            schedule.status
                        )}`}
                      >
                        {schedule.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <a
                        onClick={() => handleEditClick(schedule)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-50 transition-all cursor-pointer"
                      >
                        {schedule.status === 'Pending' ? <EditIcon fontSize="small" /> : ''}
                      </a>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <a
                        onClick={() => handleClickOpen(schedule._id)}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        {schedule.status === 'Completed' ? <DeleteIcon fontSize="small" /> : ''}
                      </a>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="8" className="w-full text-lg text-red-600 py-7 font-semibold text-center">
                  No schedules found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
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
          <Button onClick={handleDeleteSchedule} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
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
  )
}
