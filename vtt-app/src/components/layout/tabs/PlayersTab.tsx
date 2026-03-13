import { Plus, Trash2, Edit2 } from 'lucide-react';
import React, { useState } from 'react';
import { useVttStore } from '../../../store';

export const PlayersTab: React.FC = () => {
  const { playerTemplates, setEditingEntity, addPlayerTemplate, deletePlayerTemplate, addPlayer } = useVttStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerColor, setNewPlayerColor] = useState('#ef4444');

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;

    // Create the template to display in the left panel
    addPlayerTemplate({
      name: newPlayerName,
      color: newPlayerColor,
      roleId: null,
      teamId: null,
      size: 40, // Default size
    });

    // Immediately spawn an instance in the middle of the canvas
    addPlayer({
      name: newPlayerName,
      color: newPlayerColor,
      size: 40,
      x: 0,
      y: 0,
      roleId: null,
      teamId: null,
      isDead: false,
      tags: [],
    });
    setNewPlayerName('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Player Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Créer un Joueur (Modèle)</h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Nom du joueur"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newPlayerColor}
              onChange={(e) => setNewPlayerColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <button
              onClick={handleAddPlayer}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
        </div>
      </section>

      {/* List Players Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Joueurs</h3>
        <div className="flex flex-col gap-2">
          {playerTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun joueur créé.</p>
          ) : (
            playerTemplates.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-accent/50 group"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'new_player', data: player }));
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border border-border"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="text-sm font-medium">{player.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingEntity({ type: 'playerTemplate', id: player.id })}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                    title="Modifier"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => deletePlayerTemplate(player.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Teams Section Placeholder */}
      <section className="flex flex-col gap-3 opacity-50">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Équipes</h3>
        <p className="text-xs text-muted-foreground">La gestion des équipes sera accessible via la modale d'édition universelle.</p>
      </section>
    </div>
  );
};