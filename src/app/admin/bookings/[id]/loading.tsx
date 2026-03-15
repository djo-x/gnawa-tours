import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function BookingDetailLoading() {
  return (
    <div className="space-y-5">
      <div className="h-10 w-64 animate-pulse rounded bg-muted" />
      <Card className="glass-panel">
        <CardHeader className="pb-2">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-20 w-full animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
