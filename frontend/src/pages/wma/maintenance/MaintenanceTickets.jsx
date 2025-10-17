import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AuthService from "../../../api/wmaApi";
import { getAllGarbages } from "../../../api/garbageApi";
import { getAllGrievances } from "../../../api/grievanceApi";

const MaintenanceTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRaw, setLastRaw] = useState(null);
  const [lastWma, setLastWma] = useState(null);

  const DEBUG = false; // set true to enable console logs for troubleshooting

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

  const loadTickets = async () => {
    setLoading(true);
    try {
      const wma = await AuthService.getCurrentWmaDetails();
      const servicedAreas = (wma?.servicedAreas || []).map((a) => (typeof a === "string" ? a : a?._id || a?.id)).filter(Boolean);

      const raw = await getAllGarbages();
      setLastRaw(raw);
      const garbages = normalizeGarbagesResponse(raw);

      // map garbages by binId and by _id for quick lookup
      const byBinId = new Map();
      (garbages || []).forEach((g) => {
        if (g.binId) byBinId.set(String(g.binId), g);
        if (g._id) byBinId.set(String(g._id), g);
      });

      // fetch grievances/tickets
      let rawGr = [];
      try {
        const grResp = await getAllGrievances();
        rawGr = normalizeGrievancesResponse(grResp);
      } catch (e) {
        if (DEBUG) console.warn('Failed to fetch grievances:', e);
      }

      if (DEBUG) {
        console.debug('WMA servicedAreas:', servicedAreas);
        console.debug('Raw garbages response:', raw);
        console.debug('Normalized garbages count:', garbages.length);
        console.debug('Grievances fetched:', (rawGr || []).length);
      }

      // bin-based tickets (auto-detected)
      const binCandidates = (garbages || []).filter((g) => {
        const pct = g?.sensorData?.fillPercentage ?? (g?.sensorData?.percentage ?? -1);
        if (pct < 75) return false;
        const areaId = typeof g.area === 'string' ? g.area : g.area?._id || g.area?.id;
        if (!areaId) return false;
        if (!servicedAreas || servicedAreas.length === 0) return true;
        return servicedAreas.map(String).includes(String(areaId));
      }).map(g => ({ ...g, __ticketType: 'bin' }));

      // convert grievances to ticket-like items
      const grievanceTickets = (rawGr || []).map((gr) => {
          const populatedGarbage = gr.garbageId || gr.garbage || null;
          const binKey = String(gr.binId || (populatedGarbage && (populatedGarbage.binId || populatedGarbage._id)) || "");
          const matched = byBinId.get(binKey) || null;

          const binId = populatedGarbage?.binId || gr.binId || matched?.binId || null;
          const address = populatedGarbage?.address || matched?.address || gr.address || "";
          const areaField = populatedGarbage?.area || gr.area || gr.areaId || matched?.area || null;

          return {
            _id: gr._id,
            binId,
            address,
            area: areaField,
            severity: gr.severity || gr.priority || "Medium",
            status: gr.status || "Open",
            description: gr.description || gr.message || "",
            raw: gr,
          };
      }).filter(gt => {
        const areaId = typeof gt.area === 'string' ? gt.area : gt.area?._id || gt.area?.id;
        if (!servicedAreas || servicedAreas.length === 0) return true;
        return areaId && servicedAreas.map(String).includes(String(areaId));
      });

      // combine grievances first, then bin candidates
      const combined = [
        ...grievanceTickets,
        ...binCandidates,
      ];

      combined.sort((a, b) => {
        const sevRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        if (a.__ticketType === 'grievance' && b.__ticketType === 'grievance') {
          return (sevRank[b.severity] || 0) - (sevRank[a.severity] || 0);
        }
        if (a.__ticketType === 'grievance') return -1;
        if (b.__ticketType === 'grievance') return 1;
        return (b.sensorData?.fillPercentage || 0) - (a.sensorData?.fillPercentage || 0);
      });

      setTickets(combined.slice(0, 50));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load maintenance tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    const id = setInterval(loadTickets, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">Maintenance Tickets</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{loading ? "Loading..." : `${tickets.length} open`}</span>
          <button
            onClick={() => {
              console.log({ lastWma, lastRaw });
              toast.info("Debug info logged to console");
            }}
            className="text-xs px-2 py-1 bg-gray-50 border rounded text-gray-600 hover:bg-gray-100"
          >
            Show debug
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="mt-2">Loading tickets...</div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div>No maintenance tickets (≥75%) in your areas</div>
          <div className="text-xs text-gray-400 mt-2">Garbages returned: {(lastRaw && (Array.isArray(lastRaw) ? lastRaw.length : (lastRaw.garbages || lastRaw.bins || lastRaw.data || []).length)) || 0} • Serviced areas: {(lastWma?.servicedAreas || []).length}</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((t) => {
            const pct = t.sensorData?.fillPercentage ?? 0;
            const areaName = typeof t.area === "string" ? "Unknown Area" : t.area?.name || "Unknown Area";
            return (
              <li key={t._id} className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{t.binId || "Bin"}</div>
                    <div className="text-xs text-gray-500">{areaName} • {t.address}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${pct >= 90 ? "text-red-600" : "text-orange-600"}`}>{pct}%</div>
                    <div className="text-xs text-gray-400">{t.status || "Pending"}</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">User: {t.user?.username || t.user?.email || "N/A"}</div>
                  <div>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(window.location.origin + `/admin/garbage/${t._id}`);
                        toast.info("Link copied to clipboard");
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-purple-50 text-purple-600 hover:bg-purple-100 transition"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MaintenanceTickets;
