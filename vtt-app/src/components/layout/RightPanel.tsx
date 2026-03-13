import { Settings, ChevronLeft, ChevronRight, Download, Upload, Grid3X3, Clock, Eye, PaintBucket, CircleDashed, Eraser } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useVttStore } from '../../store';

export const RightPanel: React.FC = () => {
  const {
    isRightPanelOpen, toggleRightPanel,
    grid, setGrid,
    isNight, setNight,
    displaySettings, updateDisplaySettings,
    clearWalls,
    room, setRoom
  } = useVttStore();

  const textures = [
    { value: 'none', label: 'Aucun motif' },
    { value: 'https://www.transparenttextures.com/patterns/cubes.png', label: 'Cubes' },
    { value: 'https://www.transparenttextures.com/patterns/diagonal-stripes.png', label: 'Rayures diagonales' },
    { value: 'https://www.transparenttextures.com/patterns/dots.png', label: 'Points' },
    { value: 'https://www.transparenttextures.com/patterns/carbon-fibre.png', label: 'Fibre de carbone' },
    { value: 'https://www.transparenttextures.com/patterns/wood-pattern.png', label: 'Bois' },
    { value: 'https://www.transparenttextures.com/patterns/stardust.png', label: 'Poussière d\'étoiles' },
    { value: 'https://www.transparenttextures.com/patterns/hexellence.png', label: 'Hexagones' },
  ];

  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => {
          if (s === 0) {
            if (timerMinutes === 0) {
              clearInterval(interval);
              setIsTimerRunning(false);
              return 0;
            }
            setTimerMinutes(m => m - 1);
            return 59;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes]);

  const handleTimerToggle = () => setIsTimerRunning(!isTimerRunning);
  const handleTimerReset = () => {
    setIsTimerRunning(false);
    setTimerMinutes(5);
    setTimerSeconds(0);
  };

  const handleExport = () => {
    const state = useVttStore.getState();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');

    // Sanitize room name for filename
    const safeRoomName = state.roomName ? state.roomName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'vtt_state';

    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${safeRoomName}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          useVttStore.setState(json);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Fichier JSON invalide.");
        }
      };
      reader.readAsText(file);
    }
  };


  if (!isRightPanelOpen) {
    return (
      <div className="absolute right-0 top-0 h-full flex items-center z-50">
        <button
          onClick={toggleRightPanel}
          className="bg-card border border-border rounded-l-md p-2 shadow-md hover:bg-accent"
        >
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[288px] h-full bg-card border-l border-border flex flex-col relative z-40 shrink-0">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Settings size={20} />
        <h2 className="text-xl font-bold">Outils</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar">

        {/* Display Settings */}
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <Eye size={16} /> Affichage
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isNight}
                onChange={(e) => setNight(e.target.checked)}
                className="rounded border-border"
              />
              Mode Nuit Actif
            </label>
            {/* Display Settings for Players */}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-2">
              <span className="text-xs font-semibold text-muted-foreground">Paramètres d'affichage des Joueurs</span>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.showTooltip}
                  onChange={(e) => updateDisplaySettings({ showTooltip: e.target.checked })}
                  className="rounded border-border"
                />
                Afficher la bulle d'information
              </label>

              {displaySettings.showTooltip && (
                <div className="flex flex-col gap-1.5 pl-5 border-l-2 border-border/30 ml-1.5 mt-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={displaySettings.showRole}
                      onChange={(e) => updateDisplaySettings({ showRole: e.target.checked })}
                      className="rounded border-border w-3 h-3"
                    />
                    Afficher le rôle
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={displaySettings.showTeam}
                      onChange={(e) => updateDisplaySettings({ showTeam: e.target.checked })}
                      className="rounded border-border w-3 h-3"
                    />
                    Afficher l'équipe
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={displaySettings.showTags}
                      onChange={(e) => updateDisplaySettings({ showTags: e.target.checked })}
                      className="rounded border-border w-3 h-3"
                    />
                    Afficher les Tags
                  </label>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Timer */}
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <Clock size={16} /> Chronomètre
          </h3>
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl font-mono font-bold">
              {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
            </div>
            <div className="flex gap-2 w-full">
              {!isTimerRunning && (
                <button onClick={() => {setTimerMinutes(m => m + 1)}} className="flex-1 bg-accent text-xs py-1 rounded hover:bg-accent/80">+1m</button>
              )}
               {!isTimerRunning && (
                <button onClick={() => {setTimerMinutes(m => Math.max(0, m - 1))}} className="flex-1 bg-accent text-xs py-1 rounded hover:bg-accent/80">-1m</button>
              )}
            </div>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleTimerToggle}
                className={`flex-[2] py-2 rounded text-sm font-medium text-white ${isTimerRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
              >
                {isTimerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={handleTimerReset}
                className="flex-1 bg-destructive text-destructive-foreground py-2 rounded text-sm hover:bg-destructive/90"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Magnetic Grid */}
        <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <Grid3X3 size={16} /> Grille Magnétique
          </h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={grid.enabled}
                onChange={(e) => setGrid({ ...grid, enabled: e.target.checked })}
                className="rounded border-border"
              />
              Activer la grille
            </label>
            {grid.enabled && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Taille (px):</span>
                <input
                  type="number"
                  value={grid.sizeX}
                  onChange={(e) => setGrid({ ...grid, sizeX: Math.max(10, parseInt(e.target.value) || 50), sizeY: Math.max(10, parseInt(e.target.value) || 50) })}
                  className="w-16 bg-input border border-border rounded px-2 py-1 text-sm"
                />
              </div>
            )}
          </div>
        </section>

        {/* Magnetic Circle Placeholder */}
         <section className="flex flex-col gap-3 opacity-50">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <CircleDashed size={16} /> Cercle Magnétique
          </h3>
          <p className="text-xs text-muted-foreground">Outil de disposition circulaire en cours de développement.</p>
        </section>

         {/* Walls & Drawing Placeholder */}
         <section className="flex flex-col gap-3 opacity-50">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <Eraser size={16} /> Murs & Dessin
          </h3>
          <p className="text-xs text-muted-foreground">Outils de tracé en cours de développement.</p>
          <button onClick={clearWalls} className="text-xs bg-accent py-1 rounded w-full">Effacer les murs</button>
        </section>


        {/* Background Config */}
         <section className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm border-b border-border pb-1 flex items-center gap-2">
            <PaintBucket size={16} /> Salle
          </h3>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-muted-foreground">Largeur (px)</label>
              <input
                type="number"
                value={room.width}
                onChange={(e) => setRoom({ width: Math.max(100, parseInt(e.target.value) || 2000) })}
                className="w-full bg-input border border-border rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs text-muted-foreground">Hauteur (px)</label>
              <input
                type="number"
                value={room.height}
                onChange={(e) => setRoom({ height: Math.max(100, parseInt(e.target.value) || 1500) })}
                className="w-full bg-input border border-border rounded px-2 py-1 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Couleur de fond</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={room.backgroundColor}
                onChange={(e) => setRoom({ backgroundColor: e.target.value })}
                className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
              />
              <span className="text-xs uppercase font-mono">{room.backgroundColor}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Motif (Texture)</label>
            <select
              value={room.texture}
              onChange={(e) => setRoom({ texture: e.target.value })}
              className="bg-input border border-border rounded-md px-2 py-1 text-sm w-full"
            >
              {textures.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </section>

      </div>

      {/* Import / Export Footer */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 w-full py-2 bg-accent hover:bg-accent/80 rounded-md text-sm font-medium transition-colors"
        >
          <Download size={16} /> Exporter (JSON)
        </button>
        <button
           onClick={handleImportClick}
          className="flex items-center justify-center gap-2 w-full py-2 bg-accent hover:bg-accent/80 rounded-md text-sm font-medium transition-colors"
        >
          <Upload size={16} /> Importer (JSON)
        </button>
        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </div>

      <button
        onClick={toggleRightPanel}
        className="absolute -left-8 top-1/2 transform -translate-y-1/2 bg-card border border-r-0 border-border rounded-l-md p-2 shadow-md hover:bg-accent"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};