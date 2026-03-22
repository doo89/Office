import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useVttStore } from '../store';

let currentChannel: RealtimeChannel | null = null;
let lastBroadcastData = '';

export const initHostRealtime = (roomCode: string, isRoomPublic: boolean) => {
  if (!supabase) return;

  // Cleanup existing channel
  if (currentChannel) {
    supabase.removeChannel(currentChannel);
    currentChannel = null;
  }

  currentChannel = supabase.channel(`room:${roomCode}`, {
    config: { broadcast: { self: false, ack: true } },
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
          // Private room logic - maybe queue for approval (out of scope for MVP, just ignore or notify)
          console.log(`Private room: Join request ignored for ${playerName}`);
        }
      } else {
        // Player exists, force a broadcast so their client syncs immediately
        forceBroadcastState();
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Host connected to room:${roomCode}`);
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

  const newDataString = JSON.stringify(payload);
  if (newDataString !== lastBroadcastData) {
    currentChannel.send({
      type: 'broadcast',
      event: 'sync_state',
      payload: payload,
    }).catch(err => console.error("Broadcast failed", err));
    lastBroadcastData = newDataString;
  }
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
