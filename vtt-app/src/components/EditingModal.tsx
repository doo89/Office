import React from 'react';
import { useVttStore } from '../store';
import { X, Trash2, icons } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

const TEAM_ICONS = [
  'Users', 'Shield', 'Sword', 'Heart', 'Star', 'Flag', 'Skull', 'Ghost',
  'Crown', 'Flame', 'Zap', 'Droplet', 'Sun', 'Moon', 'Eye', 'Feather',
  'Key', 'Anchor', 'Axe', 'Castle', 'Crosshair', 'Hexagon', 'Sprout', 'Target', 'Gem'
];

const TAG_ICONS = [
  'Tag', 'Shield', 'Sword', 'Heart', 'Star', 'Flag', 'Skull', 'Ghost',
  'Crown', 'Flame', 'Zap', 'Droplet', 'Sun', 'Moon', 'Eye', 'Feather',
  'Key', 'Anchor', 'Axe', 'Castle', 'Crosshair', 'Hexagon', 'Sprout', 'Target', 'Gem'
];

export const EditingModal: React.FC = () => {
  const { editingEntity, setEditingEntity, players, playerTemplates, roles, teams, tags, tagCategories, markers, updatePlayer, updatePlayerTemplate, updateRole, updateTeam, updateTagModel, updateTagCategory, updateMarker } = useVttStore();

  if (!editingEntity) return null;

  const handleClose = () => setEditingEntity(null);

  let entityTitle = '';
  let entityContent = null;

  if (editingEntity.type === 'tagCategory') {
    const category = tagCategories.find(c => c.id === editingEntity.id);
    if (!category) return null;
    entityTitle = "Modifier la Catégorie";
    entityContent = (
      <>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Nom</label>
          <input
            type="text"
            value={category.name}
            onChange={(e) => updateTagCategory(category.id, { name: e.target.value })}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-xs font-medium text-muted-foreground">Icône</label>
          <div className="flex flex-wrap gap-1 bg-input border border-border rounded-md p-1.5 max-h-32 overflow-y-auto custom-scrollbar">
            {['Folder', 'Bookmark', 'Layers', 'Boxes', 'Library', 'List', 'Hash'].map(iconName => {
              const IconComponent = icons[iconName as keyof typeof icons];
              if (!IconComponent) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => updateTagCategory(category.id, { icon: iconName })}
                  className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                    category.icon === iconName
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                  title={iconName}
                >
                  {React.createElement(IconComponent, { size: 16 })}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-2">
          <ColorPicker color={category.color} onChange={(c) => updateTagCategory(category.id, { color: c })} label="Couleur de la catégorie" />
        </div>
      </>
    );
  } else if (editingEntity.type === 'playerTemplate') {
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
              <ColorPicker
                color={template.color}
                onChange={(c) => updatePlayerTemplate(template.id, { color: c })}
                label="Couleur"
                className="!w-10 !h-10"
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
          <label className="text-sm font-medium">Équipe par défaut</label>
          <select
            value={template.teamId || ''}
            onChange={(e) => updatePlayerTemplate(template.id, { teamId: e.target.value || null })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Aucune équipe</option>
            {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
              <ColorPicker
                color={player.color}
                onChange={(c) => updatePlayer(player.id, { color: c })}
                label="Couleur"
                className="!w-10 !h-10"
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
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Équipe</label>
          <select
            value={player.teamId || ''}
            onChange={(e) => updatePlayer(player.id, { teamId: e.target.value || null })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Aucune équipe</option>
            {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
            <ColorPicker
              color={role.color}
              onChange={(c) => updateRole(role.id, { color: c })}
              label="Couleur"
              className="!w-10 !h-10"
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

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Image du rôle</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      updateRole(role.id, { imageUrl: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="text-sm flex-1 text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {role.imageUrl && (
                <button
                  onClick={() => updateRole(role.id, { imageUrl: undefined })}
                  className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                  title="Supprimer l'image"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {role.imageUrl && (
              <div className="mt-2 w-16 h-16 rounded-md overflow-hidden border border-border">
                <img src={role.imageUrl} alt={role.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Équipe (réelle)</label>
            <select
              value={role.teamId || ''}
              onChange={(e) => updateRole(role.id, { teamId: e.target.value || null })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- Aucune --</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Vu comme rôle (info-bulle)</label>
              <select
                value={role.seenAsRoleId || ''}
                onChange={(e) => updateRole(role.id, { seenAsRoleId: e.target.value || null })}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Aucun --</option>
                {roles.filter(r => r.id !== role.id).map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium">Vu dans équipe (info-bulle)</label>
              <select
                value={role.seenInTeamId || ''}
                onChange={(e) => updateRole(role.id, { seenInTeamId: e.target.value || null })}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Identique à réelle --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Description libre</label>
            <textarea
              value={role.description || ''}
              onChange={(e) => updateRole(role.id, { description: e.target.value })}
              placeholder="Ex: Si tué la nuit, ressuscite le lendemain..."
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Tags attachés</label>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Aucun tag défini dans le jeu.</p>
            ) : (
              <select
                multiple
                value={(role.tags || []).map(t => t.id)}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  const selectedTagIds = options.map(o => o.value);
                  const newTags = tags.filter(t => selectedTagIds.includes(t.id));
                  updateRole(role.id, { tags: newTags });
                }}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:border-input outline-none h-24 custom-scrollbar"
                title="Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs tags."
              >
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            )}
            <span className="text-[10px] text-muted-foreground leading-tight mt-1">
              Maintenez <kbd className="bg-muted px-1 rounded">Ctrl</kbd> ou <kbd className="bg-muted px-1 rounded">Cmd</kbd> pour sélectionner plusieurs tags.
            </span>
          </div>

      </div>
    );
  } else if (editingEntity.type === 'team') {
    const team = teams.find(t => t.id === editingEntity.id);
    if (!team) return null;

    entityTitle = `Modifier Équipe: ${team.name}`;
    entityContent = (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Nom de l'équipe</label>
          <input
            type="text"
            value={team.name}
            onChange={(e) => updateTeam(team.id, { name: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Icône de l'équipe</label>
          <div className="flex flex-wrap gap-1.5 bg-input border border-border rounded-md p-2 max-h-40 overflow-y-auto">
            {TEAM_ICONS.map(iconName => {
              const IconComponent = icons[iconName as keyof typeof icons];
              if (!IconComponent) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => updateTeam(team.id, { icon: iconName })}
                  className={`p-2 rounded-md transition-colors flex items-center justify-center ${
                    team.icon === iconName
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                  title={iconName}
                >
                  {React.createElement(IconComponent, { size: 20 })}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Couleur</label>
          <ColorPicker
            color={team.color}
            onChange={(c) => updateTeam(team.id, { color: c })}
            label="Couleur"
            className="!w-10 !h-10"
          />
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
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-medium">Icône du tag</label>
          <div className="flex flex-wrap gap-1 bg-input border border-border rounded-md p-2 max-h-32 overflow-y-auto custom-scrollbar">
            {TAG_ICONS.map(iconName => {
              const IconComponent = icons[iconName as keyof typeof icons];
              if (!IconComponent) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => updateTagModel(tag.id, { icon: iconName })}
                  className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                    tag.icon === iconName
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                  title={iconName}
                >
                  {React.createElement(IconComponent, { size: 16 })}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Image personnalisée</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateTagModel(tag.id, { imageUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-sm flex-1 text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {tag.imageUrl && (
              <button
                onClick={() => updateTagModel(tag.id, { imageUrl: undefined })}
                className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                title="Supprimer l'image"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {tag.imageUrl && (
            <div className="mt-2 w-12 h-12 rounded-md overflow-hidden border border-border">
              <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" title="Ordre d'Appel Jour">Appel Jour</label>
            <input
              type="number"
              value={tag.callOrderDay ?? ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderDay: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" title="Ordre d'Appel Nuit">Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight ?? ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderNight: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Ajout Vie</label>
            <input
              type="number"
              value={tag.lives ?? ''}
              onChange={(e) => updateTagModel(tag.id, { lives: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Votes</label>
            <input
              type="number"
              value={tag.votes ?? ''}
              onChange={(e) => updateTagModel(tag.id, { votes: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Points</label>
            <input
              type="number"
              value={tag.points ?? ''}
              onChange={(e) => updateTagModel(tag.id, { points: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Uses</label>
            <input
              type="number"
              value={tag.uses ?? ''}
              onChange={(e) => updateTagModel(tag.id, { uses: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={tag.autoDeleteOnZeroUses || false}
                onChange={(e) => updateTagModel(tag.id, { autoDeleteOnZeroUses: e.target.checked })}
                className="rounded border-border w-3 h-3"
              />
              Suppr. auto à 0
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Texte libre</label>
          <textarea
            value={tag.description || ''}
            onChange={(e) => updateTagModel(tag.id, { description: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
          />
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={tag.showInTooltip !== false}
              onChange={(e) => updateTagModel(tag.id, { showInTooltip: e.target.checked })}
              className="rounded border-border w-3 h-3"
            />
            Visible dans l'info-bulle (au survol du joueur)
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={tag.showInGameTab !== false}
              onChange={(e) => updateTagModel(tag.id, { showInGameTab: e.target.checked })}
              className="rounded border-border w-3 h-3"
            />
            Visible dans l'onglet Jeu (sous le joueur)
          </label>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Jour</label>
            <input
              type="number"
              value={tag.callOrderDay ?? ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderDay: e.target.value === '' ? null : parseInt(e.target.value) })}
              placeholder="Ex: 1"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight ?? ''}
              onChange={(e) => updateTagModel(tag.id, { callOrderNight: e.target.value === '' ? null : parseInt(e.target.value) })}
              placeholder="Ex: 5"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-medium">Couleur</label>
          <div className="flex items-center gap-3">
            <ColorPicker
              color={tag.color}
              onChange={(c) => updateTagModel(tag.id, { color: c })}
              label="Couleur"
              className="!w-10 !h-10"
            />
          </div>
        </div>
      </div>
    );
  } else if (editingEntity.type === 'tagInstance') {
    let tag: any = null;
    let updateTagInstance: (updates: any) => void;

    // Check if it's attached to a player
    if (editingEntity.parentId) {
      const player = players.find(p => p.id === editingEntity.parentId);
      if (!player) return null;
      tag = player.tags.find(t => t.instanceId === editingEntity.id);
      if (!tag) return null;

      updateTagInstance = (updates: any) => {
        const newTags = player.tags.map(t => t.instanceId === tag.instanceId ? { ...t, ...updates } : t);
        updatePlayer(player.id, { tags: newTags });
      };
      entityTitle = `Modifier Tag de ${player.name}: ${tag.name}`;
    } else {
      // Otherwise, it's a standalone marker on the canvas
      const marker = markers.find((m: any) => m.tag.instanceId === editingEntity.id);
      if (!marker) return null;
      tag = marker.tag;

      updateTagInstance = (updates: any) => {
        updateMarker(marker.id, { tag: { ...tag, ...updates } });
      };
      entityTitle = `Modifier Marqueur: ${tag.name}`;
    }

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
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-medium">Icône du tag</label>
          <div className="flex flex-wrap gap-1 bg-input border border-border rounded-md p-2 max-h-32 overflow-y-auto custom-scrollbar">
            {TAG_ICONS.map(iconName => {
              const IconComponent = icons[iconName as keyof typeof icons];
              if (!IconComponent) return null;
              return (
                <button
                  key={iconName}
                  onClick={() => updateTagInstance({ icon: iconName })}
                  className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${
                    tag.icon === iconName
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                  }`}
                  title={iconName}
                >
                  {React.createElement(IconComponent, { size: 16 })}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Image personnalisée</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateTagInstance({ imageUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-sm flex-1 text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {tag.imageUrl && (
              <button
                onClick={() => updateTagInstance({ imageUrl: undefined })}
                className="p-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
                title="Supprimer l'image"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {tag.imageUrl && (
            <div className="mt-2 w-12 h-12 rounded-md overflow-hidden border border-border">
              <img src={tag.imageUrl} alt={tag.name} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground" title="Ordre d'Appel Jour">Appel Jour</label>
            <input
              type="number"
              value={tag.callOrderDay ?? ''}
              onChange={(e) => updateTagInstance({ callOrderDay: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground" title="Ordre d'Appel Nuit">Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight ?? ''}
              onChange={(e) => updateTagInstance({ callOrderNight: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Ajout Vie</label>
            <input
              type="number"
              value={tag.lives ?? ''}
              onChange={(e) => updateTagInstance({ lives: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Votes</label>
            <input
              type="number"
              value={tag.votes ?? ''}
              onChange={(e) => updateTagInstance({ votes: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Points</label>
            <input
              type="number"
              value={tag.points ?? ''}
              onChange={(e) => updateTagInstance({ points: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Uses</label>
            <input
              type="number"
              value={tag.uses ?? ''}
              onChange={(e) => updateTagInstance({ uses: e.target.value === '' ? null : parseInt(e.target.value) })}
              className="bg-input border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={tag.autoDeleteOnZeroUses || false}
                onChange={(e) => updateTagInstance({ autoDeleteOnZeroUses: e.target.checked })}
                className="rounded border-border w-3 h-3"
              />
              Suppr. auto à 0
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Texte libre</label>
          <textarea
            value={tag.description || ''}
            onChange={(e) => updateTagInstance({ description: e.target.value })}
            className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[60px]"
          />
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={tag.showInTooltip !== false}
              onChange={(e) => updateTagInstance({ showInTooltip: e.target.checked })}
              className="rounded border-border w-3 h-3"
            />
            Visible dans l'info-bulle (au survol du joueur)
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={tag.showInGameTab !== false}
              onChange={(e) => updateTagInstance({ showInGameTab: e.target.checked })}
              className="rounded border-border w-3 h-3"
            />
            Visible dans l'onglet Jeu (sous le joueur)
          </label>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Jour</label>
            <input
              type="number"
              value={tag.callOrderDay ?? ''}
              onChange={(e) => updateTagInstance({ callOrderDay: e.target.value === '' ? null : parseInt(e.target.value) })}
              placeholder="Ex: 1"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-muted-foreground text-xs">Ordre Appel Nuit</label>
            <input
              type="number"
              value={tag.callOrderNight ?? ''}
              onChange={(e) => updateTagInstance({ callOrderNight: e.target.value === '' ? null : parseInt(e.target.value) })}
              placeholder="Ex: 5"
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-sm font-medium">Couleur</label>
          <div className="flex items-center gap-3">
            <ColorPicker
              color={tag.color}
              onChange={(c) => updateTagInstance({ color: c })}
              label="Couleur"
              className="!w-10 !h-10"
            />
          </div>
        </div>
      </div>
    );
  } else if (editingEntity.type === 'playerNotes') {
    const player = players.find(p => p.id === editingEntity.id);
    if (!player) return null;

    entityTitle = `Notes privées: ${player.name}`;
    entityContent = (
      <div className="flex flex-col gap-4 min-h-[300px]">
        <div className="flex flex-col gap-2 h-full flex-1">
          <label className="text-sm font-medium text-muted-foreground">Ces notes sont visibles uniquement par vous (MJ)</label>
          <textarea
            value={player.privateNotes || ''}
            onChange={(e) => updatePlayer(player.id, { privateNotes: e.target.value })}
            placeholder="Ajouter des notes secrètes sur ce joueur..."
            className="flex-1 min-h-[250px] bg-input border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none custom-scrollbar"
            autoFocus
          />
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
