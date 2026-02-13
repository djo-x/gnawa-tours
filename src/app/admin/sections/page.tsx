"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { SectionForm } from "@/components/admin/section-form";
import { deleteSection, toggleSectionVisibility } from "@/app/admin/actions/sections";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { DynamicSection } from "@/types/section";

export default function SectionsPage() {
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editSection, setEditSection] = useState<DynamicSection | null>(null);
  const layoutLabels: Record<string, string> = {
    "text-left": "Texte à gauche",
    "text-right": "Texte à droite",
    centered: "Centré",
    "full-bleed": "Pleine largeur",
    grid: "Grille",
  };

  const fetchSections = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("dynamic_sections")
      .select("*")
      .order("display_order");
    if (data) setSections(data as DynamicSection[]);
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette section ?")) return;
    const result = await deleteSection(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Section supprimée");
      fetchSections();
    }
  }

  async function handleToggle(id: string, current: boolean) {
    const result = await toggleSectionVisibility(id, !current);
    if (result.error) {
      toast.error(result.error);
    } else {
      fetchSections();
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-4xl font-bold">Sections</h1>
        <Button
          onClick={() => {
            setEditSection(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Ajouter une section
        </Button>
      </div>

      {sections.length === 0 ? (
        <p className="text-muted-foreground">
          Aucune section pour le moment. Connectez Supabase et ajoutez des sections.
        </p>
      ) : (
        <div className="grid gap-4">
          {sections.map((section) => (
            <Card key={section.id} className="glass-panel">
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <Badge variant="secondary">
                    {layoutLabels[section.layout_type] || section.layout_type}
                  </Badge>
                  <Badge variant={section.is_visible ? "default" : "outline"}>
                    {section.is_visible ? "Visible" : "Masquée"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(section.id, section.is_visible)}
                  >
                    {section.is_visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditSection(section);
                      setFormOpen(true);
                    }}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(section.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-sm text-muted-foreground">
                  Nav : {section.nav_title} | Clé : {section.section_key} | Ordre : {section.display_order}
                  {section.subtitle && ` | ${section.subtitle}`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SectionForm
        section={editSection}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditSection(null);
            fetchSections();
          }
        }}
      />
    </div>
  );
}
