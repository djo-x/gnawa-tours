"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { createProgram, updateProgram } from "@/app/admin/actions/programs";
import { toast } from "sonner";
import type { Program, ItineraryDay } from "@/types/program";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { useMediaLibrary } from "@/hooks/use-media-library";

interface ProgramFormProps {
  program?: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgramForm({ program, open, onOpenChange }: ProgramFormProps) {
  const formKey = `${program?.id ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] max-w-3xl overflow-y-auto border-gold/25">
        <DialogHeader>
          <DialogTitle>{program ? "Modifier le programme" : "Nouveau programme"}</DialogTitle>
        </DialogHeader>
        <ProgramFormFields
          key={formKey}
          program={program}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProgramFormFields({
  program,
  onOpenChange,
}: {
  program?: Program | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>(
    program?.highlights || [""]
  );
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    program?.itinerary || [{ day: 1, title: "", description: "" }]
  );
  const [coverImage, setCoverImage] = useState(program?.cover_image || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    program?.gallery_urls || []
  );
  const [galleryInput, setGalleryInput] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery">("cover");
  const [selectedGallery, setSelectedGallery] = useState<string[]>([]);
  const { media, loading: mediaLoading, refresh } = useMediaLibrary();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const normalizeDate = (value: FormDataEntryValue | null) => {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    };
    const data = {
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      duration: formData.get("duration") as string,
      start_date: normalizeDate(formData.get("start_date")),
      end_date: normalizeDate(formData.get("end_date")),
      price_eur: parseFloat(formData.get("price_eur") as string) || 0,
      price_dzd: parseFloat(formData.get("price_dzd") as string) || 0,
      difficulty: formData.get("difficulty") as Program["difficulty"],
      highlights: highlights.filter(Boolean),
      itinerary: itinerary.filter((d) => d.title),
      gallery_urls: galleryUrls.filter(Boolean),
      cover_image: coverImage,
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_published: formData.get("is_published") === "on",
    };

    const result = program
      ? await updateProgram(program.id, data)
      : await createProgram(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(program ? "Programme mis à jour" : "Programme créé");
      onOpenChange(false);
    }

    setLoading(false);
  }

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function addGalleryUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    setGalleryUrls((prev) => Array.from(new Set([...prev, trimmed])));
    setGalleryInput("");
  }

  function removeGalleryUrl(index: number) {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={program?.title}
              onChange={(e) => {
                const slugInput = document.getElementById("slug") as HTMLInputElement;
                if (slugInput && !program) {
                  slugInput.value = generateSlug(e.target.value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Identifiant (slug) *</Label>
            <Input id="slug" name="slug" required defaultValue={program?.slug} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={program?.description || ""}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duration">Durée *</Label>
            <Input
              id="duration"
              name="duration"
              required
              defaultValue={program?.duration}
              placeholder="5 jours / 4 nuits"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_eur">Prix (EUR) *</Label>
            <Input
              id="price_eur"
              name="price_eur"
              type="number"
              step="0.01"
              required
              defaultValue={program?.price_eur ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_dzd">Prix (DZD) *</Label>
            <Input
              id="price_dzd"
              name="price_dzd"
              type="number"
              step="0.01"
              required
              defaultValue={program?.price_dzd ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulté</Label>
            <Select name="difficulty" defaultValue={program?.difficulty || "moderate"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Facile</SelectItem>
                <SelectItem value="moderate">Modéré</SelectItem>
                <SelectItem value="challenging">Difficile</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="start_date">Date de début</Label>
            <Input
              id="start_date"
              name="start_date"
              type="date"
              defaultValue={program?.start_date || ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Date de fin</Label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              defaultValue={program?.end_date || ""}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cover_image">Image de couverture</Label>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Input
                  id="cover_image"
                  name="cover_image"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Collez l’URL de l’image ou choisissez dans la bibliothèque"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    await refresh();
                    setPickerMode("cover");
                    setPickerOpen(true);
                  }}
                >
                  Choisir
                </Button>
              </div>
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt="Aperçu de la couverture"
                  className="h-32 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Ordre d’affichage</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={program?.display_order || 0}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Images de galerie</Label>
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await refresh();
                setSelectedGallery([]);
                setPickerMode("gallery");
                setPickerOpen(true);
              }}
            >
              Ajouter depuis la bibliothèque
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              value={galleryInput}
              onChange={(e) => setGalleryInput(e.target.value)}
              placeholder="Collez l’URL de l’image"
            />
            <Button type="button" onClick={() => addGalleryUrl(galleryInput)}>
              Ajouter l’URL
            </Button>
          </div>
          {galleryUrls.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              <ImageIcon size={18} />
              Aucune image de galerie pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryUrls.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-border/70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Galerie ${i + 1}`} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeGalleryUrl(i)}
                    >
                      Retirer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <Label>Points forts</Label>
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={h}
                onChange={(e) => {
                  const updated = [...highlights];
                  updated[i] = e.target.value;
                  setHighlights(updated);
                }}
              />
              {highlights.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setHighlights([...highlights, ""])}
          >
            <Plus size={16} className="mr-1" /> Ajouter un point fort
          </Button>
        </div>

        {/* Itinerary */}
        <div className="space-y-2">
          <Label>Itinéraire</Label>
          {itinerary.map((day, i) => (
            <div key={i} className="rounded-lg border border-border/70 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Label>Jour</Label>
                <Input
                  type="number"
                  value={day.day}
                  onChange={(e) => {
                    const updated = [...itinerary];
                    updated[i].day = parseInt(e.target.value);
                    setItinerary(updated);
                  }}
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <Input
                placeholder="Titre"
                value={day.title}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[i].title = e.target.value;
                  setItinerary(updated);
                }}
              />
              <Textarea
                placeholder="Description"
                value={day.description}
                onChange={(e) => {
                  const updated = [...itinerary];
                  updated[i].description = e.target.value;
                  setItinerary(updated);
                }}
                rows={3}
                className="mt-2"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }])
            }
          >
            <Plus size={16} className="mr-1" /> Ajouter un jour
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            defaultChecked={program?.is_published ?? false}
            className="h-4 w-4"
          />
          <Label htmlFor="is_published">Publié</Label>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : program ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>

      <MediaLibraryDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        media={media}
        loading={mediaLoading}
        onRefresh={refresh}
        multiple={pickerMode === "gallery"}
        selectedUrls={selectedGallery}
        onToggleSelect={(url) => {
          setSelectedGallery((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
          );
        }}
        onPick={(url) => setCoverImage(url)}
        onConfirm={() => {
          setGalleryUrls((prev) => Array.from(new Set([...prev, ...selectedGallery])));
          setPickerOpen(false);
        }}
        title="Sélectionner des images du programme"
      />
    </>
  );
}
