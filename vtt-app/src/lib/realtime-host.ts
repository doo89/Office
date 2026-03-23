import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useVttStore } from '../store';

let currentChannel: RealtimeChannel | null = null;

export const initHostRealtime = (roomCode: string, isRoomPublic: boolean) => {
  if (!supabase) return;

  // Cleanup existing channel
  if (currentChannel) {
    supabase.removeChannel(currentChannel);
    currentChannel = null;
  }

  currentChannel = supabase.channel(`room:${roomCode}`, {
    config: { broadcast: { self: false, ack: true }, presence: { key: 'host' } },
  });

  currentChannel
    .on('broadcast', { event: 'join_request' }, ({ payload }) => {
      const { playerName } = payload;

      const state = useVttStore.getState();
      const existingPlayer = state.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());

      if (!existingPlayer) {
        if (isRoomPublic) {
          // Auto-add player to canvas at center
          const { panX, panY, zoom } = state.canvas;
          // Simple center calculation (assuming 1000x800 typical view)
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

const forceBroadcastState = () => {
  if (!currentChannel) return;

  const state = useVttStore.getState();
  const payload = {
    players: state.players,
    roles: state.roles,
    teams: state.teams,
    tags: state.tags,
    isNight: state.isNight,
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
    initHostRealtime(initialState.roomCode, initialState.isRoomPublic);
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
        initHostRealtime(state.roomCode, state.isRoomPublic);
      } else {
        cleanupHostRealtime();
      }
    } else if (state.isRoomPublic !== prevState.isRoomPublic && state.roomCode) {
      // Re-initialize channel to capture new public/private setting in closure
      initHostRealtime(state.roomCode, state.isRoomPublic);
    } else if (relevantChanged && currentChannel) {
      forceBroadcastState();
    }
  });
};
