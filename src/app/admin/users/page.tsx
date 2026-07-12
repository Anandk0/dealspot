"use client";
import { useState } from "react";
import { Ban, Shield, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const mockUsers = [
  { id: 1, name: "ರಾಮಣ್ಣ", phone: "9876543210", role: "USER", listings: 3, banned: false, createdAt: "2026-06-01" },
  { id: 2, name: "ಕೃಷ್ಣಪ್ಪ", phone: "9876543211", role: "USER", listings: 7, banned: false, createdAt: "2026-06-05" },
  { id: 3, name: "ಮಹೇಶ್", phone: "9876543212", role: "CHECKER", listings: 0, banned: false, createdAt: "2026-06-10" },
  { id: 4, name: "ಸಿದ್ದಪ್ಪ", phone: "9876543213", role: "USER", listings: 12, banned: true, createdAt: "2026-06-15" },
  { id: 5, name: "Admin", phone: "9000000001", role: "SUPER_ADMIN", listings: 0, banned: false, createdAt: "2026-06-01" },
];

export default function UsersPage() {
  const [users] = useState(mockUsers);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">{users.length} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">User</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Phone</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Role</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Listings</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Joined</th>
              <th className="text-left px-5 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-gray-600">{u.phone}</td>
                <td className="px-5 py-3">
                  <Badge variant={u.role === "SUPER_ADMIN" ? "default" : "secondary"} className="text-xs">
                    {u.role}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-gray-600">{u.listings}</td>
                <td className="px-5 py-3">
                  {u.banned ? (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Banned</span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">{u.createdAt}</td>
                <td className="px-5 py-3">
                  <div className="flex gap-1">
                    {!u.banned ? (
                      <Button size="sm" variant="outline" className="text-red-600 text-xs h-7" onClick={() => toast.success(`${u.name} banned`)}>
                        <Ban size={12} className="mr-1" /> Ban
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="text-green-600 text-xs h-7" onClick={() => toast.success(`${u.name} unbanned`)}>
                        <UserCheck size={12} className="mr-1" /> Unban
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => toast.info("Role change dialog")}>
                      <Shield size={12} className="mr-1" /> Role
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
