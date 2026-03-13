export type EntityId = string;

export interface Player {
  id: EntityId;
  x: number;
  y: number;
  color: string;
  size: number;
  name: string;
  roleId: EntityId | null;
  teamId: EntityId | null;
  isDead: boolean;
  tags: TagInstance[];
  imageUrl?: string;
}

export interface Role {
  id: EntityId;
  name: string;
  color: string;
  lives: number;
  isUnique: boolean;
  teamId: EntityId | null;
  tags: TagModel[];
  imageUrl?: string;
  seenAsRoleId?: EntityId | null;
  seenInTeamId?: EntityId | null;
  description?: string;
}

export interface MarkerParameter {
  id: EntityId;
  name: string;
  lives: number;
  points: number;
  votes: number;
  uses: number;
  callOrderDay: number | null;
  callOrderNight: number | null;
}

export interface Marker {
  id: EntityId;
  x: number;
  y: number;
  tag: TagInstance;
}

// Global Tag Model (from which instances are created)
export interface TagModel extends MarkerParameter {
  color: string;
  icon: string;
}

// Local Tag Instance (attached to a player or marker)
export interface TagInstance extends TagModel {
  instanceId: EntityId; // Unique ID for this instance
}

export interface Team {
  id: EntityId;
  name: string;
  icon: string;
  color: string;
}

export interface GameState {
  roomName: string;
  players: Player[];
  roles: Role[];
  markers: Marker[];
  markerParameters: MarkerParameter[];
  teams: Team[];
  tags: TagModel[]; // Added tags property here
  isNight: boolean;
  cycleNumber: number;
  walls: Wall[];
  activeLeftTab: 'players' | 'roles' | 'tags' | 'game';
  editingEntity: { type: 'player' | 'playerTemplate' | 'role' | 'tagModel' | 'tagInstance' | 'team', id: EntityId, parentId?: EntityId } | null;
  canvas: {
    panX: number;
    panY: number;
    zoom: number;
  };
  grid: {
    enabled: boolean;
    sizeX: number;
    sizeY: number;
  };
  room: {
    width: number;
    height: number;
    backgroundColor: string;
    texture: string;
  };
  displaySettings: {
    showTooltip: boolean;
    showRole: boolean;
    showTeam: boolean;
    showTags: boolean;
    showPlayers: boolean;
    showCenter: boolean;
    showCycleIcon: boolean;
    foregroundElement: 'players' | 'markers';
    showPlayerImage: boolean;
    showRoleImage: boolean;
    imagePriority: 'player' | 'role';
  };
}

export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}