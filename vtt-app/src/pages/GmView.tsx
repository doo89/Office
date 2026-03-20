import React from 'react';
import { LeftPanel } from '../components/layout/LeftPanel';
import { RightPanel } from '../components/layout/RightPanel';
import { Canvas } from '../components/layout/Canvas';
import { ThemeToggle } from '../components/ThemeToggle';
import { EditingModal } from '../components/EditingModal';
import { HandoutWindow } from '../components/HandoutWindow';
import { useVttStore } from '../store';

export const GmView: React.FC = () => {
  const { isNight, editingEntity, handouts } = useVttStore();

  return (
    <div className={`h-screen w-screen flex overflow-hidden bg-background text-foreground transition-colors duration-300 ${isNight ? 'dark' : ''}`}>
      <ThemeToggle />
      <LeftPanel />
      <Canvas />
      <RightPanel />
      {editingEntity && <EditingModal />}

      {/* Render open handouts over everything */}
      {handouts.filter(h => h.isOpen).map(handout => (
        <HandoutWindow key={handout.id} handout={handout} />
      ))}
    </div>
  );
};
