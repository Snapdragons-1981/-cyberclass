'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  accentColor: string;
  glowIntensity: number;
  animationIntensity: number;
  backgroundGrid: boolean;
  cardTransparency: number;
  reducedMotion: boolean;
  setAccentColor: (color: string) => void;
  setGlowIntensity: (value: number) => void;
  setAnimationIntensity: (value: number) => void;
  setBackgroundGrid: (value: boolean) => void;
  setCardTransparency: (value: number) => void;
  setReducedMotion: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  accentColor: '#00fff2',
  glowIntensity: 50,
  animationIntensity: 50,
  backgroundGrid: true,
  cardTransparency: 70,
  reducedMotion: false,
  setAccentColor: () => {},
  setGlowIntensity: () => {},
  setAnimationIntensity: () => {},
  setBackgroundGrid: () => {},
  setCardTransparency: () => {},
  setReducedMotion: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState('#00fff2');
  const [glowIntensity, setGlowIntensity] = useState(50);
  const [animationIntensity, setAnimationIntensity] = useState(50);
  const [backgroundGrid, setBackgroundGrid] = useState(true);
  const [cardTransparency, setCardTransparency] = useState(70);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cyberclass-theme');
    if (saved) {
      const settings = JSON.parse(saved);
      setAccentColor(settings.accentColor || '#00fff2');
      setGlowIntensity(settings.glowIntensity ?? 50);
      setAnimationIntensity(settings.animationIntensity ?? 50);
      setBackgroundGrid(settings.backgroundGrid ?? true);
      setCardTransparency(settings.cardTransparency ?? 70);
      setReducedMotion(settings.reducedMotion ?? false);
    }
  }, []);

  useEffect(() => {
    const settings = {
      accentColor,
      glowIntensity,
      animationIntensity,
      backgroundGrid,
      cardTransparency,
      reducedMotion,
    };
    localStorage.setItem('cyberclass-theme', JSON.stringify(settings));

    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--glow-intensity', `${glowIntensity}%`);
    document.documentElement.style.setProperty('--animation-intensity', `${animationIntensity}%`);
    document.documentElement.style.setProperty('--card-transparency', `${cardTransparency}%`);
  }, [accentColor, glowIntensity, animationIntensity, backgroundGrid, cardTransparency, reducedMotion]);

  return (
    <ThemeContext.Provider value={{
      accentColor,
      glowIntensity,
      animationIntensity,
      backgroundGrid,
      cardTransparency,
      reducedMotion,
      setAccentColor,
      setGlowIntensity,
      setAnimationIntensity,
      setBackgroundGrid,
      setCardTransparency,
      setReducedMotion,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
