import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useVttStore } from '../store';

let currentChannel: RealtimeChannel | null = null;

export const initHostRealtime = (roomCode: string) => {
  if (!supabase) return;

  // Cleanup existing channel
  if (currentChannel) {
    supabase.removeChannel(currentChannel);
    currentChannel = null;
  }

  currentChannel = supabase.channel(`room:${roomCode}`, {
    config: { broadcast: { self: false, ack: false }, presence: { key: 'host' } },
  });

  currentChannel
    .on('broadcast', { event: 'join_request' }, ({ payload }) => {
      const { playerName } = payload;

      const state = useVttStore.getState();
      const rawName = playerName.trim().toLowerCase();
      const existingPlayer = state.players.find(p => p.name.trim().toLowerCase() === rawName);

      if (!existingPlayer) {
        if (state.isRoomPublic) {
          // Auto-add player to canvas at center
          const { panX, panY, zoom } = state.canvas;
          const centerX = (-panX + 500) / zoom;
          const centerY = (-panY + 400) / zoom;

          state.addPlayer({
            name: playerName,
            color: state.recentColors[Math.floor(Math.random() * state.recentColors.length)] || '#3b82f6',
            size: 40,
            x: centerX,
            y: centerY,
            roleId: null,
            teamId: null,
            isDead: false,
            tags: [],
          });
          // State change will automatically trigger a broadcast via the subscriber below
        } else {
          // Private room logic - queue for approval
          console.log(`Private room: Join request received for ${playerName}`);
          if (!state.joinRequests.includes(playerName)) {
            state.addJoinRequest(playerName);
          }
        }
      } else {
        // Player exists, force a broadcast so their client syncs immediately
        forceBroadcastState();
      }
    })
    .on('broadcast', { event: 'get_state' }, () => {
      // Direct request from a player client to get current state (useful for late joiners)
      forceBroadcastState();
    })
    .on('presence', { event: 'sync' }, () => {
      const state = useVttStore.getState();
      const newState = currentChannel?.presenceState() || {};

      const onlineIds: string[] = [];
      for (const key in newState) {
        if (key !== 'host') {
          const presences = newState[key] as any[];
          for (const p of presences) {
            if (p.playerId) {
              onlineIds.push(p.playerId);
            }
          }
        }
      }
      state.setOnlinePlayers(onlineIds);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('Player joined', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('Player left', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Host connected to room:${roomCode}`);
        await currentChannel?.track({ isHost: true });
        forceBroadcastState();
      }
    });
};

export const cleanupHostRealtime = () => {
  if (currentChannel && supabase) {
    supabase.removeChannel(currentChannel);
    currentChannel = null;
  }
};

// Vérifie si une chaîne est une image encodée en base64 (peut peser plusieurs centaines de Ko)
const isBase64Image = (str: string | undefined): boolean => {
  if (!str) return false;
  return str.startsWith('data:image');
};

// Supprime les images base64 des objets avant le broadcast pour rester sous la limite
// de 1 Mo de Supabase Realtime. La vue joueur n'affiche pas les images de rôle/joueur
// en base64 — seules les URL distantes (https://…) peuvent être conservées.
const stripBase64Images = <T extends { imageUrl?: string }>(items: T[]): T[] =>
  items.map(item => {
    if (isBase64Image(item.imageUrl)) {
      const { imageUrl: _removed, ...rest } = item as Record<string, unknown>;
      void _removed; // éviter l'erreur "variable déclarée mais non utilisée"
      return rest as T;
    }
    return item;
  });

const forceBroadcastState = () => {
  if (!currentChannel) return;

  const state = useVttStore.getState();

  // On nettoie les images base64 pour éviter que le payload dépasse la limite de 1 Mo
  const payload = {
    players: stripBase64Images(state.players),
    roles: stripBase64Images(state.roles),
    teams: state.teams,    // pas d'imageUrl sur les équipes
    tags: stripBase64Images(state.tags),
    isNight: state.isNight,
    cycleMode: state.cycleMode,
  };

  // We must always broadcast if it's forced by a client request, not just on diff.
  currentChannel.send({
    type: 'broadcast',
    event: 'sync_state',
    payload: payload,
  }).catch(err => console.error("Broadcast failed", err));
};

export const setupHostRealtimeSubscription = () => {
  // Automatically connect if there's already a room code (e.g. after page refresh)
  const initialState = useVttStore.getState();
  if (initialState.roomCode) {
    initHostRealtime(initialState.roomCode);
  }

  return useVttStore.subscribe((state, prevState) => {
    if (!state.roomCode && !prevState.roomCode) return;

    // Check if relevant parts changed
    const relevantChanged =
      state.players !== prevState.players ||
      state.roles !== prevState.roles ||
      state.teams !== prevState.teams ||
      state.tags !== prevState.tags ||
      state.isNight !== prevState.isNight ||
      state.isRoomPublic !== prevState.isRoomPublic;

    if (state.roomCode !== prevState.roomCode) {
      if (state.roomCode) {
        initHostRealtime(state.roomCode);
      } else {
        cleanupHostRealtime();
      }
    } else if (relevantChanged && currentChannel) {
      // isRoomPublic changes no longer trigger a full re-init. It's read dynamically in the event handler.
      // They just trigger a force broadcast so that clients know the current state (if they needed to).
      forceBroadcastState();
    }
  });
};
