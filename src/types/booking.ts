export type BookingStatus = "new" | "contacted" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  program_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  group_size: number;
  message: string | null;
  origin_country: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}
