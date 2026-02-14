"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Trash2, Edit2, Image as ImageIcon, Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { MediaItem } from "@/types/settings";

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const [altText, setAltText] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "image" | "audio">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMedia(data as MediaItem[]);
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          toast.error(err.error || "Échec de l’envoi");
          continue;
        }

        toast.success(`${file.name} envoyé`);
      }

      fetchMedia();
    } catch {
      toast.error("Échec de l’envoi");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm("Supprimer ce fichier ?")) return;

    const supabase = createClient();

    // Delete from storage
    const path = item.file_url.split("/gnawa-media/").pop();
    if (path) {
      await supabase.storage.from("gnawa-media").remove([path]);
    }

    // Delete from DB
    await supabase.from("media").delete().eq("id", item.id);
    toast.success("Fichier supprimé");
    fetchMedia();
  }

  async function handleUpdateAlt() {
    if (!editItem) return;
    const supabase = createClient();
    await supabase
      .from("media")
      .update({ alt_text: altText })
      .eq("id", editItem.id);
    toast.success("Texte alternatif mis à jour");
    setEditItem(null);
    fetchMedia();
  }

  const filteredMedia = media.filter((item) => {
    const type = item.file_type || "";
    if (kindFilter === "image") return type.startsWith("image/");
    if (kindFilter === "audio") return type.startsWith("audio/");
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Médiathèque</h1>
        <div className="w-full sm:w-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            <Upload size={16} className="mr-1" />
            {uploading ? "Envoi..." : "Téléverser"}
          </Button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className="glass-panel mb-8 flex min-h-[120px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-primary", "bg-primary/5");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-primary", "bg-primary/5");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-primary", "bg-primary/5");
          const dt = e.dataTransfer;
          if (dt.files.length > 0 && fileInputRef.current) {
            fileInputRef.current.files = dt.files;
            fileInputRef.current.dispatchEvent(
              new Event("change", { bubbles: true })
            );
          }
        }}
      >
        <div className="text-center text-sm text-muted-foreground">
          <ImageIcon size={32} className="mx-auto mb-2" />
          <p>Glissez-déposez des images ou audios ici, ou cliquez pour parcourir</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={kindFilter === "all" ? "default" : "outline"}
          onClick={() => setKindFilter("all")}
          size="sm"
        >
          Tous ({media.length})
        </Button>
        <Button
          type="button"
          variant={kindFilter === "image" ? "default" : "outline"}
          onClick={() => setKindFilter("image")}
          size="sm"
        >
          Images ({media.filter((m) => (m.file_type || "").startsWith("image/")).length})
        </Button>
        <Button
          type="button"
          variant={kindFilter === "audio" ? "default" : "outline"}
          onClick={() => setKindFilter("audio")}
          size="sm"
        >
          Audios ({media.filter((m) => (m.file_type || "").startsWith("audio/")).length})
        </Button>
      </div>

      {/* Media grid */}
      {filteredMedia.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun média pour ce filtre.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted"
            >
              {(item.file_type || "").startsWith("audio/") ? (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-ivory/10 via-ivory/5 to-midnight/30 text-ivory/80">
                  <Music2 size={34} />
                  <span className="mt-3 px-3 text-center text-[10px] uppercase tracking-[0.2em] text-ivory/60">
                    Audio
                  </span>
                </div>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    className="h-full w-full object-cover"
                  />
                </>
              )}
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-2 p-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditItem(item);
                      setAltText(item.alt_text || "");
                    }}
                  >
                    <Edit2 size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 truncate bg-black/40 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100">
                {item.file_name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Alt Text Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le texte alternatif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Décrivez cette image..."
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditItem(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateAlt}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
