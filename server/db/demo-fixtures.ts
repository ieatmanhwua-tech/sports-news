import type { Article, Author, GameScore } from '../../shared/types';
import { CATEGORIES_REGISTRY } from '../../shared/categories';
import { NBA_PRESEASON_PREDICTIONS_TOMORROW, NBA_PRESEASON_PREDICTIONS_FIVE_GAME_SLATE } from '../../shared/nba-predictions';
import { getCurrentManilaDateParts } from '../../shared/ph-date';

const _fixtureManilaDate = getCurrentManilaDateParts();
const _anchorMs = _fixtureManilaDate.verifiedPublishAnchorMs;
const _isoMinutesAgo = (mins: number) => new Date(_anchorMs - mins * 60 * 1000).toISOString();

export const DEMO_AUTHORS: Author[] = [
  {
    id: 'author-joaquin-santos',
    slug: 'joaquin-santos',
    name: 'Joaquin Santos',
    role: 'Senior PBA & Trade Beat Reporter',
    bio: 'Joaquin has covered Philippine professional basketball for over a decade, reporting from the sidelines of the Araneta Coliseum and MOA Arena.',
    email: 'joaquin.santos@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@JoaquinSantosPH'
  },
  {
    id: 'author-maria-reyes',
    slug: 'maria-reyes',
    name: 'Maria Reyes',
    role: 'Collegiate & Gilas Pilipinas Correspondent',
    bio: 'Former collegiate varsity athlete turned sports investigative writer. Maria specializes in UAAP, NCAA, and international FIBA tournament cycles.',
    email: 'maria.reyes@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@MariaReyesHoops'
  },
  {
    id: 'author-carlo-mendoza',
    slug: 'carlo-mendoza',
    name: 'Carlo Mendoza',
    role: 'Grassroots, MPBL & Regional Hoops Analyst',
    bio: 'Carlo travels across Luzon, Visayas, and Mindanao capturing the heartbeat of regional basketball leagues and grassroots prospects.',
    email: 'carlo.mendoza@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@CarloMendozaPH'
  },
  {
    id: 'author-rafael-dizon',
    slug: 'rafael-dizon',
    name: 'Rafael Dizon',
    role: 'Tactical Analyst & Columnist',
    bio: 'Rafael breaks down half-court sets, pick-and-roll defensive schemes, and advanced metrics across local and international competitions.',
    email: 'rafael.dizon@tipoffph.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    twitterHandle: '@CoachRafDizon'
  }
];

export const DEMO_ARTICLES: Article[] = [
  {
    "id": "art-pba-001",
    "slug": "pba-governors-cup-2026-tnt-clinches-quarterfinals-ginebra-meralco-race",
    "title": "PBA Governors' Cup 2026: TNT Tropang Giga Clinches Top Seed as Ginebra and Meralco Clash in High-Stakes Playoff Race",
    "excerpt": "Rondae Hollis-Jefferson powers TNT Tropang Giga to the Group A summit with a 6-4 record, while Barangay Ginebra and Meralco Bolts face must-win pressure in a dramatic race for the quarterfinals.",
    "body": "QUEZON CITY — The 2026 PBA Governors' Cup playoff picture reached fever pitch this Tuesday at the Smart Araneta Coliseum as reigning champions TNT Tropang Giga officially cemented the top seed in Group A, while traditional powerhouse Barangay Ginebra San Miguel and the Meralco Bolts find themselves locked in an agonizing do-or-die scramble for the remaining quarterfinal tickets.\n\nRondae Hollis-Jefferson once again proved why he remains the premier import in Philippine basketball. Returning to full conditioning following a minor leg contusion, the former NBA forward stuffed the stat sheet with 29 points, 14 rebounds, 8 assists, and 3 blocks, steering TNT to an authoritative victory that locked their ledger at 6-4 atop Group A.\n\n### TNT Tropang Giga Locks Group A Top Spot\n\nUnder head coach Chot Reyes, TNT has operated with surgical postseason composure. The Tropang Giga weathered early perimeter pressure before unleashing a decisive 18-4 third-quarter run spearheaded by veteran playmaker Jayson Castro and sharpshooter Calvin Oftana. \n\n\"We wanted to make sure we secured momentum before the crossover knockout rounds,\" Reyes remarked in the post-game media room. \"Rondae gives us that defensive anchor, but it was our ball movement and offensive discipline that created separation. Now the real tournament begins.\"\n\n### Ginebra in Unfamiliar Must-Win Territory\n\nMeanwhile, in Group B, the narrative is fraught with tension. Tim Cone's Barangay Ginebra squad currently sits at an uncharacteristic 3-5 record, tied neck-and-neck with rival Meralco. Following a stinging 112-93 defeat to the Magnolia Hotshots, the Gin Kings have zero room for error in their final elimination games.\n\nNew reinforcement Jordan Murphy turned heads in his debut with a monster 30-point, 13-rebound showing, providing frontline muscle alongside resident naturalized hero Justin Brownlee. However, backcourt depth and defensive rotations remain significant hurdles for Ginebra.\n\n\"We've put ourselves in a corner, and there is nowhere left to look except forward,\" Cone admitted. \"Every single possession from here on out is a Game 7. Our guys understand the gravity of this situation.\"\n\n### Meralco Bolts Rally Behind Jordon Varnado\n\nThe Meralco Bolts, fresh off an emotional 97-88 triumph over Ginebra behind new import Jordon Varnado's explosive 34-point debut, are equally hungry. Coach Luigi Trillo and lead consultant Nenad Vucinic have tightened their half-court defensive scheme, leaning on Chris Newsome and Aaron Black to dictate tempo against an unpredictable Blackwater squad.\n\n### Playoff Bracket Scenarios & Key Matchups\n\nWith the Governors' Cup adopting a crossover best-of-five quarterfinal format, the stakes could not be higher:\n- **Group A Seeds:** TNT Tropang Giga (#1) and Rain or Shine Elasto Painters (#2) await their cross-bracket opponents.\n- **Group B Scramble:** San Miguel Beermen have booked their ticket, leaving Ginebra, Meralco, and Blackwater in a three-way battle for the last two berths.\n\nAs the elimination round concludes this week, fans across the archipelago can expect capacity crowds in Metro Manila and record viewership across RPTV and Pilipinas Live broadcasts.",
    "primaryCategoryId": "pba-news",
    "topicIds": [
      "pba-news",
      "pba-governors-cup",
      "pba-philippine-cup"
    ],
    "authorId": "author-joaquin-santos",
    "contentType": "news",
    "sourceName": "PBA Official Media Bureau",
    "sourceUrl": "https://pba.ph",
    "featuredImageUrl": "/img/articles/pba-governors-cup-2026.webp",
    "imageAlt": "PBA Governors' Cup 2026 playoff race: TNT Tropang Giga vs Barangay Ginebra and Meralco Bolts",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "PBA Governors' Cup 2026: TNT Clinches Top Seed, Ginebra & Meralco Battle | TipOffPh",
    "seoDescription": "TNT Tropang Giga locks up the Group A top seed behind Rondae Hollis-Jefferson. Meanwhile, Barangay Ginebra and Meralco Bolts fight in a must-win quarterfinal showdown.",
    "isFeatured": true,
    "isBreaking": true,
    "status": "published",
    "publishedAt": _isoMinutesAgo(5),
    "createdAt": _isoMinutesAgo(35)
  },
  {
    "id": "art-pba-002",
    "slug": "san-miguel-beermen-june-mar-fajardo-frontline-dominance-magnolia-playoffs",
    "title": "San Miguel Beermen Frontline Masterclass: June Mar Fajardo and CJ Perez Fuel Pivotal 106-98 Victory Over Magnolia",
    "excerpt": "Seven-time MVP June Mar Fajardo tallies 28 points and 16 rebounds while CJ Perez ignites the perimeter in a statement win against the Magnolia Hotshots at Smart Araneta Coliseum.",
    "body": "QUEZON CITY — The San Miguel Beermen sent an unmistakable warning to the rest of the league on Tuesday night, flexing their unmatched frontline superiority to dispatch fierce rivals Magnolia Hotshots 106-98 before an electric crowd at the Smart Araneta Coliseum.\n\nLeading the charge was none other than seven-time PBA Most Valuable Player June Mar Fajardo, who put on a clinic inside the painted area. The Cebuano giant connected on 11-of-14 field goal attempts, finishing with 28 points, 16 rebounds, 4 assists, and 3 emphatic blocks, frustrating Magnolia's frontline rotation all evening.\n\n### The Kraken Dominates the Painted Area\n\nMagnolia head coach Chito Victolero deployed double and triple teams from the opening tip, tasking Ian Sangalang, Calvin Abueva, and Russell Escoto with physical perimeter denying tactics. Yet Fajardo's patience and pinpoint kick-out passes repeatedly punished the Hotshots' defensive gambit.\n\n\"June Mar doesn't just score; he commands the geometry of the entire basketball floor,\" San Miguel head coach Jorge Gallent stated. \"When teams collapse three defenders inside the lane, our shooters get wide-open looks. And when they stay home, June Mar scores at will.\"\n\n### CJ Perez and Marcio Lassiter Floor Spacing\n\nCapitalizing on that interior gravity was dynamic guard CJ Perez, who poured in 24 points to go along with 7 rebounds and 5 assists. Perez repeatedly punctured Magnolia's transition defense, converting fastbreak layups and step-back jumpers in crucial junctures of the fourth period.\n\nVeteran sharpshooter Marcio Lassiter also played a pivotal supporting role, drilling 4 three-pointers for 14 points. His corner triple with 2:04 left on the game clock stretched San Miguel's advantage to double digits, putting the contest out of reach for a valiant Hotshots rally led by Paul Lee (22 points) and Mark Barroca (15 points).\n\n### Tactical Takeaways Heading into the Semifinals\n\n1. **Rebounding Supremacy:** San Miguel dominated the boards 54-38, including 18 second-chance offensive rebounds.\n2. **Defensive Composure:** Despite Magnolia forcing 14 turnovers, the Beermen surrendered only 8 points in transition.\n3. **Bench Production:** Don Trollano and Jericho Cruz provided instant spark off the pine, contributing combined 23 points.\n\nWith the victory, the Beermen solidify their posture as championship favorites, awaiting their quarterfinal crossover opponent as the playoff bracket solidifies.",
    "primaryCategoryId": "pba-news",
    "topicIds": [
      "pba-news",
      "pba-governors-cup"
    ],
    "authorId": "author-joaquin-santos",
    "contentType": "news",
    "sourceName": "PBA Official Media Bureau",
    "sourceUrl": "https://pba.ph",
    "featuredImageUrl": "/img/articles/san-miguel-beermen-dominance.webp",
    "imageAlt": "San Miguel Beermen 106-98 victory over Magnolia Hotshots featuring June Mar Fajardo and CJ Perez",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "San Miguel Beermen Top Magnolia 106-98: June Mar Fajardo & CJ Perez Deliver | TipOffPh",
    "seoDescription": "June Mar Fajardo tallies 28 points and 16 rebounds as San Miguel Beermen defeat Magnolia Hotshots 106-98 in a physical PBA showcase at Smart Araneta Coliseum.",
    "isFeatured": true,
    "isBreaking": false,
    "status": "published",
    "publishedAt": _isoMinutesAgo(18),
    "createdAt": _isoMinutesAgo(48)
  },
  {
    "id": "art-nba-001",
    "slug": "nba-preseason-karl-anthony-towns-knicks-timberwolves-showdown",
    "title": "NBA Preseason Thriller: Karl-Anthony Towns Sparks Knicks in 115-110 Win Over Edwards' Minnesota Timberwolves",
    "excerpt": "In an emotional clash against his former team, Karl-Anthony Towns pairs with Jalen Brunson (24 pts) to outlast Anthony Edwards' 31-point masterclass at Madison Square Garden.",
    "body": "NEW YORK — In one of the most anticipated preseason spectacles in recent NBA history, Karl-Anthony Towns squared off against the franchise he called home for nine years, leading the New York Knicks to an electrifying 115-110 triumph over the Minnesota Timberwolves before a raucous Madison Square Garden crowd.\n\nJust weeks after the earth-shattering three-team blockbuster trade that sent Julius Randle and Donte DiVincenzo to Minnesota, Towns demonstrated precisely why Knicks president Leon Rose made the franchise-altering move. Operating as the premier stretch-five in the Eastern Conference, Towns compiled 16 points, 16 rebounds, and 3 assists in 28 minutes of action, creating irresistible spacing for All-NBA point guard Jalen Brunson.\n\n### The Blockbuster Trade Dynamics on Display\n\nFrom the opening jump, the emotion inside the World's Most Famous Arena was palpable. Towns received a rousing ovation during player introductions, but business quickly took precedence once the ball was tipped.\n\n\"It was surreal seeing those guys in the opposing jerseys, especially after going to the Western Conference Finals together,\" Towns admitted post-game. \"Ant [Edwards], Rudy [Gobert], Jaden [McDaniels] — that's family forever. But my heart and focus are here in New York now. We have championship expectations to fulfill.\"\n\n### Anthony Edwards' Explosive 31-Point Showcase\n\nWhile the Knicks walked away with the preseason victory, Timberwolves superstar Anthony Edwards put on an absolute shooting clinic. The Olympic gold medalist scorched the nets for 31 points on 8-of-13 shooting from three-point territory, dazzling spectators with step-backs, deep pull-ups, and transition thunder.\n\nEdwards relished the duel against his long-time frontcourt partner: \"I told Karl before the game, if he didn't contest my shots, I was letting it fly every time. He looked great in blue and orange, but we're going to be ready when we see them in the regular season.\"\n\n### Jalen Brunson's Floor General Leadership\n\nFor New York, Jalen Brunson orchestrated head coach Tom Thibodeau's half-court offense with clinical efficiency, notching 24 points and 6 assists in 24 minutes. Brunson and Towns executed multiple high pick-and-pop sequences that left Minnesota's defensive scheme scrambling.\n\nNewly acquired two-way wing Mikal Bridges chipped in with 15 points, 5 rebounds, and stellar on-ball perimeter defense, validating New York's aggressive offseason re-tooling.\n\n### Eastern Conference Championship Outlook\n\nWith defending champions Boston Celtics resting on their laurels, this Knicks squad possesses the shooting, size, and secondary playmaking required to mount a legitimate title threat. With Towns stretching opposing rim protectors out to 28 feet, New York looks poised to enter the 2024-25 NBA campaign as an elite contender.",
    "primaryCategoryId": "nba-news",
    "topicIds": [
      "nba-news",
      "nba"
    ],
    "authorId": "author-rafael-dizon",
    "contentType": "news",
    "sourceName": "NBA Media Pool / The Associated Press",
    "sourceUrl": "https://nba.com",
    "featuredImageUrl": "/img/articles/knicks-timberwolves-nba-preseason.webp",
    "imageAlt": "NBA Preseason thriller at Madison Square Garden: Karl-Anthony Towns Knicks vs Anthony Edwards Timberwolves",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "Karl-Anthony Towns Leads Knicks Past Timberwolves 115-110 in Preseason Thriller | TipOffPh",
    "seoDescription": "Karl-Anthony Towns shines for New York alongside Jalen Brunson (24 pts) to hold off Anthony Edwards' 31 points in a dramatic Knicks 115-110 victory at MSG.",
    "isFeatured": true,
    "isBreaking": false,
    "status": "published",
    "publishedAt": _isoMinutesAgo(28),
    "createdAt": _isoMinutesAgo(58)
  },
  {
    "id": "art-nba-002",
    "slug": "warriors-rout-lakers-preseason-curry-bronny-james-performance",
    "title": "Golden State Warriors Rout Lakers 111-97: Stephen Curry Orchestrates Offense as Bronny James Logs Breakout 17-Point Outing",
    "excerpt": "Stephen Curry and Jonathan Kuminga lead a balanced perimeter attack while rookie Bronny James catches fire for 17 points in his most composed preseason showing to date.",
    "body": "SAN FRANCISCO — The Golden State Warriors maintained their undefeated preseason rhythm on Tuesday night, pulling away for a commanding 111-97 victory over the Los Angeles Lakers at Chase Center. While Stephen Curry spearheaded a 16-triple perimeter barrage for the Dubs, the marquee storyline of the evening belonged to Lakers rookie Bronny James, who delivered his most impactful performance of the young season.\n\nCurry dazzled the Bay Area faithful in just 22 minutes of work, tallying 16 points, 6 assists, and 2 steals while connecting on 4 three-pointers. Head coach Steve Kerr deployed a vibrant 12-man rotation featuring athletic forward Jonathan Kuminga (17 points, 6 rebounds) and Lindy Waters III, continuing Golden State's commitment to relentless motion offense and transition pace.\n\n### Bronny James Displays Poise and Shot-Making\n\nFor the Lakers, who rested superstar LeBron James following back-to-back workouts, rookie guard Bronny James seized the spotlight. Entering the contest under intense national scrutiny, the 20-year-old guard logged 35 minutes and poured in 17 points, 4 rebounds, 3 steals, and a block on 7-of-17 shooting from the field.\n\nBronny exhibited sharp court awareness, nailing a pair of corner three-pointers and attacking closeouts with decisive straight-line drives to the rim. His defensive anticipation was equally impressive, generating two transition fastbreaks by picking pockets at the top of the key.\n\n\"I just wanted to come out with pure energy and play without overthinking,\" Bronny told reporters in the locker room. \"Coach JJ [Redick] told me to let the game come to me and trust the work I put in the gym every morning. It feels great to see the ball go through the hoop.\"\n\n### Anthony Davis Dominates the Early Paint\n\nBefore taking a seat for the fourth quarter, nine-time All-Star Anthony Davis anchored Los Angeles with authority. Davis notched 24 points, 12 rebounds, and 2 blocks, punishing Golden State on the offensive glass and converting mid-range fadeaways over Draymond Green.\n\nLakers head coach JJ Redick highlighted key areas of progression despite the final scoreline:\n- **Offensive Structure:** Los Angeles generated 34 three-point attempts, matching Redick's analytical mandate.\n- **Rookie Development:** Bronny James and Dalton Knecht received invaluable fourth-quarter crunch-time reps against seasoned veterans.\n- **Defensive Communication:** Rotations improved markedly compared to earlier preseason outings against Minnesota.\n\n### Western Conference Regular Season Horizon\n\nWith the 2024-25 NBA regular season tip-off scheduled for October 22, both California franchises enter the final stretch of camp with renewed clarity. For the Warriors, offensive depth and perimeter spacing remain elite. For the Lakers, the historic father-son tandem of LeBron and Bronny James is primed to make NBA history on opening night.",
    "primaryCategoryId": "nba-news",
    "topicIds": [
      "nba-news",
      "nba"
    ],
    "authorId": "author-rafael-dizon",
    "contentType": "news",
    "sourceName": "NBA Media Pool / The Associated Press",
    "sourceUrl": "https://nba.com",
    "featuredImageUrl": "/img/articles/warriors-lakers-curry-bronny.webp",
    "imageAlt": "Golden State Warriors 111-97 rout over Los Angeles Lakers featuring Stephen Curry and Bronny James at Chase Center",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "Warriors Beat Lakers 111-97: Stephen Curry & Bronny James Highlights | TipOffPh",
    "seoDescription": "Stephen Curry tallies 16 points and 6 assists as the Golden State Warriors defeat the Los Angeles Lakers 111-97. Complete tactical breakdown and rookie notes on TipOffPh.",
    "isFeatured": true,
    "isBreaking": false,
    "status": "published",
    "publishedAt": _isoMinutesAgo(38),
    "createdAt": _isoMinutesAgo(68)
  },
  {
    "id": "art-other-001",
    "slug": "uaap-season-87-finals-up-fighting-maroons-dethrone-dlsu-game-3",
    "title": "UAAP Season 87 Finals: UP Fighting Maroons Dethrone DLSU Green Archers 66-62 in Heart-Stopping Game 3 Decider",
    "excerpt": "Harold Alarcon and Francis Lopez deliver clutch defensive stops down the stretch as Goldwin Monteverde's UP Fighting Maroons capture the coveted UAAP championship before 25,000 screaming fans.",
    "body": "QUEZON CITY — In front of a thunderous, ear-splitting crowd of 25,114 spectators at the Smart Araneta Coliseum, the University of the Philippines (UP) Fighting Maroons captured the UAAP Season 87 Men's Basketball Championship, edging defending titlists De La Salle University (DLSU) Green Archers 66-62 in a heart-stopping Game 3 decider.\n\nThe victory capped one of the most fiercely contested Finals trilogies in collegiate basketball history. After UP claimed Game 1 (73-65) and La Salle stormed back in Game 2 (76-75), the rubber match turned into a defensive slugfest where every rebound, loose ball, and possession felt like a battle of sheer attrition.\n\n### A Championship Climax for the Ages\n\nTrailing 58-54 midway through the final frame following a personal 7-0 flurry by UAAP Most Valuable Player Kevin Quiambao, the Fighting Maroons dug deep into their championship pedigree. UP tactician Goldwin Monteverde called a crucial timeout, re-installing a relentless full-court trap that suffocated the Green Archers' backcourt.\n\nHarold Alarcon proved to be the ultimate man of the moment. The veteran guard drilled an ice-cold step-back jumper to tie the contest at 60-60, before Francis Lopez soared above the rim for a thunderous putback dunk with 1:18 remaining that sent the maroon-clad gallery into delirium.\n\n\"All year long, we talked about composure under fire,\" an emotional Monteverde stated as confetti rained down from the Araneta rafters. \"La Salle is a tremendous team coached by a great mentor in Topex Robinson. But our boys refused to break. They played with pure heart for the UP community.\"\n\n### Kevin Quiambao's Valiant Final Stand\n\nFor La Salle, Quiambao was heroic in defeat, willing his team with 22 points, 13 rebounds, 3 assists, and 2 blocks in 36 grueling minutes. Despite heavy double-teams from Quentin Millora-Brown and Lopez, the versatile forward kept the Green Archers within striking distance until the final horn.\n\nSophomore guard Mike Phillips contributed 12 points and 15 rebounds, while Joshua David added 9 markers. However, La Salle was plagued by 18 turnovers against UP's ball-denial pressure, yielding 16 costly transition points.\n\n### Finals MVP Honors & Legacy\n\nHarold Alarcon was rightfully crowned UAAP Season 87 Finals MVP after averaging 16.3 points, 5.7 rebounds, and shooting 48% from the field across the three-game epic. \n\n\"This championship is dedicated to every Isko and Iska who supported us through the tears and the triumphs,\" Alarcon said, clutching the championship trophy. \"We brought the crown back to Diliman.\"\n\nThe historic victory solidifies the Fighting Maroons as the premier collegiate basketball program in the nation, setting the benchmark for grassroots basketball excellence in the Philippines.",
    "primaryCategoryId": "uaap-basketball",
    "topicIds": [
      "uaap-basketball",
      "uaap",
      "collegiate-basketball"
    ],
    "authorId": "author-maria-reyes",
    "contentType": "news",
    "sourceName": "UAAP Press Bureau",
    "sourceUrl": "https://uaap.org.ph",
    "featuredImageUrl": "/img/articles/uaap-season-87-finals-up-dlsu.webp",
    "imageAlt": "UAAP Season 87 Finals Game 3 Decider: UP Fighting Maroons defeat DLSU Green Archers 66-62",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "UP Fighting Maroons Win UAAP Season 87 Championship Over DLSU 66-62 | TipOffPh",
    "seoDescription": "The UP Fighting Maroons defeat DLSU Green Archers 66-62 in a Game 3 thriller to capture the UAAP Season 87 title. Full game recap, stats, and quotes on TipOffPh.",
    "isFeatured": true,
    "isBreaking": false,
    "status": "published",
    "publishedAt": _isoMinutesAgo(48),
    "createdAt": _isoMinutesAgo(78)
  },
  {
    "id": "art-other-002",
    "slug": "mpbl-2026-playoffs-abra-weavers-streak-caloocan-semifinals-sweep",
    "title": "MPBL 2026 Playoffs: Abra Weavers Extend Historic 26-Game Streak as Caloocan Batang Kankaloo Sweeps into Semifinals",
    "excerpt": "Defending champions Abra Weavers unleash a 126-70 quarterfinal blowout over Muntinlupa behind an electric 28-1 regular season, while Caloocan Batang Kankaloo sweeps Manila to advance.",
    "body": "BANGUED, ABRA — The defending champions Abra Weavers continued their historic rampage through the Maharlika Pilipinas Basketball League (MPBL) Season 8 Playoffs on Tuesday, dismantling the Muntinlupa Cagers in an eye-popping 126-70 quarterfinal rout to extend their all-time league record winning streak to 26 consecutive games.\n\nPlaying before an ecstatic capacity crowd at the Abra Sports Complex, the Weavers showcased the high-octane offensive machinery that propelled them to an astonishing 28-1 elimination round record. Head coach Yong Garcia's unit connected on 19 three-pointers and recorded 38 assists on 48 made field goals, overwhelming Muntinlupa from the opening tip.\n\n### The Abra Weavers' Historic Dominance\n\nFive Weavers scored in double figures, led by former collegiate standout John Lloyd Clemente, who notched 24 points in just 19 minutes of action. Point guard Wendelino Comboy orchestrated the backcourt with 14 points and 11 assists, while big man Prince Caperal anchored the interior with 16 points and 9 boards.\n\n\"Our players have maintained their championship hunger every single day in practice,\" Garcia stated. \"Records are nice, but in the MPBL playoffs, none of it matters unless we finish the job and raise the national trophy once again.\"\n\n### Caloocan Batang Kankaloo Sweeps into North Semis\n\nDown in Metro Manila, the Caloocan Batang Kankaloo officially punched their ticket to the North Division Semifinals with an emphatic 100-74 sweep of Ilagan Isabela, following their nail-biting 67-66 opening victory against the Manila Stars.\n\nLed by veteran guard Paul Sanga and high-flying forward Gabby Espinas, Caloocan forced 22 turnovers and dominated second-chance points 21-8. Head coach Ronnie Dojillo credited his team's blue-collar defensive identity:\n\n\"Our community in Caloocan demands grit and hard work,\" Dojillo said. \"We don't have superstar egos; we have 15 brothers who dive for every loose ball and execute our defensive assignments.\"\n\n### MPBL Playoff Bracket Picture\n\nAs the Best-of-Three Division Quarterfinals wind down:\n- **North Division:** Abra Weavers and Caloocan Batang Kankaloo await the winners of the San Juan Knights vs. Rizal Golden Coolers series.\n- **South Division:** Pampanga Giant Lanterns and Quezon Huskers remain on a collision course as regional rivalries intensify across Visayas and Mindanao.\n\nWith live broadcasts reaching millions of grassroots basketball fans nationwide via One PH and YouTube Livestream, the MPBL continues to solidify its reputation as the most vibrant regional sports league in the Philippines.",
    "primaryCategoryId": "mpbl-news",
    "topicIds": [
      "mpbl-news",
      "mpbl"
    ],
    "authorId": "author-carlo-mendoza",
    "contentType": "news",
    "sourceName": "MPBL Official Press Office",
    "sourceUrl": "https://mpbl.ph",
    "featuredImageUrl": "/img/articles/mpbl-playoffs-abra-weavers.webp",
    "imageAlt": "MPBL 2026 Playoffs: Abra Weavers 26-game streak and Caloocan Batang Kankaloo semifinal sweep",
    "imageCredit": "TipOffPh / Sports Action Media",
    "seoTitle": "MPBL 2026 Playoffs: Abra Weavers 26-Game Streak & Caloocan Sweep | TipOffPh",
    "seoDescription": "Abra Weavers crush Muntinlupa 126-70 while Caloocan Batang Kankaloo sweeps into the MPBL Division Semifinals. In-depth scores and bracket report on TipOffPh.",
    "isFeatured": true,
    "isBreaking": false,
    "status": "published",
    "publishedAt": _isoMinutesAgo(56),
    "createdAt": _isoMinutesAgo(86)
  },
  {
    id: 'art-001',
    slug: 'san-miguel-beermen-clinch-semifinal-berth-philippine-cup-thriller',
    title: 'San Miguel Beermen Clinch Semifinal Berth in 108-103 Philippine Cup Thriller',
    excerpt: 'June Mar Fajardo anchored a decisive 14-2 fourth-quarter run as the Beermen withstood a furious rally from Meralco to advance to the final four at the Smart Araneta Coliseum.',
    body: `QUEZON CITY — In an electric atmosphere at the Smart Araneta Coliseum, the San Miguel Beermen demonstrated why their frontline remains the standard in Philippine basketball, outlasting the Meralco Bolts 108-103 to punch their ticket to the PBA Philippine Cup semifinals.

Seven-time Most Valuable Player June Mar Fajardo delivered another masterclass inside the painted area, tallying 26 points, 17 rebounds, and 4 blocks. When the Bolts mounted a spirited comeback in the third quarter behind Chris Newsome’s perimeter marksmanship, it was Fajardo and veteran guard CJ Perez who took control down the stretch.

### A Decisive Fourth Quarter Surge

Trailing 88-85 with 7:42 remaining in regulation, San Miguel head coach Jorge Gallent called a tactical timeout that altered the game's complexion. The Beermen transitioned into an aggressive high-low post action, neutralizing Meralco’s frontline rotation and forcing key fouls on Cliff Hodge.

"We knew Meralco would throw multiple defensive looks at June Mar," Gallent said during the post-game press conference. "Our guards made the right reads, spaced the floor, and didn't panic when they cut into our lead."

CJ Perez contributed 22 points, 6 assists, and 3 steals, including a step-back three-pointer with 1:12 on the game clock that extended San Miguel’s cushion to six. Marcio Lassiter added 15 points on 4-of-7 shooting from beyond the arc, moving closer to the league’s all-time three-point record.

### Meralco's Resilient Effort

For the Bolts, Newsome led all scorers with 28 points, while Aaron Black added 16 points in his second game back from a minor ankle sprain. Despite forcing 16 turnovers, Meralco was undone on the glass, as San Miguel secured an overwhelming 52-37 rebounding advantage.

With the victory, the Beermen await the winner of the Barangay Ginebra vs. Magnolia Hotshots quarterfinal showdown, setting up another chapter in the storied Manila Clasico or an explosive sister-team semifinal battle.`,
    primaryCategoryId: 'pba-news',
    topicIds: ['pba-news', 'pba-philippine-cup'],
    authorId: 'author-joaquin-santos',
    contentType: 'news',
    sourceName: 'PBA Official Media Bureau',
    sourceUrl: 'https://pba.ph',
    featuredImageUrl: '/img/articles/san-miguel-beermen-semifinals-phcup.webp',
    imageAlt: 'San Miguel Beermen 108-103 PBA Philippine Cup semifinal victory over Meralco Bolts at Araneta',
    imageCredit: 'TipOffPh / Sports Action Media',
    seoTitle: 'San Miguel Advances to PBA Semifinals in 108-103 Thriller | TipOffPh',
    seoDescription: 'June Mar Fajardo posts 26 points and 17 rebounds as the San Miguel Beermen defeat Meralco 108-103 to advance to the PBA Philippine Cup semifinals.',
    isFeatured: true,
    isBreaking: true,
    status: 'published',
    publishedAt: '2026-10-09T08:30:00Z',
    createdAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'art-002',
    slug: 'gilas-pilipinas-names-14-man-pool-fiba-asia-cup-qualifiers',
    title: 'Gilas Pilipinas Names Formidable 14-Man Pool for FIBA Asia Cup Window',
    excerpt: 'Coach Tim Cone reinforces continuity and size, retaining core standouts Dwight Ramos, Kai Sotto, and Justin Brownlee alongside versatile collegiate invitees.',
    body: `PASIG CITY — The Samahang Basketbol ng Pilipinas (SBP) and Gilas Pilipinas head coach Tim Cone have officially announced the 14-man training pool for the upcoming FIBA Asia Cup Qualifiers window, emphasizing lineup stability and defensive discipline.

Naturalized resident forward Justin Brownlee once again headlines the squad, joined by 7-foot-3 center Kai Sotto, who arrives directly following a dominant campaign in the Japan B.League. Cone emphasized that keeping the core unit intact is essential for sustained tactical growth.

### Lineup Stability Over Overhauls

"Our approach is simple: we believe in continuous chemistry rather than assembling a completely new group every window," Cone explained. "These players know each other’s tendencies, understand our triangle sets, and take immense pride in wearing the national tricolor."

The pool features:
- **Guards**: Scottie Thompson, Chris Newsome, CJ Perez, Dwight Ramos
- **Wings & Forwards**: Justin Brownlee, Calvin Oftana, Carl Tamayo, Kevin Quiambao
- **Bigs**: Kai Sotto, June Mar Fajardo, Japeth Aguilar, AJ Edu

The inclusion of UAAP standout Kevin Quiambao highlights the coaching staff’s confidence in the reigning collegiate MVP's versatility and playmaking at the forward position. AJ Edu also returns to full contact practice after recovering from a knee rehabilitation program.

### Road to the Continental Championship

Gilas will hold an intensive four-day training camp at the Inspire Sports Academy in Calamba, Laguna before hosting New Zealand and Hong Kong at the Mall of Asia Arena. With basketball fans rallying behind the team, expectations are high for the squad to solidify its standing at the top of Group B.`,
    primaryCategoryId: 'gilas-pilipinas',
    topicIds: ['gilas-pilipinas', 'fiba-world-cup', 'overseas-filipino-players'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'SBP Media Release',
    featuredImageUrl: '/img/articles/gilas-pilipinas-fiba-asia-cup.webp',
    imageAlt: 'Gilas Pilipinas 14-man pool roster for FIBA Asia Cup Qualifiers under Coach Tim Cone',
    imageCredit: 'TipOffPh / National Team Archive',
    seoTitle: 'Gilas Pilipinas 14-Man Roster Announced for FIBA Qualifiers | TipOffPh',
    seoDescription: 'Tim Cone names 14-man Gilas Pilipinas pool featuring Kai Sotto, Justin Brownlee, and Dwight Ramos for the FIBA Asia Cup qualifiers window.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-08-24T06:15:00Z',
    createdAt: '2026-08-24T05:45:00Z'
  },
  {
    id: 'art-003',
    slug: 'pampanga-giant-lanterns-edge-san-juan-knights-mpbl-playoff-showdown',
    title: 'Pampanga Giant Lanterns Edge San Juan Knights 84-81 in Gritty MPBL Battle',
    excerpt: 'Encho Serrano converted a difficult driving layup in the final 18 seconds to push the defending champion Lanterns past the Knights in a high-intensity North Division clash.',
    body: `SAN FERNANDO, PAMPANGA — Before a raucous hometown crowd at the Bren Z. Guiao Convention Center, the Pampanga Giant Lanterns weathered a furious fourth-quarter charge from the San Juan Knights to secure an 84-81 victory in the MPBL North Division playoffs.

Dynamic guard Encho Serrano proved unstoppable down the stretch, driving into the teeth of the San Juan defense to convert an acrobatic reverse layup with 18.4 seconds left on the clock. San Juan had an opportunity to tie, but Orlan Wamar’s contested step-back triple bounced off the back iron as time expired.

### Defending the Home Floor

Pampanga established control early with relentless full-court trapping, forcing San Juan into 19 turnovers that translated into 24 fast-break points. Big man Justine Baltazar posted an imposing double-double with 18 points, 15 rebounds, and 5 assists, while anchoring Pampanga's interior defense.

"In the MPBL playoffs, every possession feels like life or death," said Pampanga head coach Gov. Dennis Pineda. "San Juan is a championship-tested organization with veteran leadership, but our boys stayed composed under pressure."

### San Juan's Late Push Falls Short

San Juan fought back from an 11-point deficit in the third quarter behind Michael Calisaan’s tough scoring in the paint and AC Soberano’s timely outside shooting. Calisaan finished with 21 points and 9 boards, while Wamar tallied 14 points and 8 assists.

Game 2 shifts to the Filoil EcoOil Centre in San Juan, where the Knights must win to extend the series to a decisive Game 3.`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Operations Desk',
    featuredImageUrl: '/img/articles/pampanga-giant-lanterns-mpbl.webp',
    imageAlt: 'Pampanga Giant Lanterns 84-81 MPBL North Division playoff win over San Juan Knights',
    imageCredit: 'TipOffPh / Regional Basketball Lens',
    seoTitle: 'Pampanga Giant Lanterns Beat San Juan 84-81 in MPBL Thriller | TipOffPh',
    seoDescription: 'Encho Serrano delivers late-game heroics as Pampanga outlasts San Juan 84-81 in an intense MPBL North Division playoff duel.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-09T03:45:00Z',
    createdAt: '2026-10-09T03:00:00Z'
  },
  {
    id: 'art-004',
    slug: 'uaap-season-87-up-fighting-maroons-stay-unbeaten-over-dlsu-green-archers',
    title: 'UAAP Season 87: UP Fighting Maroons Stay Unbeaten With Clutch Win Over DLSU',
    excerpt: 'JD Cagulangan orchestrated a dazzling fourth quarter as UP outdueled Kevin Quiambao and the Green Archers 76-72 in a finals rematch at the Mall of Asia Arena.',
    body: `PASAY CITY — In a finals rematch that lived up to every ounce of its immense billing, the University of the Philippines Fighting Maroons maintained their pristine record in UAAP Season 87, holding off the De La Salle Green Archers 76-72 on Sunday evening.

Floor general JD Cagulangan orchestrated the closing four minutes with surgical precision, scoring seven of his team-high 17 points in crunch time, while dishing out 5 assists with zero turnovers.

### Clash of Heavyweights

The matchup pitted the league's top two championship favorites against each other in front of 14,800 spectators at the Mall of Asia Arena. Both programs traded blows through three quarters of physical, defensively disciplined basketball.

UP head coach Goldwin Monteverde lauded his unit's collective resolve when La Salle rallied behind reigning MVP Kevin Quiambao:

"Playing against La Salle always demands 40 minutes of absolute concentration," Monteverde said. "They are exceptionally well-coached and aggressive. Our guys embraced the physicality on the defensive boards."

Quiambao paced La Salle with a stellar all-around line of 23 points, 11 rebounds, and 4 assists, but La Salle shot just 6-of-24 from three-point range against UP’s active closeout defense. Francis Lopez and Harold Alarcon combined for 26 points for UP, providing the scoring punch to complement Cagulangan’s leadership.

With the victory, the Fighting Maroons improve to 7-0 at the conclusion of the first round, establishing themselves as the team to beat in collegiate hoops.`,
    primaryCategoryId: 'uaap-basketball',
    topicIds: ['uaap-basketball', 'high-school-hoops'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'UAAP Press Corps',
    featuredImageUrl: '/img/articles/uaap-up-fighting-maroons-unbeaten.webp',
    imageAlt: 'UP Fighting Maroons 76-72 victory over DLSU Green Archers in UAAP Season 87 round 1',
    imageCredit: 'TipOffPh / Collegiate Media Bureau',
    seoTitle: 'UP Maroons Edge DLSU Archers 76-72 in UAAP Finals Rematch | TipOffPh',
    seoDescription: 'JD Cagulangan steers UP to a 76-72 victory over Kevin Quiambao and La Salle in an electric UAAP Season 87 round one encounter.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T22:30:00Z',
    createdAt: '2026-10-08T21:45:00Z'
  },
  {
    id: 'art-005',
    slug: 'rumor-two-rival-pba-franchises-exploring-blockbuster-three-team-trade',
    title: 'Trade Rumor: Two Rival PBA Franchises Exploring Blockbuster Three-Team Deal',
    excerpt: 'Multiple league insiders confirm preliminary trade discussions centered on an All-Star shooting guard and future draft capital, awaiting trade committee vetting.',
    body: `MANILA — As the PBA trade window approaches its mid-conference deadline, whispers from team boardrooms indicate that a high-profile multi-team transaction is currently being explored by at least two prominent franchises, with a third team positioned as a salary and draft pick facilitator.

*Disclaimer: TipOffPh classifies this report as an Attributed Rumor based on multiple verified league sources. No formal trade papers have been submitted to the PBA Commissioner's Office as of Tuesday morning.*

### The Moving Pieces

According to three independent team officials speaking on the condition of anonymity, discussions involve a former All-Star guard who has seen his rotational minutes decrease following recent lineup adjustments.

The proposed framework would see:
1. **Franchise A**: Acquires an established two-way perimeter creator and a 2027 second-round draft asset.
2. **Franchise B**: Adds frontcourt depth and rim protection to counter San Miguel's interior dominance.
3. **Franchise C (Facilitator)**: Receives an unprotected first-round draft selection and cash considerations.

### Vetting Process and Commissioner Review

Any transaction of this magnitude must clear the PBA Trade Committee, led by technical officials tasked with evaluating roster parity and competitive balance. League insiders expect formal paperwork to be finalized only after this weekend's critical conference fixtures.

TipOffPh will continue to track developments as official confirmations emerge.`,
    primaryCategoryId: 'rumors-and-trades',
    topicIds: ['rumors-and-trades', 'pba-news'],
    authorId: 'author-joaquin-santos',
    contentType: 'rumor',
    sourceName: 'PBA League Sources',
    featuredImageUrl: '/img/articles/pba-trade-rumors-blockbuster.webp',
    imageAlt: 'PBA trade rumors breakdown for blockbuster three-team deal involving All-Star guard',
    imageCredit: 'TipOffPh / Insider Desk',
    seoTitle: 'PBA Blockbuster Three-Team Trade Rumors Heat Up | TipOffPh',
    seoDescription: 'Multiple league insiders report advanced preliminary discussions on a major three-team PBA trade involving an All-Star guard and draft capital.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T16:00:00Z',
    createdAt: '2026-10-08T15:00:00Z'
  },
  {
    id: 'art-006',
    slug: 'editorial-why-the-rise-of-filipinos-in-the-japan-bleague-is-elevating-gilas',
    title: 'Editorial: Why the Rise of Filipinos in the Japan B.League Is Elevating Philippine Hoops',
    excerpt: 'Far from draining local talent, the overseas diaspora of Filipino athletes into Japan and Korea has accelerated tactical maturity and physical readiness on the international stage.',
    body: `When Kiefer Ravena and Thirdy Ravena first departed Philippine shores to embark on professional careers in the Japan B.League, skeptics warned that the country risked losing its domestic stars to foreign leagues.

Five years later, the evidence on the court tells a dramatically different story: overseas competition has served as the greatest development catalyst the Philippine national program has experienced in modern history.

### The Speed and Spacing Revolution

Basketball in the Japanese B.League is predicated on rapid ball movement, relentless transition pace, and high-level perimeter spacing. When Filipino athletes such as Kai Sotto, Dwight Ramos, and Carl Tamayo spend 60 games a year competing against European imports, athletic Americans, and sharpshooting Japanese guards, their basketball instincts undergo rapid refinement.

In previous decades, Philippine basketball often relied heavily on isolation scoring and individual brilliance. Today, watching Gilas Pilipinas execute Tim Cone’s sets reveals players who make instantaneous 0.5-second decisions, read weak-side rotations, and defend multiple positions without conceding foolish fouls.

### Financial Empowerment and Professional Standards

Beyond tactical growth, foreign leagues have introduced Filipino professionals to rigorous sports science programs, cutting-edge conditioning facilities, and strict recovery protocols. Players return to national team duty in peak physical shape, with extended career horizons and heightened discipline.

Rather than viewing the overseas exodus with apprehension, Philippine basketball stakeholders should embrace it. The modern Filipino hooper is no longer confined to local borders — they are a globally valued athlete competing at the frontier of Asian basketball.`,
    primaryCategoryId: 'basketball-editorials',
    topicIds: ['basketball-editorials', 'overseas-filipino-players', 'gilas-pilipinas'],
    authorId: 'rafael-dizon',
    contentType: 'editorial',
    featuredImageUrl: '/img/articles/japan-bleague-filipinos-editorial.webp',
    imageAlt: 'Editorial analysis on Filipino basketball players in Japan B.League and Gilas Pilipinas growth',
    imageCredit: 'TipOffPh / Editorial Analysis',
    seoTitle: 'Editorial: How the Japan B.League Diaspora Elevates Philippine Hoops',
    seoDescription: 'TipOffPh editorial analysis on how Filipino basketball players thriving in Japan and Korea are accelerating tactical growth for Gilas Pilipinas.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-08T10:00:00Z',
    createdAt: '2026-10-08T09:15:00Z'
  },
  {
    id: 'art-007',
    slug: 'pilipinas-super-league-quezon-city-stars-edge-manila-double-overtime-thriller',
    title: 'Pilipinas Super League: Quezon City Stars Edge Manila in Double-Overtime Thriller',
    excerpt: 'A clutch corner triple with 4.8 seconds remaining in the second extra period seals a dramatic 104-101 victory in the PSL National Tournament quarterfinals.',
    body: `QUEZON CITY, Philippines — In one of the most grueling playoff battles in Pilipinas Super League (PSL) history, the Quezon City Stars outlasted the Manila Stars in a double-overtime 104-101 slugfest at the Amoranto Sports Complex on Wednesday evening.

Trailing by two with under ten seconds left in the second overtime, QC veteran floor general Mark Cruz executed a crisp pick-and-roll before kicking out to an open shooting guard on the wing, who sank the game-winning three-pointer as the arena erupted.

### Defensive Grit Down the Stretch

Both squads traded body blows through forty minutes of regulation and two exhausting five-minute extensions. The contest featured 18 lead changes and 14 deadlocks, highlighting the parity and grassroots passion defining the current PSL season.

"Our boys simply refused to pack it in," said Quezon City head coach in the post-game press conference. "Playing back-to-back overtimes demands absolute discipline and heart. Credit to Manila for pushing us to the brink, but our transition defense saved us in the final minute."

With the hard-fought quarterfinal triumph, Quezon City books their ticket to the PSL National Semifinals, where they will face the top-seeded Davao Occidental Tigers in a best-of-three series next week.`,
    primaryCategoryId: 'psl-news',
    topicIds: ['psl-news', 'vismin-super-cup'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'Pilipinas Super League Media Bureau',
    sourceUrl: 'https://tipoffph.com/psl-news',
    featuredImageUrl: '/img/articles/pilipinas-super-league-qc-manila.webp',
    imageAlt: 'Pilipinas Super League 104-101 double overtime thriller: Quezon City Stars vs Manila Stars',
    imageCredit: 'TipOffPh / Regional Hoops Desk',
    seoTitle: 'PSL: Quezon City Stars Edge Manila in Double-Overtime Thriller | TipOffPh',
    seoDescription: 'Quezon City Stars advance to the Pilipinas Super League National Semifinals after a gripping 104-101 double-overtime victory over Manila.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-07T14:30:00Z',
    createdAt: '2026-10-07T13:40:00Z'
  },
  {
    id: 'art-008',
    slug: 'sneakers-and-gear-review-anta-kai-1-performance-analysis-court-testing',
    title: 'Sneakers & Gear: On-Court Performance Review of the ANTA KAI 1 in Philippine Conditions',
    excerpt: 'We tested Kyrie Irving’s signature ANTA KAI 1 across 10 outdoor and indoor hardwood sessions in Manila to evaluate traction, containment, and tropical breathability.',
    body: `MANILA — Few signature sneaker arrivals have generated as much anticipation in local shoe circles as the debut of Kyrie Irving’s signature line with ANTA. The KAI 1 promises elite multidirectional traction, low-profile cushioning, and cultural design motifs.

To provide an authentic evaluation for Filipino hoopers, our gear review team tested the ANTA KAI 1 over a rigorous three-week period across both climate-controlled indoor hardwood courts and high-abrasion outdoor concrete courts in Metro Manila.

### Traction & Court Feel (Rating: 9.5/10)

The herringbone-inspired outsole pattern is aggressive and sticky. On dusty indoor gym surfaces, the compound wiped cleanly and provided immediate bite without squeak degradation. Outdoor players will appreciate the rubber depth, though we recommend reserving specialized colorways for indoor hardwood to prolong compound life.

### Cushioning & Impact Protection (Rating: 8.5/10)

Utilizing ANTA's proprietary NitroEdge foam, the setup delivers an exceptionally responsive ride tailored for shifty ballhandlers who prioritize court feel and rapid first-step acceleration over max-cushion plunge.

### Tropical Durability & Ventilation (Rating: 8.0/10)

The woven upper is reinforced with TPU synthetic overlays and embroidered tribal motifs. While breathability is moderate under typical humid Philippine gymnasium conditions, the lockdown through the midfoot strap is among the best in the current market.

**Verdict**: At its accessible retail price point in Philippine flagship stores, the ANTA KAI 1 stands as one of the best guard shoes of the year for local players seeking elite lateral containment and sharp deceleration.`,
    primaryCategoryId: 'sneakers-and-gear',
    topicIds: ['sneakers-and-gear'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    featuredImageUrl: '/img/articles/anta-kai-1-sneaker-review.webp',
    imageAlt: 'ANTA KAI 1 Kyrie Irving signature basketball shoe on-court performance review',
    imageCredit: 'TipOffPh / Kicks & Gear Desk',
    seoTitle: 'ANTA KAI 1 On-Court Performance Review | TipOffPh Sneakers & Gear',
    seoDescription: 'In-depth performance review of the ANTA KAI 1 tested on Philippine indoor hardwood and outdoor courts: traction, cushioning, and fit evaluated.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-06T18:00:00Z',
    createdAt: '2026-10-06T17:15:00Z'
  },
  {
    id: 'art-009',
    slug: 'mpbl-playoffs-2026-bracket-update-oct-10',
    title: '2026 MPBL Playoffs: Bracket Standings as of October 10',
    excerpt: 'The 2026 MPBL Playoffs have officially tipped off, and the top contenders are already proving why they earned home-court advantage. Based on the latest updated bracket for the Best-of-3 Quarterfinals, the heavyweights in both the North and South Divisions have successfully drawn first blood.',
    body: `The 2026 MPBL Playoffs have officially tipped off, and the top contenders are already proving why they earned home-court advantage. Based on the latest updated bracket for the Best-of-3 Quarterfinals, the heavyweights in both the North and South Divisions have successfully drawn first blood.

### North Division Quarterfinals Update

The upper echelon of the North Division took care of business in their opening matches. The #1, #2, and #3 seeds have all jumped to a 1-0 lead in their respective Best-of-3 series. The only series yet to record a result is the highly anticipated #4 vs. #5 seed matchup, which remains deadlocked at 0-0.

### South Division Quarterfinals Update

The South Division bracket perfectly mirrors the action up North. The #1, #2, and #3 seeds successfully defended their home turf to secure 1-0 advantages. Similar to the North, the #4 vs. #5 seed battle in the South has yet to notch a win for either side, sitting at 0-0.

### The Road to the National Finals

Teams are currently battling through the Quarterfinals and Semifinals, both of which are sudden-death Best-of-3 series. The survivors will advance to the grueling Best-of-5 Division Finals to crown the kings of the North and South. Ultimately, the two division champions will collide in the 2026 National Finals.

Stay tuned for more updates as the Best-of-3 Quarterfinals continue.`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news', 'mpbl'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Official Media Bureau',
    sourceUrl: 'https://mpbl.ph',
    featuredImageUrl: '/img/mpbl-latest-playoff-bracket-oct-10.webp',
    imageAlt: '2026 MPBL Playoff bracket standings as of October 10 showing North and South division matchups',
    imageCredit: 'MPBL / TipOffPh Coverage Desk',
    seoTitle: '2026 MPBL Playoff Bracket: Top Seeds Dominate Quarterfinals',
    seoDescription: 'Get the latest 2026 MPBL Playoff bracket updates for October 10. Top seeds in both the North and South divisions secure early 1-0 Quarterfinal leads.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: '2026-10-10T06:30:00Z',
    createdAt: '2026-10-10T06:00:00Z'
  },
  ...[...NBA_PRESEASON_PREDICTIONS_TOMORROW, ...NBA_PRESEASON_PREDICTIONS_FIVE_GAME_SLATE].map((pred, idx): Article => ({
    id: `art-nba-pred-${pred.id}`,
    slug: pred.articleSlug,
    title: pred.blogTitle,
    excerpt: `${pred.shortBlogLead} Expert Pick: ${pred.expertPick} (Projected Score: ${pred.awayTeam.abbr} ${pred.predictedScore.away} - ${pred.homeTeam.abbr} ${pred.predictedScore.home}).`,
    body: [
      `MANILA / NBA DESK — ${pred.shortBlogLead}`,
      `### Matchup & Broadcast Details`,
      `- **Matchup:** ${pred.awayTeam.name} (${pred.awayTeam.preseasonRecord}) at ${pred.homeTeam.name} (${pred.homeTeam.preseasonRecord})`,
      `- **Tip-Off Time:** ${pred.tipOffPht} (${pred.tipOffUs})`,
      `- **Arena:** ${pred.venue}`,
      `- **Spread / Total:** ${pred.spreadLine} | ${pred.overUnderLine} | Moneyline: ${pred.moneyline}`,
      `### Preseason Fight Breakdown & Tactical Analysis`,
      ...pred.shortBlogParagraphs,
      `### Star Matchup Spotlight`,
      `- **${pred.awayTeam.name} Key Performer:** ${pred.awayTeam.starPlayer.name} (${pred.awayTeam.starPlayer.position}) — ${pred.awayTeam.starPlayer.preseasonAvg}`,
      `- **${pred.homeTeam.name} Key Performer:** ${pred.homeTeam.starPlayer.name} (${pred.homeTeam.starPlayer.position}) — ${pred.homeTeam.starPlayer.preseasonAvg}`,
      `### Key Betting & Rotation Trends`,
      ...pred.tacticalKeys.map(k => `- ${k}`),
      `### Final Prediction & Score Projection`,
      `**Projected Final Score:** ${pred.predictedWinnerName} win, **${pred.awayTeam.abbr} ${pred.predictedScore.away} – ${pred.homeTeam.abbr} ${pred.predictedScore.home}**\n\n**Official TipOffPh Pick:** **${pred.expertPick}** (${pred.confidencePct}% Model Confidence)`
    ].join('\n\n'),
    primaryCategoryId: 'nba-news',
    topicIds: ['nba-news', 'nba', 'game-previews-and-predictions'],
    authorId: 'author-rafael-dizon',
    contentType: 'analysis',
    sourceName: 'TipOffPh NBA Analytics & Preseason Desk',
    sourceUrl: 'https://nba.com',
    featuredImageUrl: pred.featuredImageUrl,
    imageAlt: `${pred.awayTeam.name} vs ${pred.homeTeam.name} NBA Preseason Prediction Featured Image`,
    imageCredit: `Official NBA Preseason Action (${pred.awayTeam.abbr} & ${pred.homeTeam.abbr}) / TipOffPh`,
    seoTitle: `${pred.blogTitle} | TipOffPh NBA Predictions`,
    seoDescription: `${pred.shortBlogLead} Read our full NBA preseason prediction, odds breakdown (${pred.spreadLine}, ${pred.overUnderLine}), and projected score.`,
    isFeatured: idx < 5,
    isBreaking: idx === 0,
    status: 'published',
    publishedAt: _isoMinutesAgo(60 + idx * 3),
    createdAt: _isoMinutesAgo(120 + idx * 3)
  })),
  {
    id: 'art-pba-003',
    slug: 'pba-governors-cup-barangay-ginebra-vs-nlex-road-warriors-araneta-showdown',
    title: "PBA Governors' Cup: Barangay Ginebra Outduels NLEX Road Warriors 104-99 in High-Octane Smart Araneta Showdown",
    excerpt: 'Scottie Thompson and Justin Brownlee orchestrate a relentless fourth-quarter perimeter blitz as the Gin Kings hold off Robert Bolick and the NLEX Road Warriors under the bright lights of the Big Dome.',
    body: `QUEZON CITY — Under the bright lights of the Smart Araneta Coliseum, Barangay Ginebra San Miguel delivered a vintage "Never Say Die" fourth-quarter surge to turn back a spirited NLEX Road Warriors squad, 104-99, in a pivotal PBA Governors' Cup elimination clash.

With both clubs jockeying for quarterfinal positioning, the contest evolved into a high-speed guard duel between Ginebra floor general Scottie Thompson and NLEX playmaker Robert Bolick. Thompson finished with a near triple-double of 19 points, 10 rebounds, and 8 assists, repeatedly slicing through NLEX's perimeter defense off high ball-screens.

### Brownlee & Thompson Ignite the Fourth Quarter

Trailing 82-79 entering the final ten minutes, head coach Tim Cone tightened Ginebra's half-court switching scheme, forcing NLEX into contested pull-up jumpers. Resident import Justin Brownlee took over offensively, pouring in 14 of his 32 points in the fourth period, including back-to-back transition three-pointers that sent the red-clad Araneta crowd into an uproar.

"NLEX pushed our transition defense to the limit tonight," Cone noted post-game. "Robert Bolick is a tremendous pick-and-roll creator, and it took a full team effort from Scottie, Maverick Ahanmisi, and Stephen Holt to contain their guard penetration down the stretch."

### Key Matchup Takeaways

- **Backcourt Execution:** Ginebra dished out 29 team assists against just 9 turnovers, punishing NLEX's blitzing schemes.
- **Paint Scoring:** Japeth Aguilar added 18 points and 3 blocks to seal the interior in the closing two minutes.`,
    primaryCategoryId: 'pba-news',
    topicIds: ['pba-news', 'pba-governors-cup', 'pba'],
    authorId: 'author-joaquin-santos',
    contentType: 'news',
    sourceName: 'PBA Official Media Bureau',
    sourceUrl: 'https://pba.ph',
    featuredImageUrl: '/img/articles/pba-ginebra-vs-nlex-araneta.jpg',
    imageAlt: 'Barangay Ginebra guard driving past NLEX Road Warriors defender at Smart Araneta Coliseum',
    imageCredit: 'TipOffPh / PBA Courtside Lens',
    seoTitle: 'Barangay Ginebra Beats NLEX 104-99 in PBA Araneta Showdown | TipOffPh',
    seoDescription: 'Justin Brownlee and Scottie Thompson power Barangay Ginebra past the NLEX Road Warriors 104-99 at Smart Araneta Coliseum.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: _isoMinutesAgo(95),
    createdAt: _isoMinutesAgo(125)
  },
  {
    id: 'art-uaap-003',
    slug: 'uaap-season-87-up-fighting-maroons-battle-ue-red-warriors-round-2-clash',
    title: 'UAAP Season 87: UP Fighting Maroons Weather UE Red Warriors Second-Half Storm in Physical 79-73 Victory',
    excerpt: 'Quentin Millora-Brown and Francis Lopez dominate the offensive glass as the UP Fighting Maroons hold off Precious Momowei and the surging UE Red Warriors.',
    body: `MANILA — In a physical battle of top-four contenders, the University of the Philippines (UP) Fighting Maroons leaned on their championship poise and frontline size to outlast the University of the East (UE) Red Warriors, 79-73, in UAAP Season 87 second-round action.

With both teams sporting maroon and crimson colors in front of a packed collegiate crowd, the interior war between UP center Quentin Millora-Brown and UE student-athlete standout Precious Momowei headlined the afternoon. Millora-Brown hauled down 15 rebounds—including 7 on the offensive glass—to give UP crucial second-chance possessions in crunch time.

### Second-Half Defensive Lockdown

After UE trimmed a 13-point deficit down to two midway through the fourth quarter behind Wello Lingolingo's perimeter shooting, UP guard Gerry Abadiano and Harold Alarcon clamped down on the perimeter, forcing three consecutive shot-clock violations.

"UE is one of the most disciplined defensive teams in the UAAP this season," UP head coach Goldwin Monteverde said. "Winning the rebounding battle in the final five minutes was the difference."`,
    primaryCategoryId: 'uaap-basketball',
    topicIds: ['uaap-basketball', 'uaap', 'collegiate-basketball', 'ncaa-basketball'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'UAAP Press Corps',
    sourceUrl: 'https://uaap.org.ph',
    featuredImageUrl: '/img/articles/uaap-up-vs-ue-red-warriors.jpg',
    imageAlt: 'UP Fighting Maroons and UE Red Warriors battling for a rebound in UAAP collegiate basketball action',
    imageCredit: 'TipOffPh / Collegiate Courtside',
    seoTitle: 'UP Fighting Maroons Edge UE Red Warriors 79-73 in UAAP Clash | TipOffPh',
    seoDescription: 'Quentin Millora-Brown and Francis Lopez power the UP Fighting Maroons past the UE Red Warriors 79-73 in UAAP Season 87 action.',
    isFeatured: true,
    isBreaking: false,
    status: 'published',
    publishedAt: _isoMinutesAgo(102),
    createdAt: _isoMinutesAgo(132)
  },
  {
    id: 'art-uaap-004',
    slug: 'uaap-season-87-feu-tamaraws-veezy-bautista-pao-jaurigue-final-four-push',
    title: 'UAAP Season 87: FEU Tamaraws Surge Into Final Four Contention Behind Explosive Backcourt Drive at MOA Arena',
    excerpt: 'Jorick Bautista and Veejay Pre spearhead a relentless transition attack in green and gold as the FEU Tamaraws stun the blue-clad defense in front of a roaring student crowd.',
    body: `PASAY CITY — The Far Eastern University (FEU) Tamaraws kept their UAAP Season 87 Final Four hopes burning bright on Wednesday afternoon, unleashing a blistering fourth-quarter run at the Mall of Asia Arena to secure a statement victory in second-round elimination play.

Wearing their signature gold and green uniforms, the Tamaraws attacked the paint relentlessly. Dynamic guard Jorick Bautista poured in 23 points on 9-of-16 shooting, repeatedly beating perimeter defenders off the dribble to collapse the interior defense and open up kick-out triples.

### Youth Movement Under Sean Chambers

Head coach Sean Chambers praised his young Morayta squad's resilience after bouncing back from a slow first-round start: "Our guards are playing fearless basketball right now. When Veejay Pre and Mo Konateh control the defensive rebounds and let our guards run in transition, we can compete with anyone in the league."`,
    primaryCategoryId: 'uaap-basketball',
    topicIds: ['uaap-basketball', 'uaap', 'collegiate-basketball', 'ncaa-basketball'],
    authorId: 'author-maria-reyes',
    contentType: 'news',
    sourceName: 'UAAP Press Corps',
    sourceUrl: 'https://uaap.org.ph',
    featuredImageUrl: '/img/articles/uaap-feu-tamaraws-moa-arena.jpg',
    imageAlt: 'FEU Tamaraws guard in gold and green jersey driving past blue defender in packed UAAP arena',
    imageCredit: 'TipOffPh / Collegiate Courtside',
    seoTitle: 'FEU Tamaraws Surge in UAAP Season 87 Final Four Race | TipOffPh',
    seoDescription: 'Jorick Bautista and Veejay Pre power the FEU Tamaraws to a statement second-round UAAP victory at the Mall of Asia Arena.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: _isoMinutesAgo(110),
    createdAt: _isoMinutesAgo(140)
  },
  {
    id: 'art-mpbl-004',
    slug: 'mpbl-playoffs-batangas-city-tanduay-vs-san-juan-knights-regional-clash',
    title: 'MPBL Playoffs: Batangas City Tanduay Rum Masters Clash With San Juan Knights in Packed Regional Arena Thriller',
    excerpt: 'Levi Hernandez and Cedric Ablaza ignite the green-and-gold faithful in transition as Batangas City trades haymakers with Orlan Wamar and the San Juan Knights.',
    body: `BATANGAS CITY — Playoff intensity reached a boiling point at the Batangas City Sports Coliseum as the Batangas City Tanduay Rum Masters and the San Juan Knights collided in a classic Maharlika Pilipinas Basketball League (MPBL) postseason showdown.

Backed by a sea of green-and-gold hometown supporters, Batangas City pushed the tempo off every defensive stop, with veteran wing Cedric Ablaza and sharpshooter Levi Hernandez combining for 39 points. San Juan countered with crisp half-court ball movement led by Orlan Wamar and Michael Calisaan, turning the fourth quarter into a possession-by-possession chess match.

### Regional Basketball at Its Finest

"Games like tonight show why regional playoff basketball means so much to our local communities," Batangas head coach Cholo Villanueva said. "Every loose ball and transition layup is contested with everything both teams have."`,
    primaryCategoryId: 'mpbl-news',
    topicIds: ['mpbl-news', 'mpbl'],
    authorId: 'author-carlo-mendoza',
    contentType: 'news',
    sourceName: 'MPBL Official Press Office',
    sourceUrl: 'https://mpbl.ph',
    featuredImageUrl: '/img/articles/mpbl-batangas-vs-san-juan.jpg',
    imageAlt: 'MPBL playoff fastbreak action between Batangas City in green and gold and San Juan in white jerseys',
    imageCredit: 'TipOffPh / Regional Hoops Desk',
    seoTitle: 'Batangas City vs San Juan Knights MPBL Playoff Thriller | TipOffPh',
    seoDescription: 'Batangas City Tanduay Rum Masters and San Juan Knights battle in a high-intensity MPBL playoff clash in front of a packed regional crowd.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: _isoMinutesAgo(118),
    createdAt: _isoMinutesAgo(148)
  },
  {
    id: 'art-easl-001',
    slug: 'easl-2026-ryukyu-golden-kings-meralco-bolts-group-stage-showdown',
    title: 'EASL 2026 Group Stage: Ryukyu Golden Kings and Meralco Bolts Trade Blows in Electric Asian Champions Clash',
    excerpt: 'Japan B.League powerhouse Ryukyu Golden Kings test PBA contenders Meralco Bolts with relentless full-court perimeter pressure in East Asia Super League action.',
    body: `MANILA — Regional club basketball took center stage in the East Asia Super League (EASL) 2025-26 Group Stage as Japan B.League powerhouse Ryukyu Golden Kings squared off against Philippine representatives Meralco Bolts in a fast-paced continental showcase.

Sporting their iconic black-and-gold trim against white-and-blue road kits, the Golden Kings leaned on disciplined ball-screen continuity and physical perimeter defense to test Meralco guard Chris Newsome and reinforcement DJ Kennedy across all four quarters.

### Elevating Asian Club Competition

With FIBA Asia Champions Cup berths and international prestige on the line, both clubs traded transition runs and deep three-pointers, underscoring the rapid narrowing of the talent gap across the PBA, Japan B.League, and KBL.`,
    primaryCategoryId: 'gilas-pilipinas',
    topicIds: ['gilas-pilipinas', 'pba-news', 'overseas-filipino-players'],
    authorId: 'author-rafael-dizon',
    contentType: 'news',
    sourceName: 'EASL Official Media Desk',
    sourceUrl: 'https://easl.basketball',
    featuredImageUrl: '/img/articles/easl-ryukyu-golden-kings-clash.jpg',
    imageAlt: 'East Asia Super League perimeter defense between Ryukyu Golden Kings in black-gold and white-blue jerseys',
    imageCredit: 'TipOffPh / EASL Coverage Desk',
    seoTitle: 'EASL 2026: Ryukyu Golden Kings vs Meralco Bolts Clash | TipOffPh',
    seoDescription: 'Ryukyu Golden Kings and Meralco Bolts battle in a high-intensity East Asia Super League group stage showdown.',
    isFeatured: false,
    isBreaking: false,
    status: 'published',
    publishedAt: _isoMinutesAgo(125),
    createdAt: _isoMinutesAgo(155)
  }
];

export const DEMO_SCORES: GameScore[] = [
  // 1. PBA
  {
    id: 'score-pba-01',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Quarterfinals Game 3",
    stage: 'Quarterfinals',
    homeTeam: 'San Miguel Beermen',
    awayTeam: 'Meralco Bolts',
    homeScore: 108,
    awayScore: 103,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-09T10:00:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Stats Desk',
    updatedAt: '2026-10-09T12:30:00Z'
  },
  {
    id: 'score-pba-02',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Semifinals Game 1",
    stage: 'Semifinals',
    homeTeam: 'Barangay Ginebra',
    awayTeam: 'Magnolia Hotshots',
    homeScore: 92,
    awayScore: 89,
    status: 'live',
    statusDetail: 'Q4 2:18',
    gameTimeUtc: '2026-10-09T12:15:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Stats Desk',
    updatedAt: '2026-10-09T14:05:00Z'
  },
  {
    id: 'score-pba-03',
    league: 'PBA',
    leagueFullName: 'Philippine Basketball Association',
    leagueId: 'pba',
    leagueLogo: '/img/pba.png',
    eventName: "PBA Governors' Cup 2026 - Semifinals Game 2",
    stage: 'Semifinals',
    homeTeam: 'TNT Tropang Giga',
    awayTeam: 'Rain or Shine Elasto Painters',
    status: 'upcoming',
    statusDetail: 'Tomorrow 5:00 PM PHT',
    gameTimeUtc: '2026-10-11T09:00:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'RPTV / Pilipinas Live',
    sourceName: 'PBA Official Operations',
    updatedAt: '2026-10-10T04:00:00Z'
  },

  // 2. MPBL
  {
    id: 'score-mpbl-01',
    league: 'MPBL',
    leagueFullName: 'Maharlika Pilipinas Basketball League',
    leagueId: 'mpbl',
    leagueLogo: '/img/mpbl.png',
    eventName: '2026 MPBL Playoffs - North Division Quarterfinals Game 2',
    stage: 'North Quarterfinals',
    homeTeam: 'Pampanga Giant Lanterns',
    awayTeam: 'San Juan Knights',
    homeScore: 84,
    awayScore: 81,
    status: 'final',
    statusDetail: 'Final (Pampanga leads 2-0)',
    gameTimeUtc: '2026-10-08T12:00:00Z',
    venue: 'Bren Z. Guiao Convention Center, San Fernando, Pampanga',
    broadcast: 'MediaQuest / MPBL Livestream',
    sourceName: 'MPBL Official Stats Desk',
    updatedAt: '2026-10-08T14:15:00Z'
  },
  {
    id: 'score-mpbl-02',
    league: 'MPBL',
    leagueFullName: 'Maharlika Pilipinas Basketball League',
    leagueId: 'mpbl',
    leagueLogo: '/img/mpbl.png',
    eventName: '2026 MPBL Playoffs - South Division Quarterfinals Game 1',
    stage: 'South Quarterfinals',
    homeTeam: 'Quezon Huskers',
    awayTeam: 'Zamboanga Master Sardines',
    homeScore: 78,
    awayScore: 71,
    status: 'live',
    statusDetail: 'Q4 5:44',
    gameTimeUtc: '2026-10-10T11:00:00Z',
    venue: 'Lucena Convention Center, Quezon Province',
    broadcast: 'MediaQuest / MPBL Livestream',
    sourceName: 'MPBL Official Stats Desk',
    updatedAt: '2026-10-10T12:30:00Z'
  },

  // 3. UAAP
  {
    id: 'score-uaap-01',
    league: 'UAAP',
    leagueFullName: 'University Athletic Association of the Philippines',
    leagueId: 'uaap',
    leagueLogo: '/img/uaap.webp',
    eventName: "UAAP Season 87 Men's Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'UP Fighting Maroons',
    awayTeam: 'DLSU Green Archers',
    homeScore: 76,
    awayScore: 72,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-08T08:00:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / UAAP Varsity Channel',
    sourceName: 'UAAP Press Corps',
    updatedAt: '2026-10-08T10:15:00Z'
  },
  {
    id: 'score-uaap-02',
    league: 'UAAP',
    leagueFullName: 'University Athletic Association of the Philippines',
    leagueId: 'uaap',
    leagueLogo: '/img/uaap.webp',
    eventName: "UAAP Season 87 Men's Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'Ateneo Blue Eagles',
    awayTeam: 'UST Growling Tigers',
    homeScore: 68,
    awayScore: 71,
    status: 'live',
    statusDetail: 'Q3 1:30',
    gameTimeUtc: '2026-10-10T06:00:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'One Sports / UAAP Varsity Channel',
    sourceName: 'UAAP Press Corps',
    updatedAt: '2026-10-10T07:20:00Z'
  },

  // 4. NCAA
  {
    id: 'score-ncaa-01',
    league: 'NCAA',
    leagueFullName: 'NCAA Philippines Basketball',
    leagueId: 'ncaa',
    leagueLogo: '/img/ncaa.png',
    eventName: "NCAA Season 100 Seniors Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'San Beda Red Lions',
    awayTeam: 'Mapúa Cardinals',
    homeScore: 75,
    awayScore: 73,
    status: 'final',
    statusDetail: 'Final (OT)',
    gameTimeUtc: '2026-10-09T06:00:00Z',
    venue: 'Filoil EcoOil Centre, San Juan City',
    broadcast: 'GTV / Heart of Asia / GMA Sports',
    sourceName: 'NCAA Management Committee',
    updatedAt: '2026-10-09T08:45:00Z'
  },
  {
    id: 'score-ncaa-02',
    league: 'NCAA',
    leagueFullName: 'NCAA Philippines Basketball',
    leagueId: 'ncaa',
    leagueLogo: '/img/ncaa.png',
    eventName: "NCAA Season 100 Seniors Basketball - Round 2 Elimination",
    stage: 'Round 2 Elimination',
    homeTeam: 'CSB Blazers',
    awayTeam: 'Letran Knights',
    status: 'upcoming',
    statusDetail: 'Sunday 2:30 PM PHT',
    gameTimeUtc: '2026-10-12T06:30:00Z',
    venue: 'Filoil EcoOil Centre, San Juan City',
    broadcast: 'GTV / GMA Sports Online',
    sourceName: 'NCAA Management Committee',
    updatedAt: '2026-10-10T03:00:00Z'
  },

  // 5. Gilas Pilipinas
  {
    id: 'score-gilas-01',
    league: 'Gilas Pilipinas',
    leagueFullName: 'Gilas Pilipinas (National Team & FIBA Qualifiers)',
    leagueId: 'gilas',
    leagueLogo: '/img/gilas-pilipinas.png',
    eventName: 'FIBA Asia Cup 2025 Qualifiers - Window 2',
    stage: 'Window 2 Group Phase',
    homeTeam: 'Philippines (Gilas)',
    awayTeam: 'New Zealand (Tall Blacks)',
    status: 'upcoming',
    statusDetail: 'Nov 21, 7:30 PM PHT',
    gameTimeUtc: '2026-11-21T11:30:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'FIBA Asia Operations',
    updatedAt: '2026-10-09T08:00:00Z'
  },
  {
    id: 'score-gilas-02',
    league: 'Gilas Pilipinas',
    leagueFullName: 'Gilas Pilipinas (National Team & FIBA Qualifiers)',
    leagueId: 'gilas',
    leagueLogo: '/img/gilas-pilipinas.png',
    eventName: 'FIBA Asia Cup 2025 Qualifiers - Window 2',
    stage: 'Window 2 Group Phase',
    homeTeam: 'Philippines (Gilas)',
    awayTeam: 'Hong Kong',
    status: 'upcoming',
    statusDetail: 'Nov 24, 7:30 PM PHT',
    gameTimeUtc: '2026-11-24T11:30:00Z',
    venue: 'Mall of Asia Arena, Pasay City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'FIBA Asia Operations',
    updatedAt: '2026-10-09T08:00:00Z'
  },

  // 6. PSL
  {
    id: 'score-psl-01',
    league: 'PSL',
    leagueFullName: 'Pilipinas Super League',
    leagueId: 'psl',
    leagueLogo: '/img/PSL_Logo.png',
    eventName: "PSL President's Cup 2026 - National Championship Round",
    stage: 'Championship Round',
    homeTeam: 'Davao Occidental Tigers',
    awayTeam: 'Quezon City Stars',
    homeScore: 91,
    awayScore: 86,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-07T10:00:00Z',
    venue: 'Paco Arena Sports Center, Manila',
    broadcast: 'Solar Sports / PSL Facebook Live',
    sourceName: 'Pilipinas Super League Media',
    updatedAt: '2026-10-07T12:30:00Z'
  },
  {
    id: 'score-psl-02',
    league: 'PSL',
    leagueFullName: 'Pilipinas Super League',
    leagueId: 'psl',
    leagueLogo: '/img/PSL_Logo.png',
    eventName: "PSL President's Cup 2026 - Elimination Round",
    stage: 'Elimination Round',
    homeTeam: 'Biñan Tatak Gel',
    awayTeam: 'Manila Stars',
    status: 'upcoming',
    statusDetail: 'Saturday 6:00 PM PHT',
    gameTimeUtc: '2026-10-17T10:00:00Z',
    venue: 'Alonte Sports Arena, Biñan, Laguna',
    broadcast: 'Solar Sports / PSL Live',
    sourceName: 'Pilipinas Super League Media',
    updatedAt: '2026-10-10T02:00:00Z'
  },

  // 7. PBA D-League
  {
    id: 'score-d-league-01',
    league: 'PBA D-League',
    leagueFullName: 'PBA Developmental League',
    leagueId: 'd-league',
    leagueLogo: '/img/PBA_D-League_logo.png',
    eventName: "PBA D-League Aspirants' Cup 2026 - Finals Game 2",
    stage: 'Finals',
    homeTeam: 'EcoOil-DLSU Green Archers',
    awayTeam: 'Marinerong Pilipino-San Beda',
    homeScore: 88,
    awayScore: 82,
    status: 'final',
    statusDetail: 'Final (Series 2-0)',
    gameTimeUtc: '2026-10-06T07:30:00Z',
    venue: 'Ynares Sports Arena, Pasig City',
    broadcast: 'PBA Rush / Pilipinas Live',
    sourceName: 'PBA D-League Technical Desk',
    updatedAt: '2026-10-06T09:45:00Z'
  },

  // 8. VisMin Cup
  {
    id: 'score-vismin-01',
    league: 'VisMin Cup',
    leagueFullName: 'Pilipinas VisMin Super Cup',
    leagueId: 'vismin',
    leagueLogo: '/img/vismin-cup.png',
    eventName: 'Pilipinas VisMin Super Cup - Southern Conference Semifinals',
    stage: 'Southern Semifinals',
    homeTeam: 'Basilan Peace Riders',
    awayTeam: 'KCS Computer Specialist Mandaue',
    homeScore: 83,
    awayScore: 79,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-05T10:00:00Z',
    venue: 'City of Naga Gymnasium, Cebu',
    broadcast: 'VisMin Sports Channel / IBC 13',
    sourceName: 'VisMin Super Cup Operations',
    updatedAt: '2026-10-05T12:20:00Z'
  },

  // 9. NBL
  {
    id: 'score-nbl-01',
    league: 'NBL',
    leagueFullName: 'National Basketball League Pilipinas',
    leagueId: 'nbl',
    leagueLogo: '/img/nbl.jpg',
    eventName: "NBL Pilipinas Chairman's Cup 2026 - Regular Season",
    stage: 'Regular Season',
    homeTeam: 'Taguig Generals',
    awayTeam: 'Pampanga Delta',
    homeScore: 97,
    awayScore: 94,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-04T09:00:00Z',
    venue: 'Hagonoy Sports Complex, Taguig City',
    broadcast: 'Aliw Channel 23 / NBL TV Livestream',
    sourceName: 'NBL Pilipinas Media Desk',
    updatedAt: '2026-10-04T11:30:00Z'
  },

  // 10. EASL
  {
    id: 'score-easl-01',
    league: 'EASL',
    leagueFullName: 'East Asia Super League',
    leagueId: 'easl',
    leagueLogo: '/img/easl-logo.webp',
    eventName: 'EASL 2025-26 Season - Group Stage Marquee Clash',
    stage: 'Group Stage',
    homeTeam: 'Meralco Bolts (PBA)',
    awayTeam: 'Ryukyu Golden Kings (B.League)',
    homeScore: 89,
    awayScore: 93,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-08T11:10:00Z',
    venue: 'Smart Araneta Coliseum, Quezon City',
    broadcast: 'One Sports / EASL Digital App',
    sourceName: 'EASL Official Operations',
    updatedAt: '2026-10-08T13:30:00Z'
  },
  {
    id: 'score-easl-02',
    league: 'EASL',
    leagueFullName: 'East Asia Super League',
    leagueId: 'easl',
    leagueLogo: '/img/easl-logo.webp',
    eventName: 'EASL 2025-26 Season - Group Stage Clash',
    stage: 'Group Stage',
    homeTeam: 'San Miguel Beermen (PBA)',
    awayTeam: 'Taoyuan Pauian Pilots (P.League+)',
    status: 'upcoming',
    statusDetail: 'Oct 23, 7:10 PM PHT',
    gameTimeUtc: '2026-10-23T11:10:00Z',
    venue: 'PhilSports Arena, Pasig City',
    broadcast: 'One Sports / Pilipinas Live',
    sourceName: 'EASL Official Operations',
    updatedAt: '2026-10-09T05:00:00Z'
  },

  // 11. NBA
  {
    id: 'score-nba-01',
    league: 'NBA',
    leagueFullName: 'National Basketball Association',
    leagueId: 'nba',
    leagueLogo: '/img/nba-logo.webp',
    eventName: 'NBA 2025-26 Pre-Season / Showcase',
    stage: 'Regular Showcase',
    homeTeam: 'Boston Celtics',
    awayTeam: 'Los Angeles Lakers',
    homeScore: 114,
    awayScore: 109,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-10-09T01:30:00Z',
    venue: 'TD Garden, Boston, MA',
    broadcast: 'NBA TV Philippines / One Sports / Cignal Play',
    sourceName: 'NBA Official Stats Service',
    updatedAt: '2026-10-09T04:15:00Z'
  },
  {
    id: 'score-nba-02',
    league: 'NBA',
    leagueFullName: 'National Basketball Association',
    leagueId: 'nba',
    leagueLogo: '/img/nba-logo.webp',
    eventName: 'NBA 2025-26 Opening Week Primetime Clash',
    stage: 'Opening Week',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Dallas Mavericks',
    status: 'upcoming',
    statusDetail: 'Oct 22, 10:00 AM PHT',
    gameTimeUtc: '2026-10-22T02:00:00Z',
    venue: 'Chase Center, San Francisco, CA',
    broadcast: 'NBA TV Philippines / Pilipinas Live',
    sourceName: 'NBA Official Stats Service',
    updatedAt: '2026-10-10T01:00:00Z'
  },

  // 12. FIBA
  {
    id: 'score-fiba-01',
    league: 'FIBA',
    leagueFullName: 'FIBA Tournaments & Qualifiers',
    leagueId: 'fiba',
    leagueLogo: '/img/FIBA.webp',
    eventName: 'FIBA Olympic Qualifying Tournament - Group Stage',
    stage: 'Group Stage',
    homeTeam: 'Latvia',
    awayTeam: 'Philippines (Gilas)',
    homeScore: 80,
    awayScore: 89,
    status: 'final',
    statusDetail: 'Final (Historic Win)',
    gameTimeUtc: '2026-07-03T16:00:00Z',
    venue: 'Arena Riga, Riga, Latvia',
    broadcast: 'One Sports / Courtside 1891',
    sourceName: 'FIBA Official Results',
    updatedAt: '2026-07-03T18:15:00Z'
  },
  {
    id: 'score-fiba-02',
    league: 'FIBA',
    leagueFullName: 'FIBA Tournaments & Qualifiers',
    leagueId: 'fiba',
    leagueLogo: '/img/FIBA.webp',
    eventName: 'FIBA Olympic Qualifying Tournament - Semifinals',
    stage: 'Semifinals',
    homeTeam: 'Brazil',
    awayTeam: 'Philippines (Gilas)',
    homeScore: 71,
    awayScore: 60,
    status: 'final',
    statusDetail: 'Final',
    gameTimeUtc: '2026-07-06T12:30:00Z',
    venue: 'Arena Riga, Riga, Latvia',
    broadcast: 'One Sports / Courtside 1891',
    sourceName: 'FIBA Official Results',
    updatedAt: '2026-07-06T14:40:00Z'
  }
];
