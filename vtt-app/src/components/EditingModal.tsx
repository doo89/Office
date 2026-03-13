import React from 'react';
import { useVttStore } from '../store';
import { X, Trash2 } from 'lucide-react';

export const EditingModal: React.FC = () => {
  const { editingEntity, setEditingEntity, players, playerTemplates, roles, tags, updatePlayer, updatePlayerTemplate, updateRole, updateTagModel } = useVttStore();

  if (!editingEntity) return null;

  const handleClose = () => setEditingEntity(null);

  let entityTitle = '';
  let entityContent = null;

  if (editingEntity.type === 'playerTemplate') {
    const template = playerTemplates.find(p => p.id === editingEntity.id);
    if (!template) return null;

    entityTitle = `Modifier Modèle de Joueur: ${template.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={template.name}
            onChange={(e) => updatePlayerTemplate(template.id, { name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Couleur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={template.color}
                onChange={(e) => updatePlayerTemplate(template.id, { color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Taille (Rayon px)</label>
            <input
              type="number"
              value={template.size}
              onChange={(e) => updatePlayerTemplate(template.id, { size: Math.max(10, parseInt(e.target.value) || 40) })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Image / Icône (Modèle)</label>
          <div className="flex items-center gap-3">
            {template.imageUrl && (
              <img src={template.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-border" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    updatePlayerTemplate(template.id, { imageUrl: event.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {template.imageUrl && (
              <button
                onClick={() => updatePlayerTemplate(template.id, { imageUrl: undefined })}
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                title="Supprimer l'image"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Rôle par défaut</label>
          <select
            value={template.roleId || ''}
            onChange={(e) => updatePlayerTemplate(template.id, { roleId: e.target.value || null })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Aucun rôle</option>
            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
    );
  } else if (editingEntity.type === 'player') {
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
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Couleur</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={player.color}
                onChange={(e) => updatePlayer(player.id, { color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Taille (Rayon px)</label>
            <input
              type="number"
              value={player.size}
              onChange={(e) => updatePlayer(player.id, { size: Math.max(10, parseInt(e.target.value) || 40) })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Image / Icône</label>
          <div className="flex items-center gap-3">
            {player.imageUrl && (
              <img src={player.imageUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-border" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    updatePlayer(player.id, { imageUrl: event.target?.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {player.imageUrl && (
              <button
                onClick={() => updatePlayer(player.id, { imageUrl: undefined })}
                className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                title="Supprimer l'image"
              >
                <Trash2 size={14} />
              </button>
            )}
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
            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
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
  } else if (editingEntity.type === 'tagInstance') {
    const player = players.find(p => p.id === editingEntity.parentId);
    if (!player) return null;
    const tag = player.tags.find(t => t.instanceId === editingEntity.id);
    if (!tag) return null;

    const updateTagInstance = (updates: any) => {
      const newTags = player.tags.map(t => t.instanceId === tag.instanceId ? { ...t, ...updates } : t);
      updatePlayer(player.id, { tags: newTags });
    };

    entityTitle = `Modifier Tag de ${player.name}: ${tag.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom</label>
          <input
            type="text"
            value={tag.name}
            onChange={(e) => updateTagInstance({ name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Points</label>
            <input
              type="number"
              value={tag.points}
              onChange={(e) => updateTagInstance({ points: parseInt(e.target.value) || 0 })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium">Utilisations (Uses)</label>
            <input
              type="number"
              value={tag.uses}
              onChange={(e) => updateTagInstance({ uses: parseInt(e.target.value) || 0 })}
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
              onChange={(e) => updateTagInstance({ callOrderDay: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Ex: 1"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight || ''}
              onChange={(e) => updateTagInstance({ callOrderNight: e.target.value ? parseInt(e.target.value) : null })}
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
              onChange={(e) => updateTagInstance({ color: e.target.value })}
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
