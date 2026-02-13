"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateHeroSettings, updateSiteSetting } from "@/app/admin/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { HeroSettings } from "@/types/section";

export default function SettingsPage() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [heroLoading, setHeroLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [heroRes, settingsRes] = await Promise.all([
      supabase.from("hero_settings").select("*").limit(1).single(),
      supabase.from("site_settings").select("*"),
    ]);

    if (heroRes.data) setHero(heroRes.data as HeroSettings);
    if (settingsRes.data) {
      const map: Record<string, unknown> = {};
      for (const s of settingsRes.data) {
        map[s.key] = s.value;
      }
      setSettings(map);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  async function handleHeroSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHeroLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateHeroSettings({
      headline: formData.get("headline") as string,
      subheadline: formData.get("subheadline") as string,
      cta_text: formData.get("cta_text") as string,
      background_image: formData.get("background_image") as string,
      overlay_opacity: parseFloat(formData.get("overlay_opacity") as string) || 0.45,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Hero settings updated");
    }
    setHeroLoading(false);
  }

  async function handleSettingsSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSettingsLoading(true);

    const formData = new FormData(e.currentTarget);
    const updates = [
      updateSiteSetting("site_name", formData.get("site_name") as string),
      updateSiteSetting("contact_email", formData.get("contact_email") as string),
      updateSiteSetting("contact_phone", formData.get("contact_phone") as string),
      updateSiteSetting("address", formData.get("address") as string),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.error("Failed to update some settings");
    } else {
      toast.success("Site settings updated");
    }
    setSettingsLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-4xl font-bold">Settings</h1>

      {/* Hero Editor */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHeroSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                name="headline"
                defaultValue={hero?.headline || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subheadline">Subheadline</Label>
              <Input
                id="subheadline"
                name="subheadline"
                defaultValue={hero?.subheadline || ""}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cta_text">CTA Text</Label>
                <Input
                  id="cta_text"
                  name="cta_text"
                  defaultValue={hero?.cta_text || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overlay_opacity">Overlay Opacity (0-1)</Label>
                <Input
                  id="overlay_opacity"
                  name="overlay_opacity"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  defaultValue={hero?.overlay_opacity || 0.45}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="background_image">Background Image URL</Label>
              <Input
                id="background_image"
                name="background_image"
                defaultValue={hero?.background_image || ""}
              />
            </div>
            <Button type="submit" disabled={heroLoading}>
              {heroLoading ? "Saving..." : "Save Hero Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Site Settings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSettingsSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  name="site_name"
                  defaultValue={(settings.site_name as string) || "Gnawa Tours"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  defaultValue={(settings.contact_email as string) || ""}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  defaultValue={(settings.contact_phone as string) || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={(settings.address as string) || ""}
                />
              </div>
            </div>
            <Button type="submit" disabled={settingsLoading}>
              {settingsLoading ? "Saving..." : "Save Site Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
