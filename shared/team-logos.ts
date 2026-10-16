/**
 * TipOffPh Team Logos & Crest Registry
 * Provides official emblems, Kadario / TheSports CDN logos, and SVG vector badges
 * for all Philippine (PBA, MPBL, UAAP, NCAA, PSL, Gilas) and International teams.
 */

export interface TeamProfile {
  name: string;
  aliases: string[];
  logo?: string;
  accent: string;
  secondaryAccent?: string;
  shortName: string;
  initials: string;
  league: 'PBA' | 'MPBL' | 'UAAP' | 'NCAA' | 'PSL' | 'Gilas' | 'NBA' | 'International';
}

export const TEAM_REGISTRY: TeamProfile[] = [
  // ==========================================
  // 1. PBA (Philippine Basketball Association)
  // ==========================================
  {
    name: 'San Miguel Beermen',
    aliases: ['san miguel', 'beermen', 'smb'],
    logo: 'https://img.kadario.com/basketball/team/5bd0c220c5865e91b66749953a79cb3f.png',
    accent: '#B91C1C',
    secondaryAccent: '#F59E0B',
    shortName: 'Beermen',
    initials: 'SMB',
    league: 'PBA'
  },
  {
    name: 'Barangay Ginebra San Miguel',
    aliases: ['barangay ginebra', 'ginebra', 'gin kings', 'brgy ginebra', 'bgsm'],
    logo: 'https://img.kadario.com/basketball/team/4bee6b92661d43a6d7658dd5ed3fb1ff.png',
    accent: '#DC2626',
    secondaryAccent: '#FFFFFF',
    shortName: 'Gin Kings',
    initials: 'GIN',
    league: 'PBA'
  },
  {
    name: 'TNT Tropang Giga',
    aliases: ['tnt', 'tropang giga', 'tnt katropa', 'tropa'],
    logo: 'https://img.kadario.com/basketball/team/48f1ee0356f89729365e185e507bceb9.png',
    accent: '#F59E0B',
    secondaryAccent: '#1E3A8A',
    shortName: 'Tropang Giga',
    initials: 'TNT',
    league: 'PBA'
  },
  {
    name: 'Magnolia Hotshots',
    aliases: ['magnolia', 'hotshots', 'chicken timplados'],
    logo: 'https://img.kadario.com/basketball/team/163390dae69ab886224f9a021bd4ba71.png',
    accent: '#1E3A8A',
    secondaryAccent: '#EF4444',
    shortName: 'Hotshots',
    initials: 'MAG',
    league: 'PBA'
  },
  {
    name: 'Meralco Bolts',
    aliases: ['meralco', 'bolts'],
    logo: 'https://img.kadario.com/basketball/team/9a36a224e878349291e4863dbc1fc874.png',
    accent: '#EA580C',
    secondaryAccent: '#0284C7',
    shortName: 'Bolts',
    initials: 'MER',
    league: 'PBA'
  },
  {
    name: 'Rain or Shine Elasto Painters',
    aliases: ['rain or shine', 'elasto painters', 'elastopainters', 'rain or shine elastopainters', 'ros'],
    logo: 'https://img.kadario.com/basketball/team/fb4cef7d3a0ecc5fffcba83520732a94.png',
    accent: '#0284C7',
    secondaryAccent: '#EAB308',
    shortName: 'Elasto Painters',
    initials: 'ROS',
    league: 'PBA'
  },
  {
    name: 'Blackwater Bossing',
    aliases: ['blackwater', 'bossing'],
    logo: 'https://img.kadario.com/basketball/team/a48aa305cfd332937ab632f02aa085be.png',
    accent: '#1E293B',
    secondaryAccent: '#DC2626',
    shortName: 'Bossing',
    initials: 'BWT',
    league: 'PBA'
  },
  {
    name: 'Terrafirma Dyip',
    aliases: ['terrafirma', 'dyip'],
    logo: 'https://img.kadario.com/basketball/team/30aec23e238e9c0354de2d67d4fc918c.png',
    accent: '#16A34A',
    secondaryAccent: '#F59E0B',
    shortName: 'Dyip',
    initials: 'TER',
    league: 'PBA'
  },
  {
    name: 'Phoenix Fuel Masters',
    aliases: ['phoenix fuel masters', 'phoenix fuelmasters', 'fuel masters', 'fuelmasters', 'phoenix super lpg', 'phoenix pba'],
    logo: 'https://img.thesports.com/basketball/team/95c0060c118a7cdbf4ae5af32e2df905.png',
    accent: '#E11D48',
    secondaryAccent: '#F97316',
    shortName: 'Fuel Masters',
    initials: 'PHX',
    league: 'PBA'
  },
  {
    name: 'NLEX Road Warriors',
    aliases: ['nlex', 'road warriors'],
    logo: 'https://img.kadario.com/basketball/team/1d50e82c63dfb37c05fe0eaaeec36b56.png',
    accent: '#0284C7',
    secondaryAccent: '#EA580C',
    shortName: 'Road Warriors',
    initials: 'NLX',
    league: 'PBA'
  },
  {
    name: 'NorthPort Batang Pier',
    aliases: ['northport', 'batang pier'],
    logo: 'https://img.kadario.com/basketball/team/2bb2744ad4047814b74a103135df68b5.png',
    accent: '#DC2626',
    secondaryAccent: '#1E293B',
    shortName: 'Batang Pier',
    initials: 'NP',
    league: 'PBA'
  },
  {
    name: 'Converge FiberXers',
    aliases: ['converge', 'fiberxers'],
    logo: 'https://img.kadario.com/basketball/team/bf849767c5e2ec647d69f030bc275489.png',
    accent: '#7C3AED',
    secondaryAccent: '#06B6D4',
    shortName: 'FiberXers',
    initials: 'CNV',
    league: 'PBA'
  },
  {
    name: 'Titan Ultra Giant Risers',
    aliases: ['titan ultra', 'giant risers', 'titan ultra giant risers'],
    logo: 'https://img.thesports.com/basketball/team/bf00306322e85ee7c3b72c7e1a8a82e0.png',
    accent: '#0284C7',
    secondaryAccent: '#1E293B',
    shortName: 'Giant Risers',
    initials: 'TGR',
    league: 'PBA'
  },
  {
    name: 'Macau Black Knights',
    aliases: ['macau black knights', 'black knights', 'macau'],
    logo: 'https://img.thesports.com/basketball/team/47f1194ed9989759c7ed13c7659cd5ee.png',
    accent: '#1E293B',
    secondaryAccent: '#F59E0B',
    shortName: 'Black Knights',
    initials: 'MBK',
    league: 'PBA'
  },

  // ==========================================
  // 2. MPBL (Maharlika Pilipinas Basketball League)
  // ==========================================
  {
    name: 'San Juan Knights',
    aliases: ['san juan', 'san juan knights'],
    logo: 'https://img.thesports.com/basketball/team/47f1194ed9989759c7ed13c7659cd5ee.png',
    accent: '#DC2626',
    shortName: 'Knights',
    initials: 'SJK',
    league: 'MPBL'
  },
  {
    name: 'Quezon Huskers',
    aliases: ['quezon', 'huskers'],
    logo: 'https://img.thesports.com/basketball/team/c8fe98b168638e96e5567931d3ed64d5.png',
    accent: '#15803D',
    shortName: 'Huskers',
    initials: 'QZN',
    league: 'MPBL'
  },
  {
    name: 'Batangas City Tanduay Rum Masters',
    aliases: ['batangas', 'batangas city', 'tanduay rum masters', 'rum masters'],
    logo: 'https://img.thesports.com/basketball/team/267cdd4c5c6b5e92ca46d7b89adae6ba.png',
    accent: '#B91C1C',
    shortName: 'Rum Masters',
    initials: 'BAT',
    league: 'MPBL'
  },
  {
    name: 'Bataan Risers',
    aliases: ['bataan', 'risers'],
    logo: 'https://img.thesports.com/basketball/team/bf00306322e85ee7c3b72c7e1a8a82e0.png',
    accent: '#2563EB',
    shortName: 'Risers',
    initials: 'BTN',
    league: 'MPBL'
  },
  {
    name: 'Caloocan Batang Kankaloo',
    aliases: ['caloocan', 'batang kankaloo', 'kankaloo'],
    logo: 'https://img.thesports.com/basketball/team/8f4f7a4d7dffd7785640d9ce2d429aa8.png',
    accent: '#EA580C',
    shortName: 'Kankaloo',
    initials: 'CAL',
    league: 'MPBL'
  },
  {
    name: 'Abra Weavers',
    aliases: ['abra', 'weavers'],
    logo: 'https://img.thesports.com/basketball/team/5251264ba0d83732beb7883f424e6a8f.png',
    accent: '#0D9488',
    shortName: 'Weavers',
    initials: 'ABR',
    league: 'MPBL'
  },
  {
    name: 'Imus Agimat',
    aliases: ['imus', 'agimat'],
    logo: 'https://img.thesports.com/basketball/team/66701cfc5a53c62614b43dc6afefb920.png',
    accent: '#4F46E5',
    shortName: 'Agimat',
    initials: 'IMS',
    league: 'MPBL'
  },
  {
    name: 'Zamboanga Familys Brand Sardines',
    aliases: ['zamboanga', 'valientes', 'familys brand'],
    logo: 'https://img.thesports.com/basketball/team/b86686e05fdecf5381748ccc02611d10.png',
    accent: '#DC2626',
    shortName: 'Zamboanga',
    initials: 'ZAM',
    league: 'MPBL'
  },
  {
    name: 'Mindoro Tamaraws',
    aliases: ['mindoro', 'mindoro tamaraws'],
    logo: 'https://img.thesports.com/basketball/team/ae4049b51eb9b2a3aa6c9b27a307c6dc.png',
    accent: '#166534',
    shortName: 'Tamaraws',
    initials: 'MIN',
    league: 'MPBL'
  },
  {
    name: 'Biñan Tatak Gel',
    aliases: ['binan', 'biñan', 'tatak gel'],
    logo: 'https://img.thesports.com/basketball/team/37b283feab059616a2c700d2f6d9d03d.png',
    accent: '#2563EB',
    shortName: 'Tatak Gel',
    initials: 'BIN',
    league: 'MPBL'
  },
  {
    name: 'GenSan Warriors',
    aliases: ['gensan', 'general santos', 'gensan warriors'],
    logo: 'https://img.thesports.com/basketball/team/42fec9be43567683d53cfc5f6ecfca3e.png',
    accent: '#F59E0B',
    shortName: 'Warriors',
    initials: 'GSN',
    league: 'MPBL'
  },
  {
    name: 'Rizal Xentro Mall Golden Coolers',
    aliases: ['rizal', 'golden coolers', 'xentro mall'],
    logo: 'https://img.thesports.com/basketball/team/53b27d64fc15df6df28edc916572818f.jpg',
    accent: '#CA8A04',
    shortName: 'Golden Coolers',
    initials: 'RZL',
    league: 'MPBL'
  },
  {
    name: 'Pasay Voyagers',
    aliases: ['pasay', 'voyagers'],
    logo: 'https://img.thesports.com/basketball/team/be59618157d743a0b8cc82ee711b31db.png',
    accent: '#0284C7',
    shortName: 'Voyagers',
    initials: 'PSY',
    league: 'MPBL'
  },
  {
    name: 'Meycauayan',
    aliases: ['meycauayan'],
    logo: 'https://img.thesports.com/basketball/team/69a4d775d11cc9263b91130770ca5209.png',
    accent: '#D97706',
    shortName: 'Meycauayan',
    initials: 'MEY',
    league: 'MPBL'
  },
  {
    name: 'Cebu Classic',
    aliases: ['cebu', 'cebu classic', 'classic'],
    logo: 'https://img.thesports.com/basketball/team/ea15ab717fed8b3e4bd82de5bfef9659.png',
    accent: '#0369A1',
    shortName: 'Classic',
    initials: 'CEB',
    league: 'MPBL'
  },
  {
    name: 'Ilagan Isabela Cowboys',
    aliases: ['ilagan', 'isabela', 'cowboys'],
    logo: 'https://img.thesports.com/basketball/team/935dd8d4e230cd5e3595dfef87bd815d.png',
    accent: '#854D0E',
    shortName: 'Cowboys',
    initials: 'ILG',
    league: 'MPBL'
  },
  {
    name: 'Pampanga Giant Lanterns',
    aliases: ['pampanga', 'giant lanterns', 'lanterns'],
    accent: '#EA580C',
    shortName: 'Lanterns',
    initials: 'PAM',
    league: 'MPBL'
  },
  {
    name: 'Nueva Ecija Rice Vanguards',
    aliases: ['nueva ecija', 'rice vanguards', 'vanguards'],
    accent: '#15803D',
    shortName: 'Vanguards',
    initials: 'NER',
    league: 'MPBL'
  },
  {
    name: 'Pasig City',
    aliases: ['pasig', 'pasig city'],
    accent: '#2563EB',
    shortName: 'Pasig',
    initials: 'PSG',
    league: 'MPBL'
  },
  {
    name: 'Basilan Viva Portmasters',
    aliases: ['basilan', 'portmasters', 'viva portmasters'],
    accent: '#0891B2',
    shortName: 'Portmasters',
    initials: 'BAS',
    league: 'MPBL'
  },

  // ==========================================
  // 3. UAAP (University Athletic Association of the PH)
  // ==========================================
  {
    name: 'UP Fighting Maroons',
    aliases: ['up', 'fighting maroons', 'up maroons', 'up maroons women'],
    logo: 'https://img.thesports.com/basketball/team/118f9c03e48a878c2b37d553724b75c2.png',
    accent: '#881337',
    secondaryAccent: '#15803D',
    shortName: 'Fighting Maroons',
    initials: 'UP',
    league: 'UAAP'
  },
  {
    name: 'DLSU Green Archers',
    aliases: ['dlsu', 'la salle', 'green archers', 'dlsu archers women'],
    logo: 'https://img.thesports.com/basketball/team/16fec5097306406fae0ec071105833f1.png',
    accent: '#047857',
    secondaryAccent: '#FFFFFF',
    shortName: 'Green Archers',
    initials: 'DLSU',
    league: 'UAAP'
  },
  {
    name: 'Ateneo Blue Eagles',
    aliases: ['ateneo', 'blue eagles', 'admu', 'admu blue eagles', 'ateneo de manila university', 'admu eagles women'],
    logo: 'https://img.thesports.com/basketball/team/f0df1f3c3c76491c8c7f323cb5816679.png',
    accent: '#1D4ED8',
    secondaryAccent: '#FFFFFF',
    shortName: 'Blue Eagles',
    initials: 'ADMU',
    league: 'UAAP'
  },
  {
    name: 'UST Growling Tigers',
    aliases: ['ust', 'growling tigers', 'tigers', 'ust growling women'],
    logo: 'https://img.thesports.com/basketball/team/a6670119f5094730ba6f2d7dc7ed219d.png',
    accent: '#D97706',
    secondaryAccent: '#000000',
    shortName: 'Growling Tigers',
    initials: 'UST',
    league: 'UAAP'
  },
  {
    name: 'FEU Tamaraws',
    aliases: ['feu', 'tamaraws', 'feu lady tamaraws women', 'chadao - feu'],
    logo: 'https://img.thesports.com/basketball/team/c655be985ce25be6a7665a7a145aa29e.png',
    accent: '#15803D',
    secondaryAccent: '#CA8A04',
    shortName: 'Tamaraws',
    initials: 'FEU',
    league: 'UAAP'
  },
  {
    name: 'NU Bulldogs',
    aliases: ['nu', 'bulldogs', 'national university', 'nu lady bulldogs'],
    logo: 'https://img.thesports.com/basketball/team/f954def0414441a28a17160728d620fa.png',
    accent: '#1E3A8A',
    secondaryAccent: '#CA8A04',
    shortName: 'Bulldogs',
    initials: 'NU',
    league: 'UAAP'
  },
  {
    name: 'Adamson Soaring Falcons',
    aliases: ['adamson', 'soaring falcons', 'adu falcons', 'adu falcons women'],
    logo: 'https://img.thesports.com/basketball/team/f20d3fe35aea440f964652bcf6314b00.png',
    accent: '#0284C7',
    secondaryAccent: '#FFFFFF',
    shortName: 'Soaring Falcons',
    initials: 'ADU',
    league: 'UAAP'
  },
  {
    name: 'UE Red Warriors',
    aliases: ['ue', 'red warriors', 'ue red warriors', 'ue warriors women'],
    logo: 'https://img.thesports.com/basketball/team/a1bcab9de3ecfe45190c95eb1cad333a.png',
    accent: '#DC2626',
    secondaryAccent: '#FFFFFF',
    shortName: 'Red Warriors',
    initials: 'UE',
    league: 'UAAP'
  },

  // ==========================================
  // 4. NCAA Philippines
  // ==========================================
  {
    name: 'San Beda Red Lions',
    aliases: ['san beda', 'red lions', 'san beda college red cubs u19'],
    logo: 'https://img.thesports.com/basketball/team/c927fdb4f201b8973d4a0995f62b0ae2.png',
    accent: '#DC2626',
    shortName: 'Red Lions',
    initials: 'SBU',
    league: 'NCAA'
  },
  {
    name: 'Mapua Cardinals',
    aliases: ['mapua', 'cardinals'],
    logo: 'https://img.thesports.com/basketball/team/334de7aa8f9edc0beb91a54950532fc2.png',
    accent: '#B91C1C',
    shortName: 'Cardinals',
    initials: 'MU',
    league: 'NCAA'
  },
  {
    name: 'CSB Benilde Blazers',
    aliases: ['benilde', 'csb', 'csb blazers', 'csb benilde', 'benilde blazers'],
    logo: 'https://img.thesports.com/basketball/team/45abbe80c9e34e6490ed844a6055bf78.png',
    accent: '#047857',
    shortName: 'Blazers',
    initials: 'CSB',
    league: 'NCAA'
  },
  {
    name: 'Letran Knights',
    aliases: ['letran', 'csjl', 'csjl knight', 'letran knights'],
    logo: 'https://img.thesports.com/basketball/team/d12bf57e7104c5e8c90c1dd6f71f39fb.png',
    accent: '#1E3A8A',
    shortName: 'Knights',
    initials: 'CSJL',
    league: 'NCAA'
  },
  {
    name: 'Lyceum Pirates',
    aliases: ['lpu', 'lyceum', 'lpu pirate', 'lyceum of the philippines university u19'],
    logo: 'https://img.thesports.com/basketball/team/a5985095cb668c9ec35d17762394db26.png',
    accent: '#991B1B',
    shortName: 'Pirates',
    initials: 'LPU',
    league: 'NCAA'
  },
  {
    name: 'UPHSD Altas',
    aliases: ['perpetual', 'uphsd', 'altas', 'university of perpetual help system u19'],
    logo: 'https://img.thesports.com/basketball/team/3a3b1831bc224868b6d757b7e537f3ac.png',
    accent: '#854D0E',
    shortName: 'Altas',
    initials: 'PERP',
    league: 'NCAA'
  },
  {
    name: 'Arellano University Chiefs',
    aliases: ['arellano', 'chiefs', 'arellano university u19'],
    logo: 'https://img.thesports.com/basketball/team/a71dfb203c8b4abf9731231a406a268e.png',
    accent: '#2563EB',
    shortName: 'Chiefs',
    initials: 'AU',
    league: 'NCAA'
  },
  {
    name: 'EAC Generals',
    aliases: ['general eac', 'eac', 'generals'],
    logo: 'https://img.thesports.com/basketball/team/0594676a76dc417a8a94ecb81fc1e593.png',
    accent: '#DC2626',
    shortName: 'Generals',
    initials: 'EAC',
    league: 'NCAA'
  },
  {
    name: 'JRU Heavy Bombers',
    aliases: ['jru', 'heavy bombers', 'bombers'],
    logo: 'https://img.thesports.com/basketball/team/1d07c02ab99c2b6cb790cf8d265fedc9.png',
    accent: '#1D4ED8',
    shortName: 'Heavy Bombers',
    initials: 'JRU',
    league: 'NCAA'
  },
  {
    name: 'San Sebastian Stags',
    aliases: ['san sebastian', 'stags', 'ssc-r', 'ssc-r stags'],
    logo: 'https://img.thesports.com/basketball/team/dec36d52001eeec80b703de9fc3ffe55.png',
    accent: '#7F1D1D',
    shortName: 'Stags',
    initials: 'SSCR',
    league: 'NCAA'
  },

  // ==========================================
  // 5. PSL (Pilipinas Super League) & Regional
  // ==========================================
  {
    name: 'Quezon City Galeries Taipan',
    aliases: ['quezon city', 'galeries taipan', 'taipan'],
    logo: 'https://img.thesports.com/basketball/team/0793fe74bd8b8bc86d77553a18a5f37c.png',
    accent: '#EA580C',
    shortName: 'Taipan',
    initials: 'QC',
    league: 'MPBL'
  },
  {
    name: 'PFC Pelicans',
    aliases: ['pfc', 'pfc pelicans'],
    logo: 'https://img.thesports.com/basketball/team/17da94d1bafbd7481a9b0582dd6adb9d.png',
    accent: '#0284C7',
    shortName: 'Pelicans',
    initials: 'PFC',
    league: 'NCAA'
  },
  {
    name: 'Davao Occidental Tigers',
    aliases: ['davao', 'davao occidental', 'tigers cocolife'],
    accent: '#EA580C',
    shortName: 'Tigers',
    initials: 'DAV',
    league: 'PSL'
  },
  {
    name: 'Manila Stars',
    aliases: ['manila', 'manila stars'],
    accent: '#2563EB',
    shortName: 'Stars',
    initials: 'MNL',
    league: 'PSL'
  },

  // ==========================================
  // 6. Gilas Pilipinas & National Team
  // ==========================================
  {
    name: 'Gilas Pilipinas',
    aliases: ['gilas', 'philippines', 'pilipinas', 'gilas pilipinas national team'],
    logo: '/img/gilas-pilipinas.png',
    accent: '#1D4ED8',
    secondaryAccent: '#DC2626',
    shortName: 'Gilas',
    initials: 'PHI',
    league: 'Gilas'
  },

  // ==========================================
  // 7. NBA (National Basketball Association - All 30 Franchises)
  // ==========================================
  {
    name: 'Atlanta Hawks',
    aliases: ['hawks', 'atlanta'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/atl.png',
    accent: '#E03A3E',
    shortName: 'Hawks',
    initials: 'ATL',
    league: 'NBA'
  },
  {
    name: 'Boston Celtics',
    aliases: ['celtics', 'boston'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    accent: '#007A33',
    shortName: 'Celtics',
    initials: 'BOS',
    league: 'NBA'
  },
  {
    name: 'Brooklyn Nets',
    aliases: ['nets', 'brooklyn'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    accent: '#000000',
    shortName: 'Nets',
    initials: 'BKN',
    league: 'NBA'
  },
  {
    name: 'Charlotte Hornets',
    aliases: ['hornets', 'charlotte'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    accent: '#1D1160',
    shortName: 'Hornets',
    initials: 'CHA',
    league: 'NBA'
  },
  {
    name: 'Chicago Bulls',
    aliases: ['bulls', 'chicago'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    accent: '#CE1141',
    shortName: 'Bulls',
    initials: 'CHI',
    league: 'NBA'
  },
  {
    name: 'Cleveland Cavaliers',
    aliases: ['cavaliers', 'cleveland', 'cavs'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    accent: '#860038',
    shortName: 'Cavaliers',
    initials: 'CLE',
    league: 'NBA'
  },
  {
    name: 'Dallas Mavericks',
    aliases: ['mavericks', 'dallas', 'mavs'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    accent: '#00538C',
    shortName: 'Mavericks',
    initials: 'DAL',
    league: 'NBA'
  },
  {
    name: 'Denver Nuggets',
    aliases: ['nuggets', 'denver'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    accent: '#0E2240',
    shortName: 'Nuggets',
    initials: 'DEN',
    league: 'NBA'
  },
  {
    name: 'Detroit Pistons',
    aliases: ['pistons', 'detroit'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    accent: '#C8102E',
    shortName: 'Pistons',
    initials: 'DET',
    league: 'NBA'
  },
  {
    name: 'Golden State Warriors',
    aliases: ['warriors', 'golden state', 'gsw'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png',
    accent: '#1D428A',
    shortName: 'Warriors',
    initials: 'GSW',
    league: 'NBA'
  },
  {
    name: 'Houston Rockets',
    aliases: ['rockets', 'houston'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/hou.png',
    accent: '#CE1141',
    shortName: 'Rockets',
    initials: 'HOU',
    league: 'NBA'
  },
  {
    name: 'Indiana Pacers',
    aliases: ['pacers', 'indiana'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    accent: '#002D62',
    shortName: 'Pacers',
    initials: 'IND',
    league: 'NBA'
  },
  {
    name: 'LA Clippers',
    aliases: ['clippers', 'los angeles clippers', 'la clippers', 'lac'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    accent: '#C8102E',
    shortName: 'Clippers',
    initials: 'LAC',
    league: 'NBA'
  },
  {
    name: 'Los Angeles Lakers',
    aliases: ['lakers', 'los angeles lakers', 'la lakers', 'lal'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    accent: '#552583',
    shortName: 'Lakers',
    initials: 'LAL',
    league: 'NBA'
  },
  {
    name: 'Memphis Grizzlies',
    aliases: ['grizzlies', 'memphis'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mem.png',
    accent: '#5D76A9',
    shortName: 'Grizzlies',
    initials: 'MEM',
    league: 'NBA'
  },
  {
    name: 'Miami Heat',
    aliases: ['heat', 'miami'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    accent: '#98002E',
    shortName: 'Heat',
    initials: 'MIA',
    league: 'NBA'
  },
  {
    name: 'Milwaukee Bucks',
    aliases: ['bucks', 'milwaukee'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    accent: '#00471B',
    shortName: 'Bucks',
    initials: 'MIL',
    league: 'NBA'
  },
  {
    name: 'Minnesota Timberwolves',
    aliases: ['timberwolves', 'minnesota', 'wolves', 't-wolves'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    accent: '#0C2340',
    shortName: 'Timberwolves',
    initials: 'MIN',
    league: 'NBA'
  },
  {
    name: 'New Orleans Pelicans',
    aliases: ['pelicans', 'new orleans', 'pels'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    accent: '#0C2340',
    shortName: 'Pelicans',
    initials: 'NOP',
    league: 'NBA'
  },
  {
    name: 'New York Knicks',
    aliases: ['knicks', 'new york'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/nyk.png',
    accent: '#006BB6',
    shortName: 'Knicks',
    initials: 'NYK',
    league: 'NBA'
  },
  {
    name: 'Oklahoma City Thunder',
    aliases: ['thunder', 'oklahoma city', 'okc'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    accent: '#007AC1',
    shortName: 'Thunder',
    initials: 'OKC',
    league: 'NBA'
  },
  {
    name: 'Orlando Magic',
    aliases: ['magic', 'orlando'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    accent: '#0077C0',
    shortName: 'Magic',
    initials: 'ORL',
    league: 'NBA'
  },
  {
    name: 'Philadelphia 76ers',
    aliases: ['76ers', 'sixers', 'philadelphia', 'philly'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phi.png',
    accent: '#006BB6',
    shortName: '76ers',
    initials: 'PHI',
    league: 'NBA'
  },
  {
    name: 'Phoenix Suns',
    aliases: ['suns', 'phoenix suns', 'phoenix'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    accent: '#1D1160',
    shortName: 'Suns',
    initials: 'PHX',
    league: 'NBA'
  },
  {
    name: 'Portland Trail Blazers',
    aliases: ['trail blazers', 'portland', 'blazers'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    accent: '#E03A3E',
    shortName: 'Trail Blazers',
    initials: 'POR',
    league: 'NBA'
  },
  {
    name: 'Sacramento Kings',
    aliases: ['kings', 'sacramento'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    accent: '#5A2D81',
    shortName: 'Kings',
    initials: 'SAC',
    league: 'NBA'
  },
  {
    name: 'San Antonio Spurs',
    aliases: ['spurs', 'san antonio'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    accent: '#C4CED4',
    shortName: 'Spurs',
    initials: 'SAS',
    league: 'NBA'
  },
  {
    name: 'Toronto Raptors',
    aliases: ['raptors', 'toronto'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    accent: '#CE1141',
    shortName: 'Raptors',
    initials: 'TOR',
    league: 'NBA'
  },
  {
    name: 'Utah Jazz',
    aliases: ['jazz', 'utah'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/utah.png',
    accent: '#002B5C',
    shortName: 'Jazz',
    initials: 'UTA',
    league: 'NBA'
  },
  {
    name: 'Washington Wizards',
    aliases: ['wizards', 'washington'],
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/was.png',
    accent: '#002B5C',
    shortName: 'Wizards',
    initials: 'WAS',
    league: 'NBA'
  }
];

/**
 * Generates an ultra-crisp, stylized vector SVG emblem for any team.
 * Features a circular sports crest with concentric rings, basketball seam markings,
 * team accent gradient, and bold centered monogram typography.
 */
export function generateTeamLogoSvg(teamName: string, accentColor?: string, initialsText?: string): string {
  const initials = (initialsText || getTeamInitials(teamName)).slice(0, 3);
  const primary = accentColor || getTeamAccent(teamName);
  
  // Choose text color based on brightness
  const textColor = '#FFFFFF';
  const shadowColor = 'rgba(0,0,0,0.3)';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="${adjustBrightness(primary, -25)}" />
      </linearGradient>
      <filter id="dropshadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${shadowColor}" />
      </filter>
    </defs>
    <!-- Outer Shield / Circle Base -->
    <circle cx="50" cy="50" r="46" fill="url(#bgGrad)" stroke="#FFFFFF" stroke-width="3" filter="url(#dropshadow)" />
    <!-- Inner Accent Ring -->
    <circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1.5" stroke-dasharray="3 2" />
    <!-- Subtle Basketball Seam Lines -->
    <path d="M 50 4 A 46 46 0 0 1 50 96" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
    <path d="M 4 50 A 46 46 0 0 1 96 50" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5" />
    <path d="M 16 16 Q 50 50 84 16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
    <path d="M 16 84 Q 50 50 84 84" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" />
    <!-- Monogram Box or Center Star -->
    <circle cx="50" cy="50" r="24" fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.5)" stroke-width="1" />
    <!-- Centered Initials Monogram -->
    <text x="50" y="${initials.length > 2 ? '56' : '57'}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="${initials.length > 2 ? '17' : (initials.length === 2 ? '21' : '26')}" 
          fill="${textColor}" 
          text-anchor="middle" 
          letter-spacing="${initials.length > 2 ? '-1' : '0.5'}"
          filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.5))">
      ${initials}
    </text>
  </svg>`.replace(/\s+/g, ' ');

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Adjust hex color brightness (+/- percent)
 */
function adjustBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return '#1E293B';
  let num = parseInt(hex.slice(1), 16);
  if (isNaN(num)) return '#1E293B';
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Extracts compact initials for a team name.
 */
export function getTeamInitials(teamName: string): string {
  if (!teamName) return 'TP';
  const profile = findTeamProfile(teamName);
  if (profile?.initials) return profile.initials;

  const clean = teamName
    .replace(/\b(women|men|u19|u22|u21|basketball|team|club|philippines|pilipinas)\b/gi, '')
    .trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'TP';
  const first = words[0] || 'T';
  if (words.length === 1) return first.slice(0, 3).toUpperCase();
  if (words.length === 2) {
    const second = words[1] || 'P';
    return (first.charAt(0) + second.charAt(0)).toUpperCase();
  }
  const second = words[1] || '';
  const last = words[words.length - 1] || '';
  return (first.charAt(0) + second.charAt(0) + last.charAt(0)).toUpperCase();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesWholePhrase(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const regex = new RegExp(`(?:^|\\b)${escapeRegExp(needle)}(?:\\b|$)`, 'i');
  return regex.test(haystack);
}

/**
 * Finds a matching team profile by name or alias using strict word-boundary priority.
 */
export function findTeamProfile(teamName: string): TeamProfile | undefined {
  if (!teamName) return undefined;
  const lower = teamName.toLowerCase().trim();

  // 1. Direct exact name match
  const exact = TEAM_REGISTRY.find(t => t.name.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Direct exact alias match
  const exactAlias = TEAM_REGISTRY.find(t =>
    t.aliases.some(a => a.toLowerCase() === lower)
  );
  if (exactAlias) return exactAlias;

  // 3. Full registry name appears as whole phrase inside teamName
  const byFullNamePhrase = TEAM_REGISTRY.find(t =>
    matchesWholePhrase(lower, t.name.toLowerCase())
  );
  if (byFullNamePhrase) return byFullNamePhrase;

  // 4. Whole-phrase alias match (prioritizing longer, more specific aliases first)
  const ambiguousSingleWordMascots = new Set([
    'kings', 'warriors', 'hawks', 'pelicans', 'blazers', 'knights', 'tigers', 'bulldogs', 'falcons', 'lions', 'cardinals', 'pirates', 'generals', 'bombers', 'stags', 'stars'
  ]);

  let bestProfile: TeamProfile | undefined;
  let bestAliasLen = 0;

  for (const profile of TEAM_REGISTRY) {
    for (const alias of profile.aliases) {
      const aLower = alias.toLowerCase().trim();
      if (aLower.length < 3 && aLower !== lower) continue;
      // Avoid matching generic 1-word mascots on unrelated foreign/regional teams
      if (ambiguousSingleWordMascots.has(aLower) && aLower !== lower) continue;
      if (matchesWholePhrase(lower, aLower) && aLower.length > bestAliasLen) {
        bestProfile = profile;
        bestAliasLen = aLower.length;
      }
    }
  }

  return bestProfile;
}

/**
 * Strictly checks whether a team is one of the 30 official NBA franchises.
 */
export function isVerifiedNbaTeam(teamName: string): boolean {
  const profile = findTeamProfile(teamName);
  return profile?.league === 'NBA';
}

/**
 * Checks whether a team is an official PBA franchise.
 */
export function isVerifiedPbaTeam(teamName: string): boolean {
  const profile = findTeamProfile(teamName);
  return profile?.league === 'PBA';
}

/**
 * Returns the canonical official team name from TEAM_REGISTRY if matched (e.g. "Phoenix Fuelmasters" -> "Phoenix Fuel Masters").
 */
export function getCanonicalTeamName(teamName: string): string {
  const trimmed = String(teamName || '').trim();
  if (!trimmed) return 'Team';
  const profile = findTeamProfile(trimmed);
  if (profile && (profile.league === 'PBA' || profile.league === 'NBA')) {
    return profile.name;
  }
  return trimmed;
}

export interface ClassifiedLeagueInfo {
  leagueId: 'nba' | 'pba' | 'mpbl' | 'uaap' | 'ncaa' | 'gilas' | 'psl' | 'easl' | 'fiba' | 'd-league' | 'vismin' | 'nbl';
  sport: 'nba' | 'pba' | 'mpbl' | 'collegiate' | 'gilas' | 'psl' | 'easl' | 'fiba';
  league: string;
  leagueFullName: string;
  leagueLogo: string;
  defaultVenue: string;
  defaultBroadcast: string;
}

const LEAGUE_METADATA_MAP: Record<ClassifiedLeagueInfo['leagueId'], ClassifiedLeagueInfo> = {
  nba: {
    leagueId: 'nba',
    sport: 'nba',
    league: 'NBA',
    leagueFullName: 'National Basketball Association',
    leagueLogo: '/img/nba-logo.webp',
    defaultVenue: 'NBA Arena, USA',
    defaultBroadcast: 'NBA League Pass / NBA TV Philippines'
  },
  pba: {
    leagueId: 'pba',
    sport: 'pba',
    league: 'PBA',
    leagueFullName: "Philippine Basketball Association (Governors' Cup)",
    leagueLogo: '/img/pba.png',
    defaultVenue: 'Smart Araneta Coliseum / PhilSports Arena',
    defaultBroadcast: 'One Sports / RPTV / Pilipinas Live'
  },
  mpbl: {
    leagueId: 'mpbl',
    sport: 'mpbl',
    league: 'MPBL',
    leagueFullName: 'Maharlika Pilipinas Basketball League',
    leagueLogo: '/img/mpbl.png',
    defaultVenue: 'Bren Z. Guiao Convention Center / Cuneta Astrodome',
    defaultBroadcast: 'MPBL Official YouTube / Solar Sports'
  },
  uaap: {
    leagueId: 'uaap',
    sport: 'collegiate',
    league: 'UAAP',
    leagueFullName: 'University Athletic Association of the Philippines',
    leagueLogo: '/img/uaap.webp',
    defaultVenue: 'SM Mall of Asia Arena / Smart Araneta Coliseum',
    defaultBroadcast: 'One Sports / UAAP Varsity Channel / Pilipinas Live'
  },
  ncaa: {
    leagueId: 'ncaa',
    sport: 'collegiate',
    league: 'NCAA',
    leagueFullName: 'National Collegiate Athletic Association (Philippines)',
    leagueLogo: '/img/ncaa.png',
    defaultVenue: 'Filoil EcoOil Centre, San Juan',
    defaultBroadcast: 'GTV / GMA Sports / Heart of Asia'
  },
  gilas: {
    leagueId: 'gilas',
    sport: 'gilas',
    league: 'Gilas Pilipinas',
    leagueFullName: 'Gilas Pilipinas National Basketball Team',
    leagueLogo: '/img/gilas-pilipinas.png',
    defaultVenue: 'SM Mall of Asia Arena, Pasay City',
    defaultBroadcast: 'One Sports / Pilipinas Live'
  },
  psl: {
    leagueId: 'psl',
    sport: 'psl',
    league: 'PSL',
    leagueFullName: 'Pilipinas Super League',
    leagueLogo: '/img/PSL_Logo.png',
    defaultVenue: 'Paco Arena / Alonte Sports Arena',
    defaultBroadcast: 'Solar Sports / PSL Live'
  },
  easl: {
    leagueId: 'easl',
    sport: 'easl',
    league: 'EASL',
    leagueFullName: 'East Asia Super League',
    leagueLogo: '/img/easl-logo.webp',
    defaultVenue: 'Smart Araneta Coliseum / Mall of Asia Arena',
    defaultBroadcast: 'One Sports / Pilipinas Live'
  },
  fiba: {
    leagueId: 'fiba',
    sport: 'fiba',
    league: 'FIBA',
    leagueFullName: 'FIBA Tournaments & Qualifiers',
    leagueLogo: '/img/FIBA.webp',
    defaultVenue: 'International FIBA Arena',
    defaultBroadcast: 'One Sports / Courtside 1891'
  },
  'd-league': {
    leagueId: 'd-league',
    sport: 'pba',
    league: 'PBA D-League',
    leagueFullName: 'PBA Developmental League',
    leagueLogo: '/img/PBA_D-League_logo.png',
    defaultVenue: 'Ynares Sports Arena, Pasig City',
    defaultBroadcast: 'PBA Rush / Pilipinas Live'
  },
  vismin: {
    leagueId: 'vismin',
    sport: 'mpbl',
    league: 'VisMin Cup',
    leagueFullName: 'Pilipinas VisMin Super Cup',
    leagueLogo: '/img/vismin-cup.png',
    defaultVenue: 'Cebu Coliseum',
    defaultBroadcast: 'VisMin Sports Channel'
  },
  nbl: {
    leagueId: 'nbl',
    sport: 'mpbl',
    league: 'NBL',
    leagueFullName: 'National Basketball League Pilipinas',
    leagueLogo: '/img/nbl.jpg',
    defaultVenue: 'Hagonoy Sports Complex, Taguig',
    defaultBroadcast: 'NBL TV Livestream'
  }
};

/**
 * Authoritatively classifies a match or team pair into its true league (NBA, PBA, MPBL, UAAP, NCAA, etc.)
 * Strictly verifies NBA team franchise membership so non-NBA teams (e.g. Selangor vs Pahang in Malaysia Agong Cup)
 * are NEVER mislabeled as NBA.
 */
export function classifyMatchLeague(input: {
  homeTeam?: string;
  awayTeam?: string;
  competition?: string;
  streamLabel?: string;
  sport?: string;
  leagueId?: string;
  league?: string;
}): ClassifiedLeagueInfo {
  const homeName = (input.homeTeam || '').trim();
  const awayName = (input.awayTeam || '').trim();
  const metaText = `${input.competition || ''} ${input.streamLabel || ''} ${input.league || ''} ${input.leagueId || ''} ${input.sport || ''}`.toLowerCase();

  const compOnly = `${input.competition || ''} ${input.streamLabel || ''}`.toLowerCase();
  const isWomensLeague = /\bwnba\b|women's national basketball/i.test(compOnly);

  const homeProfile = findTeamProfile(homeName);
  const awayProfile = findTeamProfile(awayName);
  const teamLeagues = [homeProfile?.league, awayProfile?.league].filter(Boolean);

  // 1. Strict NBA Team Verification: BOTH teams (or at least one verified NBA team in an official NBA competition) must be official NBA franchises
  if (
    !isWomensLeague &&
    ((homeProfile?.league === 'NBA' && awayProfile?.league === 'NBA') ||
      (teamLeagues.includes('NBA') && (/^nba$|national basketball association/i.test((input.competition || '').trim()) || !input.competition)))
  ) {
    return LEAGUE_METADATA_MAP.nba;
  }

  // Check explicit Philippine & regional competition names from Live88 API
  if (/\beasl\b|east asia super league/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.easl;
  }
  if (/d-league|developmental league|aspirants' cup/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP['d-league'];
  }
  if (/vismin/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.vismin;
  }
  if (/nbl pilipinas|national basketball league pilipinas/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.nbl;
  }
  if (/\buaap\b|\bwuaap\b|university athletic association/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.uaap;
  }
  if (/\bncaa\b|national collegiate athletic association/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.ncaa;
  }
  if (/\bmpbl\b|maharlika/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.mpbl;
  }
  if (/\bpba\b|governors' cup|philippine basketball governors|philippine cup|commissioner's cup/i.test(compOnly)) {
    return LEAGUE_METADATA_MAP.pba;
  }

  // 2. If either team is a PBA team -> PBA
  if (teamLeagues.includes('PBA')) {
    return LEAGUE_METADATA_MAP.pba;
  }

  // 3. If either team is an MPBL team -> MPBL
  if (teamLeagues.includes('MPBL')) {
    return LEAGUE_METADATA_MAP.mpbl;
  }

  // 4. If either team is a UAAP team -> UAAP
  if (teamLeagues.includes('UAAP')) {
    return LEAGUE_METADATA_MAP.uaap;
  }

  // 5. If either team is an NCAA team -> NCAA
  if (teamLeagues.includes('NCAA')) {
    return LEAGUE_METADATA_MAP.ncaa;
  }

  // 6. If either team is Gilas -> Gilas or FIBA
  if (teamLeagues.includes('Gilas')) {
    if (/olympic qualifying|\bfiba\b/i.test(metaText) && !/gilas/i.test(input.league || '')) {
      return LEAGUE_METADATA_MAP.fiba;
    }
    return LEAGUE_METADATA_MAP.gilas;
  }

  // 7. If either team is a PSL team -> PSL
  if (teamLeagues.includes('PSL')) {
    return LEAGUE_METADATA_MAP.psl;
  }

  // 8. If the API provided an explicit international/other competition name (e.g. "Malaysia Agong Cup", "Euroleague", "LKL", "WNBA"), preserve its true competition name instead of mislabeling as NBA
  const rawCompClean = (input.competition || '').trim();
  if (rawCompClean && !/^(nba|national basketball association|pba|mpbl|uaap|ncaa)$/i.test(rawCompClean)) {
    const shortLeague = isWomensLeague
      ? 'WNBA'
      : rawCompClean.length > 24
      ? rawCompClean.split(/\s+/).slice(0, 3).join(' ')
      : rawCompClean;
    return {
      ...LEAGUE_METADATA_MAP.fiba,
      league: shortLeague,
      leagueFullName: rawCompClean,
      defaultVenue: `${shortLeague} Arena`,
      defaultBroadcast: input.streamLabel || `${shortLeague} Official Broadcast`
    };
  }

  // Fallback to explicit Philippine league string
  const compAndLeagueText = `${input.competition || ''} ${input.streamLabel || ''} ${input.league || ''}`.toLowerCase();
  if (/\bpba\b|philippine basketball|governors' cup|commissioner's cup|philippine cup/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.pba;
  }
  if (/\bmpbl\b|maharlika/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.mpbl;
  }
  if (/\buaap\b|\bwuaap\b|university athletic association/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.uaap;
  }
  if (/\bncaa\b|national collegiate|collegiate/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.ncaa;
  }
  if (/\bpsl\b|pilipinas super league/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.psl;
  }
  if (/\bgilas\b/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.gilas;
  }
  if (/\bfiba\b/i.test(compAndLeagueText)) {
    return LEAGUE_METADATA_MAP.fiba;
  }

  return LEAGUE_METADATA_MAP.pba;
}

/**
 * Returns a team's primary accent color.
 */
export function getTeamAccent(teamName: string, fallbackColor = '#DC2626'): string {
  const profile = findTeamProfile(teamName);
  if (profile?.accent) return profile.accent;

  // Stable color based on team name hash
  const colors = ['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#0891B2', '#E11D48', '#4F46E5'];
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] || fallbackColor;
}

/**
 * Returns the highest-priority logo URL for any team:
 * 1. If known in TEAM_REGISTRY with an official CDN logo, prefer it for NBA/PBA teams or when fallback is missing/SVG.
 * 2. If fallbackLogo is already provided and valid (e.g., from the API with img.thesports or kadario), use it.
 * 3. Otherwise, return a sharp, generated vector SVG badge.
 */
export function getTeamLogo(teamName: string, fallbackLogo?: string): string {
  const profile = findTeamProfile(teamName);

  // If the team is in our registry with an official logo, and fallbackLogo is missing or a data: SVG, use the registry logo
  if (profile?.logo && profile.logo.trim().length > 5) {
    if (!fallbackLogo || fallbackLogo.startsWith('data:image/svg') || fallbackLogo.includes('null') || profile.league === 'NBA' || profile.league === 'PBA') {
      return profile.logo;
    }
  }

  if (fallbackLogo && fallbackLogo.trim().length > 5 && !fallbackLogo.includes('null')) {
    return fallbackLogo;
  }

  return generateTeamLogoSvg(teamName, profile?.accent, profile?.initials);
}

