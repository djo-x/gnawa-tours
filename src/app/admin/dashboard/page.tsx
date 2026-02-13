"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  bookingsLast7: number;
  bookingsLast30: number;
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
  bookingsLast7: 0,
  bookingsLast30: 0,
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const formatCurrency = (value: number, currency: "EUR" | "DZD") =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    let active = true;

    async function loadStats() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (active) {
          setStats(emptyStats);
          setLoading(false);
          setErrorMessage("Supabase environment variables are missing.");
        }
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          if (active) {
            setLoading(false);
            setErrorMessage("Session not ready. Please refresh or sign in again.");
          }
          return;
        }
        const now = new Date();
        const last7 = new Date(now);
        last7.setDate(now.getDate() - 7);
        const last30 = new Date(now);
        last30.setDate(now.getDate() - 30);

        const [bookingsRes, programsRes, sectionsRes] = await Promise.all([
          supabase
            .from("bookings")
            .select(
              "id, full_name, email, status, created_at, group_size, program_id, origin_country"
            )
            .order("created_at", { ascending: false }),
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
        let bookingsLast7 = 0;
        let bookingsLast30 = 0;
        let pipelineValueEur = 0;
        let pipelineValueDzd = 0;
        let confirmedValueEur = 0;
        let confirmedValueDzd = 0;
        let groupTotal = 0;
        const dailySeries: DailySeries = [];
        const dayCount = 14;
        const dayKeys: string[] = [];
        for (let i = dayCount - 1; i >= 0; i -= 1) {
          const day = new Date(now);
          day.setDate(now.getDate() - i);
          day.setHours(0, 0, 0, 0);
          const key = day.toISOString().split("T")[0];
          dayKeys.push(key);
          dailySeries.push({
            label: new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
            }).format(day),
            count: 0,
            revenueEur: 0,
            revenueDzd: 0,
          });
        }
        const dayIndex = new Map(dayKeys.map((key, idx) => [key, idx]));

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
            if (created >= last7) bookingsLast7 += 1;
            if (created >= last30) bookingsLast30 += 1;

            const key = created.toISOString().split("T")[0];
            const idx = dayIndex.get(key);
            if (idx !== undefined) {
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
            bookingsLast7,
            bookingsLast30,
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
                : "Unable to load dashboard metrics.";
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
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Operations</p>
          <h1 className="font-heading text-4xl font-bold">Dashboard</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Loading</CardTitle>
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
  const overviewCards = [
    {
      title: "Total Bookings",
      value: loading ? "—" : stats.totalBookings,
      meta: `${stats.bookingsLast7} in last 7 days`,
      icon: CalendarCheck,
    },
    {
      title: "New Requests",
      value: loading ? "—" : stats.newBookings,
      meta: `${stats.bookingsLast30} in last 30 days`,
      icon: Eye,
    },
    {
      title: "Confirmed",
      value: loading ? "—" : stats.confirmedBookings,
      meta: `${stats.conversionRate.toFixed(0)}% conversion`,
      icon: MapIcon,
    },
    {
      title: "Pipeline Value",
      value: loading ? "—" : formatCurrency(stats.pipelineValueEur, "EUR"),
      subvalue: loading ? null : formatCurrency(stats.pipelineValueDzd, "DZD"),
      meta: "Excludes cancelled",
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
        <p className="text-xs uppercase tracking-[0.22em] text-gold/80">Operations</p>
        <h1 className="font-heading text-4xl font-bold">Dashboard</h1>
      </div>

      {/* Stats */}
      {errorMessage && (
        <Card className="glass-panel border border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Dashboard Notice</CardTitle>
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
              <div className="text-3xl font-bold">{stat.value}</div>
              {"subvalue" in stat && stat.subvalue ? (
                <div className="mt-1 text-lg font-semibold text-muted-foreground">
                  {stat.subvalue}
                </div>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">{stat.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Revenue Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Confirmed Revenue
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(stats.confirmedValueEur, "EUR")}
              </p>
              <p className="mt-1 text-lg font-semibold text-muted-foreground">
                {formatCurrency(stats.confirmedValueDzd, "DZD")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Cancelled
              </p>
              <p className="mt-2 text-lg font-semibold">{stats.cancelledBookings}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Booking Quality</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Average Group Size
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {stats.averageGroup.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Conversion Rate
              </p>
              <p className="mt-2 text-lg font-semibold">
                {stats.conversionRate.toFixed(0)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Published Programs
              </p>
              <p className="mt-2 text-2xl font-semibold">{stats.publishedPrograms}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Visible Sections
              </p>
              <p className="mt-2 text-lg font-semibold">{stats.visibleSections}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Bookings (Last 14 Days)</CardTitle>
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
                  No bookings in the last 14 days.
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
            <CardTitle>Confirmed Revenue (EUR)</CardTitle>
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
                  No confirmed revenue yet.
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
            <CardTitle>Confirmed Revenue (DZD)</CardTitle>
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
                  No confirmed revenue yet.
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
          <CardTitle>Recent Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No bookings yet. They will appear here once customers submit inquiries.
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
                          Est. value: {formatCurrency(value, useDzd ? "DZD" : "EUR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[booking.status] || ""}>
                        {booking.status}
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
