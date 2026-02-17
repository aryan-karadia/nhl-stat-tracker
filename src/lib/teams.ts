import { TeamConfig } from "@/types/nhl";

/**
 * All 32 NHL teams with primary + alternate color palettes.
 * Logo URLs use the official NHL CDN.
 */
export const NHL_TEAMS: TeamConfig[] = [
  // ======================== ATLANTIC ========================
  {
    id: 1,
    name: "Boston Bruins",
    abbreviation: "BOS",
    city: "Boston",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/BOS_light.svg",
    colors: {
      regular: { primary: "#000000", secondary: "#FFB81C", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#FFB81C", secondary: "#000000", accent: "#FFD100", text: "#000000" },
    },
  },
  {
    id: 2,
    name: "Buffalo Sabres",
    abbreviation: "BUF",
    city: "Buffalo",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/BUF_light.svg",
    colors: {
      regular: { primary: "#003087", secondary: "#FFB81C", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#C8102E", secondary: "#000000", accent: "#8D9093", text: "#FFFFFF" },
    },
  },
  {
    id: 3,
    name: "Detroit Red Wings",
    abbreviation: "DET",
    city: "Detroit",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/DET_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#FFFFFF", accent: "#000000", text: "#FFFFFF" },
      alternate: { primary: "#FFFFFF", secondary: "#C8102E", accent: "#000000", text: "#C8102E" },
    },
  },
  {
    id: 4,
    name: "Florida Panthers",
    abbreviation: "FLA",
    city: "Sunrise",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/FLA_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#041E42", accent: "#B9975B", text: "#FFFFFF" },
      alternate: { primary: "#041E42", secondary: "#C8102E", accent: "#B9975B", text: "#FFFFFF" },
    },
  },
  {
    id: 5,
    name: "Montreal Canadiens",
    abbreviation: "MTL",
    city: "Montreal",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/MTL_light.svg",
    colors: {
      regular: { primary: "#A6192E", secondary: "#001E62", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#001E62", secondary: "#A6192E", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  {
    id: 6,
    name: "Ottawa Senators",
    abbreviation: "OTT",
    city: "Ottawa",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/OTT_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#000000", accent: "#B9975B", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#C8102E", accent: "#B9975B", text: "#FFFFFF" },
    },
  },
  {
    id: 7,
    name: "Tampa Bay Lightning",
    abbreviation: "TBL",
    city: "Tampa Bay",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/TBL_light.svg",
    colors: {
      regular: { primary: "#00205B", secondary: "#FFFFFF", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#00205B", accent: "#A2AAAD", text: "#FFFFFF" },
    },
  },
  {
    id: 8,
    name: "Toronto Maple Leafs",
    abbreviation: "TOR",
    city: "Toronto",
    division: "Atlantic",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/TOR_light.svg",
    colors: {
      regular: { primary: "#00205B", secondary: "#FFFFFF", accent: "#003087", text: "#FFFFFF" },
      alternate: { primary: "#046A38", secondary: "#00205B", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  // ===================== METROPOLITAN =====================
  {
    id: 9,
    name: "Carolina Hurricanes",
    abbreviation: "CAR",
    city: "Raleigh",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/CAR_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#000000", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#333F48", secondary: "#C8102E", accent: "#76232F", text: "#FFFFFF" },
    },
  },
  {
    id: 10,
    name: "Columbus Blue Jackets",
    abbreviation: "CBJ",
    city: "Columbus",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/CBJ_light.svg",
    colors: {
      regular: { primary: "#041E42", secondary: "#C8102E", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#DDCBA4", secondary: "#041E42", accent: "#C8102E", text: "#041E42" },
    },
  },
  {
    id: 11,
    name: "New Jersey Devils",
    abbreviation: "NJD",
    city: "Newark",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/NJD_light.svg",
    colors: {
      regular: { primary: "#CE1126", secondary: "#000000", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#CE1126", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  {
    id: 12,
    name: "New York Islanders",
    abbreviation: "NYI",
    city: "Elmont",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/NYI_light.svg",
    colors: {
      regular: { primary: "#003087", secondary: "#F26822", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#F26822", secondary: "#003087", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  {
    id: 13,
    name: "New York Rangers",
    abbreviation: "NYR",
    city: "New York",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/NYR_light.svg",
    colors: {
      regular: { primary: "#0032A0", secondary: "#C8102E", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#000043", secondary: "#0032A0", accent: "#C8102E", text: "#FFFFFF" },
    },
  },
  {
    id: 14,
    name: "Philadelphia Flyers",
    abbreviation: "PHI",
    city: "Philadelphia",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/PHI_light.svg",
    colors: {
      regular: { primary: "#F74902", secondary: "#000000", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#F74902", accent: "#FFFFFF", text: "#F74902" },
    },
  },
  {
    id: 15,
    name: "Pittsburgh Penguins",
    abbreviation: "PIT",
    city: "Pittsburgh",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/PIT_light.svg",
    colors: {
      regular: { primary: "#000000", secondary: "#FFB81C", accent: "#FFFFFF", text: "#FFB81C" },
      alternate: { primary: "#FFB81C", secondary: "#000000", accent: "#FFFFFF", text: "#000000" },
    },
  },
  {
    id: 16,
    name: "Washington Capitals",
    abbreviation: "WSH",
    city: "Washington",
    division: "Metropolitan",
    conference: "Eastern",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/WSH_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#041E42", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#041E42", secondary: "#C8102E", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  // ======================== CENTRAL ========================
  {
    id: 17,
    name: "Arizona Coyotes",
    abbreviation: "UTA",
    city: "Salt Lake City",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/UTA_light.svg",
    colors: {
      regular: { primary: "#010101", secondary: "#6CACE4", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#6CACE4", secondary: "#010101", accent: "#FFFFFF", text: "#000000" },
    },
  },
  {
    id: 18,
    name: "Chicago Blackhawks",
    abbreviation: "CHI",
    city: "Chicago",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/CHI_light.svg",
    colors: {
      regular: { primary: "#C8102E", secondary: "#000000", accent: "#FFD100", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#C8102E", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  {
    id: 19,
    name: "Colorado Avalanche",
    abbreviation: "COL",
    city: "Denver",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/COL_light.svg",
    colors: {
      regular: { primary: "#6F263D", secondary: "#236192", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#236192", secondary: "#6F263D", accent: "#000000", text: "#FFFFFF" },
    },
  },
  {
    id: 20,
    name: "Dallas Stars",
    abbreviation: "DAL",
    city: "Dallas",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/DAL_light.svg",
    colors: {
      regular: { primary: "#00843D", secondary: "#000000", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#44D62C", secondary: "#000000", accent: "#FFFFFF", text: "#000000" },
    },
  },
  {
    id: 21,
    name: "Minnesota Wild",
    abbreviation: "MIN",
    city: "Saint Paul",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/MIN_light.svg",
    colors: {
      regular: { primary: "#154734", secondary: "#A6192E", accent: "#EAAA00", text: "#FFFFFF" },
      alternate: { primary: "#DDCBA4", secondary: "#154734", accent: "#A6192E", text: "#154734" },
    },
  },
  {
    id: 22,
    name: "Nashville Predators",
    abbreviation: "NSH",
    city: "Nashville",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/NSH_light.svg",
    colors: {
      regular: { primary: "#FFB81C", secondary: "#041E42", accent: "#FFFFFF", text: "#041E42" },
      alternate: { primary: "#041E42", secondary: "#FFB81C", accent: "#FFFFFF", text: "#FFFFFF" },
    },
  },
  {
    id: 23,
    name: "St. Louis Blues",
    abbreviation: "STL",
    city: "St. Louis",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/STL_light.svg",
    colors: {
      regular: { primary: "#002F87", secondary: "#FFB81C", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#DDCBA4", secondary: "#002F87", accent: "#FFB81C", text: "#002F87" },
    },
  },
  {
    id: 24,
    name: "Winnipeg Jets",
    abbreviation: "WPG",
    city: "Winnipeg",
    division: "Central",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/WPG_light.svg",
    colors: {
      regular: { primary: "#004C97", secondary: "#A6192E", accent: "#A2AAAD", text: "#FFFFFF" },
      alternate: { primary: "#56B4F8", secondary: "#004C97", accent: "#FFFFFF", text: "#004C97" },
    },
  },
  // ======================== PACIFIC ========================
  {
    id: 25,
    name: "Anaheim Ducks",
    abbreviation: "ANA",
    city: "Anaheim",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/ANA_light.svg",
    colors: {
      regular: { primary: "#000000", secondary: "#CF4520", accent: "#B9975B", text: "#FFFFFF" },
      alternate: { primary: "#00685E", secondary: "#CF4520", accent: "#FFB81C", text: "#FFFFFF" },
    },
  },
  {
    id: 26,
    name: "Calgary Flames",
    abbreviation: "CGY",
    city: "Calgary",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/CGY_light.svg",
    colors: {
      regular: { primary: "#CE1126", secondary: "#F1BE48", accent: "#000000", text: "#FFFFFF" },
      // Blasty alternate — the retro horse head jersey
      alternate: { primary: "#000000", secondary: "#CE1126", accent: "#F1BE48", text: "#CE1126" },
    },
  },
  {
    id: 27,
    name: "Edmonton Oilers",
    abbreviation: "EDM",
    city: "Edmonton",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/EDM_light.svg",
    colors: {
      regular: { primary: "#00205B", secondary: "#FF4C00", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#041E42", secondary: "#FF4C00", accent: "#FFFFFF", text: "#FF4C00" },
    },
  },
  {
    id: 28,
    name: "Los Angeles Kings",
    abbreviation: "LAK",
    city: "Los Angeles",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/LAK_light.svg",
    colors: {
      regular: { primary: "#000000", secondary: "#A2AAAD", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#A2AAAD", secondary: "#000000", accent: "#FFFFFF", text: "#000000" },
    },
  },
  {
    id: 29,
    name: "San Jose Sharks",
    abbreviation: "SJS",
    city: "San Jose",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/SJS_light.svg",
    colors: {
      regular: { primary: "#006271", secondary: "#000000", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#000000", secondary: "#006271", accent: "#E57200", text: "#FFFFFF" },
    },
  },
  {
    id: 30,
    name: "Seattle Kraken",
    abbreviation: "SEA",
    city: "Seattle",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/SEA_light.svg",
    colors: {
      regular: { primary: "#041E42", secondary: "#9CDBD9", accent: "#6BA4B8", text: "#FFFFFF" },
      alternate: { primary: "#C8102E", secondary: "#041E42", accent: "#9CDBD9", text: "#FFFFFF" },
    },
  },
  {
    id: 31,
    name: "Vancouver Canucks",
    abbreviation: "VAN",
    city: "Vancouver",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/VAN_light.svg",
    colors: {
      regular: { primary: "#00205B", secondary: "#00843D", accent: "#FFFFFF", text: "#FFFFFF" },
      alternate: { primary: "#C8102E", secondary: "#FFD100", accent: "#000000", text: "#FFFFFF" },
    },
  },
  {
    id: 32,
    name: "Vegas Golden Knights",
    abbreviation: "VGK",
    city: "Las Vegas",
    division: "Pacific",
    conference: "Western",
    logoUrl: "https://assets.nhle.com/logos/nhl/svg/VGK_light.svg",
    colors: {
      regular: { primary: "#333F48", secondary: "#B9975B", accent: "#C8102E", text: "#FFFFFF" },
      alternate: { primary: "#B9975B", secondary: "#333F48", accent: "#C8102E", text: "#333F48" },
    },
  },
];

/** Lookup team by abbreviation */
export function getTeamByAbbrev(abbrev: string): TeamConfig | undefined {
  return NHL_TEAMS.find((t) => t.abbreviation === abbrev);
}

/** Get all teams grouped by division */
export function getTeamsByDivision(): Record<string, TeamConfig[]> {
  return NHL_TEAMS.reduce(
    (acc, team) => {
      if (!acc[team.division]) acc[team.division] = [];
      acc[team.division].push(team);
      return acc;
    },
    {} as Record<string, TeamConfig[]>
  );
}

/** Default team (Calgary Flames) */
export const DEFAULT_TEAM_ABBREV = "CGY";
