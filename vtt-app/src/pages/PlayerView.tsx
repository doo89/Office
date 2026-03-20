import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVttStore } from '../store';
import { LogOut, UserCircle2, Tag as TagIcon, ShieldAlert } from 'lucide-react';
import type { Player, Role, Team } from '../types';

export const PlayerView: React.FC = () => {
  const { roomId, playerName } = useParams<{ roomId: string, playerName: string }>();
  const navigate = useNavigate();

  const { players, roles, teams } = useVttStore();

  const [localPlayer, setLocalPlayer] = useState<Player | null>(null);
  const [localRole, setLocalRole] = useState<Role | null>(null);
  const [localTeam, setLocalTeam] = useState<Team | null>(null);

  // In a real multiplayer setup, this component would subscribe to the Firebase/Supabase
  // document for the specific `playerId` or `playerName` inside the `roomId`.
  // For now, we simulate pulling from the local store based on name.
  useEffect(() => {
    if (!playerName) return;

    // Find player by name (case-insensitive for robust mock matching)
    const found = players.find(p => p.name.toLowerCase() === decodeURIComponent(playerName).toLowerCase());

    if (found) {
      setLocalPlayer(found);
      const role = roles.find(r => r.id === found.roleId);
      setLocalRole(role || null);

      const effectiveTeamId = role?.seenInTeamId || role?.teamId || found.teamId;
      const team = teams.find(t => t.id === effectiveTeamId);
      setLocalTeam(team || null);
    } else {
      // If player not found, they might be waiting for GM to add them, or they entered wrong name.
      // We'll just show "Waiting..." state if null.
      setLocalPlayer(null);
      setLocalRole(null);
      setLocalTeam(null);
    }
  }, [playerName, players, roles, teams]);

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-50 flex flex-col p-4 md:p-8 max-w-md mx-auto relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6 z-10">
        <div className="flex flex-col">
          <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Salle : {roomId}</span>
          <h2 className="text-xl font-bold tracking-tight text-white truncate max-w-[200px]">{decodeURIComponent(playerName || 'Joueur')}</h2>
        </div>
        <button
          onClick={() => navigate('/join')}
          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
          title="Quitter la salle"
        >
          <LogOut size={20} />
        </button>
      </div>

      {!localPlayer ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 z-10">
          <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-zinc-200">En attente du Maître du Jeu...</h3>
            <p className="text-sm text-zinc-500">Votre connexion à la salle {roomId} est établie. Le MJ doit vous faire entrer sur le plateau.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 z-10 pb-10 overflow-y-auto custom-scrollbar pr-2">

          {/* Status Banner */}
          {localPlayer.isDead && (
            <div className="bg-red-950/50 border border-red-900 text-red-200 p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg">
              <ShieldAlert size={24} className="text-red-500" />
              <span className="font-bold text-lg">Vous êtes mort.</span>
            </div>
          )}

          {/* Role Card */}
          <div className="relative flex flex-col items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-hidden mt-4">
            {localTeam && (
               <div
                  className="absolute top-0 left-0 w-full h-1.5"
                  style={{ backgroundColor: localTeam.color }}
                />
            )}

            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-xl mb-4 border-4 transition-all ${localPlayer.isDead ? 'grayscale opacity-50 border-zinc-700 bg-zinc-800' : 'border-zinc-800 bg-zinc-950'}`}
              style={{ borderColor: localPlayer.isDead ? undefined : (localRole?.color || localPlayer.color) }}
            >
              {localRole?.imageUrl || localPlayer.imageUrl ? (
                <img
                  src={localRole?.imageUrl || localPlayer.imageUrl}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserCircle2 size={48} className="text-zinc-600" />
              )}
            </div>

            <div className="text-center flex flex-col items-center gap-1 w-full">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Votre Rôle</span>
              <h3
                className={`text-3xl font-black tracking-tight mt-1 ${localPlayer.isDead ? 'text-zinc-600' : 'text-white'}`}
                style={{ color: localPlayer.isDead ? undefined : (localRole?.color || '#fff') }}
              >
                {localRole ? localRole.name : "Villageois"}
              </h3>

              {localTeam && (
                <div
                  className="inline-flex items-center justify-center px-3 py-1 rounded-full mt-3 border bg-zinc-950/50"
                  style={{ borderColor: `${localTeam.color}40`, color: localTeam.color }}
                >
                  <span className="text-xs font-bold">{localTeam.name}</span>
                </div>
              )}
            </div>

            {localRole?.description && (
              <div className="mt-6 pt-6 border-t border-zinc-800 w-full">
                <p className="text-sm text-zinc-400 italic text-center leading-relaxed">
                  {localRole.description}
                </p>
              </div>
            )}
          </div>

          {/* Tags / Status Effects */}
          {localPlayer.tags.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                <TagIcon size={14} /> Effets Actifs
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {localPlayer.tags.map(tag => (
                  <div key={tag.instanceId} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </div>
                      {tag.uses !== null && (
                         <span className="text-xs font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-300">
                           {tag.uses} util.
                         </span>
                      )}
                    </div>
                    {tag.description && (
                      <p className="text-xs text-zinc-500 italic mt-1 leading-relaxed">{tag.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Decorative background glow */}
      {localRole && !localPlayer?.isDead && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] rounded-full blur-[120px] opacity-10 pointer-events-none"
          style={{ backgroundColor: localRole.color }}
        />
      )}
    </div>
  );
};
