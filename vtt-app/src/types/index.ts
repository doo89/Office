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
  isSelectableForDistribution?: boolean;
  distributionQuantity?: number;
}

export interface TagCategory {
  id: EntityId;
  name: string;
  icon: string;
  color: string;
}

export interface MarkerParameter {
  id: EntityId;
  name: string;
  lives: number | null;
  points: number | null;
  votes: number | null;
  uses: number | null;
  autoDeleteOnZeroUses?: boolean;
  description?: string;
  callOrderDay: number | null;
  callOrderNight: number | null;
  showInTooltip?: boolean;
  showInGameTab?: boolean;
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
  imageUrl?: string;
  categoryId?: EntityId | null;
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

export type BadgeType = 'none' | 'team' | 'lives' | 'votes' | 'points' | 'uses' | 'callOrderDay' | 'callOrderNight';

export interface BadgeConfig {
  type: BadgeType;
  bgColor: string;
  textColor: string;
}

export interface Handout {
  id: EntityId;
  name: string;
  imageUrl: string;
  isOpen: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized?: boolean;
}

export interface GameState {
  roomName: string;
  selectedEntityIds: EntityId[];
  interactionMode: 'pan' | 'select';
  players: Player[];
  roles: Role[];
  markers: Marker[];
  markerParameters: MarkerParameter[];
  teams: Team[];
  tags: TagModel[]; // Added tags property here
  tagCategories: TagCategory[];
  handouts: Handout[];
  recentColors: string[];
  isNight: boolean;
  cycleNumber: number;
  activeLeftTab: 'players' | 'roles' | 'tags' | 'game' | 'handouts';
  editingEntity: { type: 'player' | 'playerTemplate' | 'role' | 'tagModel' | 'tagInstance' | 'team' | 'tagCategory', id: EntityId, parentId?: EntityId } | null;
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
  circleGrid: {
    enabled: boolean;
    centerX: number;
    centerY: number;
    radius: number;
    points: number;
    drawingState: 'idle' | 'center' | 'radius';
  };
  room: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImage: string | null;
    backgroundStyle: 'mosaic' | 'center' | 'stretch';
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
    playerNamePosition: 'inside' | 'bottom';
    playerBadges: {
      topLeft: BadgeConfig;
      topRight: BadgeConfig;
      bottomLeft: BadgeConfig;
      bottomRight: BadgeConfig;
    };
  };
}