import React from 'react';
import { useVttStore } from '../store';
import { X } from 'lucide-react';

export const EditingModal: React.FC = () => {
  const { editingEntity, setEditingEntity, players, roles, tags, updatePlayer, updateRole, updateTagModel } = useVttStore();

  if (!editingEntity) return null;

  const handleClose = () => setEditingEntity(null);

  let entityTitle = '';
  let entityContent = null;

  if (editingEntity.type === 'player') {
    const player = players.find(p => p.id === editingEntity.id);
    if (!player) return null;

    entityTitle = `Modifier Joueur: ${player.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={player.name}
            onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Couleur</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={player.color}
              onChange={(e) => updatePlayer(player.id, { color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
            />
            <span className="text-sm text-muted-foreground uppercase">{player.color}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Rôle</label>
          <select
            value={player.roleId || ''}
            onChange={(e) => updatePlayer(player.id, { roleId: e.target.value || null })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Aucun rôle</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="dead-player"
              checked={player.isDead}
              onChange={(e) => updatePlayer(player.id, { isDead: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
            />
            <label htmlFor="dead-player" className="text-sm font-medium text-destructive whitespace-nowrap cursor-pointer">
              Joueur Mort
            </label>
          </div>
      </div>
    );
  } else if (editingEntity.type === 'role') {
    const role = roles.find(r => r.id === editingEntity.id);
    if (!role) return null;

    entityTitle = `Modifier Rôle: ${role.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={role.name}
            onChange={(e) => updateRole(role.id, { name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Vies</label>
            <input
              type="number"
              value={role.lives}
              onChange={(e) => updateRole(role.id, { lives: parseInt(e.target.value) || 0 })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Couleur</label>
            <input
              type="color"
              value={role.color}
              onChange={(e) => updateRole(role.id, { color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="unique-role-edit"
              checked={role.isUnique}
              onChange={(e) => updateRole(role.id, { isUnique: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
            />
            <label htmlFor="unique-role-edit" className="text-sm font-medium cursor-pointer">
              Rôle Unique (un seul joueur peut l'avoir)
            </label>
          </div>
      </div>
    );
  } else if (editingEntity.type === 'tagModel') {
    const tag = tags.find(t => t.id === editingEntity.id);
    if (!tag) return null;

    entityTitle = `Modifier Tag: ${tag.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={tag.name}
            onChange={(e) => updateTagModel(tag.id, { name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Points</label>
            <input
              type="number"
              value={tag.points}
              onChange={(e) => updateTagModel(tag.id, { points: parseInt(e.target.value) || 0 })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Utilisations (Uses)</label>
            <input
              type="number"
              value={tag.uses}
              onChange={(e) => updateTagModel(tag.id, { uses: parseInt(e.target.value) || 0 })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Jour</label>
            <input
              type="number"
              value={tag.callOrderDay || ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderDay: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Ex: 1"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight || ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderNight: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Ex: 5"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-medium">Couleur</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={tag.color}
              onChange={(e) => updateTagModel(tag.id, { color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold text-lg">{entityTitle}</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {entityContent}
        </div>
        <div className="p-4 border-t border-border flex justify-end bg-muted/30">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium"
          >
            Terminé
          </button>
        </div>
      </div>
    </div>
  );
};
