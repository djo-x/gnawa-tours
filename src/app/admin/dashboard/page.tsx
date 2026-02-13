"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarCheck, Map as MapIcon, Layers, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type DailySeries = Array<{
  label: string;
  count: number;
  revenueEur: number;
  revenueDzd: number;
}>;

type DashboardStats = {
  totalBookings: number;
  newBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pipelineValueEur: number;
  pipelineValueDzd: number;
  confirmedValueEur: number;
  confirmedValueDzd: number;
  averageGroup: number;
  conversionRate: number;
  dailySeries: DailySeries;
  publishedPrograms: number;
  visibleSections: number;
  recentBookings: Array<Record<string, unknown>>;
};

const emptyStats: DashboardStats = {
  totalBookings: 0,
  newBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  pipelineValueEur: 0,
  pipelineValueDzd: 0,
  confirmedValueEur: 0,
  confirmedValueDzd: 0,
  averageGroup: 0,
  conversionRate: 0,
  dailySeries: [],
  publishedPrograms: 0,
  visibleSections: 0,
  recentBookings: [],
};

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

type DatePreset = "last_month" | "last_3_months" | "last_6_months" | "last_year" | "custom";

const presetOptions: Array<{ value: DatePreset; label: string }> = [
  { value: "last_month", label: "Dernier mois" },
  { value: "last_3_months", label: "3 derniers mois" },
  { value: "last_6_months", label: "6 derniers mois" },
  { value: "last_year", label: "Dernière année" },
  { value: "custom", label: "Personnalisé" },
];

const presetLabels: Record<DatePreset, string> = {
  last_month: "Dernier mois",
  last_3_months: "3 derniers mois",
  last_6_months: "6 derniers mois",
  last_year: "Dernière année",
  custom: "Période personnalisée",
};

const msDay = 24 * 60 * 60 * 1000;

function formatInputDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function parseInputDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getPresetRange(preset: DatePreset) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  if (preset === "last_3_months") {
    start.setMonth(start.getMonth() - 3);
  } else if (preset === "last_6_months") {
    start.setMonth(start.getMonth() - 6);
  } else if (preset === "last_year") {
    start.setFullYear(start.getFullYear() - 1);
  } else {
    start.setMonth(start.getMonth() - 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function resolveRange(preset: DatePreset, startInput: string, endInput: string) {
  if (preset !== "custom") {
    const parsedStart = parseInputDate(startInput);
    const parsedEnd = parseInputDate(endInput);
    if (parsedStart && parsedEnd) {
      parsedStart.setHours(0, 0, 0, 0);
      parsedEnd.setHours(23, 59, 59, 999);
      return { start: parsedStart, end: parsedEnd, label: presetLabels[preset] };
    }
    const presetRange = getPresetRange(preset);
    return { ...presetRange, label: presetLabels[preset] };
  }

  const fallback = getPresetRange("last_month");
  let start = parseInputDate(startInput) || fallback.start;
  let end = parseInputDate(endInput) || fallback.end;
  start = new Date(start);
  end = new Date(end);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  if (start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  return { start, end, label: presetLabels.custom };
}

function formatRangeLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${formatter.format(start)} → ${formatter.format(end)}`;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [datePreset, setDatePreset] = useState<DatePreset>("last_month");
  const initialRange = getPresetRange("last_month");
  const [startDate, setStartDate] = useState<string>(formatInputDate(initialRange.start));
  const [endDate, setEndDate] = useState<string>(formatInputDate(initialRange.end));

  const formatCurrency = (value: number, currency: "EUR" | "DZD") =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (datePreset === "custom") return;
    const presetRange = getPresetRange(datePreset);
    setStartDate(formatInputDate(presetRange.start));
    setEndDate(formatInputDate(presetRange.end));
  }, [datePreset]);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      setLoading(true);
      setErrorMessage(null);
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (active) {
          setStats(emptyStats);
          setLoading(false);
          setErrorMessage("Les variables d’environnement Supabase sont manquantes.");
        }
        return;
      }

      try {
        const { start, end } = resolveRange(datePreset, startDate, endDate);
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          if (active) {
            setLoading(false);
            setErrorMessage("Session non prête. Veuillez actualiser ou vous reconnecter.");
          }
          return;
        }
        let bookingsQuery = supabase
          .from("bookings")
          .select(
            "id, full_name, email, status, created_at, group_size, program_id, origin_country"
          )
          .order("created_at", { ascending: false });
        bookingsQuery = bookingsQuery.gte("created_at", start.toISOString()).lte("created_at", end.toISOString());

        const [bookingsRes, programsRes, sectionsRes] = await Promise.all([
          bookingsQuery,
          supabase
            .from("programs")
            .select("id, title, price_eur, price_dzd")
            .eq("is_published", true),
          supabase
            .from("dynamic_sections")
            .select("id")
            .eq("is_visible", true),
        ]);

        if (bookingsRes.error) {
          throw bookingsRes.error;
        }

        const bookingsData = bookingsRes.data || [];
        const programMap = new Map(
          (programsRes.data || []).map((program) => [
            program.id,
            {
              title: program.title,
              price_eur: program.price_eur,
              price_dzd: program.price_dzd,
            },
          ])
        );
        const totalBookings = bookingsData.length;
        let newBookings = 0;
        let confirmedBookings = 0;
        let cancelledBookings = 0;
        let pipelineValueEur = 0;
        let pipelineValueDzd = 0;
        let confirmedValueEur = 0;
        let confirmedValueDzd = 0;
        let groupTotal = 0;
        const rangeDays =
          Math.max(1, Math.floor((end.getTime() - start.getTime()) / msDay) + 1);
        const bucket =
          rangeDays > 180 ? "month" : rangeDays > 60 ? "week" : "day";
        const dailySeries: DailySeries = [];
        const indexMap = new Map<string, number>();
        if (bucket === "month") {
          const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
          while (cursor <= end) {
            const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
            indexMap.set(key, dailySeries.length);
            dailySeries.push({
              label: new Intl.DateTimeFormat("fr-FR", {
                month: "short",
                year: "2-digit",
              }).format(cursor),
              count: 0,
              revenueEur: 0,
              revenueDzd: 0,
            });
            cursor.setMonth(cursor.getMonth() + 1);
          }
        } else {
          const step = bucket === "week" ? 7 : 1;
          const bucketCount = Math.ceil(rangeDays / step);
          for (let i = 0; i < bucketCount; i += 1) {
            const bucketStart = new Date(start);
            bucketStart.setDate(start.getDate() + i * step);
            dailySeries.push({
              label:
                bucket === "week"
                  ? `S${i + 1} ${new Intl.DateTimeFormat("fr-FR", {
                      month: "short",
                      day: "numeric",
                    }).format(bucketStart)}`
                  : new Intl.DateTimeFormat("fr-FR", {
                      month: "short",
                      day: "numeric",
                    }).format(bucketStart),
              count: 0,
              revenueEur: 0,
              revenueDzd: 0,
            });
          }
        }

        bookingsData.forEach((booking: Record<string, unknown>) => {
          const status = booking.status as string;
          const groupSize = (booking.group_size as number) || 0;
          const programId = booking.program_id as string | null;
          const programMeta = programId ? programMap.get(programId) : undefined;
          const priceEur = programMeta?.price_eur || 0;
          const priceDzd = programMeta?.price_dzd || 0;
          const valueEur = priceEur * groupSize;
          const valueDzd = priceDzd * groupSize;
          const origin = (booking.origin_country as string | null)?.toUpperCase() || "INTL";
          const useDzd = origin === "DZ";
          groupTotal += groupSize;

          if (status === "new") newBookings += 1;
          if (status === "confirmed") confirmedBookings += 1;
          if (status === "cancelled") cancelledBookings += 1;

          if (status !== "cancelled") {
            if (useDzd) {
              pipelineValueDzd += valueDzd;
            } else {
              pipelineValueEur += valueEur;
            }
          }
          if (status === "confirmed") {
            if (useDzd) {
              confirmedValueDzd += valueDzd;
            } else {
              confirmedValueEur += valueEur;
            }
          }

          const createdAt = booking.created_at as string | undefined;
          if (createdAt) {
            const created = new Date(createdAt);
            if (created < start || created > end) return;
            let idx: number | undefined;
            if (bucket === "month") {
              const key = `${created.getFullYear()}-${created.getMonth()}`;
              idx = indexMap.get(key);
            } else {
              const daysFromStart = Math.floor(
                (created.getTime() - start.getTime()) / msDay
              );
              const step = bucket === "week" ? 7 : 1;
              idx = Math.floor(daysFromStart / step);
            }
            if (idx !== undefined && dailySeries[idx]) {
              dailySeries[idx].count += 1;
              if (status === "confirmed") {
                if (useDzd) {
                  dailySeries[idx].revenueDzd += valueDzd;
                } else {
                  dailySeries[idx].revenueEur += valueEur;
                }
              }
            }
          }
        });

        const averageGroup = totalBookings ? groupTotal / totalBookings : 0;
        const conversionRate = totalBookings
          ? (confirmedBookings / totalBookings) * 100
          : 0;

        const recentBookings = bookingsData.slice(0, 5).map((booking) => {
          const programId = booking.program_id as string | null;
          const programMeta = programId ? programMap.get(programId) : undefined;
          return {
            ...booking,
            programs: programMeta
              ? {
                  title: programMeta.title,
                  price_eur: programMeta.price_eur,
                  price_dzd: programMeta.price_dzd,
                }
              : null,
          };
        });

        if (active) {
          setStats({
            totalBookings,
            newBookings,
            confirmedBookings,
            cancelledBookings,
            pipelineValueEur,
            pipelineValueDzd,
            confirmedValueEur,
            confirmedValueDzd,
            averageGroup,
            conversionRate,
            dailySeries,
            publishedPrograms: programsRes.data?.length || 0,
            visibleSections: sectionsRes.data?.length || 0,
            recentBookings,
          });
          setLoading(false);
          setErrorMessage(null);
        }
      } catch (err) {
        if (active) {
          setStats(emptyStats);
          setLoading(false);
          const errorText =
            typeof err === "string"
              ? err
              : err && typeof err === "object" && "message" in err
                ? String((err as { message: unknown }).message)
                : "Impossible de charger les indicateurs du tableau de bord.";
          setErrorMessage(errorText);
          console.error("Dashboard metrics error:", err);
        }
      }
    }

    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadStats();
      }
    });

    loadStats();
    return () => {
      active = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [datePreset, startDate, endDate]);

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Opérations</p>
          <h1 className="font-heading text-4xl font-bold">Tableau de bord</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Chargement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-7 w-20 rounded-md bg-muted/40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  const { start: rangeStart, end: rangeEnd, label: rangeLabel } = resolveRange(
    datePreset,
    startDate,
    endDate
  );
  const rangeMeta = `Du ${formatRangeLabel(rangeStart, rangeEnd)}`;
  const rangeBadge = `${rangeLabel} · ${formatRangeLabel(rangeStart, rangeEnd)}`;
  const overviewCards = [
    {
      title: "Total des réservations",
      value: loading ? "—" : stats.totalBookings,
      meta: rangeMeta,
      icon: CalendarCheck,
    },
    {
      title: "Nouvelles demandes",
      value: loading ? "—" : stats.newBookings,
      meta: "Sur la période sélectionnée",
      icon: Eye,
    },
    {
      title: "Confirmées",
      value: loading ? "—" : stats.confirmedBookings,
      meta: `${stats.conversionRate.toFixed(0)}% de conversion`,
      icon: MapIcon,
    },
    {
      title: "Valeur du pipeline",
      dualValues: {
        eur: loading ? "—" : formatCurrency(stats.pipelineValueEur, "EUR"),
        dzd: loading ? "—" : formatCurrency(stats.pipelineValueDzd, "DZD"),
      },
      meta: "Sur la période sélectionnée",
      icon: Layers,
    },
  ];
  const series = stats.dailySeries;
  const maxCount = Math.max(1, ...series.map((item) => item.count));
  const maxRevenueEur = Math.max(1, ...series.map((item) => item.revenueEur));
  const maxRevenueDzd = Math.max(1, ...series.map((item) => item.revenueDzd));
  const hasCountSeries = series.some((item) => item.count > 0);
  const hasRevenueEur = series.some((item) => item.revenueEur > 0);
  const hasRevenueDzd = series.some((item) => item.revenueDzd > 0);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Opérations</p>
        <h1 className="font-heading text-4xl font-bold">Tableau de bord</h1>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-base">Filtre de période</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Période active
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{rangeBadge}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Préréglages
                </p>
                <Select
                  value={datePreset}
                  onValueChange={(value) => setDatePreset(value as DatePreset)}
                >
                  <SelectTrigger className="w-full sm:w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {datePreset === "custom" && (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Début
                    </p>
                    <Input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setDatePreset("custom");
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Fin
                    </p>
                    <Input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setDatePreset("custom");
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {errorMessage && (
        <Card className="glass-panel border border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Alerte tableau de bord</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{errorMessage}</CardContent>
        </Card>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((stat) => (
          <Card key={stat.title} className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon size={18} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {"dualValues" in stat && stat.dualValues ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      EUR
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{stat.dualValues.eur}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      DZD
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{stat.dualValues.dzd}</p>
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">{stat.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Aperçu des revenus</CardTitle>
            <p className="text-xs text-muted-foreground">{rangeMeta}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  EUR confirmé
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(stats.confirmedValueEur, "EUR")}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  DZD confirmé
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(stats.confirmedValueDzd, "DZD")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Annulées
              </p>
              <p className="mt-2 text-lg font-semibold">{stats.cancelledBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Qualité des réservations</CardTitle>
            <p className="text-xs text-muted-foreground">{rangeMeta}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Taille moyenne du groupe
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats.averageGroup.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Taux de conversion
              </p>
              <p className="mt-2 text-lg font-semibold">
                {stats.conversionRate.toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Inventaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Programmes publiés
              </p>
              <p className="mt-2 text-2xl font-semibold">{stats.publishedPrograms}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Sections visibles
              </p>
              <p className="mt-2 text-lg font-semibold">{stats.visibleSections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader>
          <CardTitle>Réservations ({rangeLabel})</CardTitle>
          <p className="text-xs text-muted-foreground">{rangeMeta}</p>
          </CardHeader>
          <CardContent>
            <div className="relative h-24">
              <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent_0_12px,rgba(244,234,216,0.08)_12px_14px)]" />
              {hasCountSeries ? (
                <div className="relative flex h-full items-end gap-1">
                  {series.map((item) => {
                    const heightPct = (item.count / maxCount) * 100;
                    const height = item.count === 0 ? 4 : Math.min(100, Math.max(12, heightPct));
                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-ivory/20 via-ivory/50 to-ivory/90"
                          style={{ height: `${height}%` }}
                          title={`${item.label}: ${item.count}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative flex h-full items-center justify-center text-xs text-muted-foreground">
                  Aucune réservation sur la période sélectionnée.
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{series[0]?.label}</span>
              <span>{series[series.length - 1]?.label}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
          <CardTitle>Revenu confirmé (EUR)</CardTitle>
          <p className="text-xs text-muted-foreground">{rangeMeta}</p>
          </CardHeader>
          <CardContent>
            <div className="relative h-24">
              <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent_0_12px,rgba(215,180,124,0.08)_12px_14px)]" />
              {hasRevenueEur ? (
                <div className="relative flex h-full items-end gap-1">
                  {series.map((item) => {
                    const heightPct = (item.revenueEur / maxRevenueEur) * 100;
                    const height =
                      item.revenueEur === 0 ? 4 : Math.min(100, Math.max(12, heightPct));
                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-gold/20 via-gold/50 to-gold/90"
                          style={{ height: `${height}%` }}
                          title={`${item.label}: ${formatCurrency(item.revenueEur, "EUR")}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative flex h-full items-center justify-center text-xs text-muted-foreground">
                  Aucun revenu confirmé pour le moment.
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{series[0]?.label}</span>
              <span>{series[series.length - 1]?.label}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
          <CardTitle>Revenu confirmé (DZD)</CardTitle>
          <p className="text-xs text-muted-foreground">{rangeMeta}</p>
          </CardHeader>
          <CardContent>
            <div className="relative h-24">
              <div className="absolute inset-0 opacity-30 [background:repeating-linear-gradient(90deg,transparent_0_12px,rgba(215,180,124,0.08)_12px_14px)]" />
              {hasRevenueDzd ? (
                <div className="relative flex h-full items-end gap-1">
                  {series.map((item) => {
                    const heightPct = (item.revenueDzd / maxRevenueDzd) * 100;
                    const height =
                      item.revenueDzd === 0 ? 4 : Math.min(100, Math.max(12, heightPct));
                    return (
                      <div
                        key={item.label}
                        className="flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-ivory/20 via-ivory/50 to-ivory/90"
                          style={{ height: `${height}%` }}
                          title={`${item.label}: ${formatCurrency(item.revenueDzd, "DZD")}`}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative flex h-full items-center justify-center text-xs text-muted-foreground">
                  Aucun revenu confirmé pour le moment.
                </div>
              )}
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span>{series[0]?.label}</span>
              <span>{series[series.length - 1]?.label}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Dernières demandes de réservation</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune réservation pour le moment. Elles apparaîtront ici dès réception des demandes.
            </p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(stats.recentBookings as any[]).map(
                (booking) => {
                  const origin = (booking.origin_country as string | undefined)?.toUpperCase() || "INTL";
                  const useDzd = origin === "DZ";
                  const programPrice = useDzd
                    ? booking.programs?.price_dzd
                    : booking.programs?.price_eur;
                  const value = (programPrice || 0) * (booking.group_size || 0);
                  return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{booking.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.email}
                        {booking.programs?.title &&
                          ` — ${booking.programs.title}`}
                      </p>
                      {value > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Valeur estimée : {formatCurrency(value, useDzd ? "DZD" : "EUR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[booking.status] || ""}>
                        {statusLabels[booking.status] || booking.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  );
                }
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
