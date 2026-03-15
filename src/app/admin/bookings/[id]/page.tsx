import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { BookingStatusSelect } from "@/components/admin/booking-status-select";
import type { BookingStatus } from "@/types/booking";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatCurrency(value: number, currency: "EUR" | "DZD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

type BookingWithProgram = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  group_size: number;
  message: string | null;
  origin_country: string | null;
  status: BookingStatus;
  created_at: string;
  program_title?: string | null;
  program_price_eur?: number | null;
  program_price_dzd?: number | null;
};

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("bookings")
    .select("*, programs(title, price_eur, price_dzd)")
    .eq("id", id)
    .single();

  if (!row) {
    notFound();
  }

  const booking: BookingWithProgram = {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    group_size: row.group_size ?? 1,
    message: row.message,
    origin_country: row.origin_country,
    status: row.status as BookingStatus,
    created_at: row.created_at,
    program_title: (row.programs as { title?: string } | null)?.title ?? null,
    program_price_eur: (row.programs as { price_eur?: number } | null)?.price_eur ?? null,
    program_price_dzd: (row.programs as { price_dzd?: number } | null)?.price_dzd ?? null,
  };

  const origin = booking.origin_country?.toUpperCase() || "INTL";
  const useDzd = origin === "DZ";
  const price = useDzd ? booking.program_price_dzd : booking.program_price_eur;
  const estimatedValue = price != null ? price * booking.group_size : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/bookings" aria-label="Retour à la liste">
              <ArrowLeft size={20} />
            </Link>
          </Button>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">
            Réservation : {booking.full_name}
          </h1>
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg">Détails</CardTitle>
            <Badge className={statusColors[booking.status] ?? ""}>
              {booking.status === "new"
                ? "Nouveau"
                : booking.status === "contacted"
                  ? "Contacté"
                  : booking.status === "confirmed"
                    ? "Confirmé"
                    : "Annulé"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Créée le {new Date(booking.created_at).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-mail</p>
              <p>
                <a
                  href={`mailto:${booking.email}`}
                  className="text-primary hover:underline"
                >
                  {booking.email}
                </a>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p>{booking.phone || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Programme</p>
              <p>{booking.program_title || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taille du groupe</p>
              <p>{booking.group_size}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Origine</p>
              <p>{booking.origin_country || "—"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valeur estimée</p>
              <p>
                {estimatedValue != null
                  ? formatCurrency(estimatedValue, useDzd ? "DZD" : "EUR")
                  : "—"}
              </p>
            </div>
          </div>
          {booking.message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">
                {booking.message}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <span className="text-sm font-medium">Statut</span>
            <BookingStatusSelect bookingId={booking.id} currentStatus={booking.status} />
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" asChild>
        <Link href="/admin/bookings" className="inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Retour à la liste
        </Link>
      </Button>
    </div>
  );
}
