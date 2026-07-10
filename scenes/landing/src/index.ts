import { engine, Material, MeshCollider, MeshRenderer, TextShape, Transform } from '@dcl/sdk/ecs';
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math';
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { teleportUi } from '../../../utils/ui';
import { SCENE_VERSION } from '../../../utils/version'

export function main() {
    const floor = engine.addEntity();
    Transform.create(floor, { position: Vector3.create(8., 0., 8.), scale: Vector3.create(16., 0.1, 16.) });
    MeshRenderer.setBox(floor);
    MeshCollider.setBox(floor);
    Material.setPbrMaterial(floor, { albedoColor: Color4.create(0.2, 0.2, 0.2, 1.) });

    teleportUi()

    // Version label on the floor at origin
    const versionLabel = engine.addEntity()
    Transform.create(versionLabel, {
        position: Vector3.create(8, 0.1, 8),
        rotation: Quaternion.fromEulerDegrees(90, 0, 0)
    })
    TextShape.create(versionLabel, {
        text: `v${SCENE_VERSION}`,
        fontSize: 8,
        textColor: Color4.White(),
        outlineWidth: 0.3,
        outlineColor: Color3.Black()

    })

}