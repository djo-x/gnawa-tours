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
import { Plus, Trash2 } from "lucide-react";
import { createProgram, updateProgram } from "@/app/admin/actions/programs";
import { toast } from "sonner";
import type { Program, ItineraryDay } from "@/types/program";

interface ProgramFormProps {
  program?: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgramForm({ program, open, onOpenChange }: ProgramFormProps) {
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<string[]>(
    program?.highlights || [""]
  );
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(
    program?.itinerary || [{ day: 1, title: "", description: "" }]
  );

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
      gallery_urls: program?.gallery_urls || [],
      cover_image: formData.get("cover_image") as string,
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_published: formData.get("is_published") === "on",
    };

    const result = program
      ? await updateProgram(program.id, data)
      : await createProgram(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(program ? "Program updated" : "Program created");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] max-w-2xl overflow-y-auto border-gold/25">
        <DialogHeader>
          <DialogTitle>
            {program ? "Edit Program" : "New Program"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
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
              <Label htmlFor="slug">Slug *</Label>
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
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                name="duration"
                required
                defaultValue={program?.duration}
                placeholder="5 days / 4 nights"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price_eur">Price (EUR) *</Label>
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
              <Label htmlFor="price_dzd">Price (DZD) *</Label>
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
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select name="difficulty" defaultValue={program?.difficulty || "moderate"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="challenging">Challenging</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={program?.start_date || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
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
              <Label htmlFor="cover_image">Cover Image URL</Label>
              <Input
                id="cover_image"
                name="cover_image"
                defaultValue={program?.cover_image || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                defaultValue={program?.display_order || 0}
              />
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-2">
            <Label>Highlights</Label>
            {highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={h}
                  onChange={(e) => {
                    const updated = [...highlights];
                    updated[i] = e.target.value;
                    setHighlights(updated);
                  }}
                  placeholder="Highlight"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setHighlights(highlights.filter((_, j) => j !== i))}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHighlights([...highlights, ""])}
            >
              <Plus size={14} className="mr-1" /> Add Highlight
            </Button>
          </div>

          {/* Itinerary */}
          <div className="space-y-2">
            <Label>Itinerary</Label>
            {itinerary.map((day, i) => (
              <div key={i} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Day {day.day}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Input
                  value={day.title}
                  onChange={(e) => {
                    const updated = [...itinerary];
                    updated[i] = { ...updated[i], title: e.target.value };
                    setItinerary(updated);
                  }}
                  placeholder="Day title"
                />
                <Textarea
                  value={day.description}
                  onChange={(e) => {
                    const updated = [...itinerary];
                    updated[i] = { ...updated[i], description: e.target.value };
                    setItinerary(updated);
                  }}
                  placeholder="Day description"
                  rows={2}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setItinerary([
                  ...itinerary,
                  {
                    day: itinerary.length + 1,
                    title: "",
                    description: "",
                  },
                ])
              }
            >
              <Plus size={14} className="mr-1" /> Add Day
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              defaultChecked={program?.is_published}
              className="h-4 w-4"
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : program ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
