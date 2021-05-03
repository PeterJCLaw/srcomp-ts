import {
  Arena,
  ArenaName,
  Corner,
  CornerNumber,
  Current,
  Location,
  LocationName,
  Match,
  MatchNumber,
  Period,
  ShepherdName,
  Team,
  TLA,
} from './types';

export class SRComp {
  private readonly api_root: string;

  constructor(api_root: string) {
    this.api_root = api_root;
  }

  private buildUrl(
    endpoint: string,
    query: URLSearchParams | null = null
  ): string {
    const queryString = query !== null ? '?' + query.toString() : '';
    return this.api_root + endpoint + queryString;
  }

  private fetch<T>(
    endpoint: string,
    query: URLSearchParams | null = null
  ): Promise<T> {
    return fetch(this.buildUrl(endpoint, query)).then(
      (response: Response) => response.json() as Promise<T>
    );
  }

  // We don't actually get `Date`s back from the API, however it's easier to
  // pretend that we do and then convert them here.
  private processMatch(match: Match): Match {
    function addDates(
      times: Record<ShepherdName, Date>
    ): Record<ShepherdName, Date> {
      const withDates: Record<ShepherdName, Date> = {};
      for (const shepherd in times) {
        withDates[shepherd] = new Date(times[shepherd]);
      }
      return withDates;
    }

    const {
      times: { game, slot, staging },
      ...rest
    } = match;

    return {
      times: {
        game: {
          start: new Date(game.start),
          end: new Date(game.end),
        },
        slot: {
          start: new Date(slot.start),
          end: new Date(slot.end),
        },
        staging: {
          opens: new Date(staging.opens),
          closes: new Date(staging.closes),
          signal_teams: new Date(staging.signal_teams),
          signal_shepherds: addDates(staging.signal_shepherds),
        },
      },
      ...rest,
    };
  }

  public getArenas(): Promise<Record<ArenaName, Arena>> {
    return this.fetch<{ arenas: Record<ArenaName, Arena> }>('/arenas').then(
      (x) => x.arenas
    );
  }

  public getCorners(): Promise<Record<CornerNumber, Corner>> {
    return this.fetch<{ corners: Record<CornerNumber, Corner> }>(
      '/corners'
    ).then((x) => x.corners);
  }

  public getCurrent(): Promise<Current> {
    return this.fetch<{ current: Current }>('/current').then((x) => {
      const {
        matches,
        staging_matches,
        shepherding_matches,
        time,
        ...rest
      } = x.current;
      return {
        matches: matches.map(this.processMatch),
        staging_matches: staging_matches.map(this.processMatch),
        shepherding_matches: shepherding_matches.map(this.processMatch),
        time: new Date(time),
        ...rest,
      };
    });
  }

  public getLocations(): Promise<Record<LocationName, Location>> {
    return this.fetch<{ locations: Record<LocationName, Location> }>(
      '/locations'
    ).then((x) => x.locations);
  }

  public getKnockouts(): Promise<Array<Array<Match>>> {
    return this.fetch<{ rounds: Array<Array<Match>> }>('/knockout').then((x) =>
      x.rounds.map((matches) => matches.map(this.processMatch))
    );
  }

  public getLastScoredMatch(): Promise<MatchNumber> {
    return this.fetch<{ last_scored_match: MatchNumber }>(
      '/matches/last_scored_match'
    ).then((x) => x.last_scored_match);
  }

  public getMatches(): Promise<Array<Match>> {
    // TODO: support filtering the returned list of matches.
    return this.fetch<{ matches: Array<Match> }>('/matches').then((x) =>
      x.matches.map(this.processMatch)
    );
  }

  public getPeriods(): Promise<Array<Period>> {
    return this.fetch<{ periods: Array<Period> }>('/periods').then((x) =>
      x.periods.map(({ start_time, end_time, max_end_time, ...rest }) => ({
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        max_end_time: new Date(max_end_time),
        ...rest,
      }))
    );
  }

  public getState(): Promise<string> {
    return this.fetch<{ state: string }>('/state').then((x) => x.state);
  }

  public getTeams(): Promise<Record<TLA, Team>> {
    return this.fetch<{ teams: Record<TLA, Team> }>('/teams').then(
      (x) => x.teams
    );
  }

  public getTiebreaker(): Promise<Match> {
    return this.fetch<{ tiebreaker: Match }>('/tiebreaker').then((x) =>
      this.processMatch(x.tiebreaker)
    );
  }
}
