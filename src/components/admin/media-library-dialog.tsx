"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Check, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { MediaItem } from "@/types/settings";

interface MediaLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  loading?: boolean;
  onRefresh: () => Promise<void>;
  multiple?: boolean;
  selectedUrls?: string[];
  onToggleSelect?: (url: string) => void;
  onPick?: (url: string) => void;
  onConfirm?: () => void;
  title?: string;
  fileKind?: "image" | "audio" | "all";
}

export function MediaLibraryDialog({
  open,
  onOpenChange,
  media,
  loading = false,
  onRefresh,
  multiple = false,
  selectedUrls = [],
  onToggleSelect,
  onPick,
  onConfirm,
  title = "Médiathèque",
  fileKind = "image",
}: MediaLibraryDialogProps) {
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const acceptValue =
    fileKind === "audio" ? "audio/*" : fileKind === "all" ? "image/*,audio/*" : "image/*";

  const filtered = media.filter((item) => {
    const isImage = (item.file_type || "").startsWith("image/");
    const isAudio = (item.file_type || "").startsWith("audio/");
    if (fileKind === "image" && !isImage) return false;
    if (fileKind === "audio" && !isAudio) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.file_name.toLowerCase().includes(q) ||
      (item.alt_text || "").toLowerCase().includes(q)
    );
  });

  async function handleUpload(files: FileList) {
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

      await onRefresh();
    } catch {
      toast.error("Échec de l’envoi");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSelect(url: string) {
    if (multiple) {
      onToggleSelect?.(url);
      return;
    }
    onPick?.(url);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] max-w-4xl overflow-y-auto border-ivory/15">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="Rechercher un média..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            {loading && <span className="text-xs text-muted-foreground">Chargement...</span>}
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptValue}
              multiple
              onChange={(e) => {
                if (e.target.files) void handleUpload(e.target.files);
              }}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={16} className="mr-1" />
              {uploading ? "Envoi..." : "Téléverser"}
            </Button>
          </div>
        </div>

        <div
          className="glass-panel mt-4 flex min-h-[120px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/30 transition-colors hover:border-primary"
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
            if (dt.files.length > 0) {
              void handleUpload(dt.files);
            }
          }}
        >
          <div className="text-center text-sm text-muted-foreground">
            {fileKind === "audio" ? (
              <Music2 size={32} className="mx-auto mb-2" />
            ) : (
              <ImageIcon size={32} className="mx-auto mb-2" />
            )}
            <p>
              {fileKind === "audio"
                ? "Glissez-déposez des fichiers audio ici, ou cliquez pour parcourir"
                : fileKind === "all"
                  ? "Glissez-déposez des images ou audios ici, ou cliquez pour parcourir"
                  : "Glissez-déposez des images ici, ou cliquez pour parcourir"}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Aucun fichier média trouvé.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => {
              const selected = selectedUrls.includes(item.file_url);
              const isAudio = (item.file_type || "").startsWith("audio/");
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.file_url)}
                  className={`group relative aspect-square overflow-hidden rounded-xl border transition ${
                    selected ? "border-gold/80 ring-2 ring-gold/40" : "border-border/70"
                  }`}
                >
                  {isAudio ? (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-ivory/10 via-ivory/5 to-midnight/30 text-ivory/80">
                      <Music2 size={30} />
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 truncate bg-black/40 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {item.file_name}
                  </div>
                  {selected && (
                    <div className="absolute right-2 top-2 rounded-full bg-gold/90 p-1 text-midnight">
                      <Check size={14} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {multiple && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {selectedUrls.length} sélectionné(s)
            </p>
            <Button onClick={onConfirm} disabled={selectedUrls.length === 0}>
              Utiliser la sélection
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
