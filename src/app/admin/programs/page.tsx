"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { ProgramForm } from "@/components/admin/program-form";
import { deleteProgram, toggleProgramPublished } from "@/app/admin/actions/programs";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Program } from "@/types/program";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editProgram, setEditProgram] = useState<Program | null>(null);
  const difficultyLabels: Record<Program["difficulty"], string> = {
    easy: "Facile",
    moderate: "Modéré",
    challenging: "Difficile",
    expert: "Expert",
  };
  const formatCurrency = (value: number | null | undefined, currency: "EUR" | "DZD") => {
    if (value === null || value === undefined || Number.isNaN(value) || value <= 0) {
      return "—";
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };
  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
  };

  const fetchPrograms = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .order("display_order");
    if (data) setPrograms(data as Program[]);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void fetchPrograms();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [fetchPrograms]);

  const filtered = programs.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce programme ?")) return;
    const result = await deleteProgram(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Programme supprimé");
      fetchPrograms();
    }
  }

  async function handleToggle(id: string, current: boolean) {
    const result = await toggleProgramPublished(id, !current);
    if (result.error) {
      toast.error(result.error);
    } else {
      fetchPrograms();
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-3xl font-bold sm:text-4xl">Programmes</h1>
        <Button
          className="w-full sm:w-auto"
          onClick={() => {
            setEditProgram(null);
            setFormOpen(true);
          }}
        >
          <Plus size={16} className="mr-1" /> Ajouter un programme
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Rechercher des programmes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm"
        />
      </div>

      <div className="glass-panel rounded-2xl border border-border/70 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Début</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Prix (EUR)</TableHead>
              <TableHead>Prix (DZD)</TableHead>
              <TableHead>Difficulté</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  {programs.length === 0
                    ? "Aucun programme pour le moment. Connectez Supabase et ajoutez des programmes."
                    : "Aucun programme correspondant."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((program) => (
                <TableRow key={program.id}>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                  <TableCell>{formatDate(program.start_date)}</TableCell>
                  <TableCell>{formatDate(program.end_date)}</TableCell>
                  <TableCell>{formatCurrency(program.price_eur, "EUR")}</TableCell>
                  <TableCell>{formatCurrency(program.price_dzd, "DZD")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {difficultyLabels[program.difficulty] || program.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={program.is_published ? "default" : "outline"}
                    >
                      {program.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggle(program.id, program.is_published)}
                        title={program.is_published ? "Dépublier" : "Publier"}
                      >
                        {program.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditProgram(program);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(program.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProgramForm
        program={editProgram}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditProgram(null);
            fetchPrograms();
          }
        }}
      />
    </div>
  );
}
