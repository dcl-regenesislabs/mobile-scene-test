import { Vector3, Color4 } from '@dcl/sdk/math'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { createPlatform, createLabel } from '../../../utils/helpers'
import { uiMenu } from '../../../utils/ui';

/**
 * TEST 6: CORRIDOR WIDTH TEST - Testing player collision width
 */
export function main() {
  const corridorBaseZ = 4
  const corridorBaseX = 8
  const columnHeight = 3
  const columnWidth = 0.5

  createLabel('CORRIDOR WIDTH TEST\n(can you fit through?)', Vector3.create(12, 4, corridorBaseZ - 2), 1.2)

  ReactEcsRenderer.setUiRenderer(uiMenu, { virtualWidth: 1920, virtualHeight: 1080 })

  const gapWidths = [0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5]

  gapWidths.forEach((gap, index) => {
    const z = corridorBaseZ + index * 3

    createPlatform(
      Vector3.create(corridorBaseX - gap / 2 - columnWidth / 2, columnHeight / 2, z),
      Vector3.create(columnWidth, columnHeight, columnWidth),
      Color4.create(0.8, 0.3, 0.3, 1)
    )

    createPlatform(
      Vector3.create(corridorBaseX + gap / 2 + columnWidth / 2, columnHeight / 2, z),
      Vector3.create(columnWidth, columnHeight, columnWidth),
      Color4.create(0.8, 0.3, 0.3, 1)
    )

    createLabel(
      `${gap.toFixed(2)}m`,
      Vector3.create(corridorBaseX, columnHeight + 0.5, z),
      1
    )

    createPlatform(
      Vector3.create(corridorBaseX, 0.02, z),
      Vector3.create(gap, 0.04, 2),
      Color4.create(0.2, 0.8, 0.2, 1)
    )
  })

  createPlatform(
    Vector3.create(corridorBaseX - 2, 0.5, corridorBaseZ + 12),
    Vector3.create(0.2, 1, 28),
    Color4.create(0.4, 0.4, 0.4, 1)
  )
  createPlatform(
    Vector3.create(corridorBaseX + 2, 0.5, corridorBaseZ + 12),
    Vector3.create(0.2, 1, 28),
    Color4.create(0.4, 0.4, 0.4, 1)
  )
}
