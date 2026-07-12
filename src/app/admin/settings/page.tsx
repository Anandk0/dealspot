"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    contact_unlock_price: "5000",
    max_images_per_listing: "5",
    listing_expiry_days: "30",
    maintenance_mode: "false",
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Platform Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Contact Unlock Price (in paise)
          </label>
          <Input
            value={settings.contact_unlock_price}
            onChange={(e) => setSettings({ ...settings, contact_unlock_price: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-gray-400 mt-1">5000 paise = ₹50</p>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Max Images per Listing
          </label>
          <Input
            value={settings.max_images_per_listing}
            onChange={(e) => setSettings({ ...settings, max_images_per_listing: e.target.value })}
            className="h-11"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Listing Expiry (days)
          </label>
          <Input
            value={settings.listing_expiry_days}
            onChange={(e) => setSettings({ ...settings, listing_expiry_days: e.target.value })}
            className="h-11"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Maintenance Mode
          </label>
          <select
            value={settings.maintenance_mode}
            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.value })}
            className="w-full h-11 border rounded-md px-3"
          >
            <option value="false">Off</option>
            <option value="true">On (site shows maintenance page)</option>
          </select>
        </div>

        <Button onClick={handleSave} className="bg-primary h-11 px-8">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
