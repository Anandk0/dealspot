"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Settings, IndianRupee, Image, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAdminGuard } from "@/lib/useAdminGuard";

export default function SettingsPage() {
  const { isAuthorized, isLoading: guardLoading } = useAdminGuard("SUPER_ADMIN");

  const [settings, setSettings] = useState<Record<string, string>>({
    contact_unlock_price: "",
    max_images_per_listing: "",
    listing_expiry_days: "",
    maintenance_mode: "false",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.adminGetSettings();
      setSettings({
        contact_unlock_price: data.contact_unlock_price || "",
        max_images_per_listing: data.max_images_per_listing || "",
        listing_expiry_days: data.listing_expiry_days || "",
        maintenance_mode: data.maintenance_mode || "false",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load settings";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchSettings();
    }
  }, [isAuthorized, fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await api.adminUpdateSettings(settings);
      toast.success(result.message || "Settings saved successfully");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (guardLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const priceInRupees = settings.contact_unlock_price
    ? (parseInt(settings.contact_unlock_price, 10) / 100).toFixed(0)
    : "0";

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-800">Platform Settings</h1>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl space-y-6">
        {/* Contact Unlock Price */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Contact Unlock Price (in paise)
            </label>
          </div>
          <Input
            type="number"
            min="0"
            value={settings.contact_unlock_price}
            onChange={(e) =>
              setSettings({ ...settings, contact_unlock_price: e.target.value })
            }
            className="h-11"
            placeholder="e.g., 5000"
          />
          <p className="text-xs text-gray-400">
            {settings.contact_unlock_price
              ? `${settings.contact_unlock_price} paise = ₹${priceInRupees}`
              : "Enter price in paise (100 paise = ₹1)"}
          </p>
        </div>

        {/* Max Images per Listing */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Max Images per Listing
            </label>
          </div>
          <Input
            type="number"
            min="1"
            max="20"
            value={settings.max_images_per_listing}
            onChange={(e) =>
              setSettings({ ...settings, max_images_per_listing: e.target.value })
            }
            className="h-11"
            placeholder="e.g., 5"
          />
          <p className="text-xs text-gray-400">
            Maximum number of images a user can upload per listing
          </p>
        </div>

        {/* Listing Expiry Days */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Listing Expiry (days)
            </label>
          </div>
          <Input
            type="number"
            min="1"
            value={settings.listing_expiry_days}
            onChange={(e) =>
              setSettings({ ...settings, listing_expiry_days: e.target.value })
            }
            className="h-11"
            placeholder="e.g., 30"
          />
          <p className="text-xs text-gray-400">
            Number of days after which active listings automatically expire
          </p>
        </div>

        {/* Maintenance Mode */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">
              Maintenance Mode
            </label>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={settings.maintenance_mode === "true"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maintenance_mode: e.target.checked ? "true" : "false",
                })
              }
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-gray-600">
              {settings.maintenance_mode === "true"
                ? "Enabled — site shows maintenance page to users"
                : "Disabled — site is accessible to all users"}
            </span>
          </label>
          <p className="text-xs text-gray-400">
            When enabled, regular users will see a maintenance page instead of the site
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary h-11 px-8"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
