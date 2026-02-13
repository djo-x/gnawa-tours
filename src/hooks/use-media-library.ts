import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaItem } from "@/types/settings";

export function useMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        setMedia(data as MediaItem[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return { media, loading, refresh };
}
