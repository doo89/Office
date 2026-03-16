import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState, EntityId, Player, Role, TagModel, Marker, Team, Wall } from '../types';
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

  // Selection & Interaction
  setSelectedEntityIds: (ids: string[]) => void;
  clearSelection: () => void;
  setInteractionMode: (mode: 'pan' | 'select') => void;

  // Room
  setRoomName: (name: string) => void;

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
  isDrawingMode: boolean;
  toggleDrawingMode: () => void;
  updateDrawingSettings: (updates: Partial<GameState['drawingSettings']>) => void;
  setGrid: (grid: GameState['grid']) => void;
  setRoom: (room: Partial<GameState['room']>) => void;
  addWall: (wall: Omit<Wall, 'id'>) => void;
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
  resetCycle: () => void;

  // Settings
  updateDisplaySettings: (updates: Partial<GameState['displaySettings']>) => void;

  // Colors
  addRecentColor: (color: string) => void;
}

const initialState = {
  roomName: 'Ma Salle',
  selectedEntityIds: [],
  interactionMode: 'pan' as const,
  playerTemplates: [],
  players: [],
  roles: [],
  tags: [],
  markers: [],
  markerParameters: [],
  teams: [],
  recentColors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff', '#000000', '#6b7280'], // default colors
  isNight: false,
  cycleNumber: 1,
  walls: [],
  drawingSettings: {
    tool: 'line' as const,
    color: '#000000',
    thickness: 5,
    fillColor: '#ef4444',
    fillTransparent: true,
  },
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
  displaySettings: {
    showTooltip: true,
    showRole: true,
    showTeam: true,
    showTags: true,
    showPlayers: true,
    showCenter: true,
    showCycleIcon: true,
    foregroundElement: 'players' as const,
    showPlayerImage: true,
    showRoleImage: true,
    imagePriority: 'player' as const,
    playerNamePosition: 'bottom' as const,
    playerBadges: {
      topLeft: { type: 'team' as const, bgColor: '#000000', textColor: '#ffffff' },
      topRight: { type: 'lives' as const, bgColor: '#ef4444', textColor: '#ffffff' },
      bottomLeft: { type: 'none' as const, bgColor: '#3b82f6', textColor: '#ffffff' },
      bottomRight: { type: 'none' as const, bgColor: '#10b981', textColor: '#ffffff' },
    },
  },
  isLeftPanelOpen: true,
  isRightPanelOpen: true,
  isDrawingMode: false,
};

export const useVttStore = create<VttStore>()(
  persist(
    (set) => ({
      ...initialState,

  // Selection & Interaction
  setSelectedEntityIds: (ids) => set({ selectedEntityIds: ids }),
  clearSelection: () => set({ selectedEntityIds: [] }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),

  setRoomName: (name) => set({ roomName: name }),

  setPan: (x, y) => set((state) => ({ canvas: { ...state.canvas, panX: x, panY: y } })),
  setZoom: (zoom) => set((state) => ({ canvas: { ...state.canvas, zoom } })),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setEditingEntity: (entity) => set({ editingEntity: entity }),
  toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
  toggleRightPanel: () => set((state) => ({ isRightPanelOpen: !state.isRightPanelOpen })),

  // Tools
  toggleDrawingMode: () => set((state) => ({ isDrawingMode: !state.isDrawingMode })),
  updateDrawingSettings: (updates) => set((state) => ({
    drawingSettings: { ...state.drawingSettings, ...updates }
  })),
  setGrid: (grid) => set({ grid }),
  setRoom: (roomUpdates) => set((state) => ({ room: { ...state.room, ...roomUpdates } })),
  addWall: (wallData) => set((state) => ({ walls: [...state.walls, { id: uuidv4(), ...wallData }] })),
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
    teams: [...state.teams, { id: uuidv4(), ...teamData } as Team]
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
  resetCycle: () => set({ isNight: false, cycleNumber: 1 }),

  // Settings
      updateDisplaySettings: (updates) => set((state) => ({
        displaySettings: { ...state.displaySettings, ...updates }
      })),

      // Colors
      addRecentColor: (color) => set((state) => {
        const uppercaseColor = color.toUpperCase();
        const existingIndex = state.recentColors.indexOf(uppercaseColor);
        if (existingIndex > -1) {
          // Move to front
          const newColors = [...state.recentColors];
          newColors.splice(existingIndex, 1);
          newColors.unshift(uppercaseColor);
          return { recentColors: newColors };
        } else {
          // Add to front, keep max 16
          return { recentColors: [uppercaseColor, ...state.recentColors].slice(0, 16) };
        }
      }),
    }),
    {
      name: 'vtt-storage',
    }
  )
);