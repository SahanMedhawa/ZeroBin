import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDrawer from "../components/AdminDrawer";
import { deleteGarbage, getAllGarbages } from "../../../api/garbageApi";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SummarizeIcon from "@mui/icons-material/Summarize";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import { getAllAreas } from "../../../api/areaApi";

const AdminGarbage = () => {
  const [garbages, setGarbages] = useState([]);
  const [filteredGarbages, setFilteredGarbages] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedGarbageId, setSelectedGarbageId] = useState(null);
  const [loader, setLoader] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [areas, setAreas] = useState([]);
  const navigate = useNavigate();

  const fetchAllAreas = async () => {
    try {
      const res = await getAllAreas();
      setAreas(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching areas: ", error.message);
    }
  };

  const fetchAllGarbages = async () => {
    try {
      const res = await getAllGarbages();
      setGarbages(res);
      setFilteredGarbages(res);
    } catch (error) {
      alert(error.message);
      console.error("Error fetching garbages: ", error.message);
    }
  };

  useEffect(() => {
    fetchAllGarbages();
    fetchAllAreas();
  }, []);

  const filterGarbages = () => {
    let filtered = garbages;
    if (statusFilter) {
      filtered = filtered.filter((garbage) => garbage.status === statusFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter((garbage) => garbage.type === typeFilter);
    }

    if (areaFilter !== "") {
      filtered = filtered.filter(
        (garbage) => garbage.area?.name === areaFilter
      );
    }

    // console.log(`areaFilter => `, areaFilter);
    setFilteredGarbages(filtered);
  };

  useEffect(() => {
    filterGarbages();
  }, [statusFilter, typeFilter, areaFilter, garbages]);

  const handleClickOpen = (id) => {
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
        setGarbages((currentGarbage) =>
          currentGarbage.filter((garbage) => garbage._id !== selectedGarbageId)
        );
        handleClose();
        toast.success("Garbage Request Deleted Successfully!", {
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
        // console.log("Error deleting garbage: ", error);
      }
    }
  };

  function getStatusClassName(status) {
    switch (status) {
      case "Pending":
        return "bg-yellow-300 text-yellow-900";
      case "Collected":
        return "bg-green-300 text-green-900";
      case "In Progress":
        return "bg-red-300 text-red-900";
      default:
        return "";
    }
  }

  function getTypeClassName(type) {
    switch (type) {
      case "Recyclable":
        return "bg-blue-100 text-blue-800";
      case "Non-Recyclable":
        return "bg-orange-100 text-orange-800";

      default:
        return "";
    }
  }

  const handleEditClick = (garbage) => {
    navigate("/admin/garbage/update", { state: { garbage } });
  };

  const downloadPDF = (garbageData) => {
    const doc = new jsPDF();
    const imgLogo = new Image();
    imgLogo.src = "../src/assets/logo.png"; // Add your logo path

    // console.log("Image path: ", imgLogo.src);
    imgLogo.onload = () => {
      // Header
      doc.addImage(imgLogo, "PNG", 14, 10, 55, 15); // Add logo
      doc.setFont("helvetica", "bold");
      doc.setTextColor("48752c"); // Change color if needed
      doc.setFontSize(16);
      doc.text("CleanPath Waste Management System", 95, 18); // Title in the header

      // Title and Date
      doc.setFont("helvetica", "normal");
      doc.setTextColor("000000");
      doc.setFontSize(20);
      doc.text("Garbage Collection Report", 14, 40);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 48);

      // Garbage Collection Summary Table
      autoTable(doc, {
        startY: 58,
        head: [["Summary", "Total Count"]],
        body: [
          ["Total Garbage Requests", garbageData.totalRequests],
          ["Collected Garbages", garbageData.collectedCount],
          ["InProgress Garbages", garbageData.inProgressCount],
          ["Pending Garbages", garbageData.pendingCount],
        ],
        theme: "grid",
      });

      // Garbage Type Counts Table
      autoTable(doc, {
        startY: doc.autoTable.previous.finalY + 10,
        head: [["Garbage Type", "Toatal Count"]],
        body: [
          ["Recyclable", garbageData.recyclableCount],
          ["Non-Recyclable", garbageData.nonRecyclableCount],
        ],
        theme: "grid",
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        ); // Page number
      }

      setLoader(false);

      // Save the PDF
      const generatedDate = new Date().toLocaleDateString().replace(/\//g, "-");
      doc.save(`Garbage_Collection_Report_${generatedDate}.pdf`);

      toast.success("Report Generated Successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    };
  };

  return (
    <AdminDrawer>
      <h1 className="m-5 text-2xl font-semibold text-green-900">
        Garbage Management
      </h1>
      <div className="m-5 shadow-md rounded-lg">
        <div className="flex justify-between p-4">
          <div className="flex items-center space-x-4">
            {/* <span className="font-semibold">Filter By</span> */}
            <FormControl className="w-44">
              <InputLabel id="status-filter-label">Filter By Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Collected">Collected</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="w-44">
              <InputLabel id="type-filter-label">Filter By Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Recyclable">Recyclable</MenuItem>
                <MenuItem value="Non-Recyclable">Non-Recyclable</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="w-44">
              <InputLabel id="area-filter-label">Filter By Area</InputLabel>
              <Select
                labelId="area-filter-label"
                value={areaFilter}
                label="Area"
                onChange={(e) => setAreaFilter(e.target.value)}
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
          <Button
            variant="contained"
            color="success"
            startIcon={<SummarizeIcon />}
            onClick={() =>
              downloadPDF({
                totalRequests: filteredGarbages.length,
                collectedCount: filteredGarbages.filter(
                  (g) => g.status === "Collected"
                ).length,
                inProgressCount: filteredGarbages.filter(
                  (g) => g.status === "In Progress"
                ).length,
                pendingCount: filteredGarbages.filter(
                  (g) => g.status === "Pending"
                ).length,
                recyclableCount: filteredGarbages.filter(
                  (g) => g.type === "Recyclable"
                ).length,
                nonRecyclableCount: filteredGarbages.filter(
                  (g) => g.type === "Non-Recyclable"
                ).length,
              })
            }
          >
            Generate Report
          </Button>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 :text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 :bg-gray-700 :text-gray-400">
            <tr>
              <th scope="col" className="px-5 py-3">
                Name
              </th>
              {/* <th scope="col" className="px-5 py-3">
                Email
              </th> */}
              <th scope="col" className="px-5 py-3">
                Phone Number
              </th>
              <th scope="col" className="px-3 py-3">
                Type
              </th>
              <th scope="col" className="px-5 py-3">
                Area
              </th>
              {/* <th scope="col" className="px-5 py-3">
                Address
              </th> */}
              <th scope="col" className="px-5 py-3">
                Date Requested
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
            {filteredGarbages.length > 0 ? (
              filteredGarbages
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((garbage) => (
                  <tr
                    className="bg-white border-b :bg-gray-800 :border-gray-700"
                    key={garbage._id}
                  >
                    <th
                      scope="row"
                      className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap :text-white"
                    >
                      {garbage.user
                        ? garbage.user.username
                        : "No user assigned"}
                    </th>
                    <td className="px-5 py-4">
                      {garbage.user ? garbage.user.contact : ""}
                    </td>
                    <td className="px-3 py-4 capitalize">
                      <span
                        className={`uppercase font-semibold text-[12px] px-2.5 py-0.5 rounded ${getTypeClassName(
                          garbage.type
                        )}`}
                      >
                        {garbage.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {garbage.area ? garbage.area.name : ""}
                      &nbsp;
                      <span
                        className={`uppercase font-semibold text-[12px] p-1.5 rounded-full ${
                          garbage.area.type === "weightBased"
                            ? `bg-blue-200 text-blue-600`
                            : "bg-green-200 text-green-600"
                        }`}
                      >
                        {garbage.area.type === "weightBased" ? "W" : "F"}
                      </span>
                    </td>
                    {/* <td className="px-5 py-4">
                      {garbage.user ? garbage.user.address : ""}
                    </td> */}
                    <td className="px-5 py-4">
                      {" "}
                      {new Date(garbage.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 capitalize">
                      <span
                        className={`uppercase font-semibold text-[10px] px-2.5 py-1 rounded-full ${getStatusClassName(
                          garbage.status
                        )}`}
                      >
                        {garbage.status}
                      </span>
                    </td>
                    <td className="px- py-4 text-right">
                      {garbage.status !== "Collected" && (
                        <a
                          onClick={() => handleEditClick(garbage)}
                          className="font-medium text-gray-400 :text-blue-500 cursor-pointer"
                        >
                          <EditIcon />
                        </a>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <a
                        onClick={() => handleClickOpen(garbage._id)}
                        className="font-medium text-red-600 :text-blue-500 cursor-pointer"
                      >
                        <DeleteIcon />
                      </a>
                    </td>
                  </tr>
                ))
            ) : (
              <tr className="">
                <td className="w-full text-lg text-red-600 py-7 font-semibold text-center col-span-5">
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
            The selected garbage disposal request will be deleted and cannot be
            retrieved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDeleteGarbage} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
    </AdminDrawer>
  );
};

export default AdminGarbage;
