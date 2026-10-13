import type { CategoryInfo } from './types';

export const CATEGORIES_REGISTRY: CategoryInfo[] = [
  // === PARENT LEAGUE CATEGORIES ===
  {
    id: 'pba',
    slug: 'pba',
    name: 'Philippine Basketball Association (PBA)',
    sectionGroup: 'local-leagues',
    path: '/pba',
    description: 'The premier professional basketball league in the Philippines. In-depth game recaps, scores, standings, conference updates, trades, and PBA Draft coverage.',
    seoTitle: 'PBA News, Scores, Standings & Philippine Cup Updates | TipOffPh',
    seoDescription: 'Comprehensive PBA coverage: Philippine Cup, Commissioner’s Cup, Governors’ Cup, live scores, standings, and breaking trade rumors on TipOffPh.',
    badgeText: 'PBA',
    isCore: true,
    logoUrl: '/img/pba.png',
    childSlugs: ['pba-news', 'pba-philippine-cup', 'pba-commissioners-cup', 'pba-governors-cup', 'pba-draft', 'pba-all-star', 'pba-d-league', '3x3-basketball']
  },
  {
    id: 'nba',
    slug: 'nba',
    name: 'National Basketball Association (NBA)',
    sectionGroup: 'national-international',
    path: '/nba',
    description: 'Curated NBA coverage for Filipino fans: marquee game recaps, playoff brackets, standings, trade analysis, and standout performances.',
    seoTitle: 'NBA News, Scores, Standings & Game Recaps for Pinoy Fans | TipOffPh',
    seoDescription: 'Get the latest NBA news, live scores, trades, and playoff highlights tailored for Filipino basketball enthusiasts on TipOffPh.',
    badgeText: 'NBA',
    isCore: true,
    logoUrl: '/img/nba-logo.webp',
    childSlugs: ['nba-news']
  },
  {
    id: 'mpbl',
    slug: 'mpbl',
    name: 'Maharlika Pilipinas Basketball League (MPBL)',
    sectionGroup: 'local-leagues',
    path: '/mpbl',
    description: 'Grassroots and regional basketball drama across the North and South divisions. Live scores, standings, team rosters, and division finals.',
    seoTitle: 'MPBL Updates, Scores, Highlights & Standings | TipOffPh',
    seoDescription: 'Follow the Maharlika Pilipinas Basketball League with full division recaps, live scores, and standout homegrown performances on TipOffPh.',
    badgeText: 'MPBL',
    isCore: true,
    logoUrl: '/img/mpbl.png',
    childSlugs: ['mpbl-news']
  },
  {
    id: 'uaap',
    slug: 'uaap',
    name: 'UAAP Basketball',
    sectionGroup: 'collegiate-grassroots',
    path: '/uaap',
    description: 'University Athletic Association of the Philippines collegiate hoops: Men’s and Women’s basketball tournaments, Final Four showdowns, and awards.',
    seoTitle: 'UAAP Basketball News, Scores, Standings & Highlights | TipOffPh',
    seoDescription: 'Track UAAP Season basketball action, collegiate rivalries, Final Four brackets, and standout player profiles on TipOffPh.',
    badgeText: 'UAAP',
    isCore: true,
    logoUrl: '/img/uaap.webp',
    childSlugs: ['uaap-basketball']
  },
  {
    id: 'ncaa',
    slug: 'ncaa',
    name: 'NCAA Philippines Basketball',
    sectionGroup: 'collegiate-grassroots',
    path: '/ncaa',
    description: 'The oldest collegiate athletic league in the Philippines. Complete coverage of NCAA seniors basketball, team standings, and championship rivalries.',
    seoTitle: 'NCAA Philippines Basketball News, Scores & Standings | TipOffPh',
    seoDescription: 'Read the latest NCAA Philippines basketball news, game schedules, team rosters, and rivalry recaps on TipOffPh.',
    badgeText: 'NCAA',
    isCore: true,
    logoUrl: '/img/ncaa.png',
    childSlugs: ['ncaa-philippines']
  },
  {
    id: 'gilas',
    slug: 'gilas',
    name: 'Gilas Pilipinas',
    sectionGroup: 'national-international',
    path: '/gilas',
    description: 'The Philippine Men’s National Basketball Team: FIBA Asia Cup, World Cup qualifiers, Olympic Qualifying Tournaments, roster pools, and training updates.',
    seoTitle: 'Gilas Pilipinas News, Roster, Schedule & FIBA Updates | TipOffPh',
    seoDescription: 'Official coverage of Gilas Pilipinas, Tim Cone’s training pool, international tournament results, and FIBA world rankings on TipOffPh.',
    badgeText: 'Gilas',
    isCore: true,
    logoUrl: '/img/gilas-pilipinas.png',
    childSlugs: ['gilas-pilipinas']
  },
  {
    id: 'psl',
    slug: 'psl',
    name: 'Pilipinas Super League (PSL)',
    sectionGroup: 'local-leagues',
    path: '/psl',
    description: 'Pilipinas Super League game results, grassroots tournaments, regional championships, and rising Filipino talents across Luzon, Visayas, and Mindanao.',
    seoTitle: 'Pilipinas Super League (PSL) News, Scores & Updates | TipOffPh',
    seoDescription: 'Stay connected with Pilipinas Super League (PSL) national and regional tournament results, team rosters, and game recaps on TipOffPh.',
    badgeText: 'PSL',
    isCore: true,
    logoUrl: '/img/PSL_Logo.png',
    childSlugs: ['psl-news']
  },
  {
    id: 'd-league',
    slug: 'd-league',
    name: 'PBA D-League',
    sectionGroup: 'local-leagues',
    path: '/d-league',
    description: 'The PBA Developmental League: scouting the top amateur collegiate prospects and future PBA draft picks competing in the Aspirants’ Cup.',
    seoTitle: 'PBA D-League News, Scores & Draft Prospects | TipOffPh',
    seoDescription: 'Follow the PBA Developmental League with comprehensive game coverage, standout prospect evaluations, and championship results on TipOffPh.',
    badgeText: 'D-League',
    isCore: true,
    logoUrl: '/img/PBA_D-League_logo.png',
    childSlugs: ['pba-d-league']
  },
  {
    id: 'vismin',
    slug: 'vismin',
    name: 'Pilipinas VisMin Super Cup',
    sectionGroup: 'local-leagues',
    path: '/vismin',
    description: 'Premier professional basketball tournament across southern Philippines. High-intensity rivalry games, scores, and standings in Visayas and Mindanao.',
    seoTitle: 'Pilipinas VisMin Super Cup News & Standings | TipOffPh',
    seoDescription: 'Follow southern Philippine basketball with the Pilipinas VisMin Super Cup on TipOffPh: game recaps, highlights, and division standings.',
    badgeText: 'VisMin',
    isCore: true,
    logoUrl: '/img/vismin-cup.png',
    childSlugs: ['vismin-super-cup']
  },
  {
    id: 'nbl',
    slug: 'nbl',
    name: 'NBL Pilipinas',
    sectionGroup: 'local-leagues',
    path: '/nbl',
    description: 'Homegrown Filipino basketball action, community teams, and championship playoff brackets from the National Basketball League (Pilipinas).',
    seoTitle: 'NBL Pilipinas News, Scores & Standings | TipOffPh',
    seoDescription: 'Keep up with National Basketball League (NBL Pilipinas) tournaments, grassroots basketball, and homegrown standout athletes on TipOffPh.',
    badgeText: 'NBL',
    isCore: true,
    logoUrl: '/img/nbl.jpg',
    childSlugs: ['nbl-pilipinas']
  },
  {
    id: 'easl',
    slug: 'easl',
    name: 'East Asia Super League (EASL)',
    sectionGroup: 'national-international',
    path: '/easl',
    description: 'Pan-regional club basketball tournament bringing PBA powerhouse teams against champions from Japan B.League, Korea KBL, and Taiwan P.League+.',
    seoTitle: 'EASL East Asia Super League News & PBA Club Results | TipOffPh',
    seoDescription: 'Follow PBA teams in the East Asia Super League (EASL): game schedules, standings, group stage clashes, and Final Four action on TipOffPh.',
    badgeText: 'EASL',
    isCore: true,
    logoUrl: '/img/easl-logo.svg',
    childSlugs: ['easl-basketball']
  },
  {
    id: 'fiba',
    slug: 'fiba',
    name: 'FIBA Tournaments & Qualifiers',
    sectionGroup: 'national-international',
    path: '/fiba',
    description: 'International basketball championships, FIBA Asia Cup, World Cup Qualifiers, Olympic Qualifying Tournaments, and world rankings.',
    seoTitle: 'FIBA International Basketball News, Schedules & Standings | TipOffPh',
    seoDescription: 'Stay on top of FIBA international basketball tournaments, global qualification windows, and Gilas Pilipinas matchups on TipOffPh.',
    badgeText: 'FIBA',
    isCore: true,
    logoUrl: '/img/FIBA.webp',
    childSlugs: ['fiba-world-cup', 'fiba-oqt']
  },
  // Sub-Categories & Archives
  // Local Leagues
  {
    id: 'pba-news',
    slug: 'pba-news',
    name: 'PBA News',
    sectionGroup: 'local-leagues',
    path: '/pba-news',
    description: 'Comprehensive coverage of the Philippine Basketball Association, featuring game recaps, standings, team rosters, and conference updates.',
    seoTitle: 'PBA News, Scores & Updates | TipOffPh',
    seoDescription: 'Stay updated with the latest PBA news, scores, highlights, and team updates. TipOffPh delivers comprehensive Philippine Basketball Association coverage.',
    badgeText: 'PBA',
    isCore: true
  },
  {
    id: 'mpbl-news',
    slug: 'mpbl-news',
    name: 'MPBL News',
    sectionGroup: 'local-leagues',
    path: '/mpbl-news',
    description: 'Scores, highlights, and in-depth updates from the Maharlika Pilipinas Basketball League across North and South divisions.',
    seoTitle: 'MPBL Updates, Scores & Highlights | TipOffPh',
    seoDescription: 'Get the latest MPBL updates, game scores, and highlights. TipOffPh delivers in-depth coverage and breaking news of the Maharlika Pilipinas Basketball League.',
    badgeText: 'MPBL',
    isCore: true
  },
  {
    id: 'psl-news',
    slug: 'psl-news',
    name: 'PSL News',
    sectionGroup: 'local-leagues',
    path: '/psl-news',
    description: 'Pilipinas Super League game results, grassroots tournaments, regional rivalries, and rising Filipino talents.',
    seoTitle: 'Pilipinas Super League (PSL) News | TipOffPh',
    seoDescription: 'Catch all Pilipinas Super League (PSL) news, live scores, and team updates. Stay connected with local grassroots basketball action on TipOffPh.',
    badgeText: 'PSL'
  },
  {
    id: 'vismin-super-cup',
    slug: 'vismin-super-cup',
    name: 'VisMin Super Cup',
    sectionGroup: 'local-leagues',
    path: '/vismin-super-cup',
    description: 'Tournament updates, scores, and features from the premier professional basketball league in the Visayas and Mindanao regions.',
    seoTitle: 'Pilipinas VisMin Super Cup News | TipOffPh',
    seoDescription: 'Follow Pilipinas VisMin Super Cup news, highlights, and standings. TipOffPh is your trusted source for southern Philippine basketball updates.',
    badgeText: 'VisMin'
  },
  {
    id: 'nbl-pilipinas',
    slug: 'nbl-pilipinas',
    name: 'NBL Pilipinas',
    sectionGroup: 'local-leagues',
    path: '/nbl-pilipinas',
    description: 'Homegrown Filipino basketball action, championship results, and standings from the National Basketball League (Pilipinas).',
    seoTitle: 'NBL Pilipinas Updates & Scores | TipOffPh',
    seoDescription: 'Read the latest NBL Pilipinas updates, match results, and scores. TipOffPh brings you closer to homegrown National Basketball League action.',
    badgeText: 'NBL'
  },
  {
    id: 'pba-d-league',
    slug: 'pba-d-league',
    name: 'PBA D-League',
    sectionGroup: 'local-leagues',
    path: '/pba-d-league',
    description: 'Tracking developing collegiate standouts and aspiring professionals battling in the PBA Developmental League.',
    seoTitle: 'PBA D-League Updates, Scores & Highlights | TipOffPh',
    seoDescription: 'Read the latest PBA D-League updates, match results, and standout player highlights. Discover the future stars of Philippine basketball on TipOffPh.',
    badgeText: 'D-League'
  },
  {
    id: 'womens-basketball',
    slug: 'womens-basketball',
    name: "Women's Basketball",
    sectionGroup: 'local-leagues',
    path: '/womens-basketball',
    description: 'Spotlighting Gilas Pilipinas Women, the Women’s National Basketball League (WNBL), UAAP women’s hoops, and international tournaments.',
    seoTitle: "Women's Basketball News: Gilas Women & WNBL | TipOffPh",
    seoDescription: "Follow Philippine women's basketball news, featuring Gilas Women, WNBL, and collegiate leagues. Celebrate female hoopers on TipOffPh.",
    badgeText: "Women's Hoops"
  },

  // Collegiate & Grassroots
  {
    id: 'uaap-basketball',
    slug: 'uaap-basketball',
    name: 'UAAP Basketball',
    sectionGroup: 'collegiate-grassroots',
    path: '/uaap-basketball',
    description: 'In-depth coverage of UAAP men’s and women’s basketball, game schedules, statistical leaders, and Final Four battles.',
    seoTitle: 'UAAP Basketball News & Standings | TipOffPh',
    seoDescription: 'Get comprehensive UAAP basketball news, current standings, and game highlights. Follow your favorite collegiate basketball teams on TipOffPh.',
    badgeText: 'UAAP',
    isCore: true
  },
  {
    id: 'ncaa-philippines',
    slug: 'ncaa-philippines',
    name: 'NCAA Philippines',
    sectionGroup: 'collegiate-grassroots',
    path: '/ncaa-philippines',
    description: 'Complete coverage of the National Collegiate Athletic Association (NCAA Philippines) basketball tournament and campus rivalries.',
    seoTitle: 'NCAA Philippines Basketball News & Scores | TipOffPh',
    seoDescription: 'Catch the latest NCAA Philippines basketball news, standings, and game recaps. Follow your favorite collegiate teams and future stars on TipOffPh.',
    badgeText: 'NCAA',
    isCore: true
  },
  {
    id: 'high-school-hoops',
    slug: 'high-school-hoops',
    name: 'High School Hoops',
    sectionGroup: 'collegiate-grassroots',
    path: '/high-school-hoops',
    description: 'Scouting the next generation: UAAP Juniors, NCAA Juniors, NBTC National Finals, and elite high school standouts across the nation.',
    seoTitle: 'High School Basketball & NBTC Updates | TipOffPh',
    seoDescription: 'Track the next generation of players with high school basketball news, UAAP Juniors, NCAA Juniors, and NBTC tournament updates on TipOffPh.',
    badgeText: 'High School'
  },
  {
    id: 'camps-and-clinics',
    slug: 'camps-and-clinics',
    name: 'Camps & Clinics',
    sectionGroup: 'collegiate-grassroots',
    path: '/camps-and-clinics',
    description: 'Youth basketball training camps, coaching clinics, and grassroots skill development programs nationwide.',
    seoTitle: 'Basketball Camps, Clinics & Grassroots News | TipOffPh',
    seoDescription: 'Support grassroots development with news on local basketball camps and clinics. Find training schedules and youth programs across the Philippines on TipOffPh.',
    badgeText: 'Camps'
  },

  // National & International
  {
    id: 'gilas-pilipinas',
    slug: 'gilas-pilipinas',
    name: 'Gilas Pilipinas',
    sectionGroup: 'national-international',
    path: '/gilas-pilipinas',
    description: 'Official news, schedules, rosters, and match recaps for the Philippine Men’s National Basketball Team.',
    seoTitle: 'Gilas Pilipinas News, Schedule & Roster | TipOffPh',
    seoDescription: 'Stay updated with the latest Gilas Pilipinas news, game schedules, and roster updates. Support the Philippine national basketball team with TipOffPh.',
    badgeText: 'Gilas',
    isCore: true
  },
  {
    id: 'fiba-world-cup',
    slug: 'fiba-world-cup',
    name: 'FIBA World Cup',
    sectionGroup: 'national-international',
    path: '/fiba-world-cup',
    description: 'Global international basketball coverage, FIBA World Cup qualifiers, tournament brackets, and national team matchups.',
    seoTitle: 'FIBA Basketball World Cup News | TipOffPh',
    seoDescription: 'Stay on top of FIBA Basketball World Cup news, updates, and Gilas Pilipinas schedules. TipOffPh covers the grandest global stage of basketball.',
    badgeText: 'FIBA World Cup'
  },
  {
    id: 'fiba-oqt',
    slug: 'fiba-oqt',
    name: 'FIBA OQT',
    sectionGroup: 'national-international',
    path: '/fiba-oqt',
    description: 'FIBA Olympic Qualifying Tournaments news, bracket scenarios, game results, and Gilas Pilipinas Olympic roadmaps.',
    seoTitle: 'FIBA Olympic Qualifying Tournaments | TipOffPh',
    seoDescription: 'Follow the FIBA Olympic Qualifying Tournaments (OQT) news. Track Gilas Pilipinas and other top national teams battling for an Olympic spot with TipOffPh.',
    badgeText: 'FIBA OQT'
  },
  {
    id: 'easl-basketball',
    slug: 'easl-basketball',
    name: 'EASL Basketball',
    sectionGroup: 'national-international',
    path: '/easl-basketball',
    description: 'East Asia Super League club championship, featuring PBA teams clashing against top franchises from Japan, Korea, and Taiwan.',
    seoTitle: 'East Asia Super League (EASL) Updates | TipOffPh',
    seoDescription: 'Catch the latest East Asia Super League (EASL) updates. Follow your favorite Asian club teams and regional professional basketball action on TipOffPh.',
    badgeText: 'EASL'
  },
  {
    id: 'nba-news',
    slug: 'nba-news',
    name: 'NBA News',
    sectionGroup: 'national-international',
    path: '/nba-news',
    description: 'Curated NBA coverage for Filipino fans: marquee game recaps, playoff brackets, trade updates, and daily standout performances.',
    seoTitle: 'NBA News, Scores & Updates for Filipino Fans | TipOffPh',
    seoDescription: 'Get the latest NBA news, live scores, trades, and highlights tailored for Filipino basketball fans. Stay connected to global hoops action with TipOffPh.',
    badgeText: 'NBA',
    isCore: true
  },
  {
    id: 'overseas-filipino-players',
    slug: 'overseas-filipino-players',
    name: 'Overseas Filipino Players',
    sectionGroup: 'national-international',
    path: '/overseas-filipino-players',
    description: 'Tracking Filipino basketball exports playing in the Japan B.League, Korean Basketball League (KBL), Taiwan TPBL, and European leagues.',
    seoTitle: 'Filipino Basketball Players Overseas News | TipOffPh',
    seoDescription: 'Track the journeys of Filipino basketball players overseas. Get updates on local stars dominating the Japan B.League and Korean KBL on TipOffPh.',
    badgeText: 'Overseas Pinoys'
  },
  {
    id: 'fil-am-prospects',
    slug: 'fil-am-prospects',
    name: 'Fil-Am Prospects',
    sectionGroup: 'national-international',
    path: '/fil-am-prospects',
    description: 'Scouting Filipino-American and diaspora hoopers across US NCAA Division 1, high school showcases, and recruitment rankings.',
    seoTitle: 'Fil-Am Basketball Prospects & US NCAA News | TipOffPh',
    seoDescription: 'Discover the next generation of talent. Follow news on Fil-Am basketball prospects and Filipino athletes shining in the US NCAA with TipOffPh.',
    badgeText: 'Fil-Am Prospects'
  },

  // PBA & Tournament Coverage
  {
    id: 'pba-philippine-cup',
    slug: 'pba-philippine-cup',
    name: 'PBA Philippine Cup',
    sectionGroup: 'tournaments-events',
    path: '/pba-philippine-cup',
    description: 'All-Filipino conference coverage: the crown jewel of Philippine professional basketball with zero imports and maximum court pride.',
    seoTitle: 'PBA Philippine Cup News, Scores & Standings | TipOffPh',
    seoDescription: 'Catch every moment of the PBA Philippine Cup. Stay updated with all-Filipino game news, team standings, and exclusive recaps on TipOffPh.',
    badgeText: 'All-Filipino'
  },
  {
    id: 'pba-commissioners-cup',
    slug: 'pba-commissioners-cup',
    name: "PBA Commissioner's Cup",
    sectionGroup: 'tournaments-events',
    path: '/pba-commissioners-cup',
    description: 'Import evaluations, height limits, game recaps, and championship pursuits in the PBA Commissioner’s Cup conference.',
    seoTitle: "PBA Commissioner's Cup Updates & Import News | TipOffPh",
    seoDescription: "Follow PBA Commissioner's Cup action with real-time updates. Read about team imports, match results, and conference standings on TipOffPh.",
    badgeText: "Comm's Cup"
  },
  {
    id: 'pba-governors-cup',
    slug: 'pba-governors-cup',
    name: "PBA Governors' Cup",
    sectionGroup: 'tournaments-events',
    path: '/pba-governors-cup',
    description: 'High-scoring imports, clutch playoff battles, and season-ending drama in the PBA Governors’ Cup.',
    seoTitle: "PBA Governors' Cup News, Scores & Highlights | TipOffPh",
    seoDescription: "Experience the excitement of the PBA Governors' Cup. Get the latest news, import updates, game scores, and highlights on TipOffPh.",
    badgeText: "Govs' Cup"
  },
  {
    id: 'pba-draft',
    slug: 'pba-draft',
    name: 'PBA Draft',
    sectionGroup: 'tournaments-events',
    path: '/pba-draft',
    description: 'Mock drafts, combine measurements, draft board predictions, and rookie selection coverage for the annual PBA Rookie Draft.',
    seoTitle: 'PBA Draft News, Mock Drafts & Prospects | TipOffPh',
    seoDescription: 'Get the latest PBA Draft news, expert mock drafts, and top prospect analysis. Discover the next big star in Philippine basketball on TipOffPh.',
    badgeText: 'PBA Draft'
  },
  {
    id: 'pba-all-star',
    slug: 'pba-all-star',
    name: 'PBA All-Star',
    sectionGroup: 'tournaments-events',
    path: '/pba-all-star',
    description: 'Annual PBA All-Star Weekend festival: fan voting, 3-point shootout, slam dunk contest, and exhibition showdowns.',
    seoTitle: 'PBA All-Star Weekend News, Voting & Results | TipOffPh',
    seoDescription: 'Celebrate the brightest stars of the league. Get the latest PBA All-Star Weekend news, fan voting updates, and event highlights on TipOffPh.',
    badgeText: 'All-Star'
  },
  {
    id: '3x3-basketball',
    slug: '3x3-basketball',
    name: '3x3 Basketball',
    sectionGroup: 'tournaments-events',
    path: '/3x3-basketball',
    description: 'Half-court, 10-minute sprint hoops: PBA 3x3, FIBA 3x3 World Tour stops, and national 3x3 team rankings.',
    seoTitle: '3x3 Basketball News: PBA 3x3 & Chooks | TipOffPh',
    seoDescription: 'Follow fast-paced action with the latest 3x3 basketball news. Get updates on PBA 3x3, FIBA 3x3 tours, and national team quests on TipOffPh.',
    badgeText: '3x3'
  },

  // Media, Features & Tools
  {
    id: 'scores-and-schedules',
    slug: 'scores-and-schedules',
    name: 'Scores & Schedules',
    sectionGroup: 'media-features',
    path: '/scores-and-schedules',
    description: 'Daily calendar of games, live score updates, broadcast channels, and game venues across PBA, MPBL, UAAP, NCAA, and Gilas.',
    seoTitle: 'Philippine Basketball Game Scores & Schedules | TipOffPh',
    seoDescription: 'Find complete schedules and live scores for PBA, MPBL, UAAP, NCAA, and Gilas Pilipinas games. Never miss a local basketball matchup with TipOffPh.',
    badgeText: 'Scores',
    isCore: true
  },
  {
    id: 'rumors-and-trades',
    slug: 'rumors-and-trades',
    name: 'Rumors & Trades',
    sectionGroup: 'media-features',
    path: '/rumors-and-trades',
    description: 'Attributed transfer rumors, contract extension discussions, free agent signings, and trade committee approvals.',
    seoTitle: 'PBA & Local Hoops Trade Rumors and Signings | TipOffPh',
    seoDescription: 'Keep up with the latest Philippine basketball trade rumors, contract negotiations, and player signings verified by TipOffPh.',
    badgeText: 'Rumors'
  },
  {
    id: 'player-interviews',
    slug: 'player-interviews',
    name: 'Player Interviews',
    sectionGroup: 'media-features',
    path: '/player-interviews',
    description: 'Exclusive 1-on-1 conversations with PBA champions, college stars, coaching legends, and Gilas icons.',
    seoTitle: 'Basketball Player Interviews & Features | TipOffPh',
    seoDescription: 'Go beyond the court with exclusive basketball player interviews and feature stories. Get to know the stars of Philippine hoops on TipOffPh.',
    badgeText: 'Interviews'
  },
  {
    id: 'basketball-editorials',
    slug: 'basketball-editorials',
    name: 'Editorials',
    sectionGroup: 'media-features',
    path: '/basketball-editorials',
    description: 'Thoughtful columns, tactical breakdowns, debate essays, and editorial perspectives on the state of Philippine hoops.',
    seoTitle: 'Philippine Basketball Editorials & Analysis | TipOffPh',
    seoDescription: 'Read expert opinions, deep tactical analysis, and thought-provoking editorials on Philippine basketball on TipOffPh.',
    badgeText: 'Opinion'
  },
  {
    id: 'video-highlights',
    slug: 'video-highlights',
    name: 'Video Highlights',
    sectionGroup: 'media-features',
    path: '/video-highlights',
    description: 'Curated official highlights, game recaps, poster dunks, buzzer beaters, and top plays from local and international tournaments.',
    seoTitle: 'Philippine Basketball Video Highlights & Plays | TipOffPh',
    seoDescription: 'Watch curated Philippine basketball video highlights, epic plays, and official game recaps from the PBA, MPBL, and UAAP on TipOffPh.',
    badgeText: 'Highlights'
  },
  {
    id: 'podcasts',
    slug: 'podcasts',
    name: 'Podcasts',
    sectionGroup: 'media-features',
    path: '/podcasts',
    description: 'Audio episodes discussing weekly storylines, post-game analysis, trade chatter, and hoop history with guest analysts.',
    seoTitle: 'TipOffPh Podcasts: Philippine Basketball Talk | TipOffPh',
    seoDescription: 'Tune in to the TipOffPh Podcast for sharp Philippine basketball discussions. Listen to deep-dive analysis and insider talks on the go.',
    badgeText: 'Podcasts'
  },
  {
    id: 'sneakers-and-gear',
    slug: 'sneakers-and-gear',
    name: 'Sneakers & Gear',
    sectionGroup: 'media-features',
    path: '/sneakers-and-gear',
    description: 'Basketball performance footwear reviews, signature sneaker releases, on-court kicks checks, and local sneaker culture.',
    seoTitle: 'Basketball Sneakers, Gear Reviews & News | TipOffPh',
    seoDescription: 'Step up your game with basketball sneakers and gear reviews. Find the best performance shoes and signature apparel releases on TipOffPh.',
    badgeText: 'Kicks'
  },
  {
    id: 'fantasy-basketball',
    slug: 'fantasy-basketball',
    name: 'Fantasy Basketball',
    sectionGroup: 'media-features',
    path: '/fantasy-basketball',
    description: 'Fantasy basketball advice, statistical projections, waiver wire pickups, and category strategy for hoops managers.',
    seoTitle: 'Fantasy Basketball Advice, Rankings & Tips | TipOffPh',
    seoDescription: 'Dominate your fantasy league with expert basketball advice, sleeper picks, weekly schedules, and waiver wire recommendations on TipOffPh.',
    badgeText: 'Fantasy'
  },
  {
    id: 'coaching-news',
    slug: 'coaching-news',
    name: 'Coaching News',
    sectionGroup: 'media-features',
    path: '/coaching-news',
    description: 'Head coach appointments, bench staff changes, tactical philosophy shifts, and playbook analysis.',
    seoTitle: 'Basketball Coaching Changes & Staff Updates | TipOffPh',
    seoDescription: 'Stay informed on Philippine basketball coaching changes and staff updates. Track head coach movements across PBA, UAAP, NCAA, and MPBL.',
    badgeText: 'Coaching'
  },
  {
    id: 'retro-basketball',
    slug: 'retro-basketball',
    name: 'Retro Basketball',
    sectionGroup: 'media-features',
    path: '/retro-basketball',
    description: 'Classic PBA dynasties, legendary rivalries (Crispa vs Toyota, Ginebra vs Shell), and historical milestones of Philippine basketball.',
    seoTitle: 'Retro PBA & Philippine Basketball History | TipOffPh',
    seoDescription: 'Take a trip down memory lane with retro PBA highlights and Philippine basketball history. Relive classic games and legendary rivalries with TipOffPh.',
    badgeText: 'Retro'
  },

  // Corporate & Publication
  {
    id: 'about-us',
    slug: 'about-us',
    name: 'About Us',
    sectionGroup: 'corporate',
    path: '/about-us',
    description: 'Learn about TipOffPh: an independent, digitally native Philippine basketball publication created for passionate fans.',
    seoTitle: 'About TipOffPh | Philippine Basketball News Portal',
    seoDescription: 'Learn more about TipOffPh, the independent publication dedicated to delivering accurate and timely Philippine basketball reporting and analysis.',
    badgeText: 'About'
  },
  {
    id: 'contact',
    slug: 'contact',
    name: 'Contact Us',
    sectionGroup: 'corporate',
    path: '/contact',
    description: 'Get in touch with the TipOffPh editorial room for press releases, inquiries, corrections, and partnership opportunities.',
    seoTitle: 'Contact TipOffPh | Get in Touch With Our Team',
    seoDescription: 'Have a news scoop, partnership inquiry, or press release? Contact the TipOffPh editorial team today.',
    badgeText: 'Contact'
  },
  {
    id: 'write-for-us',
    slug: 'write-for-us',
    name: 'Write for Us',
    sectionGroup: 'corporate',
    path: '/write-for-us',
    description: 'Join the TipOffPh contributor network. We are seeking passionate sports journalists, analysts, and beat writers across the Philippines.',
    seoTitle: 'Write for Us | Become a TipOffPh Contributor',
    seoDescription: 'Passionate about Philippine hoops? Write for TipOffPh. Submit your sports journalism portfolio and contribute to our growing platform.',
    badgeText: 'Contribute'
  }
];

export const PARENT_CATEGORY_ALIASES: Record<string, string[]> = {
  pba: ['pba', 'pba-news', 'pba-philippine-cup', 'pba-commissioners-cup', 'pba-governors-cup', 'pba-draft', 'pba-all-star', 'pba-d-league', '3x3-basketball'],
  nba: ['nba', 'nba-news'],
  mpbl: ['mpbl', 'mpbl-news'],
  uaap: ['uaap', 'uaap-basketball'],
  ncaa: ['ncaa', 'ncaa-philippines'],
  gilas: ['gilas', 'gilas-pilipinas'],
  'gilas-pilipinas': ['gilas', 'gilas-pilipinas'],
  psl: ['psl', 'psl-news'],
  'd-league': ['d-league', 'pba-d-league'],
  'pba-d-league': ['d-league', 'pba-d-league'],
  vismin: ['vismin', 'vismin-super-cup'],
  'vismin-super-cup': ['vismin', 'vismin-super-cup'],
  nbl: ['nbl', 'nbl-pilipinas'],
  'nbl-pilipinas': ['nbl', 'nbl-pilipinas'],
  easl: ['easl', 'easl-basketball'],
  'easl-basketball': ['easl', 'easl-basketball'],
  fiba: ['fiba', 'fiba-world-cup', 'fiba-oqt'],
  'fiba-world-cup': ['fiba', 'fiba-world-cup', 'fiba-oqt']
};

export const CATEGORY_MAP = new Map<string, CategoryInfo>(
  CATEGORIES_REGISTRY.map(c => [c.slug, c])
);

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  if (CATEGORY_MAP.has(slug)) {
    return CATEGORY_MAP.get(slug);
  }
  for (const [parent, aliases] of Object.entries(PARENT_CATEGORY_ALIASES)) {
    if (aliases.includes(slug) && CATEGORY_MAP.has(parent)) {
      return CATEGORY_MAP.get(parent);
    }
  }
  return undefined;
}

export const NAVIGATION_GROUPS = [
  {
    title: 'Local Leagues',
    items: [
      { name: 'PBA', slug: 'pba-news' },
      { name: 'MPBL', slug: 'mpbl-news' },
      { name: 'PSL', slug: 'psl-news' },
      { name: 'VisMin Super Cup', slug: 'vismin-super-cup' },
      { name: 'NBL Pilipinas', slug: 'nbl-pilipinas' },
      { name: 'PBA D-League', slug: 'pba-d-league' },
      { name: "Women's Basketball", slug: 'womens-basketball' }
    ]
  },
  {
    title: 'Collegiate & Grassroots',
    items: [
      { name: 'UAAP Basketball', slug: 'uaap-basketball' },
      { name: 'NCAA Philippines', slug: 'ncaa-philippines' },
      { name: 'High School Hoops', slug: 'high-school-hoops' },
      { name: 'Camps & Clinics', slug: 'camps-and-clinics' }
    ]
  },
  {
    title: 'National & Global Pinoys',
    items: [
      { name: 'Gilas Pilipinas', slug: 'gilas-pilipinas' },
      { name: 'FIBA World Cup', slug: 'fiba-world-cup' },
      { name: 'FIBA OQT', slug: 'fiba-oqt' },
      { name: 'EASL Super League', slug: 'easl-basketball' },
      { name: 'Overseas Filipinos', slug: 'overseas-filipino-players' },
      { name: 'Fil-Am Prospects', slug: 'fil-am-prospects' }
    ]
  },
  {
    title: 'Tournaments & Events',
    items: [
      { name: 'PBA Philippine Cup', slug: 'pba-philippine-cup' },
      { name: "PBA Comm's Cup", slug: 'pba-commissioners-cup' },
      { name: "PBA Govs' Cup", slug: 'pba-governors-cup' },
      { name: 'PBA Draft', slug: 'pba-draft' },
      { name: 'PBA All-Star', slug: 'pba-all-star' },
      { name: '3x3 Basketball', slug: '3x3-basketball' }
    ]
  },
  {
    title: 'Media, Features & Tools',
    items: [
      { name: 'Scores & Schedules', slug: 'scores-and-schedules' },
      { name: 'Rumors & Trades', slug: 'rumors-and-trades' },
      { name: 'Player Interviews', slug: 'player-interviews' },
      { name: 'Editorials', slug: 'basketball-editorials' },
      { name: 'Video Highlights', slug: 'video-highlights' },
      { name: 'Podcasts', slug: 'podcasts' },
      { name: 'Sneakers & Gear', slug: 'sneakers-and-gear' },
      { name: 'Fantasy Basketball', slug: 'fantasy-basketball' },
      { name: 'Coaching News', slug: 'coaching-news' },
      { name: 'Retro Hoops', slug: 'retro-basketball' }
    ]
  }
];
