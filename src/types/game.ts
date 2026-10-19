export type Complexity = 'light' | 'medium' | 'heavy';

export type GameCategory =
  | 'strategy'
  | 'party'
  | 'cooperative'
  | 'family'
  | 'thematic'
  | 'abstract'
  | 'deckbuilding';

export interface BoardGame {
  id: string;
  title: string;
  originalTitle: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers: string; // e.g. "3-4" or "4"
  minPlaytime: number; // minutes
  maxPlaytime: number; // minutes
  complexity: Complexity;
  category: GameCategory;
  age: number;
  rating: number; // e.g. 8.4
  imageUrl: string;
  mechanics: string[];
  tags: string[];
  ruleSummary?: string;
  bestForMood?: string;
  isPopular?: boolean;
  createdAt?: string;
}

export interface RecommendationPreferences {
  playerCount: number;
  exactPlayerCount: boolean;
  playtimePreference: 'quick' | 'medium' | 'long' | 'epic' | 'any'; // quick <=30, medium 30-60, long 60-120, epic 120+
  complexityPreference: Complexity | 'any';
  categories: GameCategory[];
  playerExperience: 'beginner' | 'casual' | 'geek' | 'any';
  interactionStyle: 'cooperative' | 'competitive' | 'friendly' | 'bluff' | 'any';
}

export interface MatchReason {
  type: 'player' | 'time' | 'genre' | 'complexity' | 'mood';
  label: string;
  positive: boolean;
}

export interface RecommendationResult {
  game: BoardGame;
  score: number; // 0 - 100
  matchPercentage: number;
  reasons: MatchReason[];
  isBestPlayerCount: boolean;
}

export interface UserFavorite {
  gameId: string;
  userId: string;
  savedAt: string;
}
