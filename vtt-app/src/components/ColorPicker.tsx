import React, { useRef, useEffect, useState } from 'react';
import { useVttStore } from '../store';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
  label?: string; // Optional label for accessibility/UI
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, className = '', label }) => {
  const recentColors = useVttStore((state) => state.recentColors);
  const addRecentColor = useVttStore((state) => state.addRecentColor);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value.toUpperCase();
    onChange(newColor);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    addRecentColor(e.target.value.toUpperCase());
  };

  const handleColorClick = (c: string) => {
    onChange(c);
    addRecentColor(c);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className || 'w-8 h-8'}`} ref={popoverRef}>
      <div
        className="w-full h-full rounded-md cursor-pointer border border-border shadow-sm flex items-center justify-center bg-background hover:bg-accent transition-colors overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
        title={label || "Choisir une couleur"}
      >
        <div
          className="w-full h-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[200] top-full mt-2 left-0 bg-popover border border-border rounded-md shadow-xl p-3 w-48">
          <div className="mb-3">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Couleur personnalisée</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={handleNativeChange}
                onBlur={handleBlur}
                className="w-full h-8 cursor-pointer rounded border border-border p-0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Couleurs récentes</label>
            <div className="grid grid-cols-4 gap-2">
              {recentColors.map((c, i) => (
                <button
                  key={`${c}-${i}`}
                  onClick={() => handleColorClick(c)}
                  className="w-full aspect-square rounded shadow-sm border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
