import test from 'ava';
import fetchMock from 'fetch-mock';

import { SRComp } from './srcomp';
import { MatchType } from './types';

test.afterEach(() => {
  fetchMock.restore();
});

test('srcomp.getMatches', async (t) => {
  const rawData = {
    last_scored: 160,
    matches: [
      {
        arena: 'Simulator',
        display_name: 'Final (#160)',
        num: 160,
        scores: {
          game: { HRS3: 8, SPA: 36 },
          normalised: { HRS3: 2, SPA: 4 },
          ranking: { HRS3: 2, SPA: 1 },
        },
        teams: ['SPA', 'HRS3'],
        times: {
          game: {
            end: '2021-05-01T13:33:00+01:00',
            start: '2021-05-01T13:31:00+01:00',
          },
          slot: {
            end: '2021-05-01T13:33:30+01:00',
            start: '2021-05-01T13:30:00+01:00',
          },
          staging: {
            closes: '2021-05-01T13:29:00+01:00',
            opens: '2021-05-01T13:26:00+01:00',
            signal_shepherds: { Shepherd: '2021-05-01T13:28:00+01:00' },
            signal_teams: '2021-05-01T13:28:00+01:00',
          },
        },
        type: 'knockout',
      },
    ],
  };

  fetchMock.mock(
    'https://studentrobotics.org/comp-api/matches',
    JSON.stringify(rawData)
  );

  const expected = [
    {
      arena: 'Simulator',
      display_name: 'Final (#160)',
      num: 160,
      scores: {
        game: { HRS3: 8, SPA: 36 },
        normalised: { HRS3: 2, SPA: 4 },
        ranking: { HRS3: 2, SPA: 1 },
      },
      teams: ['SPA', 'HRS3'],
      times: {
        game: {
          end: new Date('2021-05-01T13:33:00+01:00'),
          start: new Date('2021-05-01T13:31:00+01:00'),
        },
        slot: {
          end: new Date('2021-05-01T13:33:30+01:00'),
          start: new Date('2021-05-01T13:30:00+01:00'),
        },
        staging: {
          closes: new Date('2021-05-01T13:29:00+01:00'),
          opens: new Date('2021-05-01T13:26:00+01:00'),
          signal_shepherds: { Shepherd: new Date('2021-05-01T13:28:00+01:00') },
          signal_teams: new Date('2021-05-01T13:28:00+01:00'),
        },
      },
      type: MatchType.Knockout,
    },
  ];

  const srcomp = new SRComp('https://studentrobotics.org/comp-api');
  const matches = await srcomp.getMatches();

  t.deepEqual(expected, matches);
});

test('srcomp.getTeams', async (t) => {
  const teamData = {
    name: 'SR House Robot',
    tla: 'SRZ',
    league_pos: 13,
    location: {
      name: 'the-venue',
      get: '/comp-api/locations/the-venue',
    },
    scores: {
      game: 6,
      league: 7,
    },
    get: '/comp-api/teams/SRZ',
  };
  const teamsData = { SRZ: teamData };

  fetchMock.mock(
    'https://studentrobotics.org/comp-api/teams',
    JSON.stringify({ teams: teamsData })
  );

  const srcomp = new SRComp('https://studentrobotics.org/comp-api');
  const teams = await srcomp.getTeams();

  t.deepEqual(teamsData, teams);
});
