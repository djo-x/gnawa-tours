"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Music2, Pause, Play, Plus, Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  enabled?: boolean;
  tracks?: string[];
  defaultVolume?: number;
}

function getRandomIndex(length: number, exclude?: number) {
  if (length <= 1) return 0;
  let next = exclude ?? 0;
  while (next === exclude) {
    next = Math.floor(Math.random() * length);
  }
  return next;
}

export function MusicPlayer({
  enabled = false,
  tracks = [],
  defaultVolume = 0.06,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const cleanTracks = useMemo(
    () => tracks.filter((item) => typeof item === "string" && item.trim() !== ""),
    [tracks]
  );
  const [currentIndex, setCurrentIndex] = useState(() => getRandomIndex(cleanTracks.length));
  const [muted, setMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() =>
    Math.max(0.02, Math.min(defaultVolume, 0.35))
  );
  const hasTracks = cleanTracks.length > 0;
  const safeIndex = hasTracks ? Math.min(currentIndex, cleanTracks.length - 1) : 0;
  const source = hasTracks ? cleanTracks[safeIndex] : "";
  const effectiveMuted = muted || !hasInteracted;
  const safeVolume = Math.max(0.02, Math.min(volume, 0.35));

  const ensurePlaying = useCallback(async () => {
    const audio = audioRef.current;
    if (!enabled || !source || !audio) return;
    audio.volume = safeVolume;
    audio.muted = effectiveMuted;
    try {
      await audio.play();
    } catch {
      // Browser autoplay policy can still block playback until user interaction.
    }
  }, [enabled, source, effectiveMuted, safeVolume]);

  useEffect(() => {
    if (!enabled || !source) return;
    const t1 = window.setTimeout(() => {
      void ensurePlaying();
    }, 0);
    const t2 = window.setTimeout(() => {
      void ensurePlaying();
    }, 500);
    const t3 = window.setTimeout(() => {
      void ensurePlaying();
    }, 1200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [enabled, source, ensurePlaying]);

  useEffect(() => {
    if (!enabled || !source) return;
    const handleInteraction = () => {
      setHasInteracted(true);
      void ensurePlaying();
    };
    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [enabled, source, ensurePlaying]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await ensurePlaying();
      return;
    }
    audio.pause();
  };

  const adjustVolume = (delta: number) => {
    const nextVolume = Math.max(0.02, Math.min(volume + delta, 0.35));
    setVolume(nextVolume);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = nextVolume;
    }
    if (muted) {
      setMuted(false);
      if (audio) audio.muted = false;
    }
  };

  if (!enabled || !source) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio
        ref={audioRef}
        src={source}
        preload="auto"
        autoPlay
        muted={effectiveMuted}
        playsInline
        loop={cleanTracks.length === 1}
        onLoadedData={() => {
          void ensurePlaying();
        }}
        onLoadedMetadata={() => {
          void ensurePlaying();
        }}
        onCanPlay={() => {
          void ensurePlaying();
        }}
        onCanPlayThrough={() => {
          void ensurePlaying();
        }}
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          if (cleanTracks.length <= 1) return;
          setCurrentIndex((prev) => getRandomIndex(cleanTracks.length, prev));
        }}
        onError={() => {
          if (cleanTracks.length <= 1) return;
          setCurrentIndex((prev) => getRandomIndex(cleanTracks.length, prev));
        }}
      />

      <div className="flex items-center gap-2 rounded-full border border-ivory/20 bg-[#0b0b0d]/85 px-3 py-2 text-ivory/80 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <Music2 size={14} className="text-gold" />
        <span className="hidden text-[10px] uppercase tracking-[0.22em] sm:inline">
          {isPlaying ? "En lecture" : "Ambiance"}
        </span>

        <button
          type="button"
          onClick={() => {
            void togglePlayback();
          }}
          aria-label={isPlaying ? "Mettre en pause" : "Lire la musique"}
          className="rounded-full border border-ivory/30 p-1.5 transition hover:bg-ivory/10"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>

        <button
          type="button"
          onClick={() => {
            const nextMuted = !muted;
            setMuted(nextMuted);
            const audio = audioRef.current;
            if (audio) {
              audio.muted = nextMuted || !hasInteracted;
              if (!nextMuted) {
                void ensurePlaying();
              }
            }
          }}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          className="rounded-full border border-ivory/30 p-1.5 transition hover:bg-ivory/10"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button
          type="button"
          onClick={() => adjustVolume(-0.03)}
          aria-label="Baisser le volume"
          className="rounded-full border border-ivory/30 p-1.5 transition hover:bg-ivory/10"
        >
          <Minus size={14} />
        </button>

        <input
          type="range"
          min={2}
          max={50}
          step={1}
          value={Math.round(volume * 100)}
          onChange={(e) => {
            const nextVolume = Math.max(
              0.02,
              Math.min(Number(e.target.value) / 100, 0.35)
            );
            setVolume(nextVolume);
            const audio = audioRef.current;
            if (audio) {
              audio.volume = nextVolume;
            }
            if (muted) {
              setMuted(false);
              if (audio) audio.muted = false;
            }
          }}
          aria-label="Niveau de volume"
          className="h-1 w-20 accent-gold"
        />

        <button
          type="button"
          onClick={() => adjustVolume(0.03)}
          aria-label="Augmenter le volume"
          className="rounded-full border border-ivory/30 p-1.5 transition hover:bg-ivory/10"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
