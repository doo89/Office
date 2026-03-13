import React, { useRef, useState, useEffect } from 'react';
import { useVttStore } from '../../store';
import { ZoomIn, ZoomOut, Maximize, Tag } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Marker } from '../../types';

export const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    canvas, setPan, setZoom, isNight,
    players, updatePlayer, addPlayer,
    markers, updateMarker, addMarker, deleteMarker,
    roles, grid
  } = useVttStore();
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

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
        const newPlayer = { ...payload.data, x: canvasX, y: canvasY, id: undefined };
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
        {/* Origin indicator (0,0) */}
        <div className="absolute w-4 h-4 rounded-full bg-red-500/50 -ml-2 -mt-2" />

        {/* Render Players */}
        {players.map(player => {
          const role = roles.find(r => r.id === player.roleId);
          return (
            <div
              key={player.id}
              className="absolute canvas-entity group"
              style={{
                left: player.x,
                top: player.y,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab'
              }}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_player', data: player }));
              }}
            >
              <div
                className={`rounded-full border-4 shadow-lg flex items-center justify-center transition-all ${player.isDead ? 'opacity-40 grayscale' : ''}`}
                style={{
                  width: player.size * 2,
                  height: player.size * 2,
                  backgroundColor: player.color,
                  borderColor: role?.color || '#ffffff',
                }}
              >
                <span className="font-bold text-white text-sm mix-blend-difference drop-shadow-md px-1 text-center leading-tight">
                  {player.name}
                </span>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-bold">{player.name}</p>
                {role && <p>Rôle: <span style={{ color: role.color }}>{role.name}</span></p>}
                {player.isDead && <p className="text-destructive font-bold">Mort</p>}
                {player.tags.length > 0 && (
                  <div className="mt-1 border-t border-border pt-1">
                    <p className="font-semibold text-[10px] text-muted-foreground">Tags:</p>
                    <ul className="flex flex-wrap gap-1 mt-1">
                      {player.tags.map(t => (
                        <li key={t.instanceId} className="flex items-center gap-1 bg-muted px-1 rounded text-[10px]">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.name} ({t.uses})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Render Markers */}
        {markers.map(marker => (
          <div
            key={marker.id}
            className="absolute canvas-entity group"
            style={{
              left: marker.x,
              top: marker.y,
              transform: 'translate(-50%, -50%)',
              cursor: 'grab'
            }}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'existing_marker', data: marker }));
            }}
          >
             <div
                className="w-10 h-10 rounded-lg shadow-md border-2 flex items-center justify-center bg-card transition-transform hover:scale-110"
                style={{ borderColor: marker.tag.color }}
              >
                <Tag size={20} style={{ color: marker.tag.color }} />
              </div>

               {/* Tooltip */}
               <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-max bg-popover text-popover-foreground text-xs p-2 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <p className="font-bold" style={{ color: marker.tag.color }}>{marker.tag.name}</p>
                <p>Pts: {marker.tag.points} | Uses: {marker.tag.uses}</p>
              </div>
          </div>
        ))}

      </div>
    </div>
  );
};