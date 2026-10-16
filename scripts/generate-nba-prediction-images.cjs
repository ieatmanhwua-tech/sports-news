const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const publicTeamsDir = path.resolve('public/img/nba-teams');
const publicArticlesDir = path.resolve('public/img/articles');
const assetsArticlesDir = path.resolve('assets/img/articles');

fs.mkdirSync(publicTeamsDir, { recursive: true });
fs.mkdirSync(publicArticlesDir, { recursive: true });
fs.mkdirSync(assetsArticlesDir, { recursive: true });

const logoPath = path.resolve('public/img/TipOffPh_logo.png');
const watermarkPath = '/tmp/tipoff_watermark_nba.png';
if (fs.existsSync(logoPath)) {
  execSync(`convert "${logoPath}" -resize 190x "${watermarkPath}"`);
}

const TEAMS = {
  cha: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/cha.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1007/f6f4b1bd-5990-4bc3-883d-823bf707ee06/f6f4b1bd-5990-4bc3-883d-823bf707ee06.jpg'
  },
  bos: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1011/3eb44c8f-e475-4841-a3ef-aa8276fe0ddf/3eb44c8f-e475-4841-a3ef-aa8276fe0ddf.jpg'
  },
  phx: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1008/ac0cf659-6f72-48fc-8760-c1103f44a491/ac0cf659-6f72-48fc-8760-c1103f44a491.jpg'
  },
  sas: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/sa.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1013/11e92f6f-4e6b-4f90-acec-3718cd5b9b3a/11e92f6f-4e6b-4f90-acec-3718cd5b9b3a.jpg'
  },
  nop: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/no.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1009/1c925fb8-cfd9-4c39-812b-dd104dc81c90/1c925fb8-cfd9-4c39-812b-dd104dc81c90.jpg'
  },
  dal: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png',
    photoUrl: 'https://a.espncdn.com/photo/2026/1011/r1729169_1296x729_16-9.jpg'
  },
  chi: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1010/385b62c8-aa7f-4688-ba30-14976fdc10bb/385b62c8-aa7f-4688-ba30-14976fdc10bb.jpg'
  },
  mil: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1012/aadaa262-b665-4303-a205-5c10a0ef2909/aadaa262-b665-4303-a205-5c10a0ef2909.jpg'
  },
  den: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/den.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1012/59342c8f-e439-44a4-8876-1759e9a99d4c/59342c8f-e439-44a4-8876-1759e9a99d4c.jpg'
  },
  lac: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1005/1274de8d-cbfa-4b27-bff7-d605feb6c974/1274de8d-cbfa-4b27-bff7-d605feb6c974.jpg'
  },
  bkn: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png',
    photoUrl: 'https://a.espncdn.com/photo/2026/1012/r1729782_1080x607_16-9.jpg'
  },
  mia: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1011/918dcd49-9ab1-4b93-8ba8-04aab4f6ac5c/918dcd49-9ab1-4b93-8ba8-04aab4f6ac5c.jpg'
  },
  det: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/det.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1011/71ded35d-90c3-4427-9810-e5bfad93a724/71ded35d-90c3-4427-9810-e5bfad93a724.jpg'
  },
  min: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/min.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1013/6166fe3c-b2a8-456f-8c51-eec23e65b77b/6166fe3c-b2a8-456f-8c51-eec23e65b77b.jpg'
  },
  cle: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/cle.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/1d1dbb33-5c22-408a-a2c8-c2628768df15/1d1dbb33-5c22-408a-a2c8-c2628768df15.jpg'
  },
  orl: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/orl.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1008/52ce7f58-2e19-400b-8ef6-eab38aff8ea9/52ce7f58-2e19-400b-8ef6-eab38aff8ea9.jpg'
  },
  nyk: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ny.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/ef521df6-eb21-4dc4-85da-231d6ddac7b9/ef521df6-eb21-4dc4-85da-231d6ddac7b9.jpg'
  },
  tor: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/tor.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/b9a866f4-b32d-49ed-927a-74621e29ed31/b9a866f4-b32d-49ed-927a-74621e29ed31.jpg'
  },
  ind: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/ind.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/22b4aa38-2a9f-47c5-9079-f91a6dea5ac9/22b4aa38-2a9f-47c5-9079-f91a6dea5ac9.jpg'
  },
  okc: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/okc.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/38f62f29-2c64-4b8c-8c9e-a979270d11ec/38f62f29-2c64-4b8c-8c9e-a979270d11ec.jpg'
  },
  gsw: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/gs.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1011/8ce75427-269e-4c9a-b811-48ee7a8bf7a9/8ce75427-269e-4c9a-b811-48ee7a8bf7a9.jpg'
  },
  lal: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/b18a238c-a623-4cbc-b023-2d0afb8d3e4b/b18a238c-a623-4cbc-b023-2d0afb8d3e4b.jpg'
  },
  por: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/por.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1008/d90975c3-d438-4292-a93b-5ffbb8c39f25/d90975c3-d438-4292-a93b-5ffbb8c39f25.jpg'
  },
  sac: {
    espnLogo: 'https://a.espncdn.com/i/teamlogos/nba/500/sac.png',
    photoUrl: 'https://espnmedia-cdn.akamaized.net/espn/media/common/wsc/2026/1014/ec30ccee-1c04-4b22-97e4-54f4f09e9a8b/ec30ccee-1c04-4b22-97e4-54f4f09e9a8b.jpg'
  }
};

const MATCHUPS = [
  { away: 'cha', home: 'bos', out: 'nba-preseason-pred-cha-bos.webp' },
  { away: 'phx', home: 'sas', out: 'nba-preseason-pred-phx-sas.webp' },
  { away: 'nop', home: 'dal', out: 'nba-preseason-pred-nop-dal.webp' },
  { away: 'chi', home: 'mil', out: 'nba-preseason-pred-chi-mil.webp' },
  { away: 'den', home: 'lac', out: 'nba-preseason-pred-den-lac.webp' },
  { away: 'bkn', home: 'mia', out: 'nba-preseason-pred-bkn-mia.webp' },
  { away: 'det', home: 'min', out: 'nba-preseason-pred-det-min.webp' },
  { away: 'cle', home: 'orl', out: 'nba-preseason-pred-cle-orl.webp' },
  { away: 'nyk', home: 'tor', out: 'nba-preseason-pred-nyk-tor.webp' },
  { away: 'ind', home: 'okc', out: 'nba-preseason-pred-ind-okc.webp' },
  { away: 'gsw', home: 'lal', out: 'nba-preseason-pred-gsw-lal.webp' },
  { away: 'por', home: 'sac', out: 'nba-preseason-pred-por-sac.webp' }
];

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) return true;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TipOffPhBot/2.0 (https://tipoffph.com)' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return true;
}

function createSplitFeaturedImage(awayKey, homeKey, outputFilename) {
  const awayPhoto = path.join(publicTeamsDir, `${awayKey}-action.jpg`);
  const homePhoto = path.join(publicTeamsDir, `${homeKey}-action.jpg`);
  const awayLogo = path.join(publicTeamsDir, `${awayKey}-logo.png`);
  const homeLogo = path.join(publicTeamsDir, `${homeKey}-logo.png`);

  const tmpLeft = `/tmp/left_${awayKey}.png`;
  const tmpRight = `/tmp/right_${homeKey}.png`;
  const tmpJoined = `/tmp/joined_${awayKey}_${homeKey}.png`;
  const tmpOut = `/tmp/${outputFilename}`;

  // Crop left team action photo to 600x675 and right team action photo to 600x675
  execSync(`convert "${awayPhoto}" -resize 600x675^ -gravity Center -crop 600x675+0+0 "${tmpLeft}"`);
  execSync(`convert "${homePhoto}" -resize 600x675^ -gravity Center -crop 600x675+0+0 "${tmpRight}"`);

  // Join side-by-side into 1200x675
  execSync(`convert "${tmpLeft}" "${tmpRight}" +append "${tmpJoined}"`);

  // Prepare resized logos (110x110)
  const tmpAwayLogo = `/tmp/logo_sm_${awayKey}.png`;
  const tmpHomeLogo = `/tmp/logo_sm_${homeKey}.png`;
  execSync(`convert "${awayLogo}" -resize 110x110 "${tmpAwayLogo}"`);
  execSync(`convert "${homeLogo}" -resize 110x110 "${tmpHomeLogo}"`);

  // Composite center divider, bottom vignette, team logos on each half, and TipOffPh watermark
  execSync(`convert "${tmpJoined}" \\
    \\( -size 1200x675 gradient:"rgba(0,0,0,0.15)"-"rgba(5,10,22,0.82)" \\) -composite \\
    -fill "rgba(245,158,11,0.85)" -draw "rectangle 598,0 602,675" \\
    \\( "${tmpAwayLogo}" \\) -gravity SouthWest -geometry +36+32 -composite \\
    \\( "${tmpHomeLogo}" \\) -gravity SouthEast -geometry +36+32 -composite \\
    \\( "${watermarkPath}" \\) -gravity NorthWest -geometry +28+24 -composite \\
    -quality 90 "${tmpOut}"`);

  fs.copyFileSync(tmpOut, path.join(publicArticlesDir, outputFilename));
  fs.copyFileSync(tmpOut, path.join(assetsArticlesDir, outputFilename));
  console.log(`Generated split-team featured image: ${outputFilename} (${fs.statSync(tmpOut).size} bytes)`);
}

async function run() {
  for (const [key, info] of Object.entries(TEAMS)) {
    const actionDest = path.join(publicTeamsDir, `${key}-action.jpg`);
    const logoDest = path.join(publicTeamsDir, `${key}-logo.png`);
    await download(info.photoUrl, actionDest);
    await download(info.espnLogo, logoDest);
    // Also create optimized webp for individual team action image
    const actionWebp = path.join(publicTeamsDir, `${key}-action.webp`);
    execSync(`convert "${actionDest}" -resize 800x450^ -gravity Center -crop 800x450+0+0 -quality 88 "${actionWebp}"`);
    console.log(`Saved real team assets for ${key.toUpperCase()}`);
  }

  for (const m of MATCHUPS) {
    createSplitFeaturedImage(m.away, m.home, m.out);
  }
  console.log('All real NBA team action photos and split featured images generated!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
