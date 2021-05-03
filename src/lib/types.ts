// A colour expressed as a CSS compatible string.
export type CSSColour = string;

export type UrlPath = string;

// The canonical identifier of an arena.
export type ArenaName = string;

export interface Arena {
  // The canonical identifier of the arena.
  name: ArenaName;

  // The display name of the arena.
  display_name: string;

  // The colour of the arena, expressed as a CSS compatible string.
  colour: CSSColour;

  // Url to fetch this information.
  get: UrlPath;
}

// The canonical identifier of a corner, a non-negative integer. This is only
// unique within an arena.
export type CornerNumber = number;

// A starting zone within the arena. It is assumed that all arenas are of the
// same design.
export interface Corner {
  // The canonical identifier of a corner, a non-negative integer. This is only
  // unique within an arena.
  number: CornerNumber;

  // The colour of the starting zone, expressed as a CSS compatible string.
  colour: CSSColour;

  // Url to fetch this information.
  get: UrlPath;
}

// The canonical identifier of a team
export type TLA = string;

// The canonical identifier of location.
export type LocationName = string;

// The name of the Shepherd. Usually a role name rather than a person's name.
export type ShepherdName = string;

// An area within the venue assigned to a Shepherd.
export interface Location {
  // The display name of the location.
  display_name: string;

  // The TLAs of teams which are in this venue location.
  teams: Array<TLA>;

  shepherds: {
    // The name of the Shepherd. Usually a role name rather than a person's name.
    name: ShepherdName;

    // The colour of the location, expressed as a CSS compatible string.
    colour: CSSColour;
  };

  // Url to fetch this information.
  get: UrlPath;
}

// A team of competitors.
export interface Team {
  // The name of the team. This will not include the TLA, though in many
  // contexts clients may with to prefix the name with the tla as "TLA: Name".
  name: string;

  // The TLA of the team is its canonical identifier.
  tla: TLA;

  // The team's league position. Tied teams with have the same position value.
  league_pos: Ranking;

  // The team's location within the arena.
  location: {
    name: LocationName;
    // Url to fetch information about this location.
    get: UrlPath;
  };

  // The league points earned by the team.
  scores: {
    // The game points earned by the team in their league matches.
    game: GamePoints;

    // The league points earned by the team in their league matches.
    league: RankPoints;
  };

  // Url to fetch this information.
  get: UrlPath;
}

export enum MatchType {
  League = 'league',
  Knockout = 'knockout',
  Tiebreaker = 'tiebreaker',
}

export type MatchNumber = number;

// A match between teams.
export interface Match {
  // The name of the arena in which this match will be played. This forms part
  // of the canonical identifier of the match, in combination with the number.
  arena: string;
  // The number of this match. This forms part of the canonical identifier of
  // the match, in combination with the arena.
  num: MatchNumber;

  // The display name of the match. This is usually something like "Match 42",
  // however it accounts for things like "Quarter 3" and "Final".
  display_name: string;

  // The teams which will appear in this match. This will always contain as many
  // entries as there are corners, with null values representing empty corners.
  teams: Array<TLA | null>;

  // Timing information about the match. This already includes any delays or
  // other timing adjustments.
  times: {
    // The time that this match will be underway in the arena.
    game: {
      end: Date;
      start: Date;
    };
    // The slot allocated for running this match. These are the times when the
    // match will be present in the arena, but does not imply that the game is
    // underway.
    slot: {
      end: Date;
      start: Date;
    };

    // Timing information for preparing teams for their match.
    staging: {
      // The time at which staging for this match opens. This is the earliest
      // time a team can present themselves for a match.
      opens: Date;
      // The time at which staging for this match closes. This is the latest
      // time a team can present themselves for a match.
      closes: Date;

      // The time at which teams should be signalled that they should go to the
      // staging area.
      signal_teams: Date;

      // The time at which shepherds should be signalled that they should start
      // looking for teams.
      signal_shepherds: Record<ShepherdName, Date>;
    };
  };

  // The type of match.
  type: MatchType;
}

// The points earned by each team according to the rules of the game being
// played.
export type GamePoints = number;

// The normalisation of the points earned from a match, potentially contributing
// towards the team's position within the league. This will be a non-negative
// integer.
export type RankPoints = number;

// A ranked position, within either a single match or the league as a whole.
// This will be a strictly positive integer.
export type Ranking = number;

// The scores from a league match. The TLAs within each mapping are guaranteed
// to be the same.
export interface LeagueScores {
  // The points earned by each team according to the rules of the game being
  // played.
  game: Record<TLA, GamePoints>;

  // The normalisation of the points earned from this match contributing towards
  // the team's position within the league.
  league: Record<TLA, RankPoints>;

  // The ranking of teams within this match.
  ranking: Record<TLA, Ranking>;
}

// The scores from a knockout match (including a tiebreaker). The TLAs within
// each mapping are guaranteed to be the same.
export interface KnockoutScores {
  // The points earned by each team according to the rules of the game being
  // played.
  game: Record<TLA, GamePoints>;

  // The normalisation of the points earned from this match.
  normalised: Record<TLA, RankPoints>;

  // The ranking of teams within this match.
  ranking: Record<TLA, Ranking>;
}

// A match which has been played and scored.
export interface ScoredMatch extends Match {
  scores: LeagueScores | KnockoutScores;
}

// The result of an API query for matches.
export interface Matches {
  // The most recently scored match number.
  last_scored: MatchNumber;

  // The matches matching the query.
  matches: Array<Match>;
}

// A single session of matches
export interface Period {
  // The type of matches which would be played within this period.
  type: MatchType;

  // A description of the period for humans.
  description: string;

  // The start time of the period. This is the earliest that a match slot within
  // the period can start.
  start_time: Date;
  // The expected end time of the period. This is the latest that a match slot
  // within the period would be scheduled to start (before any delays are
  // applied).
  end_time: Date;
  // The latest end time of the period. This is the latest that a match slot
  // within the period can start.
  max_end_time: Date;

  // Summary of the matches within this period.
  matches: {
    first_num: MatchNumber;
    last_num: MatchNumber;
  };
}

// The current state of the competition
export interface Current {
  // The amount of delay relative to the original schedule. This value is
  // intended for informational purposes and clients should never use this value
  // for computation.
  delay: number;

  // The matches which are currently being played, as measured by the current
  // time falling between the start and end of their slot. This does not imply
  // that the game is actually underway.
  matches: Array<Match>;

  // The matches which are currently being staged (i.e: getting ready or moving
  // into the arena), as measured by the current time falling between the open
  // and close values of their staging times.
  staging_matches: Array<Match>;

  // The matches for which the teams are being shepherded into staging area, as
  // measured by the current time falling between the earliest shepherding
  // signal value and time when staging closes.
  shepherding_matches: Array<Match>;

  // The canonical current time.
  time: Date;
}
