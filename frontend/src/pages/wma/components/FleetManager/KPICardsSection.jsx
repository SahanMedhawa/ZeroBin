import React from "react";
import { DollarSign, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { KPICard } from "./KPICard";
import { formatCurrency } from "../../../../utility/FleetM_Dashbaord";

/**
 * KPI Cards Section Component
 * Displays key performance indicators
 */
export const KPICardsSection = ({
  totalIncome,
  inProgressGarbages,
  pendingGarbages,
  collectedGarbages,
  completionRate,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <KPICard
      title="Daily Revenue"
      value={formatCurrency(totalIncome)}
      subtext="Expected income"
      icon={<DollarSign className="h-5 w-5" />}
      trend="+12.5%"
      gradient="from-emerald-500 to-teal-600"
    />
    <KPICard
      title="Active Collections"
      value={inProgressGarbages}
      subtext="In progress now"
      icon={<Truck className="h-5 w-5" />}
      trend={`${completionRate}%`}
      gradient="from-blue-500 to-cyan-600"
    />
    <KPICard
      title="Pending Requests"
      value={pendingGarbages}
      subtext="Awaiting pickup"
      icon={<AlertCircle className="h-5 w-5" />}
      trend="-8.2%"
      gradient="from-amber-500 to-orange-600"
    />
    <KPICard
      title="Completed Today"
      value={collectedGarbages}
      subtext="Successfully collected"
      icon={<CheckCircle2 className="h-5 w-5" />}
      trend="+22.3%"
      gradient="from-green-500 to-emerald-600"
    />
  </div>
);
