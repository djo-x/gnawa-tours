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
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { useMediaLibrary } from "@/hooks/use-media-library";
import type { HeroSettings } from "@/types/section";

function normalizeShowcaseImages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "");
      }
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }
  if (value && typeof value === "object") {
    const images = (value as { images?: unknown }).images;
    if (Array.isArray(images)) {
      return images.filter((item): item is string => typeof item === "string" && item.trim() !== "");
    }
  }
  return [];
}

export default function SettingsPage() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [heroImage, setHeroImage] = useState("");
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [heroLoading, setHeroLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);
  const [showcaseInput, setShowcaseInput] = useState("");
  const [showcasePickerOpen, setShowcasePickerOpen] = useState(false);
  const [selectedShowcase, setSelectedShowcase] = useState<string[]>([]);
  const { media, loading: mediaLoading, refresh } = useMediaLibrary();

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [heroRes, settingsRes] = await Promise.all([
      supabase.from("hero_settings").select("*").limit(1).single(),
      supabase.from("site_settings").select("*"),
    ]);

    if (heroRes.data) {
      const heroData = heroRes.data as HeroSettings;
      setHero(heroData);
      setHeroImage(heroData.background_image || "");
    }
    if (settingsRes.data) {
      const map: Record<string, unknown> = {};
      for (const s of settingsRes.data) {
        map[s.key] = s.value;
      }
      setSettings(map);
      const normalizedShowcase = normalizeShowcaseImages(map.showcase_images);
      if (normalizedShowcase.length > 0) {
        setShowcaseImages(normalizedShowcase);
      }
    }
  }, []);

  useEffect(() => {
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
      background_image: heroImage,
      overlay_opacity: parseFloat(formData.get("overlay_opacity") as string) || 0.45,
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Paramètres du héros mis à jour");
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
      updateSiteSetting("showcase_images", showcaseImages),
    ];

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      toast.error("Échec de la mise à jour de certains paramètres");
    } else {
      toast.success("Paramètres du site mis à jour");
    }
    setSettingsLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-4xl font-bold">Paramètres</h1>

      {/* Hero Editor */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Section héros</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHeroSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Titre principal</Label>
              <Input
                id="headline"
                name="headline"
                defaultValue={hero?.headline || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subheadline">Sous‑titre</Label>
              <Input
                id="subheadline"
                name="subheadline"
                defaultValue={hero?.subheadline || ""}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cta_text">Texte du CTA</Label>
                <Input
                  id="cta_text"
                  name="cta_text"
                  defaultValue={hero?.cta_text || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overlay_opacity">Opacité du voile (0‑1)</Label>
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
              <Label htmlFor="background_image">URL de l’image d’arrière‑plan</Label>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="background_image"
                    name="background_image"
                    value={heroImage}
                    onChange={(e) => setHeroImage(e.target.value)}
                    placeholder="Collez l’URL de l’image ou choisissez dans la bibliothèque"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      await refresh();
                      setMediaOpen(true);
                    }}
                  >
                    Choisir dans la bibliothèque
                  </Button>
                </div>
                {heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroImage}
                    alt="Aperçu de l’arrière‑plan du héros"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                )}
              </div>
            </div>
            <Button type="submit" disabled={heroLoading}>
              {heroLoading ? "Enregistrement..." : "Enregistrer les réglages du héros"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Site Settings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Paramètres du site</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSettingsSave} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="site_name">Nom du site</Label>
                <Input
                  id="site_name"
                  name="site_name"
                  defaultValue={(settings.site_name as string) || "Gnaoua Tours"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">E‑mail de contact</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  defaultValue={(settings.contact_email as string) || ""}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  defaultValue={(settings.contact_phone as string) || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={(settings.address as string) || ""}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Images de vitrine</Label>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={showcaseInput}
                  onChange={(e) => setShowcaseInput(e.target.value)}
                  placeholder="Collez l’URL de l’image"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const trimmed = showcaseInput.trim();
                    if (!trimmed) return;
                    setShowcaseImages((prev) =>
                      Array.from(new Set([...prev, trimmed]))
                    );
                    setShowcaseInput("");
                  }}
                >
                    Ajouter l’URL
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await refresh();
                    setSelectedShowcase([]);
                    setShowcasePickerOpen(true);
                  }}
                >
                  Ajouter depuis la bibliothèque
                </Button>
              </div>
              {showcaseImages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Aucune image de vitrine pour le moment.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {showcaseImages.map((url, i) => (
                    <div
                      key={`${url}-${i}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border/70"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Showcase ${i + 1}`} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowcaseImages((prev) => prev.filter((_, idx) => idx !== i))
                          }
                        >
                          Retirer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={settingsLoading}>
              {settingsLoading ? "Enregistrement..." : "Enregistrer les paramètres du site"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <MediaLibraryDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        media={media}
        loading={mediaLoading}
        onRefresh={refresh}
        onPick={(url) => setHeroImage(url)}
      />

      <MediaLibraryDialog
        open={showcasePickerOpen}
        onOpenChange={setShowcasePickerOpen}
        media={media}
        loading={mediaLoading}
        onRefresh={refresh}
        multiple
        selectedUrls={selectedShowcase}
        onToggleSelect={(url) => {
          setSelectedShowcase((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
          );
        }}
        onConfirm={() => {
          setShowcaseImages((prev) =>
            Array.from(new Set([...prev, ...selectedShowcase]))
          );
          setShowcasePickerOpen(false);
        }}
        title="Sélectionner des images de vitrine"
      />
    </div>
  );
}
