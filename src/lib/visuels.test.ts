import { describe, expect, it } from 'vitest'
import { srcsetContenu } from './visuels'

/** Un `-640.jpg` n'existe que pour les actifs statiques, jamais pour un média de l'API. */
describe('srcsetContenu', () => {
  it('construit la déclinaison des visuels du dépôt', () => {
    expect(srcsetContenu('/site-prince-edja/images/journal/griot-moderne.jpg')).toBe(
      '/site-prince-edja/images/journal/griot-moderne-640.jpg 640w, /site-prince-edja/images/journal/griot-moderne.jpg 1600w',
    )
  })

  it('ne fabrique pas de déclinaison sur une image servie par l’API', () => {
    expect(
      srcsetContenu('http://localhost:3000/medias-dev/medias/b1416403-4ffe-4dda-9601-aad576dc3021.jpg'),
    ).toBeUndefined()
    expect(
      srcsetContenu('https://res.cloudinary.com/demo/image/upload/prince-edja/medias/x.jpg'),
    ).toBeUndefined()
  })

  it('laisse les autres formats sans srcset', () => {
    expect(srcsetContenu('/images/logo.png')).toBeUndefined()
  })
})
