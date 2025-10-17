import React, { useEffect, useState } from "react";
import WMADrawer from "../components/WMADrawer";
import { toast } from "react-toastify";
import AuthService from "../../../api/wmaApi";
import { getAllGarbages, updateGarbage } from "../../../api/garbageApi";
import { getAllGrievances, updateGrievanceStatus } from "../../../api/grievanceApi";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
/**
 * TicketsReview
 * Matches WMA pages style: gradient header, stats row, two-column layout
 */
const TicketsReview = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'reviewed'

  const normalizeGarbagesResponse = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.garbages)) return resp.garbages;
    if (Array.isArray(resp.bins)) return resp.bins;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.garbage)) return resp.garbage;
    return [];
  };

  const normalizeGrievancesResponse = (resp) => {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp;
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp.grievances)) return resp.grievances;
    return [];
  };

  const load = async () => {
    setLoading(true);
    try {
      const wma = await AuthService.getCurrentWmaDetails(); // [`getCurrentWmaDetails`](frontend/src/api/wmaApi.js)
      const servicedAreas = (wma?.servicedAreas || []).map((a) =>
        typeof a === "string" ? a : a?._id || a?.id
      ).filter(Boolean);

      const rawGar = await getAllGarbages(); // [`getAllGarbages`](frontend/src/api/garbageApi.js)
      const garbages = normalizeGarbagesResponse(rawGar);

      const byBinId = new Map();
      (garbages || []).forEach((g) => {
        if (g.binId) byBinId.set(String(g.binId), g);
        if (g._id) byBinId.set(String(g._id), g);
      });

      let rawGr = [];
      try {
        rawGr = await getAllGrievances(); // [`getAllGrievances`](frontend/src/api/grievanceApi.js)
        rawGr = normalizeGrievancesResponse(rawGr);
      } catch (e) {
        console.warn("getAllGrievances failed", e?.message || e);
      }

      const grievanceTickets = (rawGr || []).map((gr) => {
        // support both populated garbageId (object) or garbage (object)
        const populatedGarbage = gr.garbageId || gr.garbage || null;

        // lookup matched garbage from the getAllGarbages list if needed
        const binKey = String(gr.binId || (populatedGarbage && (populatedGarbage.binId || populatedGarbage._id)) || "");
        const matched = byBinId.get(binKey) || null;

        const binId = populatedGarbage?.binId || gr.binId || matched?.binId || null;
        const address = populatedGarbage?.address || matched?.address || gr.address || "";
        const areaField = populatedGarbage?.area || gr.area || gr.areaId || matched?.area || null;
        const userField = populatedGarbage?.user || gr.user || gr.userId || matched?.user || null;
        const sensorData = populatedGarbage?.sensorData || matched?.sensorData || gr.sensorData || null;
        const coordinates = {
          latitude: populatedGarbage?.latitude || populatedGarbage?.lat || gr.latitude || gr.lat || matched?.latitude || matched?.lat,
          longitude: populatedGarbage?.longitude || populatedGarbage?.lng || gr.longitude || gr.lng || matched?.longitude || matched?.lng,
        };

        return {
          __ticketType: "grievance",
          _id: gr._id,
          binId,
          address,
          area: areaField,
          sensorData,
          user: userField,
          severity: gr.severity || gr.priority || "Medium",
          status: gr.status || "Open",
          description: gr.description || gr.message || "",
          raw: gr,
          coordinates,
        };
      }).filter(item => {
        if (!servicedAreas || servicedAreas.length === 0) return true;
        const areaId = typeof item.area === "string" ? item.area : item.area?._id || item.area?.id;
        return areaId && servicedAreas.map(String).includes(String(areaId));
      });

      const binAutoTickets = (garbages || []).filter(g => {
        const pct = g?.sensorData?.fillPercentage ?? (g?.sensorData?.percentage ?? -1);
        return pct >= 75;
      }).map(g => ({
        __ticketType: "auto-bin",
        _id: g._id,
        binId: g.binId,
        address: g.address,
        area: g.area,
        sensorData: g.sensorData,
        user: g.user,
        severity: null,
        status: g.status || "Pending",
        description: "",
        raw: g,
      })).filter(item => {
        if (!servicedAreas || servicedAreas.length === 0) return true;
        const areaId = typeof item.area === "string" ? item.area : item.area?._id || item.area?.id;
        return areaId && servicedAreas.map(String).includes(String(areaId));
      });

      const combined = [...grievanceTickets, ...binAutoTickets];
      combined.sort((a, b) => {
        // First sort by status (pending/open tickets first)
        const statusPriority = {
          'Open': 0,
          'Pending': 0,
          'In Progress': 1,
          'Fixed': 2,
          'Collected': 2,
          'Cancelled': 3
        };
        const statusDiff = (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
        if (statusDiff !== 0) return statusDiff;

        // Then by severity for same status
        const sevRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        if (a.__ticketType === 'grievance' && b.__ticketType === 'grievance') {
          return (sevRank[b.severity] || 0) - (sevRank[a.severity] || 0);
        }

        // Then by ticket type
        if (a.__ticketType === 'grievance') return -1;
        if (b.__ticketType === 'grievance') return 1;

        // Finally by fill percentage for auto-bin tickets
        return (b.sensorData?.fillPercentage || 0) - (a.sensorData?.fillPercentage || 0);
      });

      setTickets(combined);
    } catch (err) {
      console.error("TicketsReview load error", err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const openMaps = (ticket) => {
    const lat = ticket.coordinates?.latitude || ticket.raw?.latitude || ticket.raw?.lat || ticket.area?.lat || ticket.area?.latitude;
    const lng = ticket.coordinates?.longitude || ticket.raw?.longitude || ticket.raw?.lng || ticket.area?.lng || ticket.area?.longitude;
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
      return;
    }

    const q = encodeURIComponent(ticket.address || ticket.binId || "");
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  const handleSubmitReview = async () => {
    if (!selected || !reviewNote.trim()) {
      toast.error('Please add a review note');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const reviewData = {
        note: reviewNote.trim(),
        reviewedAt: new Date().toISOString(),
        reviewedBy: selected.user?.username || 'WMA Staff'
      };

      await updateStatus(selected, selected.__ticketType === "grievance" ? "Fixed" : "Collected", reviewData);
      setReviewDialogOpen(false);
      setReviewNote('');
      toast.success('Review submitted successfully');
    } catch (err) {
      console.error('Review submission error:', err);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const updateStatus = async (ticket, newStatus, reviewData = null) => {
    setBusyId(ticket._id);
    try {
      if (ticket.__ticketType === "grievance") {
        await updateGrievanceStatus(ticket.raw._id, newStatus, reviewData);
      } else {
        await updateGarbage(newStatus, ticket._id, reviewData);
      }

      // Update local state with review data
      setTickets(prev => prev.map(t => 
        t._id === ticket._id 
          ? { ...t, status: newStatus, review: reviewData } 
          : t
      ));

      if (selected && selected._id === ticket._id) {
        setSelected({ ...selected, status: newStatus, review: reviewData });
      }

      toast.success(`Ticket ${newStatus}`);
    } catch (err) {
      console.error("updateStatus error", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <WMADrawer>
      <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-800 bg-clip-text text-transparent">Tickets Review</h1>
          <p className="text-gray-600 mt-1">Review user-submitted and auto-detected maintenance tickets for your areas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tickets</p>
                  <div className="text-lg font-bold text-gray-800">
                    {loading ? "Loading..." : `${tickets.length} found`}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex rounded-lg border overflow-hidden">
                    <button 
                      className={`px-3 py-1.5 text-sm ${filterStatus === 'all' ? 
                        'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-white hover:bg-gray-50'}`}
                      onClick={() => setFilterStatus('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1.5 text-sm ${filterStatus === 'active' ? 
                        'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-white hover:bg-gray-50'}`}
                      onClick={() => setFilterStatus('active')}
                    >
                      Active
                    </button>
                    <button 
                      className={`px-3 py-1.5 text-sm ${filterStatus === 'reviewed' ? 
                        'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-white hover:bg-gray-50'}`}
                      onClick={() => setFilterStatus('reviewed')}
                    >
                      Reviewed
                    </button>
                  </div>
                  <button 
                    className="px-3 py-2 bg-gray-50 border rounded text-sm hover:bg-gray-100" 
                    onClick={load}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-400">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="py-12 text-center text-gray-500">No tickets in your serviced areas</div>
              ) : (() => {
                const filteredTickets = tickets.filter(ticket => {
                  if (filterStatus === 'active') {
                    return !['Fixed', 'Collected', 'Cancelled'].includes(ticket.status);
                  } else if (filterStatus === 'reviewed') {
                    return ['Fixed', 'Collected'].includes(ticket.status) && ticket.review;
                  }
                  return true;
                });
                
                if (filteredTickets.length === 0) {
                  return (
                    <div className="py-12 text-center text-gray-500">
                      No {filterStatus} tickets found
                    </div>
                  );
                }
                
                return (
                <ul className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                  {filteredTickets.map(ticket => {
                    const isGr = ticket.__ticketType === "grievance";
                    const pct = ticket.sensorData?.fillPercentage ?? null;
                    const areaName = typeof ticket.area === "string" ? ticket.area : ticket.area?.name || "Unknown Area";
                    return (
                      <li key={ticket._id} className="p-3 border rounded-lg flex items-start justify-between hover:shadow-sm transition" onClick={() => setSelected(ticket)}>
                        <div>
                          <div className="font-medium text-gray-800">{isGr ? `User Ticket` : `Auto-bin`} • {ticket.binId || "—"}</div>
                          <div className="text-xs text-gray-500">{areaName} • {ticket.address}</div>
                          {isGr && <div className="mt-2 text-sm text-gray-700">{ticket.description}</div>}
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                          {isGr ? (
                            <div className={`text-sm font-semibold ${ticket.severity === "High" ? "text-red-600" : ticket.severity === "Medium" ? "text-orange-600" : "text-green-600"}`}>{ticket.severity}</div>
                          ) : (
                            pct != null ? <div className="text-sm font-semibold text-orange-600">{pct}%</div> : null
                          )}
                          <div className="text-xs text-gray-400">{ticket.status}</div>

                          <div className="flex gap-2 mt-2">
                            <button className="px-2 py-1 text-xs bg-gray-50 border rounded hover:bg-gray-100" onClick={(e) => { e.stopPropagation(); setSelected(ticket); }}>Review</button>
                            <button className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border rounded hover:bg-blue-100" onClick={(e) => { e.stopPropagation(); openMaps(ticket); }}>Map</button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                );
              })()}
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Details</h3>
                <div className="text-sm text-gray-500">{selected ? selected.status : "Select a ticket"}</div>
              </div>

              {!selected ? (
                <div className="py-12 text-center text-gray-500">Select a ticket to see details</div>
              ) : (
                <div className="space-y-3">
                  <div><strong>Bin:</strong> {selected.binId || "N/A"}</div>
                  <div><strong>Area:</strong> {(selected.area && (selected.area.name || selected.area)) || "N/A"}</div>
                  <div><strong>Address:</strong> {selected.address || "N/A"}</div>
                  {selected.sensorData && <div><strong>Fill:</strong> {selected.sensorData.fillPercentage}% ({selected.sensorData.fillLevel})</div>}
                  {selected.user && <div><strong>User:</strong> {selected.user.username || selected.user.email || "N/A"}</div>}
                  {selected.description && <div><strong>Description:</strong><div className="mt-1 text-gray-700">{selected.description}</div></div>}
                  
                  {selected.review && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-700 mb-2">Review</h4>
                      <p className="text-gray-600">{selected.review.note}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Reviewed by {selected.review.reviewedBy} on {new Date(selected.review.reviewedAt).toLocaleString()}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    <button 
                      className="px-3 py-2 bg-green-600 text-white rounded" 
                      disabled={busyId === selected._id} 
                      onClick={() => setReviewDialogOpen(true)}
                    >
                      {busyId === selected._id ? "..." : "Mark & Review"}
                    </button>
                    <button 
                      className="px-3 py-2 bg-red-600 text-white rounded" 
                      disabled={busyId === selected._id} 
                      onClick={() => updateStatus(selected, "Cancelled")}
                    >
                      {busyId === selected._id ? "..." : "Cancel Ticket"}
                    </button>
                    <button 
                      className="px-3 py-2 bg-gray-100 rounded text-gray-800" 
                      onClick={() => openMaps(selected)}
                    >
                      Open in Maps
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submit Review</DialogTitle>
        <DialogContent>
          <div className="py-4">
            <TextField
              label="Review Note"
              multiline
              rows={4}
              fullWidth
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add your review comments here..."
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setReviewDialogOpen(false)}
            disabled={submittingReview}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={submittingReview || !reviewNote.trim()}
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogActions>
      </Dialog>
    </WMADrawer>
  );
};

export default TicketsReview;
