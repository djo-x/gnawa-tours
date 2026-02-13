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
import { createSection, updateSection } from "@/app/admin/actions/sections";
import { toast } from "sonner";
import type { DynamicSection } from "@/types/section";

interface SectionFormProps {
  section?: DynamicSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionForm({ section, open, onOpenChange }: SectionFormProps) {
  const [loading, setLoading] = useState(false);
  const formKey = `${section?.id ?? "new"}-${open ? "open" : "closed"}`;
  const contentDefault = section
    ? JSON.stringify(section.content ?? {}, null, 2)
    : "{}";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const contentValue = (formData.get("content") as string) || "{}";
    let parsedContent = {};
    try {
      parsedContent = JSON.parse(contentValue);
    } catch {
      toast.error("Invalid JSON in content field");
      setLoading(false);
      return;
    }

    const data = {
      section_key: formData.get("section_key") as string,
      title: formData.get("title") as string,
      subtitle: formData.get("subtitle") as string,
      content: parsedContent,
      layout_type: formData.get("layout_type") as DynamicSection["layout_type"],
      background_image: formData.get("background_image") as string,
      is_visible: formData.get("is_visible") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0,
    };

    const result = section
      ? await updateSection(section.id, data)
      : await createSection(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(section ? "Section updated" : "Section created");
      onOpenChange(false);
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] max-w-2xl overflow-y-auto border-gold/25">
        <DialogHeader>
          <DialogTitle>
            {section ? "Edit Section" : "New Section"}
          </DialogTitle>
        </DialogHeader>

        <form key={formKey} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required defaultValue={section?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section_key">Section Key *</Label>
              <Input
                id="section_key"
                name="section_key"
                required
                defaultValue={section?.section_key}
                placeholder="e.g. our-story"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" defaultValue={section?.subtitle || ""} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="layout_type">Layout Type *</Label>
              <Select name="layout_type" defaultValue={section?.layout_type || "centered"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-left">Text Left</SelectItem>
                  <SelectItem value="text-right">Text Right</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                  <SelectItem value="full-bleed">Full Bleed</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                defaultValue={section?.display_order || 0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="background_image">Background Image URL</Label>
            <Input
              id="background_image"
              name="background_image"
              defaultValue={section?.background_image || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (JSON)</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={contentDefault}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_visible"
              name="is_visible"
              defaultChecked={section?.is_visible ?? true}
              className="h-4 w-4"
            />
            <Label htmlFor="is_visible">Visible</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : section ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
