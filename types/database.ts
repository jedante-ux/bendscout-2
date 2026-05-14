export type GameCategory =
  | "knots"
  | "law"
  | "first_aid"
  | "nature"
  | "orientation"
  | "history";

export type GameDifficulty = "easy" | "medium" | "hard";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rank: number;
  xp: number;
  timezone: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  emblem: string | null;
  color: string | null;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  team_id: string;
  user_id: string;
  role: "owner" | "captain" | "member";
  joined_at: string;
}

export type AttemptKind = "practice" | "scoring";
export type SessionStatus = "in_progress" | "completed" | "abandoned";

export interface GameSession {
  id: string;
  user_id: string;
  team_id: string | null;
  game_key: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  score: number;
  duration_ms: number;
  meta: Record<string, unknown> | null;
  jamboree_id: string | null;
  attempt_kind: AttemptKind;
  attempt_no: 1 | 2;
  local_play_date: string | null;
  status: SessionStatus;
  created_at: string;
}

export interface Jamboree {
  id: string;
  slug: string;
  name: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyPlay {
  user_id: string;
  local_play_date: string;
  jamboree_id: string;
  game_key: string;
  team_id_snapshot: string | null;
  practice_done: boolean;
  practice_points: number;
  attempt_1_score: number | null;
  attempt_2_score: number | null;
  best_score: number;
  mvp_bonus: number;
  day_total: number;
  updated_at: string;
}

export interface JamboreeScore {
  jamboree_id: string;
  user_id: string;
  team_id: string | null;
  total_points: number;
  plays_count: number;
  last_played_at: string | null;
  updated_at: string;
}

export interface JamboreeTeamScore {
  jamboree_id: string;
  team_id: string;
  total_points: number;
  members_active: number;
  updated_at: string;
}

export type StartAttemptResult =
  | {
      blocked: false;
      sessionId: string;
      attemptKind: AttemptKind;
      attemptNo: 1 | 2;
      jamboreeId: string;
    }
  | {
      blocked: true;
      reason: "already_played_other_game" | "attempts_exhausted" | "unauthenticated";
      jamboreeId: string | null;
    };

export interface FinishAttemptResult {
  dayTotal: number;
  weeklyTotal: number;
  teamWeekly: number;
  attemptKind: AttemptKind;
  attemptNo: 1 | 2;
}
