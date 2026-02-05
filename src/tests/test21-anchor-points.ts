import { AvatarAnchorPointType, AvatarAttach, engine, Entity, Material, MeshRenderer, Transform } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";

export function setupAttachPointsTest() {
    createAttachment(Color4.create(1, 0.7, 0), AvatarAnchorPointType.AAPT_HEAD);
    createAttachment(Color4.create(1, 0, 0.7), AvatarAnchorPointType.AAPT_NECK);
    createAttachment(Color4.create(1, 0.5, 0.5), AvatarAnchorPointType.AAPT_SPINE);
    createAttachment(Color4.create(1, 0.25, 0.5), AvatarAnchorPointType.AAPT_SPINE1);
    createAttachment(Color4.create(1, 0.5, 0.25), AvatarAnchorPointType.AAPT_SPINE2);
}

function createAttachment(albedoColor: Color4, anchorPointId: AvatarAnchorPointType): Entity {
    const attachment = engine.addEntity();
    Transform.create(attachment, {
        position: Vector3.create(0, 10, 0),
        rotation: Quaternion.fromAngleAxis(180, Vector3.Forward()),
        scale: Vector3.create(0.5, 0.1, 0.25),
    });
    MeshRenderer.setCylinder(attachment);
    Material.setPbrMaterial(attachment, { albedoColor });
    AvatarAttach.create(attachment, { anchorPointId });
    return attachment;
}