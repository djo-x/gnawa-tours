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
import { createSection, updateSection } from "@/app/admin/actions/sections";
import { toast } from "sonner";
import type { DynamicSection, LayoutType } from "@/types/section";
import { MediaLibraryDialog } from "@/components/admin/media-library-dialog";
import { useMediaLibrary } from "@/hooks/use-media-library";

interface SectionFormProps {
  section?: DynamicSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SectionForm({ section, open, onOpenChange }: SectionFormProps) {
  const formKey = `${section?.id ?? "new"}-${open ? "open" : "closed"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel max-h-[85vh] max-w-4xl overflow-y-auto border-gold/25">
        <DialogHeader>
          <DialogTitle>{section ? "Modifier la section" : "Nouvelle section"}</DialogTitle>
        </DialogHeader>
        <SectionFormFields
          key={formKey}
          section={section}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

type GridCard = { icon: string; title: string; description: string };

type Quote = {
  name: string;
  location: string;
  text: string;
  rating: number;
};

type FullBleedSlide = { url: string; caption: string };

function SectionFormFields({
  section,
  onOpenChange,
}: {
  section?: DynamicSection | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const content = (section?.content || {}) as Record<string, unknown>;
  const [layoutType, setLayoutType] = useState<LayoutType>(
    section?.layout_type || "centered"
  );
  const [backgroundImage, setBackgroundImage] = useState(
    section?.background_image || ""
  );

  const [centeredText, setCenteredText] = useState(
    typeof content.text === "string" ? content.text : ""
  );
  const [centeredImage, setCenteredImage] = useState(
    typeof content.image === "string" ? content.image : ""
  );

  const [gridCards, setGridCards] = useState<GridCard[]>(
    Array.isArray(content.cards)
      ? (content.cards as GridCard[])
      : [{ icon: "compass", title: "", description: "" }]
  );

  const fullBleedImages = Array.isArray(content.images)
    ? (content.images as string[])
    : [];
  const fullBleedCaptions = Array.isArray(content.captions)
    ? (content.captions as string[])
    : [];
  const [fullBleedSlides, setFullBleedSlides] = useState<FullBleedSlide[]>(
    fullBleedImages.length > 0
      ? fullBleedImages.map((url, i) => ({
          url,
          caption: fullBleedCaptions[i] || "",
        }))
      : []
  );
  const [fullBleedText, setFullBleedText] = useState(
    typeof content.text === "string" ? content.text : ""
  );
  const [fullBleedInput, setFullBleedInput] = useState("");

  const [textSideText, setTextSideText] = useState(
    typeof content.text === "string" ? content.text : ""
  );
  const [textSideImage, setTextSideImage] = useState(
    typeof content.image === "string" ? content.image : ""
  );

  const [quotes, setQuotes] = useState<Quote[]>(
    Array.isArray(content.quotes)
      ? (content.quotes as Quote[])
      : []
  );
  const [useQuotes, setUseQuotes] = useState(quotes.length > 0);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"single" | "multi">("single");
  const [pickerTarget, setPickerTarget] = useState<
    "background" | "centered" | "text-side" | "slide"
  >("background");
  const [slideTargetIndex, setSlideTargetIndex] = useState<number | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const { media, loading: mediaLoading, refresh } = useMediaLibrary();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    let parsedContent: Record<string, unknown> = {};

    if (layoutType === "centered") {
      parsedContent = { text: centeredText };
      if (centeredImage) parsedContent.image = centeredImage;
    }

    if (layoutType === "grid") {
      parsedContent = {
        cards: gridCards
          .filter((card) => card.title || card.description)
          .map((card) => ({
            icon: card.icon || "compass",
            title: card.title,
            description: card.description,
          })),
      };
    }

    if (layoutType === "full-bleed") {
      const slides = fullBleedSlides.filter((slide) => slide.url.trim());
      parsedContent = {
        text: fullBleedText,
        images: slides.map((slide) => slide.url.trim()),
        captions: slides.map((slide) => slide.caption || ""),
      };
    }

    if (layoutType === "text-left" || layoutType === "text-right") {
      if (useQuotes && quotes.length > 0) {
        parsedContent = {
          quotes: quotes
            .filter((quote) => quote.text.trim())
            .map((quote) => ({
              name: quote.name,
              location: quote.location,
              text: quote.text,
              rating: quote.rating || 5,
            })),
        };
      } else {
        parsedContent = {
          text: textSideText,
          image: textSideImage || undefined,
        };
      }
    }

    const data = {
      section_key: formData.get("section_key") as string,
      title: formData.get("title") as string,
      nav_title:
        (formData.get("nav_title") as string) ||
        (formData.get("title") as string),
      subtitle: formData.get("subtitle") as string,
      content: parsedContent,
      layout_type: layoutType,
      background_image: backgroundImage,
      is_visible: formData.get("is_visible") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0,
    };

    const result = section
      ? await updateSection(section.id, data)
      : await createSection(data);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(section ? "Section mise à jour" : "Section créée");
      onOpenChange(false);
    }

    setLoading(false);
  }

  function openSinglePicker(target: "background" | "centered" | "text-side" | "slide", index?: number) {
    return async () => {
      await refresh();
      setPickerMode("single");
      setPickerTarget(target);
      setSlideTargetIndex(typeof index === "number" ? index : null);
      setPickerOpen(true);
    };
  }

  function openMultiPicker() {
    return async () => {
      await refresh();
      setSelectedMedia([]);
      setPickerMode("multi");
      setPickerTarget("slide");
      setPickerOpen(true);
    };
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input id="title" name="title" required defaultValue={section?.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nav_title">Titre de navigation *</Label>
            <Input
              id="nav_title"
              name="nav_title"
              required
              defaultValue={section?.nav_title || section?.title}
              placeholder="Libellé court pour la navigation"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section_key">Clé de section *</Label>
            <Input
              id="section_key"
              name="section_key"
              required
              defaultValue={section?.section_key}
              placeholder="ex. notre-histoire"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="layout_type">Type de mise en page *</Label>
            <Select
              name="layout_type"
              value={layoutType}
              onValueChange={(value) => setLayoutType(value as LayoutType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-left">Texte à gauche</SelectItem>
                <SelectItem value="text-right">Texte à droite</SelectItem>
                <SelectItem value="centered">Centré</SelectItem>
                <SelectItem value="full-bleed">Pleine largeur</SelectItem>
                <SelectItem value="grid">Grille</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subtitle">Sous‑titre</Label>
            <Input id="subtitle" name="subtitle" defaultValue={section?.subtitle || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_order">Ordre d’affichage</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={section?.display_order || 0}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="background_image">Image d’arrière‑plan</Label>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Input
                id="background_image"
                name="background_image"
                value={backgroundImage}
                onChange={(e) => setBackgroundImage(e.target.value)}
                placeholder="Collez l’URL de l’image ou choisissez dans la bibliothèque"
              />
              <Button type="button" variant="outline" onClick={openSinglePicker("background")}>
                Choisir
              </Button>
            </div>
            {backgroundImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImage}
                alt="Aperçu de l’arrière‑plan"
                className="h-32 w-full rounded-xl object-cover"
              />
            )}
          </div>
        </div>

        {layoutType === "centered" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texte de section</Label>
              <Textarea
                value={centeredText}
                onChange={(e) => setCenteredText(e.target.value)}
                rows={5}
                placeholder="Écrivez le texte de l’histoire..."
              />
            </div>
            <div className="space-y-2">
              <Label>Image centrée (optionnelle)</Label>
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={centeredImage}
                    onChange={(e) => setCenteredImage(e.target.value)}
                    placeholder="Collez l’URL de l’image ou choisissez dans la bibliothèque"
                  />
                  <Button type="button" variant="outline" onClick={openSinglePicker("centered")}>
                    Choisir
                  </Button>
                </div>
                {centeredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={centeredImage} alt="Aperçu centré" className="h-32 w-full rounded-xl object-cover" />
                )}
              </div>
            </div>
          </div>
        )}

        {layoutType === "grid" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Cartes de grille</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setGridCards((prev) => [
                    ...prev,
                    { icon: "compass", title: "", description: "" },
                  ])
                }
              >
                  <Plus size={16} className="mr-1" /> Ajouter une carte
              </Button>
            </div>
            {gridCards.map((card, i) => (
              <div key={i} className="rounded-xl border border-border/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Select
                    value={card.icon}
                    onValueChange={(value) => {
                      const updated = [...gridCards];
                      updated[i].icon = value;
                      setGridCards(updated);
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compass">Compass</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                      <SelectItem value="star">Star</SelectItem>
                      <SelectItem value="heart">Heart</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setGridCards(gridCards.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Input
                  placeholder="Titre"
                  value={card.title}
                  onChange={(e) => {
                    const updated = [...gridCards];
                    updated[i].title = e.target.value;
                    setGridCards(updated);
                  }}
                />
                <Textarea
                  placeholder="Description"
                  value={card.description}
                  onChange={(e) => {
                    const updated = [...gridCards];
                    updated[i].description = e.target.value;
                    setGridCards(updated);
                  }}
                  rows={3}
                />
              </div>
            ))}
          </div>
        )}

        {layoutType === "full-bleed" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Texte de section</Label>
              <Textarea
                value={fullBleedText}
                onChange={(e) => setFullBleedText(e.target.value)}
                rows={4}
                placeholder="Court paragraphe descriptif..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Images de galerie</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={openMultiPicker()}>
                  Ajouter depuis la bibliothèque
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                value={fullBleedInput}
                onChange={(e) => setFullBleedInput(e.target.value)}
                placeholder="Collez l’URL de l’image"
              />
              <Button
                type="button"
                onClick={() => {
                  const trimmed = fullBleedInput.trim();
                  if (!trimmed) return;
                  setFullBleedSlides((prev) => [...prev, { url: trimmed, caption: "" }]);
                  setFullBleedInput("");
                }}
              >
                Ajouter l’URL
              </Button>
            </div>
            {fullBleedSlides.length === 0 ? (
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
                <ImageIcon size={18} />
                Aucune image de galerie pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {fullBleedSlides.map((slide, i) => (
                  <div key={`${slide.url}-${i}`} className="rounded-xl border border-border/70 p-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={slide.url}
                        onChange={(e) => {
                          const updated = [...fullBleedSlides];
                          updated[i].url = e.target.value;
                          setFullBleedSlides(updated);
                        }}
                        placeholder="URL de l’image"
                      />
                      <Button type="button" variant="outline" onClick={openSinglePicker("slide", i)}>
                        Choisir
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFullBleedSlides(fullBleedSlides.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <Input
                      value={slide.caption}
                      onChange={(e) => {
                        const updated = [...fullBleedSlides];
                        updated[i].caption = e.target.value;
                        setFullBleedSlides(updated);
                      }}
                      placeholder="Légende (optionnelle)"
                    />
                    {slide.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={slide.url} alt={`Diapositive ${i + 1}`} className="h-32 w-full rounded-xl object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(layoutType === "text-left" || layoutType === "text-right") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use_quotes"
                checked={useQuotes}
                onChange={(e) => setUseQuotes(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="use_quotes">Utiliser des témoignages à la place du texte + image</Label>
            </div>

            {useQuotes ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Témoignages</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setQuotes((prev) => [
                        ...prev,
                        { name: "", location: "", text: "", rating: 5 },
                      ])
                    }
                  >
                    <Plus size={16} className="mr-1" /> Ajouter un témoignage
                  </Button>
                </div>
                {quotes.map((quote, i) => (
                  <div key={i} className="rounded-xl border border-border/70 p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        placeholder="Nom"
                        value={quote.name}
                        onChange={(e) => {
                          const updated = [...quotes];
                          updated[i].name = e.target.value;
                          setQuotes(updated);
                        }}
                      />
                      <Input
                        placeholder="Lieu"
                        value={quote.location}
                        onChange={(e) => {
                          const updated = [...quotes];
                          updated[i].location = e.target.value;
                          setQuotes(updated);
                        }}
                      />
                    </div>
                    <Textarea
                      placeholder="Texte du témoignage"
                      value={quote.text}
                      onChange={(e) => {
                        const updated = [...quotes];
                        updated[i].text = e.target.value;
                        setQuotes(updated);
                      }}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label>Note</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={quote.rating}
                          onChange={(e) => {
                            const updated = [...quotes];
                            updated[i].rating = parseInt(e.target.value) || 5;
                            setQuotes(updated);
                          }}
                          className="w-20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuotes(quotes.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Texte de section</Label>
                  <Textarea
                    value={textSideText}
                    onChange={(e) => setTextSideText(e.target.value)}
                    rows={5}
                    placeholder="Écrivez le texte de la section..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Image (optionnelle)</Label>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={textSideImage}
                        onChange={(e) => setTextSideImage(e.target.value)}
                        placeholder="Collez l’URL de l’image ou choisissez dans la bibliothèque"
                      />
                      <Button type="button" variant="outline" onClick={openSinglePicker("text-side")}>
                        Choisir
                      </Button>
                    </div>
                    {textSideImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={textSideImage} alt="Aperçu de la section" className="h-32 w-full rounded-xl object-cover" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement..." : section ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>

      <MediaLibraryDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        media={media}
        loading={mediaLoading}
        onRefresh={refresh}
        multiple={pickerMode === "multi"}
        selectedUrls={selectedMedia}
        onToggleSelect={(url) => {
          setSelectedMedia((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
          );
        }}
        onPick={(url) => {
          if (pickerTarget === "background") setBackgroundImage(url);
          if (pickerTarget === "centered") setCenteredImage(url);
          if (pickerTarget === "text-side") setTextSideImage(url);
          if (pickerTarget === "slide" && slideTargetIndex !== null) {
            setFullBleedSlides((prev) =>
              prev.map((slide, idx) =>
                idx === slideTargetIndex ? { ...slide, url } : slide
              )
            );
          }
        }}
        onConfirm={() => {
          setFullBleedSlides((prev) => [
            ...prev,
            ...selectedMedia.map((url) => ({ url, caption: "" })),
          ]);
          setPickerOpen(false);
        }}
        title="Sélectionner des médias pour la section"
      />
    </>
  );
}
