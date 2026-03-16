'use client';

import React from 'react';

export function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return scrolled;
}

