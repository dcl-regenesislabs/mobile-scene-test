import { engine, Material, MeshCollider, MeshRenderer, Transform } from '@dcl/sdk/ecs';
import { Color4, Vector3 } from '@dcl/sdk/math';
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';
import { uiMenu } from '../../../utils/ui';

export function main() {
    const floor = engine.addEntity();
    Transform.create(floor, { position: Vector3.create(8., 0., 8.), scale: Vector3.create(16., 0.1, 16.) });
    MeshRenderer.setBox(floor);
    MeshCollider.setBox(floor);
    Material.setPbrMaterial(floor, { albedoColor: Color4.create(0.2, 0.2, 0.2, 1.) });

    ReactEcsRenderer.setUiRenderer(uiMenu, { virtualWidth: 1920, virtualHeight: 1080 })
}