"use client";

const mockAudit = [
  { id: 1, actor: "Admin", action: "APPROVE_LISTING", target: "Listing #101", details: null, time: "2026-07-12 14:30" },
  { id: 2, actor: "Admin", action: "REJECT_LISTING", target: "Listing #98", details: "Spam content", time: "2026-07-12 11:00" },
  { id: 3, actor: "SuperAdmin", action: "BAN_USER", target: "User #4", details: "Repeated violations", time: "2026-07-11 16:45" },
  { id: 4, actor: "SuperAdmin", action: "ROLE_CHANGE", target: "User #3", details: "USER → CHECKER", time: "2026-07-10 09:30" },
  { id: 5, actor: "Admin", action: "CREATE_BANNER", target: "Banner #2", details: "ಟ್ರ್ಯಾಕ್ಟರ್ ಆಫರ್", time: "2026-07-09 12:00" },
  { id: 6, actor: "SuperAdmin", action: "UPDATE_SETTING", target: "Setting", details: "contact_unlock_price=5000", time: "2026-07-08 10:00" },
];

export default function AuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Audit Logs</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Time</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Actor</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Action</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Target</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {mockAudit.map((log) => (
              <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 text-gray-500 text-xs">{log.time}</td>
                <td className="px-5 py-3 font-medium">{log.actor}</td>
                <td className="px-5 py-3">
                  <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{log.target}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{log.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
