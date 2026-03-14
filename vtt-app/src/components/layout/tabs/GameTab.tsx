import { Moon, Sun, FastForward, RotateCcw } from 'lucide-react';
import React, { useMemo } from 'react';
import { useVttStore } from '../../../store';
import type { Player, Marker, TagInstance } from '../../../types';

export const GameTab: React.FC = () => {
  const { isNight, cycleNumber, nextCycle, resetCycle, players, markers, updatePlayer, updateMarker } = useVttStore();

  const handleModifyTagUses = (player: Player, tag: TagInstance, amount: number) => {
    const newUses = Math.max(0, (tag.uses ?? 0) + amount);
    let updatedTags = player.tags.map(t =>
      t.instanceId === tag.instanceId ? { ...t, uses: newUses } : t
    );

    // Handle Auto-delete
    if (newUses === 0 && tag.autoDeleteOnZeroUses) {
      updatedTags = updatedTags.filter(t => t.instanceId !== tag.instanceId);
    }

    updatePlayer(player.id, { tags: updatedTags });
  };

  const handleModifyMarkerTagUses = (marker: Marker, amount: number) => {
    const newUses = Math.max(0, (marker.tag.uses ?? 0) + amount);

    // Handle Auto-delete
    if (newUses === 0 && marker.tag.autoDeleteOnZeroUses) {
      useVttStore.getState().deleteMarker(marker.id);
      return;
    }

    updateMarker(marker.id, {
      tag: { ...marker.tag, uses: newUses }
    });
  };

  // Generate Call Order List dynamically
  const { calledEntities, otherEntities } = useMemo(() => {
    const called: Array<{ type: 'player' | 'marker', entity: any, order: number, reason: string }> = [];
    const others: Array<{ type: 'player' | 'marker', entity: any }> = [];

    // Check Players
    players.forEach(player => {
      let isCalled = false;
      let minOrder = Infinity;
      let reason = '';

      // Check player's local tags
      player.tags.forEach(tag => {
        const order = isNight ? tag.callOrderNight : tag.callOrderDay;
        if (order !== null && order !== undefined) {
          isCalled = true;
          if (order < minOrder) {
            minOrder = order;
            reason = `Tag: ${tag.name}`;
          }
        }
      });

      // Check role's tags
      const role = useVttStore.getState().roles.find(r => r.id === player.roleId);
      if (role && role.tags) {
        role.tags.forEach(tag => {
          const order = isNight ? tag.callOrderNight : tag.callOrderDay;
          if (order !== null && order !== undefined) {
            isCalled = true;
            if (order < minOrder) {
              minOrder = order;
              reason = `Tag Rôle: ${tag.name}`;
            }
          }
        });
      }

      if (isCalled) {
        called.push({ type: 'player', entity: player, order: minOrder, reason });
      } else {
        others.push({ type: 'player', entity: player });
      }
    });

    // Check Markers
    markers.forEach(marker => {
      const order = isNight ? marker.tag.callOrderNight : marker.tag.callOrderDay;
      if (order !== null && order !== undefined) {
        called.push({ type: 'marker', entity: marker, order, reason: `Marker: ${marker.tag.name}` });
      } else {
        others.push({ type: 'marker', entity: marker });
      }
    });

    // Sort called entities
    called.sort((a, b) => a.order - b.order);

    return { calledEntities: called, otherEntities: others };
  }, [players, markers, isNight]);


  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Phase Actuelle</h3>
        <div className="p-4 border border-border rounded-lg bg-card text-center flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 mx-auto">
              {isNight ? <Moon className="text-blue-400" size={24} /> : <Sun className="text-yellow-400" size={24} />}
              <span className="text-2xl font-bold">
                {isNight ? 'Nuit' : 'Jour'} {cycleNumber}
              </span>
            </div>
            <button
              onClick={resetCycle}
              className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
              title="Réinitialiser au Jour 1"
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <button
            onClick={nextCycle}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors w-full justify-center"
          >
            <FastForward size={16} /> Passer à la phase suivante
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Ordre d'Appel ({isNight ? 'Nuit' : 'Jour'})</h3>

        {calledEntities.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-2">Personne n'est appelé pour cette phase.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {calledEntities.map((item, index) => (
              <div key={`called-${index}`} className="flex flex-col gap-2 p-3 rounded-md border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {item.order}
                    </span>
                    <span className="font-medium text-sm">
                      {item.type === 'player' ? item.entity.name : `Marqueur: ${item.entity.tag.name}`}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                    {item.reason}
                  </span>
                </div>

                {/* Quick actions for players */}
                {item.type === 'player' && item.entity.tags.map((tag: TagInstance) => (
                  <div key={tag.instanceId} className="flex items-center justify-between pl-7 pr-2">
                    <span className="text-xs text-muted-foreground truncate w-24" title={tag.name}>- {tag.name}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleModifyTagUses(item.entity, tag, -1)} className="w-5 h-5 flex items-center justify-center bg-accent rounded text-xs hover:bg-accent/80">-</button>
                      <span className="text-xs w-4 text-center">{tag.uses}</span>
                      <button onClick={() => handleModifyTagUses(item.entity, tag, 1)} className="w-5 h-5 flex items-center justify-center bg-accent rounded text-xs hover:bg-accent/80">+</button>
                    </div>
                  </div>
                ))}

                {/* Quick actions for markers */}
                {item.type === 'marker' && (
                  <div className="flex items-center justify-between pl-7 pr-2">
                    <span className="text-xs text-muted-foreground">Utilisations</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleModifyMarkerTagUses(item.entity, -1)} className="w-5 h-5 flex items-center justify-center bg-accent rounded text-xs hover:bg-accent/80">-</button>
                      <span className="text-xs w-4 text-center">{item.entity.tag.uses}</span>
                      <button onClick={() => handleModifyMarkerTagUses(item.entity, 1)} className="w-5 h-5 flex items-center justify-center bg-accent rounded text-xs hover:bg-accent/80">+</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Autres entités</h3>
        <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
          {otherEntities.length === 0 ? (
             <p className="text-xs text-muted-foreground text-center">Aucune autre entité.</p>
          ) : (
            otherEntities.map((item, index) => (
              <div key={`other-${index}`} className="flex items-center justify-between p-1.5 rounded bg-muted/30 text-xs">
                 <span className="truncate flex-1">
                    {item.type === 'player' ? item.entity.name : `Marqueur: ${item.entity.tag.name}`}
                 </span>
                 <span className="text-[10px] text-muted-foreground w-12 text-right">
                   {item.type === 'player' && item.entity.isDead ? '(Mort)' : ''}
                 </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};