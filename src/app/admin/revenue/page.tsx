"use client";
import { IndianRupee, TrendingUp, CreditCard, AlertCircle } from "lucide-react";

const transactions = [
  { id: "pay_abc1", user: "ರಾಮಣ್ಣ", listing: "ರಾಗಿ 50 ಕ್ವಿ", amount: 50, status: "PAID", date: "2026-07-12 14:30" },
  { id: "pay_abc2", user: "ಕೃಷ್ಣಪ್ಪ", listing: "ಜರ್ಸಿ ಹಸು", amount: 50, status: "PAID", date: "2026-07-12 11:20" },
  { id: "pay_abc3", user: "ಮಹೇಶ್", listing: "5 ಎಕರೆ ಭೂಮಿ", amount: 50, status: "PAID", date: "2026-07-11 16:45" },
  { id: "pay_abc4", user: "ಸಿದ್ದಪ್ಪ", listing: "ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ", amount: 50, status: "FAILED", date: "2026-07-11 09:15" },
  { id: "pay_abc5", user: "ರಮೇಶ್", listing: "ಎಲೆಕ್ಟ್ರಿಷಿಯನ್", amount: 50, status: "PAID", date: "2026-07-10 18:00" },
];

export default function RevenuePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Revenue & Transactions</h1>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <IndianRupee size={16} className="text-green-600" />
            <span className="text-xs text-gray-500">Today</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹100</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />
            <span className="text-xs text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹2,875</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={16} className="text-purple-600" />
            <span className="text-xs text-gray-500">Total (All Time)</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹12,450</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-red-500" />
            <span className="text-xs text-gray-500">Failed</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₹50</p>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Payment ID</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">User</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Listing</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{tx.id}</td>
                <td className="px-5 py-3">{tx.user}</td>
                <td className="px-5 py-3 text-gray-600">{tx.listing}</td>
                <td className="px-5 py-3 font-semibold">₹{tx.amount}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${
                    tx.status === "PAID" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
