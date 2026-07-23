"use client";
import { useState, useEffect, useCallback } from "react";
import { Ban, UserCheck, Shield, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api, AdminUserResponse, PagedResponse } from "@/lib/api";
import { useAdminGuard, hasMinimumRole } from "@/lib/useAdminGuard";
import { useAuth } from "@/lib/auth-context";

const ROLES = ["USER", "CHECKER", "ADMIN"] as const;

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "USER":
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    case "CHECKER":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "ADMIN":
      return "bg-purple-100 text-purple-700 hover:bg-purple-100";
    case "SUPER_ADMIN":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-700 hover:bg-gray-100";
  }
}

export default function UsersPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("ADMIN");
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Ban modal state
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<AdminUserResponse | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banLoading, setBanLoading] = useState(false);

  // Role change state
  const [roleTarget, setRoleTarget] = useState<AdminUserResponse | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [roleLoading, setRoleLoading] = useState(false);

  const isSuperAdmin = hasMinimumRole(currentUser?.role, "SUPER_ADMIN");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data: PagedResponse<AdminUserResponse> = await api.adminGetUsers(page, pageSize, search || undefined);
      setUsers(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  const handleSearch = () => {
    setPage(0);
    setSearch(searchInput);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Ban user
  const openBanModal = (user: AdminUserResponse) => {
    setBanTarget(user);
    setBanReason("");
    setBanModalOpen(true);
  };

  const handleBan = async () => {
    if (!banTarget || !banReason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }
    setBanLoading(true);
    try {
      await api.adminBanUser(banTarget.id, banReason.trim());
      toast.success(`${banTarget.name} has been banned`);
      setBanModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to ban user");
    } finally {
      setBanLoading(false);
    }
  };

  // Unban user
  const handleUnban = async (user: AdminUserResponse) => {
    try {
      await api.adminUnbanUser(user.id);
      toast.success(`${user.name} has been unbanned`);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to unban user");
    }
  };

  // Role change
  const openRoleModal = (user: AdminUserResponse) => {
    setRoleTarget(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleRoleChange = async () => {
    if (!roleTarget || !newRole || newRole === roleTarget.role) {
      setRoleModalOpen(false);
      return;
    }
    setRoleLoading(true);
    try {
      await api.adminChangeRole(roleTarget.id, newRole);
      toast.success(`${roleTarget.name}'s role changed to ${newRole}`);
      setRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change role");
    } finally {
      setRoleLoading(false);
    }
  };

  if (guardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">{totalElements} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search by name or phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} variant="outline">
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-gray-400" size={28} />
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            No users found
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Phone</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Role</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Listings</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Joined</th>
                <th className="text-left px-5 py-3 text-gray-600 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div>
                      <span className="font-medium">{u.name}</span>
                      {u.location && (
                        <span className="text-xs text-gray-400 ml-2">{u.location}</span>
                      )}
                    </div>
                    {u.email && (
                      <span className="text-xs text-gray-400">{u.email}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.phone}</td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className={`text-xs ${getRoleBadgeClass(u.role)}`}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {u.banned ? (
                      <div>
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">Banned</span>
                        {u.banReason && (
                          <p className="text-xs text-gray-400 mt-1 max-w-[120px] truncate" title={u.banReason}>
                            {u.banReason}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Active</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{u.listingCount ?? 0}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {!u.banned ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 text-xs h-7"
                          onClick={() => openBanModal(u)}
                        >
                          <Ban size={12} className="mr-1" /> Ban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 text-xs h-7"
                          onClick={() => handleUnban(u)}
                        >
                          <UserCheck size={12} className="mr-1" /> Unban
                        </Button>
                      )}
                      {isSuperAdmin && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => openRoleModal(u)}
                        >
                          <Shield size={12} className="mr-1" /> Role
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      <Dialog open={banModalOpen} onOpenChange={setBanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Provide a reason for banning {banTarget?.name}. This action will prevent the user from logging in.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Reason for ban
            </label>
            <Input
              placeholder="e.g., Spam listings, Fraudulent activity..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBan();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={banLoading || !banReason.trim()}
            >
              {banLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              Change the role for {roleTarget?.name}. Current role: {roleTarget?.role}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              New Role
            </label>
            <Select value={newRole} onValueChange={(val) => setNewRole(val ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={roleLoading || newRole === roleTarget?.role}
            >
              {roleLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
