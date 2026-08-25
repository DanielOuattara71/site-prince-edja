import sharp from 'sharp'

const SVG = {
  hero: 'public/images/hero.svg',
  paysage: 'public/images/placeholder-paysage.svg',
  portrait: 'public/images/placeholder-portrait.svg',
  carre: 'public/images/placeholder-carre.svg',
  foret: 'public/images/placeholder-foret.svg',
  fleuve: 'public/images/placeholder-fleuve.svg',
}

const OUT = [
  ['hero/hero-prince-edja.jpg', 'hero', 1920, 1080],
  ['og-prince-edja.jpg', 'hero', 1200, 630],
  ['a-propos/portrait-edja.jpg', 'portrait', 1200, 1500],
  ['episodes/bouake.jpg', 'paysage', 1600, 900],
  ['episodes/sassandra.jpg', 'paysage', 1600, 900],
  ['episodes/jacqueville.jpg', 'fleuve', 1600, 900],
  ['episodes/tai.jpg', 'foret', 1600, 900],
  ['episodes/tiassale.jpg', 'fleuve', 1600, 900],
  ['episodes/adiake.jpg', 'paysage', 1600, 900],
  ['xplore/bandeau-foret.jpg', 'foret', 1920, 820],
  ['voyage/bandeau-littoral.jpg', 'paysage', 1920, 820],
  ['voyage/abidjan.jpg', 'portrait', 1200, 1500],
  ['voyage/dakar.jpg', 'portrait', 1200, 1500],
  ['voyage/conakry.jpg', 'portrait', 1200, 1500],
  ['boutique/hero-tribe.jpg', 'carre', 1200, 1500],
  ['boutique/agadez.jpg', 'carre', 1200, 1600],
  ['boutique/akuaba.jpg', 'carre', 1200, 1600],
  ['boutique/deangle.jpg', 'carre', 1200, 1600],
  ['boutique/oba.jpg', 'carre', 1200, 1600],
  ['boutique/baoule.jpg', 'carre', 1200, 1600],
  ['boutique/nka.jpg', 'carre', 1200, 1600],
  ['boutique/baobabe.jpg', 'carre', 1200, 1600],
  ['boutique/mambo.jpg', 'carre', 1200, 1600],
  ['boutique/okoro.jpg', 'carre', 1200, 1600],
  ['boutique/kowe.jpg', 'carre', 1200, 1600],
  ['journal/afrique-multitude-de-mondes.jpg', 'paysage', 1600, 900],
  ['journal/citoyens-premiers-ambassadeurs.jpg', 'paysage', 1600, 900],
  ['journal/griot-moderne.jpg', 'carre', 1600, 900],
  ['journal/voyager-change-le-regard.jpg', 'paysage', 1600, 900],
  ['journal/porter-un-symbole.jpg', 'carre', 1600, 900],
  ['journal/hotel-premiere-ambassade.jpg', 'paysage', 1600, 900],
  ['journal/raconter-pour-exister.jpg', 'portrait', 1600, 900],
  ['presse/tv5monde.jpg', 'carre', 400, 400],
]

for (const [out, source, width, height] of OUT) {
  await sharp(SVG[source])
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`public/images/${out}`)
  console.log('OK', out)
}
