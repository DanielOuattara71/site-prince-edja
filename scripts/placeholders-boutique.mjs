// Génère le placeholder spécifique à chaque pièce (fichier images/boutique/<slug>.svg→jpg).
import sharp from 'sharp'
const PIECES = [
  { slug: 'agadez', numero: '01', nom: 'AGADEZ', culture: 'TOUAREG · VOYAGE' },
  { slug: 'akuaba', numero: '02', nom: 'AKUABA', culture: 'AKAN · FERTILITÉ' },
  { slug: 'deangle', numero: '03', nom: 'DÉANGLÉ', culture: 'DAN · GRÂCE' },
  { slug: 'oba', numero: '04', nom: 'OBA', culture: 'ROYAUME DU BÉNIN · DYNASTIE' },
  { slug: 'baoule', numero: '05', nom: 'BAOULÉ', culture: 'CÔTE D’IVOIRE · COUR' },
  { slug: 'nka', numero: '06', nom: 'NKA', culture: 'ASANTE · LIGNES DE VIE' },
  { slug: 'baobabe', numero: '07', nom: 'BAOBABÉ', culture: 'ARBRE DE VIE · SAGESSE' },
  { slug: 'mambo', numero: '08', nom: 'MAMBO', culture: 'ÉLÉPHANT ROYAL · FORCE' },
  { slug: 'okoro', numero: '09', nom: 'OKORO', culture: 'IGBO · UNITÉ' },
  { slug: 'kowe', numero: '10', nom: 'KÔWÊ', culture: 'AFRIQUE DE L’OUEST · UNITÉ' },
]
const template = ({ numero, nom, culture }) => `
<svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="1000" fill="#1B150E"/>
  <!-- motif cauri serpentine style ethnic divider -->
  <path fill="none" stroke="#C58A3E" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.45"
        d="M 80 920 Q 400 780 720 920"/>
  <path fill="none" stroke="#C58A3E" stroke-width="2.4" opacity="0.35"
        d="M 60 480 Q 400 380 740 480"/>
  <!-- arc de la pièce (stylized gold arch) -->
  <path fill="none" stroke="#C58A3E" stroke-width="14" stroke-linecap="round"
        d="M 250 700 L 250 350 A 150 150 0 0 1 550 350 L 550 700 Z"/>
  <!-- grand numéro de la pièce -->
  <text x="400" y="520" font-family="Anton, 'Anton Black', 'Arial Black', sans-serif"
        font-weight="800" font-size="240" fill="#F2E9DA" text-anchor="middle" letter-spacing="6">${numero}</text>
  <!-- numéro de collection, en haut à gauche -->
  <text x="60" y="120" font-family="Anton, sans-serif" font-size="42" fill="#C58A3E" letter-spacing="8">TRIBE</text>
  <!-- nom de la pièce en bas -->
  <text x="400" y="810" font-family="Anton, sans-serif" font-size="60" fill="#F2E9DA" text-anchor="middle" letter-spacing="3">${nom}</text>
  <!-- culture en bas en circle -->
  <text x="400" y="875" font-family="'Courier New', monospace" font-size="22" fill="#C58A3E" text-anchor="middle" letter-spacing="1.5">${culture}</text>
</svg>
`
for (const piece of PIECES) {
  const svg = Buffer.from(template(piece))
  await sharp(svg).jpeg({ quality: 88, mozjpeg: true }).toFile(`public/images/boutique/${piece.slug}.jpg`)
  console.log('wrote', piece.slug)
}
