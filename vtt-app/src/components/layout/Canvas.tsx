import React, { useRef, useState, useEffect } from 'react';
import { useVttStore } from '../../store';
import { ZoomIn, ZoomOut, Maximize, Tag, Skull, Trash2, Settings, ChevronRight, Sun, Moon, Copy, Heart, icons, Users } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Marker } from '../../types';

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    roomName, setRoomName,
    canvas, setPan, setZoom, isNight, nextCycle,
    players, updatePlayer, addPlayer, deletePlayer,
    markers, updateMarker, addMarker, deleteMarker,
    roles, teams, grid, room, displaySettings,
    isDrawingMode, drawingSettings, walls, addWall,
    selectedEntityIds, setSelectedEntityIds, clearSelection
  } = useVttStore();
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [drawingStart, setDrawingStart] = useState<{ x: number, y: number } | null>(null);
  const [drawingCurrent, setDrawingCurrent] = useState<{ x: number, y: number } | null>(null);
  const [selectionBoxStart, setSelectionBoxStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionBoxCurrent, setSelectionBoxCurrent] = useState<{ x: number, y: number } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    setContainerSize({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight });
    return () => observer.disconnect();
  }, []);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'player' | 'marker' | 'canvas' | 'group', entityId: string | null } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, type: 'player' | 'marker' | 'canvas' | 'group', entityId: string | null = null) => {
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

    const coords = getCanvasCoordinates(e);
    let canvasX = coords.x;
    let canvasY = coords.y;

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
      } else if (payload.type === 'group_move') {
        const anchorId = payload.anchorId;
        const anchorPlayer = players.find(p => p.id === anchorId);
        const anchorMarker = markers.find(m => m.id === anchorId);

        const anchorEntity = anchorPlayer || anchorMarker;
        if (!anchorEntity) return;

        // Calculate delta
        const dx = canvasX - anchorEntity.x;
        const dy = canvasY - anchorEntity.y;

        // Apply delta to all selected entities
        selectedEntityIds.forEach(id => {
          const player = players.find(p => p.id === id);
          if (player) {
            updatePlayer(player.id, { x: player.x + dx, y: player.y + dy });
          } else {
            const marker = markers.find(m => m.id === id);
            if (marker) {
              updateMarker(marker.id, { x: marker.x + dx, y: marker.y + dy });
            }
          }
        });
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

  const getCanvasCoordinates = (e: React.MouseEvent | React.DragEvent) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.panX - rect.width / 2) / canvas.zoom;
    const y = (e.clientY - rect.top - canvas.panY - rect.height / 2) / canvas.zoom;
    return { x, y };
  };

  const getSnappedCoordinates = (coords: { x: number, y: number }) => {
    if (!grid.enabled) return coords;
    return {
      x: snapToGrid(coords.x, grid.sizeX),
      y: snapToGrid(coords.y, grid.sizeY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    closeContextMenu();
    // Only start panning if clicking directly on the canvas background, not on entities
    if ((e.target as HTMLElement).closest('.canvas-entity')) {
      return;
    }

    if (!e.shiftKey) {
      clearSelection();
    }

    if (isDrawingMode && e.button === 0) {
      e.preventDefault();
      let coords = getCanvasCoordinates(e);
      if (grid.enabled) coords = getSnappedCoordinates(coords);
      setDrawingStart(coords);
      setDrawingCurrent(coords);
      return;
    }

    if (e.button === 1 || (e.button === 0 && e.altKey) || (!isDrawingMode && e.button === 0)) {
      e.preventDefault();

      if (!e.altKey && e.button === 0) {
        // Start selection rectangle instead of pan
        setIsSelecting(true);
        const coords = getCanvasCoordinates(e);
        setSelectionBoxStart(coords);
        setSelectionBoxCurrent(coords);
      } else {
        setIsPanning(true);
        setStartPan({ x: e.clientX, y: e.clientY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawingMode && drawingStart) {
      let coords = getCanvasCoordinates(e);
      if (grid.enabled) coords = getSnappedCoordinates(coords);
      setDrawingCurrent(coords);
      return;
    }

    if (isSelecting && selectionBoxStart) {
      setSelectionBoxCurrent(getCanvasCoordinates(e));
      return;
    }

    if (isPanning) {
      const dx = e.clientX - startPan.x;
      const dy = e.clientY - startPan.y;
      setPan(canvas.panX + dx, canvas.panY + dy);
      setStartPan({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDrawingMode && drawingStart && drawingCurrent) {
      const startCoord = drawingStart;
      let endCoord = getCanvasCoordinates(e);
      if (grid.enabled) endCoord = getSnappedCoordinates(endCoord);

      // Only add wall if it has some length
      if (Math.hypot(endCoord.x - startCoord.x, endCoord.y - startCoord.y) > 5) {
        addWall({
          type: drawingSettings.tool,
          startX: startCoord.x,
          startY: startCoord.y,
          endX: endCoord.x,
          endY: endCoord.y,
          color: drawingSettings.color,
          thickness: drawingSettings.thickness,
          fillColor: drawingSettings.fillTransparent ? 'transparent' : drawingSettings.fillColor,
        });
      }
      setDrawingStart(null);
      setDrawingCurrent(null);
    }

    if (isSelecting && selectionBoxStart && selectionBoxCurrent) {
      // Calculate selected entities
      const minX = Math.min(selectionBoxStart.x, selectionBoxCurrent.x);
      const maxX = Math.max(selectionBoxStart.x, selectionBoxCurrent.x);
      const minY = Math.min(selectionBoxStart.y, selectionBoxCurrent.y);
      const maxY = Math.max(selectionBoxStart.y, selectionBoxCurrent.y);

      const newlySelectedIds: string[] = [];

      players.forEach(p => {
        // simple box check for center of player
        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
          newlySelectedIds.push(p.id);
        }
      });

      markers.forEach(m => {
        if (m.x >= minX && m.x <= maxX && m.y >= minY && m.y <= maxY) {
          newlySelectedIds.push(m.id);
        }
      });

      if (e.shiftKey) {
        setSelectedEntityIds([...new Set([...selectedEntityIds, ...newlySelectedIds])]);
      } else {
        setSelectedEntityIds(newlySelectedIds);
      }

      setIsSelecting(false);
      setSelectionBoxStart(null);
      setSelectionBoxCurrent(null);
    }

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

  // Auto-kill logic based on derived lives
  useEffect(() => {
    let hasChanges = false;
    const updates = players.map(player => {
      if (player.isDead) return null; // Already dead, ignore

      const role = roles.find(r => r.id === player.roleId);
      const baseLives = role?.lives || 0;
      const tagLives = player.tags.reduce((sum, t) => sum + (t.lives || 0), 0);
      const roleTagLives = role?.tags?.reduce((sum, t) => sum + (t.lives || 0), 0) || 0;
      const totalLives = baseLives + tagLives + roleTagLives;

      if (totalLives <= 0) {
        hasChanges = true;
        return player.id;
      }
      return null;
    }).filter(id => id !== null) as string[];

    if (hasChanges) {
      updates.forEach(id => {
        updatePlayer(id, { isDead: true });
      });
    }
  }, [players, roles, updatePlayer]);

  return (
    <div className="flex-1 relative flex flex-col min-w-0">
      {/* Banner */}
      <div className="h-12 bg-card border-b border-border flex items-center shrink-0 z-40 relative shadow-sm px-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2"
            placeholder="Nom de la salle"
            title="Nom de la salle"
          />
          <button
            onClick={() => {
              const state = useVttStore.getState();
              // Create a serializable state by extracting the relevant data
              const stateToSave = {
                roomName: state.roomName,
                playerTemplates: state.playerTemplates,
                players: state.players,
                roles: state.roles,
                tags: state.tags,
                markers: state.markers,
                markerParameters: state.markerParameters,
                teams: state.teams,
                isNight: state.isNight,
                cycleNumber: state.cycleNumber,
                walls: state.walls,
                activeLeftTab: state.activeLeftTab,
                canvas: state.canvas,
                grid: state.grid,
                room: state.room,
                displaySettings: state.displaySettings,
              };
              const stateStr = JSON.stringify(stateToSave, null, 2);
              const blob = new Blob([stateStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              const safeRoomName = roomName ? roomName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'vtt_state';
              a.download = `${safeRoomName}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
            title="Exporter l'état (JSON)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          </button>
        </div>
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
      onContextMenu={(e) => {
        // Intercept context menu on the canvas background
        if (!(e.target as HTMLElement).closest('.canvas-entity')) {
          handleContextMenu(e, 'canvas');
        }
      }}
      tabIndex={0}
      style={{ cursor: isDrawingMode ? 'crosshair' : (isPanning ? 'grabbing' : 'grab') }}
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
            backgroundPosition: `${(canvas.panX + containerSize.width / 2) % (grid.sizeX * canvas.zoom)}px ${(canvas.panY + containerSize.height / 2) % (grid.sizeY * canvas.zoom)}px`
          }}
        />
      )}

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

        {/* Drawn Walls & Shapes (Layered below entities) */}
        <svg
          className="absolute pointer-events-none"
          style={{
            zIndex: 1,
            overflow: 'visible',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
          }}
        >
          {walls.map(wall => {
            if (wall.type === 'rectangle') {
              const minX = Math.min(wall.startX, wall.endX);
              const minY = Math.min(wall.startY, wall.endY);
              const width = Math.abs(wall.endX - wall.startX);
              const height = Math.abs(wall.endY - wall.startY);
              return (
                <rect
                  key={wall.id}
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  stroke={wall.color}
                  strokeWidth={wall.thickness || 5}
                  fill={wall.fillColor === 'transparent' ? 'none' : (wall.fillColor || 'transparent')}
                  opacity={0.8}
                />
              );
            } else {
              return (
                <line
                  key={wall.id}
                  x1={wall.startX}
                  y1={wall.startY}
                  x2={wall.endX}
                  y2={wall.endY}
                  stroke={wall.color || "hsl(var(--foreground))"}
                  strokeWidth={wall.thickness || 5}
                  strokeLinecap="round"
                />
              );
            }
          })}
          {isDrawingMode && drawingStart && drawingCurrent && (
            drawingSettings.tool === 'rectangle' ? (
              <rect
                x={Math.min(drawingStart.x, drawingCurrent.x)}
                y={Math.min(drawingStart.y, drawingCurrent.y)}
                width={Math.abs(drawingCurrent.x - drawingStart.x)}
                height={Math.abs(drawingCurrent.y - drawingStart.y)}
                stroke={drawingSettings.color}
                strokeWidth={drawingSettings.thickness}
                fill={drawingSettings.fillTransparent ? 'none' : drawingSettings.fillColor}
                opacity={0.5}
                strokeDasharray="5,5"
              />
            ) : (
              <line
                x1={drawingStart.x}
                y1={drawingStart.y}
                x2={drawingCurrent.x}
                y2={drawingCurrent.y}
                stroke={drawingSettings.color}
                strokeWidth={drawingSettings.thickness}
                strokeLinecap="round"
                opacity={0.5}
                strokeDasharray="5,5"
              />
            )
          )}

          {isSelecting && selectionBoxStart && selectionBoxCurrent && (
            <rect
              x={Math.min(selectionBoxStart.x, selectionBoxCurrent.x)}
              y={Math.min(selectionBoxStart.y, selectionBoxCurrent.y)}
              width={Math.abs(selectionBoxCurrent.x - selectionBoxStart.x)}
              height={Math.abs(selectionBoxCurrent.y - selectionBoxStart.y)}
              fill="rgba(59, 130, 246, 0.2)"
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth={2}
              pointerEvents="none"
            />
          )}
        </svg>

        {/* Render Players */}
        {displaySettings.showPlayers && players.map(player => {
          const role = roles.find(r => r.id === player.roleId);

          // Determine effective team (role's seenInTeamId -> role's actual teamId -> player's teamId)
          const effectiveTeamId = role?.seenInTeamId || role?.teamId || player.teamId;
          const team = teams.find(t => t.id === effectiveTeamId);

          // Determine effective role for tooltip
          const effectiveRoleId = role?.seenAsRoleId || role?.id;
          const effectiveRole = roles.find(r => r.id === effectiveRoleId);

          // Calculate Total Lives
          const baseLives = role?.lives || 0;
          const tagLives = player.tags.reduce((sum, t) => sum + (t.lives || 0), 0);
          const roleTagLives = role?.tags?.reduce((sum, t) => sum + (t.lives || 0), 0) || 0;
          const totalLives = baseLives + tagLives + roleTagLives;

          // Compute other stats for custom badges
          const getAggregatedValue = (field: 'votes' | 'points' | 'uses') => {
            const val1 = player.tags.reduce((sum, t) => sum + (t[field] || 0), 0);
            const val2 = role?.tags?.reduce((sum, t) => sum + (t[field] || 0), 0) || 0;
            return val1 + val2;
          };

          // For call orders, pick the minimum
          const getMinOrder = (field: 'callOrderDay' | 'callOrderNight') => {
            const vals = [
              ...player.tags.map(t => t[field]).filter(v => v !== null),
              ...(role?.tags || []).map(t => t[field]).filter(v => v !== null)
            ] as number[];
            if (vals.length === 0) return null;
            return Math.min(...vals);
          };

          const customBadgeValues: Record<string, string | number | null> = {
            votes: getAggregatedValue('votes'),
            points: getAggregatedValue('points'),
            uses: getAggregatedValue('uses'),
            callOrderDay: getMinOrder('callOrderDay'),
            callOrderNight: getMinOrder('callOrderNight'),
          };

          const renderBadge = (position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight') => {
            const config = displaySettings.playerBadges?.[position];
            if (!config || config.type === 'none') return null;

            const baseClasses = "absolute min-w-[24px] h-6 px-1 rounded-full flex items-center justify-center border-2 border-background shadow-sm text-[11px] font-bold z-20";
            let posClass = "";
            switch (position) {
              case 'topLeft': posClass = "-top-1 -left-1"; break;
              case 'topRight': posClass = "-top-1 -right-1"; break;
              case 'bottomLeft': posClass = "-bottom-1 -left-1"; break;
              case 'bottomRight': posClass = "-bottom-1 -right-1"; break;
            }

            if (config.type === 'team') {
              if (!team) return null;
              return (
                <div
                  key={position}
                  className={`${baseClasses} ${posClass} !w-6 !min-w-[24px]`}
                  style={{ backgroundColor: team.color }}
                  title={`Équipe: ${team.name}`}
                >
                  {team.icon && icons[team.icon as keyof typeof icons] ? (
                    React.createElement(icons[team.icon as keyof typeof icons], { size: 12, className: "text-white drop-shadow" })
                  ) : null}
                </div>
              );
            }

            if (config.type === 'lives') {
              // Note: 'topRight' gets the heart specifically, but we apply heart to any 'lives' type as per the request implied context
              // The user specifically asked "Pour la pastille en haut à droite, peux tu lui mettre une forme de cœur".
              // We'll apply the heart shape styling if type === 'lives'.
              return (
                <div
                  key={position}
                  className={`absolute ${posClass} z-20 w-7 h-7 flex items-center justify-center`}
                  title={`Vies: ${totalLives}`}
                >
                  <Heart
                    className="absolute w-full h-full drop-shadow-sm"
                    fill={player.isDead ? '#3f3f46' : config.bgColor} // zinc-700
                    color={player.isDead ? '#27272a' : config.bgColor} // zinc-800 outline
                  />
                  <span
                    className="relative z-10 text-[11px] font-bold"
                    style={{ color: player.isDead ? '#a1a1aa' : config.textColor }} // zinc-400
                  >
                    {totalLives}
                  </span>
                </div>
              );
            }

            // Other generic values (votes, points, uses, call orders)
            const val = customBadgeValues[config.type];
            if (val === null || val === undefined) return null;

            return (
              <div
                key={position}
                className={`${baseClasses} ${posClass}`}
                style={{ backgroundColor: config.bgColor, color: config.textColor }}
                title={`${config.type}: ${val}`}
              >
                {val}
              </div>
            );
          };

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
              className={`absolute canvas-entity group ${selectedEntityIds.includes(player.id) ? 'ring-4 ring-blue-500 rounded-full' : ''}`}
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

                // If dragging a selected player, we will handle group drag logic inside handleDrop or onDrag
                // For now, if dragging a selected one, pass special group drag payload
                if (selectedEntityIds.includes(player.id) && selectedEntityIds.length > 1) {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'group_move', anchorId: player.id }));
                } else {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_player', data: player }));
                }
              }}
              onContextMenu={(e) => {
                if (selectedEntityIds.includes(player.id) && selectedEntityIds.length > 1) {
                   handleContextMenu(e, 'group');
                } else {
                   handleContextMenu(e, 'player', player.id);
                }
              }}
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

                {/* Custom Badges */}
                {renderBadge('topLeft')}
                {renderBadge('topRight')}
                {renderBadge('bottomLeft')}
                {renderBadge('bottomRight')}
              </div>

              {/* Tooltip */}
              {displaySettings.showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <p className="font-bold">{player.name}</p>
                  {displaySettings.showRole && effectiveRole && <p>Rôle: <span style={{ color: effectiveRole.color }}>{effectiveRole.name}</span></p>}
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
            className={`absolute canvas-entity group ${selectedEntityIds.includes(marker.id) ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}
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

              if (selectedEntityIds.includes(marker.id) && selectedEntityIds.length > 1) {
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'group_move', anchorId: marker.id }));
              } else {
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_marker', data: marker }));
              }
            }}
            onContextMenu={(e) => {
              if (selectedEntityIds.includes(marker.id) && selectedEntityIds.length > 1) {
                 handleContextMenu(e, 'group');
              } else {
                 handleContextMenu(e, 'marker', marker.id);
              }
            }}
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
                  useVttStore.getState().setEditingEntity({ type: 'player', id: contextMenu.entityId! });
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
                              useVttStore.getState().setEditingEntity({ type: 'tagInstance', id: tag.instanceId, parentId: contextMenu.entityId || undefined });
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
                  if (contextMenu.entityId) deletePlayer(contextMenu.entityId);
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
                  if (contextMenu.entityId) deleteMarker(contextMenu.entityId);
                  closeContextMenu();
                }}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </>
          )}

          {contextMenu.type === 'canvas' && (
            <>
              <div className="relative group">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Users size={14} /> Ajouter un Joueur</span>
                  <ChevronRight size={14} />
                </button>
                <div className="absolute left-full top-0 ml-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[150px] hidden group-hover:block z-[101] max-h-64 overflow-y-auto custom-scrollbar">
                  {useVttStore.getState().playerTemplates.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground italic">Aucun modèle de joueur</div>
                  ) : (
                    useVttStore.getState().playerTemplates.map(pt => (
                      <button
                        key={pt.id}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const coords = getCanvasCoordinates(e as unknown as React.MouseEvent);
                          let canvasX = coords.x;
                          let canvasY = coords.y;
                          if (grid.enabled) {
                            canvasX = snapToGrid(canvasX, grid.sizeX);
                            canvasY = snapToGrid(canvasY, grid.sizeY);
                          }
                          addPlayer({
                            ...pt,
                            size: pt.size || 40,
                            imageUrl: pt.imageUrl,
                            isDead: false,
                            tags: [],
                            x: canvasX,
                            y: canvasY
                          });
                          closeContextMenu();
                        }}
                      >
                        <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: pt.color }} />
                        {pt.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="relative group">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Tag size={14} /> Ajouter un Tag</span>
                  <ChevronRight size={14} />
                </button>
                <div className="absolute left-full top-0 ml-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[150px] hidden group-hover:block z-[101] max-h-64 overflow-y-auto custom-scrollbar">
                  {useVttStore.getState().tags.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground italic">Aucun modèle de tag</div>
                  ) : (
                    useVttStore.getState().tags.map(tagModel => {
                      const IconComponent = icons[tagModel.icon as keyof typeof icons] || Tag;
                      return (
                        <button
                          key={tagModel.id}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            const coords = getCanvasCoordinates(e as unknown as React.MouseEvent);
                            let canvasX = coords.x;
                            let canvasY = coords.y;
                            if (grid.enabled) {
                              canvasX = snapToGrid(canvasX, grid.sizeX);
                              canvasY = snapToGrid(canvasY, grid.sizeY);
                            }
                            addMarker({
                              x: canvasX,
                              y: canvasY,
                              tag: { ...tagModel, instanceId: uuidv4() }
                            });
                            closeContextMenu();
                          }}
                        >
                          <div className="flex items-center justify-center w-4 h-4 rounded-sm border border-border overflow-hidden" style={{ backgroundColor: `${tagModel.color}20`, borderColor: tagModel.color }}>
                            {tagModel.imageUrl ? (
                              <img src={tagModel.imageUrl} alt={tagModel.name} className="w-full h-full object-cover" />
                            ) : (
                              <IconComponent size={10} style={{ color: tagModel.color }} />
                            )}
                          </div>
                          {tagModel.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {contextMenu.type === 'group' && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
                {selectedEntityIds.length} éléments sélectionnés
              </div>

              {/* Equipe Submenu for group */}
              <div className="relative group">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">Équipe</span>
                  <ChevronRight size={14} />
                </button>
                <div className="absolute left-full top-0 ml-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[150px] hidden group-hover:block z-[101]">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground italic"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      selectedEntityIds.forEach(id => {
                        const player = players.find(p => p.id === id);
                        if (player) updatePlayer(player.id, { teamId: null });
                      });
                      closeContextMenu();
                    }}
                  >
                    Aucune
                  </button>
                  {teams.map(team => (
                    <button
                      key={team.id}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        selectedEntityIds.forEach(id => {
                          const player = players.find(p => p.id === id);
                          if (player) updatePlayer(player.id, { teamId: team.id });
                        });
                        closeContextMenu();
                      }}
                    >
                      <div className="w-3 h-3 rounded-full border border-border" style={{ backgroundColor: team.color }} />
                      {team.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Submenu for group */}
              <div className="relative group">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2"><Tag size={14} /> Ajouter Tag</span>
                  <ChevronRight size={14} />
                </button>
                <div className="absolute left-full top-0 ml-1 bg-popover text-popover-foreground border border-border rounded-md shadow-xl py-1 min-w-[150px] hidden group-hover:block z-[101] max-h-64 overflow-y-auto custom-scrollbar">
                  {useVttStore.getState().tags.length === 0 ? (
                    <div className="px-4 py-2 text-xs text-muted-foreground italic">Aucun modèle de tag</div>
                  ) : (
                    useVttStore.getState().tags.map(tagModel => {
                      const IconComponent = icons[tagModel.icon as keyof typeof icons] || Tag;
                      return (
                        <button
                          key={tagModel.id}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            selectedEntityIds.forEach(id => {
                              const player = players.find(p => p.id === id);
                              if (player) {
                                updatePlayer(player.id, {
                                  tags: [...player.tags, { ...tagModel, instanceId: uuidv4() }]
                                });
                              }
                            });
                            closeContextMenu();
                          }}
                        >
                          <div className="flex items-center justify-center w-4 h-4 rounded-sm border border-border overflow-hidden" style={{ backgroundColor: `${tagModel.color}20`, borderColor: tagModel.color }}>
                            {tagModel.imageUrl ? (
                              <img src={tagModel.imageUrl} alt={tagModel.name} className="w-full h-full object-cover" />
                            ) : (
                              <IconComponent size={10} style={{ color: tagModel.color }} />
                            )}
                          </div>
                          {tagModel.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="h-px bg-border my-1" />

              <button
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  selectedEntityIds.forEach(id => {
                    const player = players.find(p => p.id === id);
                    if (player) deletePlayer(id);
                    else {
                      const marker = markers.find(m => m.id === id);
                      if (marker) deleteMarker(id);
                    }
                  });
                  clearSelection();
                  closeContextMenu();
                }}
              >
                <Trash2 size={14} /> Supprimer la sélection
              </button>

            </>
          )}

        </div>
      )}

    </div>
    </div>
  );
};