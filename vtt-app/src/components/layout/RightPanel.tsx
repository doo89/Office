import { Settings, ChevronLeft, ChevronRight, Upload, Grid3X3, Clock, Eye, PaintBucket, ChevronDown, Image as ImageIcon, Trash2, ArrowUpRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useVttStore } from '../../store';
import type { BadgeConfig, BadgeType } from '../../types';
import { ColorPicker } from '../ColorPicker';

export const RightPanel: React.FC = () => {
  const {
    isRightPanelOpen, toggleRightPanel,
    grid, setGrid,
    isNight, setNight,
    displaySettings, updateDisplaySettings,
    room, setRoom,
    timer, setTimer
  } = useVttStore();

  const [activeSection, setActiveSection] = useState<string | null>('affichage');

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer.isRunning) {
      interval = setInterval(() => {
        let newS = timer.seconds - 1;
        let newM = timer.minutes;

        if (newS < 0) {
          if (newM === 0) {
            clearInterval(interval);
            setTimer({ isRunning: false, seconds: 0 });
            if (timer.playSoundAtZero) {
              // Beep sound
              const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = ctx.createOscillator();
              const gainNode = ctx.createGain();
              osc.connect(gainNode);
              gainNode.connect(ctx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, ctx.currentTime);
              gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
              osc.start();
              osc.stop(ctx.currentTime + 0.5);
            }
            return;
          }
          newM -= 1;
          newS = 59;
        }

        setTimer({ minutes: newM, seconds: newS });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer.isRunning, timer.minutes, timer.seconds, timer.playSoundAtZero, setTimer]);

  const handleTimerToggle = () => setTimer({ isRunning: !timer.isRunning });
  const handleTimerReset = () => {
    setTimer({ isRunning: false, minutes: 5, seconds: 0 });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setRoom({ backgroundImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
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

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar min-h-0">

        {/* Display Settings */}
        <section className="flex flex-col border border-border rounded-md bg-background">
          <button
            onClick={() => toggleSection('affichage')}
            className="flex items-center justify-between p-2 bg-muted/50 hover:bg-muted font-semibold text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Eye size={16} /> Affichage
            </div>
            {activeSection === 'affichage' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {activeSection === 'affichage' && (
          <div className="flex flex-col gap-2 p-3 border-t border-border">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={isNight}
                onChange={(e) => setNight(e.target.checked)}
                className="rounded border-border"
              />
              Mode Nuit Actif
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={displaySettings.showCenter}
                onChange={(e) => updateDisplaySettings({ showCenter: e.target.checked })}
                className="rounded border-border"
              />
              Afficher le centre de la salle
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={displaySettings.showCycleIcon}
                onChange={(e) => updateDisplaySettings({ showCycleIcon: e.target.checked })}
                className="rounded border-border"
              />
              Afficher l'icône Jour/Nuit
            </label>

            {/* Foreground Selection */}
            <div className="mt-2 flex flex-col gap-1.5 border-t border-border/50 pt-2">
              <label className="text-xs font-semibold text-muted-foreground">Élément au premier plan</label>
              <select
                value={displaySettings.foregroundElement}
                onChange={(e) => updateDisplaySettings({ foregroundElement: e.target.value as 'players' | 'markers' })}
                className="w-full bg-background border border-border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-ring focus:border-input outline-none"
              >
                <option value="players">Joueurs</option>
                <option value="markers">Marqueurs</option>
              </select>
            </div>

            {/* Display Settings for Players */}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-2">
              <span className="text-xs font-semibold text-muted-foreground">Paramètres d'affichage des Joueurs</span>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.showPlayers}
                  onChange={(e) => updateDisplaySettings({ showPlayers: e.target.checked })}
                  className="rounded border-border"
                />
                Afficher les joueurs
              </label>

              {displaySettings.showPlayers && (
                <div className="flex flex-col gap-1.5 pl-5 border-l-2 border-border/30 ml-1.5 mt-1">
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={displaySettings.showPlayerImage}
                      onChange={(e) => updateDisplaySettings({ showPlayerImage: e.target.checked })}
                      className="rounded border-border w-3 h-3"
                    />
                    Afficher l'image du joueur
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={displaySettings.showRoleImage}
                      onChange={(e) => updateDisplaySettings({ showRoleImage: e.target.checked })}
                      className="rounded border-border w-3 h-3"
                    />
                    Afficher l'image du rôle
                  </label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Priorité si les deux existent :</span>
                    <select
                      value={displaySettings.imagePriority}
                      onChange={(e) => updateDisplaySettings({ imagePriority: e.target.value as 'player' | 'role' })}
                      className="bg-background border border-border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="player">Joueur</option>
                      <option value="role">Rôle</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>Position du nom (sans image) :</span>
                    <select
                      value={displaySettings.playerNamePosition}
                      onChange={(e) => updateDisplaySettings({ playerNamePosition: e.target.value as 'inside' | 'bottom' })}
                      className="bg-background border border-border rounded px-1 py-0.5 outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="inside">À l'intérieur</option>
                      <option value="bottom">En dessous</option>
                    </select>
                  </div>

                  {/* Custom Badges Configurator */}
                  <div className="mt-3 flex flex-col gap-2 border-t border-border/30 pt-2">
                    <span className="text-[11px] font-bold text-foreground">Pastilles personnalisables</span>

                    {[
                      { key: 'topLeft', label: 'Haut Gauche' },
                      { key: 'topRight', label: 'Haut Droite (Cœur si Vie)' },
                      { key: 'bottomLeft', label: 'Bas Gauche' },
                      { key: 'bottomRight', label: 'Bas Droite' }
                    ].map(corner => {
                      const badgeKey = corner.key as keyof typeof displaySettings.playerBadges;
                      const badge = displaySettings.playerBadges?.[badgeKey] || { type: 'none', bgColor: '#000', textColor: '#fff' };

                      const updateBadge = (updates: Partial<BadgeConfig>) => {
                        updateDisplaySettings({
                          playerBadges: {
                            ...displaySettings.playerBadges,
                            [badgeKey]: { ...badge, ...updates }
                          }
                        });
                      };

                      return (
                        <div key={corner.key} className="flex flex-col gap-1 bg-muted/20 p-1.5 rounded border border-border/50">
                          <span className="text-[10px] text-muted-foreground font-medium">{corner.label}</span>
                          <div className="flex items-center gap-2">
                            <select
                              value={badge.type}
                              onChange={(e) => updateBadge({ type: e.target.value as BadgeType })}
                              className="flex-1 bg-background border border-border rounded px-1 py-0.5 text-[10px] outline-none focus:ring-1 focus:ring-ring"
                            >
                              <option value="none">Rien</option>
                              <option value="team">Équipe</option>
                              <option value="lives">Vie</option>
                              <option value="votes">Votes</option>
                              <option value="points">Pts</option>
                              <option value="uses">Uses</option>
                              <option value="callOrderDay">Ordre Appel Jour</option>
                              <option value="callOrderNight">Ordre Appel Nuit</option>
                              <option value="connection">Connexion</option>
                            </select>

                            {badge.type !== 'none' && badge.type !== 'team' && badge.type !== 'connection' && (
                              <div className="flex items-center gap-1 shrink-0">
                                <ColorPicker
                                  color={badge.bgColor}
                                  onChange={(c) => updateBadge({ bgColor: c })}
                                  label="Couleur de fond"
                                  className="!w-4 !h-4"
                                />
                                <ColorPicker
                                  color={badge.textColor}
                                  onChange={(c) => updateBadge({ textColor: c })}
                                  label="Couleur du texte"
                                  className="!w-4 !h-4"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
          )}
        </section>

        {/* Timer */}
        <section className="flex flex-col border border-border rounded-md bg-background">
          <button
            onClick={() => toggleSection('chrono')}
            className="flex items-center justify-between p-2 bg-muted/50 hover:bg-muted font-semibold text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} /> Chronomètre
            </div>
            {activeSection === 'chrono' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {activeSection === 'chrono' && (
            <div className="flex flex-col items-center gap-3 p-3 border-t border-border">
              {timer.isDetached ? (
                <div className="flex flex-col items-center gap-2 w-full text-center py-2">
                  <span className="text-sm text-muted-foreground italic">Le chronomètre est détaché.</span>
                  <button
                    onClick={() => setTimer({ isDetached: false })}
                    className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90"
                  >
                    Rattacher
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1 text-3xl font-mono font-bold bg-input px-3 py-2 rounded-md border border-border">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={String(timer.minutes).padStart(2, '0')}
                      onChange={(e) => {
                        if (!timer.isRunning) {
                          setTimer({ minutes: Math.min(99, Math.max(0, parseInt(e.target.value) || 0)) });
                        }
                      }}
                      disabled={timer.isRunning}
                      className="w-16 bg-transparent text-center focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    />
                    <span className="text-muted-foreground pb-1">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={String(timer.seconds).padStart(2, '0')}
                      onChange={(e) => {
                        if (!timer.isRunning) {
                          setTimer({ seconds: Math.min(59, Math.max(0, parseInt(e.target.value) || 0)) });
                        }
                      }}
                      disabled={timer.isRunning}
                      className="w-16 bg-transparent text-center focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-muted-foreground w-full cursor-pointer mt-1 mb-1">
                    <input
                      type="checkbox"
                      checked={timer.playSoundAtZero}
                      onChange={(e) => setTimer({ playSoundAtZero: e.target.checked })}
                      className="rounded border-border w-3.5 h-3.5"
                    />
                    Jouer un son à la fin
                  </label>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleTimerToggle}
                      className={`flex-[2] py-2 rounded text-sm font-medium text-white ${timer.isRunning ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      {timer.isRunning ? 'Pause' : 'Démarrer'}
                    </button>
                    <button
                      onClick={handleTimerReset}
                      className="flex-1 bg-destructive text-destructive-foreground py-2 rounded text-sm hover:bg-destructive/90"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="w-full mt-1 border-t border-border pt-2">
                    <button
                      onClick={() => setTimer({ isDetached: true })}
                      className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-accent py-1.5 rounded transition-colors"
                    >
                      <ArrowUpRight size={14} /> Détacher en fenêtre volante
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* Magnetic Grid */}
        <section className="flex flex-col border border-border rounded-md bg-background">
          <button
            onClick={() => toggleSection('grille')}
            className="flex items-center justify-between p-2 bg-muted/50 hover:bg-muted font-semibold text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <Grid3X3 size={16} /> Grille Magnétique
            </div>
            {activeSection === 'grille' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {activeSection === 'grille' && (
          <div className="flex flex-col gap-2 p-3 border-t border-border">
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
          )}
        </section>

        {/* Background Config */}
         <section className="flex flex-col border border-border rounded-md bg-background">
          <button
            onClick={() => toggleSection('salle')}
            className="flex items-center justify-between p-2 bg-muted/50 hover:bg-muted font-semibold text-sm transition-colors"
          >
            <div className="flex items-center gap-2">
              <PaintBucket size={16} /> Salle
            </div>
            {activeSection === 'salle' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {activeSection === 'salle' && (
          <div className="flex flex-col gap-3 p-3 border-t border-border">

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
                <ColorPicker
                  color={room.backgroundColor}
                  onChange={(c) => setRoom({ backgroundColor: c })}
                  label="Couleur de fond"
                />
                <span className="text-xs uppercase font-mono">{room.backgroundColor}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/50">
              <span className="text-xs font-semibold text-muted-foreground">Image de fond</span>

              {!room.backgroundImage ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <ImageIcon size={24} className="mb-2" />
                  <span className="text-xs">Charger une image</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="relative w-full h-24 rounded-md overflow-hidden border border-border group">
                    <div
                      className="absolute inset-0 bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${room.backgroundImage})` }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        onClick={() => setRoom({ backgroundImage: null })}
                        className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                        title="Supprimer l'image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mt-1">
                    <label className="text-xs text-muted-foreground">Style d'affichage</label>
                    <select
                      value={room.backgroundStyle}
                      onChange={(e) => setRoom({ backgroundStyle: e.target.value as any })}
                      className="bg-input border border-border rounded-md px-2 py-1 text-sm w-full outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="mosaic">Mosaïque (Répéter)</option>
                      <option value="center">Centrer (Taille réelle)</option>
                      <option value="stretch">Étendre (Occuper tout l'espace)</option>
                    </select>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          )}
        </section>

      </div>

      {/* Import / Export Footer */}
      <div className="p-4 border-t border-border flex flex-col gap-2">
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