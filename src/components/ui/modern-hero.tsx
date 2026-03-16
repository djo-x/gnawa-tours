"use client";

import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { Mountain, MapPin } from "lucide-react";
import { useRef } from "react";

const SECTION_HEIGHT = 1500;

export const SmoothScrollHero = () => {
  return (
    <div className="bg-zinc-950">
      <Nav />
      <Hero />
      <Schedule />
    </div>
  );
};

const Nav = () => {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-3 text-white">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-amber-300 ring-1 ring-amber-300/40">
          <Mountain className="h-4 w-4" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase">
            Gnaoua Tours
          </span>
          <span className="text-[10px] uppercase tracking-[0.28em] text-zinc-400">
            Sahara algérien
          </span>
        </div>
      </div>
      <button
        onClick={() => {
          document.getElementById("launch-schedule")?.scrollIntoView({
            behavior: "smooth",
          });
        }}
        className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white"
      >
        Prochains départs
        <span aria-hidden>→</span>
      </button>
    </nav>
  );
};

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />
      <ParallaxImages />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();

  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);

  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;

  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"],
  );
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0],
  );

  return (
    <motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(https://images.pexels.com/photos/3876407/pexels-photo-3876407.jpeg?w=2670&q=80)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-[200px]">
      <ParallaxImg
        src="https://images.pexels.com/photos/1001435/pexels-photo-1001435.jpeg?w=2670&q=80"
        alt="Caravane dans les dunes du Sahara"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="https://images.pexels.com/photos/1146708/pexels-photo-1146708.jpeg?w=2670&q=80"
        alt="Ciel étoilé au-dessus d’un campement saharien"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="https://images.pexels.com/photos/2832040/pexels-photo-2832040.jpeg?w=2370&q=80"
        alt="Massifs rocheux du Tassili"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?w=2670&q=80"
        alt="Vallée isolée baignée de lumière dorée"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

const ParallaxImg = ({
  className,
  alt,
  src,
  start,
  end,
}: {
  className?: string;
  alt: string;
  src: string;
  start: number;
  end: number;
}) => {
  const ref = useRef<HTMLImageElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });

  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      ref={ref}
      style={{ transform, opacity }}
    />
  );
};

const Schedule = () => {
  return (
    <section
      id="launch-schedule"
      className="mx-auto max-w-5xl px-4 py-32 text-white"
    >
      <motion.h1
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-16 text-3xl font-black uppercase text-zinc-50 md:text-4xl"
      >
        Prochains départs sahariens
      </motion.h1>
      <ScheduleItem title="Tadrart Rouge" date="Octobre" location="Djanet" />
      <ScheduleItem title="Oasis d’Ihrir" date="Novembre" location="Tassili" />
      <ScheduleItem title="Erg Admer" date="Décembre" location="Sahara central" />
      <ScheduleItem title="Circuit Nomade" date="Janvier" location="Sud algérien" />
    </section>
  );
};

const ScheduleItem = ({
  title,
  date,
  location,
}: {
  title: string;
  date: string;
  location: string;
}) => {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.6 }}
      className="mb-8 flex items-center justify-between border-b border-zinc-800 px-3 pb-6"
    >
      <div>
        <p className="mb-1.5 text-lg text-zinc-50 md:text-xl">{title}</p>
        <p className="text-xs uppercase text-zinc-500">{date}</p>
      </div>
      <div className="flex items-center gap-1.5 text-end text-xs uppercase text-zinc-500">
        <p>{location}</p>
        <MapPin className="h-3.5 w-3.5" />
      </div>
    </motion.div>
  );
};

