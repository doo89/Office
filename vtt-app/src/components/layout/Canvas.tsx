import React, { useRef, useState, useEffect } from 'react';
import { useVttStore } from '../../store';
import { ZoomIn, ZoomOut, Maximize, Tag, Skull, Trash2, Settings, ChevronRight, Sun, Moon, Copy, icons } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Marker } from '../../types';

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    roomName, setRoomName,
    canvas, setPan, setZoom, isNight, nextCycle,
    players, updatePlayer, addPlayer, deletePlayer,
    markers, updateMarker, addMarker, deleteMarker,
    roles, teams, grid, room, displaySettings
  } = useVttStore();
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'player' | 'marker', entityId: string } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, type: 'player' | 'marker', entityId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, type, entityId });
  };

  const closeContextMenu = () => {
    if (contextMenu) setContextMenu(null);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const snapToGrid = (value: number, gridSize: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    // Convert screen coordinates to canvas coordinates
    const rect = containerRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;

    // Apply inverse transform to get coordinates relative to origin
    let canvasX = (dropX - canvas.panX - rect.width / 2) / canvas.zoom;
    let canvasY = (dropY - canvas.panY - rect.height / 2) / canvas.zoom;

    if (grid.enabled) {
      canvasX = snapToGrid(canvasX, grid.sizeX);
      canvasY = snapToGrid(canvasY, grid.sizeY);
    }

    try {
      const payload = JSON.parse(e.dataTransfer.getData('application/json'));

      if (payload.type === 'new_player') {
        // Cloning a player from left panel
        const newPlayer = {
          ...payload.data,
          size: payload.data.size || 40,
          imageUrl: payload.data.imageUrl,
          isDead: false,
          tags: [],
          x: canvasX,
          y: canvasY,
          id: undefined
        };
        addPlayer(newPlayer);
      } else if (payload.type === 'existing_player') {
        // Moving an existing player
        updatePlayer(payload.data.id, { x: canvasX, y: canvasY });
      } else if (payload.type === 'new_marker') {
        // Creating a new marker from a tag model
        addMarker({
          x: canvasX,
          y: canvasY,
          tag: { ...payload.data, instanceId: uuidv4() }
        });
      } else if (payload.type === 'existing_marker') {
        // Moving an existing marker, check for collision with players for merge
        const marker = payload.data as Marker;

        // Find if dropped on a player
        const hitPlayer = players.find(p => {
          const dx = p.x - canvasX;
          const dy = p.y - canvasY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= p.size; // Simple circle collision
        });

        if (hitPlayer) {
          if (window.confirm(`Voulez-vous fusionner le tag "${marker.tag.name}" avec le joueur "${hitPlayer.name}" ?`)) {
            // Merge tag into player
            updatePlayer(hitPlayer.id, {
              tags: [...hitPlayer.tags, { ...marker.tag }]
            });
            deleteMarker(marker.id);
            return;
          }
        }

        // If not merged, just update position
        updateMarker(marker.id, { x: canvasX, y: canvasY });
      }
    } catch (err) {
      console.error("Drop error", err);
    }
  };


  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom
      const zoomSensitivity = 0.001;
      const newZoom = Math.min(Math.max(0.1, canvas.zoom - e.deltaY * zoomSensitivity), 5);
      setZoom(newZoom);
    } else {
      // Pan
      setPan(canvas.panX - e.deltaX, canvas.panY - e.deltaY);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    closeContextMenu();
    // Only start panning if clicking directly on the canvas background, not on entities
    if ((e.target as HTMLElement).closest('.canvas-entity')) return;

    if (e.button === 1 || (e.button === 0 && e.altKey) || e.button === 0) { // Allow left click pan for now if not on entity
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setPan(canvas.panX + dx, canvas.panY + dy);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const preventDefaultWheel = (e: WheelEvent) => {
        if (e.ctrlKey) e.preventDefault();
      };
      container.addEventListener('wheel', preventDefaultWheel, { passive: false });
      return () => container.removeEventListener('wheel', preventDefaultWheel);
    }
  }, []);

  return (
    <div className="flex-1 relative flex flex-col min-w-0">
      {/* Banner */}
      <div className="h-12 bg-card border-b border-border flex items-center justify-center shrink-0 z-40 relative shadow-sm">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="text-lg font-bold text-center bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
          placeholder="Nom de la salle"
          title="Nom de la salle (utilisé pour l'export JSON)"
        />
      </div>

    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-background outline-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      tabIndex={0}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Cycle Icon */}
      {displaySettings.showCycleIcon && (
        <button
          onClick={nextCycle}
          className="absolute top-4 left-4 z-50 p-3 rounded-full shadow-lg bg-card/80 backdrop-blur border border-border hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center group"
          title={`Passer au ${isNight ? 'Jour' : 'Nuit'}`}
        >
          {isNight ? <Sun className="text-yellow-500 group-hover:scale-110 transition-transform" size={28} /> : <Moon className="text-blue-400 group-hover:scale-110 transition-transform" size={28} />}
        </button>
      )}

      {/* Night Overlay */}
      {isNight && (
        <div className="absolute inset-0 bg-black/60 z-30 pointer-events-none transition-opacity duration-1000" />
      )}

      {/* Grid Overlay */}
      {grid.enabled && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: `${grid.sizeX * canvas.zoom}px ${grid.sizeY * canvas.zoom}px`,
            backgroundPosition: `${(canvas.panX + containerRef.current?.getBoundingClientRect().width! / 2) % (grid.sizeX * canvas.zoom)}px ${(canvas.panY + containerRef.current?.getBoundingClientRect().height! / 2) % (grid.sizeY * canvas.zoom)}px`
          }}
        />
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-4 z-40 flex gap-2 bg-card p-2 rounded-lg border border-border shadow-md">
        <button onClick={() => setZoom(Math.max(0.1, canvas.zoom - 0.1))} className="p-1 hover:bg-accent rounded-md"><ZoomOut size={20} /></button>
        <span className="w-12 text-center text-sm flex items-center justify-center font-mono">{(canvas.zoom * 100).toFixed(0)}%</span>
        <button onClick={() => setZoom(Math.min(5, canvas.zoom + 0.1))} className="p-1 hover:bg-accent rounded-md"><ZoomIn size={20} /></button>
        <div className="w-px h-6 bg-border mx-1" />
        <button onClick={() => { setZoom(1); setPan(0, 0); }} className="p-1 hover:bg-accent rounded-md" title="Reset View"><Maximize size={20} /></button>
      </div>

      {/* The actual infinite canvas */}
      <div
        className="absolute origin-center"
        style={{
          transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
          left: '50%',
          top: '50%',
          width: 0,
          height: 0,
        }}
      >
        {/* Room Area */}
        <div
          className="absolute origin-center transition-colors duration-500 shadow-2xl"
          style={{
            width: room.width,
            height: room.height,
            left: -room.width / 2,
            top: -room.height / 2,
            backgroundColor: room.backgroundColor,
            backgroundImage: room.texture !== 'none' ? `url(${room.texture})` : 'none',
            border: '2px solid rgba(0,0,0,0.1)',
            borderRadius: '8px',
            pointerEvents: 'none', // Allow clicking through to canvas for panning
          }}
        />

        {/* Origin indicator (0,0) */}
        {displaySettings.showCenter && (
          <div className="absolute w-4 h-4 rounded-full bg-red-500/50 -ml-2 -mt-2" />
        )}

        {/* Render Players */}
        {displaySettings.showPlayers && players.map(player => {
          const role = roles.find(r => r.id === player.roleId);
          const team = teams.find(t => t.id === player.teamId);

          let imageToShow = null;
          if (displaySettings.showPlayerImage && player.imageUrl && displaySettings.showRoleImage && role?.imageUrl) {
            imageToShow = displaySettings.imagePriority === 'player' ? player.imageUrl : role.imageUrl;
          } else if (displaySettings.showPlayerImage && player.imageUrl) {
            imageToShow = player.imageUrl;
          } else if (displaySettings.showRoleImage && role?.imageUrl) {
            imageToShow = role.imageUrl;
          }

          return (
            <div
              key={player.id}
              className="absolute canvas-entity group"
              style={{
                left: player.x,
                top: player.y,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab',
                zIndex: displaySettings.foregroundElement === 'players' ? 20 : 10
              }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                closeContextMenu();
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_player', data: player }));
              }}
              onContextMenu={(e) => handleContextMenu(e, 'player', player.id)}
              onDoubleClick={() => useVttStore.getState().setEditingEntity({ type: 'player', id: player.id })}
            >
              <div className="relative flex flex-col items-center justify-center">
                <div
                  className={`rounded-full shadow-lg flex items-center justify-center transition-all overflow-hidden ${player.isDead ? 'opacity-80' : ''}`}
                  style={{
                    width: player.size * 2,
                    height: player.size * 2,
                    backgroundColor: player.isDead ? '#27272a' : player.color, // zinc-800
                    border: `4px solid ${player.isDead ? '#7f1d1d' : (role?.color || '#ffffff')}`, // red-900
                    padding: imageToShow ? '2px' : '0' // Leave 2px border for color if image exists
                  }}
                >
                  {imageToShow && !player.isDead && (
                    <img
                      src={imageToShow}
                      alt={player.name}
                      className="w-full h-full object-cover rounded-full bg-background"
                      draggable={false}
                    />
                  )}
                  {player.isDead && (
                    <Skull size={player.size * 1.5} className="absolute text-red-900/60 pointer-events-none" />
                  )}

                  {/* Show name inside circle ONLY if there's no image AND setting says 'inside' */}
                  {!imageToShow && displaySettings.playerNamePosition === 'inside' && (
                    <span className="font-bold text-white text-sm mix-blend-difference drop-shadow-md px-1 text-center leading-tight z-10 pointer-events-none">
                      {player.name}
                    </span>
                  )}
                </div>

                {/* Show name below the circle IF there IS an image OR setting says 'bottom' */}
                {(imageToShow || (!imageToShow && displaySettings.playerNamePosition === 'bottom')) && (
                  <div className="absolute top-full mt-1 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap border border-border pointer-events-none">
                    {player.name}
                  </div>
                )}

                {/* Team Badge */}
                {team && (
                  <div
                    className="absolute -top-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background shadow-sm"
                    style={{ backgroundColor: team.color }}
                    title={`Équipe: ${team.name}`}
                  >
                    {team.icon && icons[team.icon as keyof typeof icons] ? (
                      React.createElement(icons[team.icon as keyof typeof icons], { size: 12, className: "text-white drop-shadow" })
                    ) : null}
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {displaySettings.showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-bold">{player.name}</p>
                  {displaySettings.showRole && role && <p>Rôle: <span style={{ color: role.color }}>{role.name}</span></p>}
                  {displaySettings.showTeam && team && <p>Équipe: <span style={{ color: team.color }}>{team.name}</span></p>}
                  {player.isDead && <p className="text-destructive font-bold">Mort</p>}
                  {displaySettings.showTags && (
                    player.tags.some(t => t.showInTooltip !== false) ||
                    (role && role.tags && role.tags.some(t => t.showInTooltip !== false))
                  ) && (
                    <div className="mt-1 border-t border-border pt-1">
                      <p className="font-semibold text-[10px] text-muted-foreground">Tags:</p>
                      <ul className="flex flex-col gap-1 mt-1">
                        {role?.tags?.filter(t => t.showInTooltip !== false).map(t => {
                          const TIcon = icons[t.icon as keyof typeof icons] || Tag;
                          return (
                            <li key={`role-tag-${t.id}`} className="flex flex-col bg-muted px-1.5 py-0.5 rounded text-[10px] border border-dashed border-border" title="Tag de Rôle">
                              <div className="flex items-center gap-1">
                                {t.imageUrl ? (
                                  <img src={t.imageUrl} alt={t.name} className="w-3 h-3 rounded-full object-cover" />
                                ) : (
                                  <TIcon size={10} style={{ color: t.color }} />
                                )}
                                <span className="font-medium">{t.name} (Rôle)</span>
                              </div>
                              {(t.uses !== null || t.points !== null || t.votes !== null) && (
                                <div className="text-[9px] text-muted-foreground pl-4">
                                  {t.uses !== null && <span>Uses: {t.uses} </span>}
                                  {t.points !== null && <span>Pts: {t.points} </span>}
                                  {t.votes !== null && <span>Votes: {t.votes === -1 ? 'Illimité' : t.votes}</span>}
                                </div>
                              )}
                              {t.description && <div className="text-[9px] text-muted-foreground pl-4 italic">{t.description}</div>}
                            </li>
                          );
                        })}
                        {player.tags.filter(t => t.showInTooltip !== false).map(t => {
                          const TIcon = icons[t.icon as keyof typeof icons] || Tag;
                          return (
                            <li key={t.instanceId} className="flex flex-col bg-muted px-1.5 py-0.5 rounded text-[10px]">
                              <div className="flex items-center gap-1">
                                {t.imageUrl ? (
                                  <img src={t.imageUrl} alt={t.name} className="w-3 h-3 rounded-full object-cover" />
                                ) : (
                                  <TIcon size={10} style={{ color: t.color }} />
                                )}
                                <span className="font-medium">{t.name}</span>
                              </div>
                              {(t.uses !== null || t.points !== null || t.votes !== null) && (
                                <div className="text-[9px] text-muted-foreground pl-4">
                                  {t.uses !== null && <span>Uses: {t.uses} </span>}
                                  {t.points !== null && <span>Pts: {t.points} </span>}
                                  {t.votes !== null && <span>Votes: {t.votes === -1 ? 'Illimité' : t.votes}</span>}
                                </div>
                              )}
                              {t.description && <div className="text-[9px] text-muted-foreground pl-4 italic">{t.description}</div>}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Render Markers */}
        {markers.map(marker => {
          const TagIconComponent = icons[marker.tag.icon as keyof typeof icons] || Tag;
          return (
          <div
            key={marker.id}
            className="absolute canvas-entity group"
            style={{
              left: marker.x,
              top: marker.y,
              transform: 'translate(-50%, -50%)',
              cursor: 'grab',
              zIndex: displaySettings.foregroundElement === 'markers' ? 20 : 10
            }}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              closeContextMenu();
              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_marker', data: marker }));
            }}
            onContextMenu={(e) => handleContextMenu(e, 'marker', marker.id)}
            onDoubleClick={() => useVttStore.getState().setEditingEntity({ type: 'tagInstance', id: marker.tag.instanceId })}
          >
             <div
                className="w-10 h-10 rounded-lg shadow-md border-2 flex items-center justify-center bg-card transition-transform hover:scale-110 overflow-hidden"
                style={{ borderColor: marker.tag.color }}
              >
                {marker.tag.imageUrl ? (
                  <img src={marker.tag.imageUrl} alt={marker.tag.name} className="w-full h-full object-cover" draggable={false} />
                ) : (
                  <TagIconComponent size={20} style={{ color: marker.tag.color }} />
                )}
              </div>

               {/* Tooltip */}
               <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max max-w-[200px] bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-bold" style={{ color: marker.tag.color }}>{marker.tag.name}</p>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {marker.tag.uses !== null && <span>Uses: {marker.tag.uses} </span>}
                  {marker.tag.points !== null && <span>Pts: {marker.tag.points} </span>}
                  {marker.tag.votes !== null && <span>Votes: {marker.tag.votes === -1 ? 'Illimité' : marker.tag.votes}</span>}
                </div>
                {marker.tag.description && <p className="text-[10px] text-muted-foreground italic mt-1">{marker.tag.description}</p>}
              </div>
          </div>
        );
      })}

      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-[100] bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {contextMenu.type === 'player' && players.find(p => p.id === contextMenu.entityId) && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const p = players.find(p => p.id === contextMenu.entityId);
                  if (p) updatePlayer(p.id, { isDead: !p.isDead });
                  closeContextMenu();
                }}
              >
                <Skull size={14} className={players.find(p => p.id === contextMenu.entityId)?.isDead ? "text-muted-foreground" : "text-destructive"} />
                {players.find(p => p.id === contextMenu.entityId)?.isDead ? "Ressusciter" : "Tuer"}
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  useVttStore.getState().setEditingEntity({ type: 'player', id: contextMenu.entityId });
                  closeContextMenu();
                }}
              >
                Éditer
              </button>

              {/* Tags Submenu */}
              {players.find(p => p.id === contextMenu.entityId)!.tags.length > 0 && (
                <div className="relative group">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Tag size={14} /> Éditer les tags</span>
                    <ChevronRight size={14} />
                  </button>
                  <div className="absolute left-full top-0 ml-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[150px] hidden group-hover:block z-[101]">
                    {players.find(p => p.id === contextMenu.entityId)!.tags.map(tag => (
                      <div key={tag.instanceId} className="flex items-center justify-between px-2 py-1 hover:bg-accent hover:text-accent-foreground">
                        <span className="text-sm truncate flex-1 flex items-center gap-2" title={tag.name}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                          {tag.name}
                        </span>
                        <div className="flex items-center gap-1 opacity-60 hover:opacity-100">
                          <button
                            className="p-1 hover:text-primary"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              useVttStore.getState().setEditingEntity({ type: 'tagInstance', id: tag.instanceId, parentId: contextMenu.entityId });
                              closeContextMenu();
                            }}
                          >
                            <Settings size={14} />
                          </button>
                          <button
                            className="p-1 hover:text-destructive"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              const player = players.find(p => p.id === contextMenu.entityId);
                              if (player) {
                                updatePlayer(player.id, {
                                  tags: player.tags.filter(t => t.instanceId !== tag.instanceId)
                                });
                              }
                              // Keep menu open unless there are no more tags
                              if (player && player.tags.length <= 1) closeContextMenu();
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-border my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  deletePlayer(contextMenu.entityId);
                  closeContextMenu();
                }}
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            </>
          )}

          {contextMenu.type === 'marker' && markers.find(m => m.id === contextMenu.entityId) && (
            <>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const marker = markers.find(m => m.id === contextMenu.entityId);
                  if (marker) {
                    useVttStore.getState().setEditingEntity({ type: 'tagInstance', id: marker.tag.instanceId });
                  }
                  closeContextMenu();
                }}
              >
                <Settings size={14} /> Modifier
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const marker = markers.find(m => m.id === contextMenu.entityId);
                  if (marker) {
                    // Create a new instance id for the duplicated tag
                    const duplicatedTag = {
                      ...marker.tag,
                      instanceId: uuidv4()
                    };
                    addMarker({
                      x: marker.x + 20, // offset slightly
                      y: marker.y + 20,
                      tag: duplicatedTag
                    });
                  }
                  closeContextMenu();
                }}
              >
                <Copy size={14} /> Dupliquer
              </button>
              <div className="h-px bg-border my-1" />
              <button
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  deleteMarker(contextMenu.entityId);
                  closeContextMenu();
                }}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </>
          )}
        </div>
      )}

    </div>
    </div>
  );
};