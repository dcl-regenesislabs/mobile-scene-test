import { engine, Material, MaterialTransparencyMode, MeshRenderer, PBSkyboxTime, SkyboxTime, Transform, TransitionMode, TriggerArea, triggerAreaEventsSystem } from "@dcl/sdk/ecs"
import { Color4, Vector3 } from "@dcl/sdk/math"
import { createLabel, createPlatform, TRIGGER_COLOR_INSIDE, TRIGGER_COLOR_OUTSIDE, TriggerVisual } from "../utils/helpers"

export function setupSkyboxTimeZones() {
    const triggerBaseX = -76
    const triggerBaseZ = 0

    const nightTrigger = buildTrigger(
        triggerBaseX,
        triggerBaseZ,
        { fixedTime: 0 },
        'Night Skybox: Enter',
        'Night Skybox: Exit',
        'Night Skybox',
        Color4.create(0.1, 0.1, 0.2, 1),
    )

    const dayTrigger = buildTrigger(
        triggerBaseX,
        triggerBaseZ + 8,
        { fixedTime: 43200 },
        'Day Skybox: Enter',
        'Day Skybox: Exit',
        'Day Skybox',
        Color4.create(0.3, 0.2, 0.1, 1)
    )

    const nightRevTrigger = buildTrigger(
        triggerBaseX,
        triggerBaseZ + 16,
        { fixedTime: 0, transitionMode: TransitionMode.TM_BACKWARD },
        'Reverse Night Skybox: Enter',
        'Reverse Night Skybox: Exit',
        'Night Skybox\nBackwards',
        Color4.create(0.1, 0.1, 0.2, 1),
    )

    const dayRevTrigger = buildTrigger(
        triggerBaseX,
        triggerBaseZ + 24,
        { fixedTime: 43200, transitionMode: TransitionMode.TM_BACKWARD },
        'Reverse Day Skybox: Enter',
        'Reverse Day Skybox: Exit',
        'Day Skybox\nBackward',
        Color4.create(0.3, 0.2, 0.1, 1)
    )
}

function buildTrigger(
    x: number,
    z: number,
    skyboxTime: PBSkyboxTime,
    enter: string,
    exit: string,
    label: string,
    platform: Color4
) {
    const entity = engine.addEntity()
    Transform.create(entity, {
        position: Vector3.create(x, 2, z),
        scale: Vector3.create(4, 4, 4)
    })
    MeshRenderer.setBox(entity)
    Material.setPbrMaterial(entity, {
        albedoColor: TRIGGER_COLOR_OUTSIDE,
        transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
    })
    TriggerArea.setBox(entity)
    TriggerVisual.create(entity, { isPlayerInside: false })
    triggerAreaEventsSystem.onTriggerEnter(entity, () => {
        TriggerVisual.getMutable(entity).isPlayerInside = true
        Material.setPbrMaterial(entity, {
            albedoColor: TRIGGER_COLOR_INSIDE,
            transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
        })
        SkyboxTime.createOrReplace(engine.RootEntity, skyboxTime)
        console.log(enter)
    })
    triggerAreaEventsSystem.onTriggerExit(entity, () => {
        TriggerVisual.getMutable(entity).isPlayerInside = false
        Material.setPbrMaterial(entity, {
            albedoColor: TRIGGER_COLOR_OUTSIDE,
            transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
        })
        SkyboxTime.deleteFrom(engine.RootEntity)
        console.log(exit)
    })
    createPlatform(
        Vector3.create(x, 0.05, z),
        Vector3.create(8, 0.1, 8),
        platform
    )
    createLabel(label, Vector3.create(x, 2, z), 4)

    return entity;
}
