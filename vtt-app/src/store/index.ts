import { create } from 'zustand';
import type { GameState, EntityId, Player, Role, TagModel, Marker } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface PlayerTemplate {
  id: EntityId;
  color: string;
  name: string;
  roleId: EntityId | null;
  teamId: EntityId | null;
  size: number;
  imageUrl?: string;
}

interface VttStore extends GameState {
  playerTemplates: PlayerTemplate[];

  // Navigation
  setPan: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  setActiveLeftTab: (tab: GameState['activeLeftTab']) => void;
  setEditingEntity: (entity: GameState['editingEntity']) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;

  // Tools
  setGrid: (grid: GameState['grid']) => void;
  setRoom: (room: Partial<GameState['room']>) => void;
  clearWalls: () => void;

  // Player Templates
  addPlayerTemplate: (templateData: Omit<PlayerTemplate, 'id'>) => void;
  updatePlayerTemplate: (id: EntityId, updates: Partial<PlayerTemplate>) => void;
  deletePlayerTemplate: (id: EntityId) => void;

  // Players
  addPlayer: (playerData: Omit<Player, 'id'>) => void;
  updatePlayer: (id: EntityId, updates: Partial<Player>) => void;
  deletePlayer: (id: EntityId) => void;

  // Roles
  addRole: (roleData: Omit<Role, 'id'>) => void;
  updateRole: (id: EntityId, updates: Partial<Role>) => void;
  deleteRole: (id: EntityId) => void;

  // Teams
  addTeam: (teamData: Omit<Team, 'id'>) => void;
  updateTeam: (id: EntityId, updates: Partial<Team>) => void;
  deleteTeam: (id: EntityId) => void;

  // Tags (Models)
  tags: TagModel[];
  addTagModel: (tagData: Omit<TagModel, 'id'>) => void;
  updateTagModel: (id: EntityId, updates: Partial<TagModel>) => void;
  deleteTagModel: (id: EntityId) => void;

  // Markers (on canvas)
  addMarker: (markerData: Omit<Marker, 'id'>) => void;
  updateMarker: (id: EntityId, updates: Partial<Marker>) => void;
  deleteMarker: (id: EntityId) => void;

  // Game Logic
  setNight: (isNight: boolean) => void;
  nextCycle: () => void;
}

const initialState = {
  playerTemplates: [],
  players: [],
  roles: [],
  tags: [],
  markers: [],
  markerParameters: [],
  teams: [],
  isNight: false,
  cycleNumber: 1,
  walls: [],
  activeLeftTab: 'players' as const,
  editingEntity: null,
  canvas: {
    panX: 0,
    panY: 0,
    zoom: 1,
  },
  grid: {
    enabled: false,
    sizeX: 50,
    sizeY: 50,
  },
  room: {
    width: 2000,
    height: 1500,
    backgroundColor: '#ffffff',
    texture: 'none',
  },
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
};

export const useVttStore = create<VttStore>((set) => ({
  ...initialState,

  setPan: (x, y) => set((state) => ({ canvas: { ...state.canvas, panX: x, panY: y } })),
  setZoom: (zoom) => set((state) => ({ canvas: { ...state.canvas, zoom } })),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setEditingEntity: (entity) => set({ editingEntity: entity }),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  // Tools
  setGrid: (grid) => set({ grid }),
  setRoom: (roomUpdates) => set((state) => ({ room: { ...state.room, ...roomUpdates } })),
  clearWalls: () => set({ walls: [] }),

  // Player Templates
  addPlayerTemplate: (templateData) => set((state) => ({
    playerTemplates: [...state.playerTemplates, { ...templateData, id: uuidv4() }]
  })),
  updatePlayerTemplate: (id, updates) => set((state) => ({
    playerTemplates: state.playerTemplates.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePlayerTemplate: (id) => set((state) => ({
    playerTemplates: state.playerTemplates.filter(p => p.id !== id)
  })),

  // Players
  addPlayer: (playerData) => set((state) => ({
    players: [...state.players, { ...playerData, id: uuidv4() }]
  })),
  updatePlayer: (id, updates) => set((state) => ({
    players: state.players.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  deletePlayer: (id) => set((state) => ({
    players: state.players.filter(p => p.id !== id)
  })),

  // Roles
  addRole: (roleData) => set((state) => ({
    roles: [...state.roles, { ...roleData, id: uuidv4() }]
  })),
  updateRole: (id, updates) => set((state) => ({
    roles: state.roles.map(r => r.id === id ? { ...r, ...updates } : r)
  })),
  deleteRole: (id) => set((state) => ({
    roles: state.roles.filter(r => r.id !== id)
  })),

  // Teams
  addTeam: (teamData) => set((state) => ({
    teams: [...state.teams, { ...teamData, id: uuidv4() }]
  })),
  updateTeam: (id, updates) => set((state) => ({
    teams: state.teams.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTeam: (id) => set((state) => ({
    teams: state.teams.filter(t => t.id !== id)
  })),

  // Tags
  addTagModel: (tagData) => set((state) => ({
    tags: [...state.tags, { ...tagData, id: uuidv4() }]
  })),
  updateTagModel: (id, updates) => set((state) => ({
    tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  deleteTagModel: (id) => set((state) => ({
    tags: state.tags.filter(t => t.id !== id)
  })),

  // Markers
  addMarker: (markerData) => set((state) => ({
    markers: [...state.markers, { ...markerData, id: uuidv4() }]
  })),
  updateMarker: (id, updates) => set((state) => ({
    markers: state.markers.map(m => m.id === id ? { ...m, ...updates } : m)
  })),
  deleteMarker: (id) => set((state) => ({
    markers: state.markers.filter(m => m.id !== id)
  })),

  // Game Logic
  setNight: (isNight) => set({ isNight }),
  nextCycle: () => set((state) => {
    if (state.isNight) {
      return { isNight: false, cycleNumber: state.cycleNumber + 1 };
    } else {
      return { isNight: true };
    }
  }),
}));