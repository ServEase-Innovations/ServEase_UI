import { useState } from "react";
import Tickets from "./Tickets";
import OnDemandEscalations from "./OnDemandEscalations";
import { useAdminOpsSocket } from "src/hooks/useAdminTicketSocket";
import { cn } from "../../utils";

type AdminTab = "tickets" | "on-demand";

/**
 * Admin operations hub: support tickets + on-demand booking escalations.
 * Mount this route in your admin shell (e.g. /admin/operations).
 */
const AdminOperationsDashboard = () => {
  const [tab, setTab] = useState<AdminTab>("on-demand");
  useAdminOpsSocket(true);

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "on-demand"
              ? "bg-sky-600 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          onClick={() => setTab("on-demand")}
        >
          On-demand escalations
        </button>
        <button
          type="button"
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            tab === "tickets"
              ? "bg-sky-600 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          onClick={() => setTab("tickets")}
        >
          Support tickets
        </button>
      </div>

      {tab === "on-demand" ? <OnDemandEscalations /> : <Tickets />}
    </div>
  );
};

export default AdminOperationsDashboard;
