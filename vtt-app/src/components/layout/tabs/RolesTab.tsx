import { Plus, Trash2, Edit2, ChevronDown, ChevronRight, icons } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useVttStore } from '../../../store';
import { ColorPicker } from '../../ColorPicker';

export const RolesTab: React.FC = () => {
  const { roles, teams, tags, setEditingEntity, addRole, deleteRole } = useVttStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3b82f6');
  const [newRoleLives, setNewRoleLives] = useState(1);
  const [newRoleUnique, setNewRoleUnique] = useState(true);
  const [newRoleTeamId, setNewRoleTeamId] = useState<string>('');
  const [newRoleTags, setNewRoleTags] = useState<string[]>([]);
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});

  const rolesByTeam = useMemo(() => {
    const grouped: Record<string, typeof roles> = {
      'no-team': []
    };

    teams.forEach(t => grouped[t.id] = []);

    roles.forEach(role => {
      if (role.teamId && grouped[role.teamId]) {
        grouped[role.teamId].push(role);
      } else {
        grouped['no-team'].push(role);
      }
    });

    return grouped;
  }, [roles, teams]);

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;

    const selectedTags = tags.filter(t => newRoleTags.includes(t.id));

    addRole({
      name: newRoleName,
      color: newRoleColor,
      lives: newRoleLives,
      isUnique: newRoleUnique,
      teamId: newRoleTeamId || null,
      tags: selectedTags,
    });
    setNewRoleName('');
    setNewRoleLives(1);
    setNewRoleUnique(true);
    setNewRoleTeamId('');
    setNewRoleTags([]);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Role Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Créer un Rôle</h3>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom du rôle"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">Équipe :</label>
            <select
              value={newRoleTeamId}
              onChange={(e) => setNewRoleTeamId(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">-- Aucune --</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Vies:</label>
              <input
                type="number"
                min="0"
                value={newRoleLives}
                onChange={(e) => setNewRoleLives(parseInt(e.target.value) || 0)}
                className="w-full bg-input border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring text-center"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unique-role"
                checked={newRoleUnique}
                onChange={(e) => setNewRoleUnique(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring cursor-pointer"
              />
              <label htmlFor="unique-role" className="text-xs font-medium text-muted-foreground whitespace-nowrap cursor-pointer">
                Unique
              </label>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-xs font-medium text-muted-foreground">Tags par défaut :</span>
              <select
                multiple
                value={newRoleTags}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions);
                  setNewRoleTags(options.map(o => o.value));
                }}
                className="w-full bg-background border border-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-ring focus:border-input outline-none h-24 custom-scrollbar"
                title="Maintenez Ctrl (ou Cmd) pour sélectionner plusieurs tags."
              >
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-muted-foreground leading-tight">
                Maintenez <kbd className="bg-muted px-1 rounded">Ctrl</kbd> ou <kbd className="bg-muted px-1 rounded">Cmd</kbd> pour sélectionner plusieurs tags.
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <ColorPicker
              color={newRoleColor}
              onChange={setNewRoleColor}
              label="Couleur du rôle"
            />
            <button
              onClick={handleAddRole}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Ajouter Rôle
            </button>
          </div>
        </div>
      </section>

      {/* List Roles Section */}
      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-sm border-b border-border pb-1">Rôles Disponibles</h3>
        <div className="flex flex-col gap-2">
          {roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun rôle défini.</p>
          ) : (
            <>
              {Object.entries(rolesByTeam).map(([teamId, teamRoles]) => {
                if (teamRoles.length === 0) return null;

                const team = teamId === 'no-team' ? null : teams.find(t => t.id === teamId);
                const isExpanded = expandedTeams[teamId] !== false; // Default to true
                const TeamIcon = team && team.icon ? icons[team.icon as keyof typeof icons] : null;

                return (
                  <div key={teamId} className="flex flex-col gap-1">
                    <button
                      onClick={() => toggleTeam(teamId)}
                      className="flex items-center justify-between w-full p-1.5 rounded bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {team ? (
                          <div className="flex items-center gap-1.5" style={{ color: team.color }}>
                            {TeamIcon && React.createElement(TeamIcon, { size: 14 })}
                            {team.name}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sans Équipe</span>
                        )}
                        <span className="text-xs text-muted-foreground ml-1">({teamRoles.length})</span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="flex flex-col gap-1.5 pl-4 mt-1 border-l-2 border-border/30 ml-2">
                        {teamRoles.map((role) => (
                          <div
                            key={role.id}
                            className="flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-accent/50 group"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-sm border border-border"
                                style={{ backgroundColor: role.color }}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none">{role.name}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">
                                  {role.lives} PV • {role.isUnique ? 'Unique' : 'Multiple'}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingEntity({ type: 'role', id: role.id })}
                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                                title="Modifier"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteRole(role.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>
    </div>
  );
};