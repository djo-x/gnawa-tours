"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingStatus } from "@/app/admin/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BookingStatus } from "@/types/booking";

const statusLabels: Record<BookingStatus, string> = {
  new: "Nouveau",
  contacted: "Contacté",
  confirmed: "Confirmé",
  cancelled: "Annulé",
};

export function BookingStatusSelect({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();

  async function handleChange(value: string) {
    const result = await updateBookingStatus(bookingId, value);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Statut mis à jour");
      router.refresh();
    }
  }

  return (
    <Select value={currentStatus} onValueChange={handleChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(statusLabels) as BookingStatus[]).map((status) => (
          <SelectItem key={status} value={status}>
            {statusLabels[status]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
