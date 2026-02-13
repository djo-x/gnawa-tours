"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { updateBookingStatus } from "@/app/admin/actions/settings";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Booking } from "@/types/booking";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const statusLabels: Record<string, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<
    (Booking & {
      program_title?: string;
      program_price_eur?: number | null;
      program_price_dzd?: number | null;
    })[]
  >([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<
    (Booking & {
      program_title?: string;
      program_price_eur?: number | null;
      program_price_dzd?: number | null;
    }) | null
  >(null);

  const fetchBookings = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("bookings")
      .select("*, programs(title, price_eur, price_dzd)")
      .order("created_at", { ascending: false });

    if (data) {
      setBookings(
        data.map((b: Record<string, unknown>) => ({
          ...(b as unknown as Booking),
          program_title: (b.programs as { title: string } | null)?.title,
          program_price_eur:
            (b.programs as { price_eur?: number } | null)?.price_eur ?? null,
          program_price_dzd:
            (b.programs as { price_dzd?: number } | null)?.price_dzd ?? null,
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const summary = useMemo(() => {
    const counts = {
      total: bookings.length,
      new: 0,
      contacted: 0,
      confirmed: 0,
      cancelled: 0,
    };
    let pipelineValueEur = 0;
    let pipelineValueDzd = 0;
    let confirmedValueEur = 0;
    let confirmedValueDzd = 0;
    let groupTotal = 0;
    bookings.forEach((booking) => {
      counts[booking.status] += 1;
      groupTotal += booking.group_size || 0;
      const groupSize = booking.group_size || 0;
      const valueEur = (booking.program_price_eur || 0) * groupSize;
      const valueDzd = (booking.program_price_dzd || 0) * groupSize;
      const origin = booking.origin_country?.toUpperCase() || "INTL";
      const useDzd = origin === "DZ";
      if (booking.status !== "cancelled") {
        if (useDzd) {
          pipelineValueDzd += valueDzd;
        } else {
          pipelineValueEur += valueEur;
        }
      }
      if (booking.status === "confirmed") {
        if (useDzd) {
          confirmedValueDzd += valueDzd;
        } else {
          confirmedValueEur += valueEur;
        }
      }
    });

    const averageGroup = counts.total ? groupTotal / counts.total : 0;
    const conversionRate = counts.total
      ? (counts.confirmed / counts.total) * 100
      : 0;

    return {
      counts,
      pipelineValueEur,
      pipelineValueDzd,
      confirmedValueEur,
      confirmedValueDzd,
      averageGroup,
      conversionRate,
    };
  }, [bookings]);

  const formatCurrency = (value: number, currency: "EUR" | "DZD") =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const statusOptions = [
    { value: "all", label: `Tous (${summary.counts.total})` },
    { value: "new", label: `Nouveau (${summary.counts.new})` },
    { value: "contacted", label: `Contacté (${summary.counts.contacted})` },
    { value: "confirmed", label: `Confirmé (${summary.counts.confirmed})` },
    { value: "cancelled", label: `Annulé (${summary.counts.cancelled})` },
  ];

  async function handleStatusChange(id: string, status: string) {
    const result = await updateBookingStatus(id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Statut mis à jour");
      fetchBookings();
    }
  }

  function exportCsv() {
    const headers = [
      "Nom",
      "E-mail",
      "Téléphone",
      "Programme",
      "Taille du groupe",
      "Origine",
      "Valeur EUR",
      "Valeur DZD",
      "Statut",
      "Message",
      "Créé le",
    ];
    const rows = filtered.map((b) => [
      b.full_name,
      b.email,
      b.phone || "",
      b.program_title || "",
      b.group_size,
      b.origin_country || "",
      b.program_price_eur ? b.program_price_eur * b.group_size : "",
      b.program_price_dzd ? b.program_price_dzd * b.group_size : "",
      statusLabels[b.status] || b.status,
      b.message || "",
      b.created_at,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-4xl font-bold">Réservations</h1>
        <Button variant="outline" onClick={exportCsv}>
          <Download size={16} className="mr-1" /> Exporter CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total des réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{summary.counts.total}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.counts.new} nouvelles, {summary.counts.confirmed} confirmées
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Valeur du pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-semibold">
                {formatCurrency(summary.pipelineValueEur, "EUR")}
              </div>
              <div className="text-xl font-semibold text-muted-foreground">
                {formatCurrency(summary.pipelineValueDzd, "DZD")}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Hors réservations annulées
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Revenu confirmé</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-semibold">
                {formatCurrency(summary.confirmedValueEur, "EUR")}
              </div>
              <div className="text-xl font-semibold text-muted-foreground">
                {formatCurrency(summary.confirmedValueDzd, "DZD")}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Conversion {summary.conversionRate.toFixed(0)}%
            </p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taille moyenne du groupe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {summary.averageGroup.toFixed(1)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Basé sur {summary.counts.total} réservations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Rechercher par nom ou e‑mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="new">Nouveau</SelectItem>
            <SelectItem value="contacted">Contacté</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={statusFilter === option.value ? "default" : "outline"}
            onClick={() => setStatusFilter(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-border/70 p-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Groupe</TableHead>
              <TableHead>Origine</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Aucune réservation trouvée.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((booking) => (
                <TableRow
                  key={booking.id}
                  className={`cursor-pointer transition-colors hover:bg-ivory/5 ${
                    booking.status === "new" ? "bg-gold/10" : ""
                  }`}
                  onClick={() => setSelectedBooking(booking)}
                >
                  <TableCell className="font-medium">{booking.full_name}</TableCell>
                  <TableCell>{booking.email}</TableCell>
                  <TableCell>{booking.program_title || "—"}</TableCell>
                  <TableCell>{booking.group_size}</TableCell>
                  <TableCell>
                    {booking.origin_country || "—"}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const origin = booking.origin_country?.toUpperCase() || "INTL";
                      const useDzd = origin === "DZ";
                      const price = useDzd
                        ? booking.program_price_dzd
                        : booking.program_price_eur;
                      if (!price) return "—";
                      return formatCurrency(
                        price * booking.group_size,
                        useDzd ? "DZD" : "EUR"
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[booking.status]}>
                      {statusLabels[booking.status] || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Booking Detail Dialog */}
      <Dialog
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      >
        {selectedBooking && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réservation : {selectedBooking.full_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <strong>E-mail :</strong> {selectedBooking.email}
              </div>
              <div>
                <strong>Téléphone :</strong> {selectedBooking.phone || "—"}
              </div>
              <div>
                <strong>Taille du groupe :</strong> {selectedBooking.group_size}
              </div>
              <div>
                <strong>Programme :</strong> {selectedBooking.program_title || "—"}
              </div>
              <div>
                <strong>Origine :</strong> {selectedBooking.origin_country || "—"}
              </div>
              <div>
                <strong>Valeur estimée :</strong>{" "}
                {(() => {
                  const origin = selectedBooking.origin_country?.toUpperCase() || "INTL";
                  const useDzd = origin === "DZ";
                  const price = useDzd
                    ? selectedBooking.program_price_dzd
                    : selectedBooking.program_price_eur;
                  if (!price) return "—";
                  return formatCurrency(
                    price * selectedBooking.group_size,
                    useDzd ? "DZD" : "EUR"
                  );
                })()}
              </div>
              <div>
                <strong>Message :</strong>{" "}
                {selectedBooking.message || "Aucun message"}
              </div>
              <div className="flex items-center gap-3">
                <strong>Statut :</strong>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(val) =>
                    handleStatusChange(selectedBooking.id, val)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="contacted">Contacté</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
