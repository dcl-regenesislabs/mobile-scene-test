import { UiEntity, ReactEcs, PositionType, Label, Dropdown, Button } from '@dcl/sdk/react-ecs';
import { Color4, Vector2 } from '@dcl/sdk/math';
import { teleportTo } from '~system/RestrictedActions';
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs';

const TESTS = [
    { "test": "Landing", "name": null, "base": [0, 0] },
    { "test": "Test 1", "name": "Staircase", "base": [0, 2] },
    { "test": "Test 2", "name": "Jumping", "base": [0, 4] },
    { "test": "Test 3", "name": "Platforms", "base": [1, 2] },
    { "test": "Test 4", "name": "Step Height", "base": [0, 3] },
    { "test": "Test 5", "name": "Ramps", "base": [2, 2] },
    { "test": "Test 6", "name": "Corridor", "base": [-1, 2] },
    { "test": "Test 7", "name": "Controls", "base": [0, -2] },
    { "test": "Test 8", "name": "Triggers", "base": [-4, 0] },
    { "test": "Test 9", "name": "Teleport", "base": [-4, -1] },
    { "test": "Test 10", "name": "Continuous Tweens", "base": [2, 0] },
    { "test": "Test 11", "name": "Texture Tweens", "base": [2, -2] },
    { "test": "Test 12", "name": "UNIMPLEMENTED", "base": null },
    { "test": "Test 13", "name": "Boundary Trigger", "base": [-7, 1] },
    { "test": "Test 14", "name": "Video Streaming", "base": [6, 0] },
    { "test": "Test 15", "name": "Misc", "base": [-2, -1] },
    { "test": "Test 16", "name": "Meshes", "base": [-2, -2] },
    { "test": "Test 17", "name": "Materials", "base": [-2, -2] },
    { "test": "Test 18", "name": "glTF Models", "base": [-4, -6] },
    { "test": "Test 19", "name": "Animations", "base": [3, -4] },
    { "test": "Test 20", "name": "Morph Target", "base": [1, -2] },
    { "test": "Test 21", "name": "Anchor Points", "base": [-3, -3] },
    { "test": "Test 22", "name": "Skybox Time", "base": [-5, -3] },
    { "test": "Test 23", "name": "Player Physics", "base": [-8, 4] },
    { "test": "Test 24", "name": "Memory Stress", "base": [-10, 4] },
    { "test": "Test 25", "name": "Particle System", "base": [0, -5] },

]

export function teleportUi() {
    ReactEcsRenderer.setUiRenderer(teleportButton, { virtualWidth: 1920, virtualHeight: 1080 })
}

const teleportButton = () => (
    <UiEntity
        uiTransform={{
            width: "100%",
            flexDirection: "column"
        }}>
        <Button
            value='Teleport'
            fontSize={40}
            uiBackground={{
                color: Color4.create(0.3, 0.1, 0.8, 1.),
            }}
            uiTransform={{
                alignSelf: "center",
                height: "auto",
                position: { top: "32px" },
                padding: { top: "4px", bottom: "4px", left: "4px", right: "4px", },
                borderRadius: { bottomLeft: "5px", bottomRight: "5px", topLeft: "5px", topRight: "5px" }
            }}
            onMouseUp={() => {
                ReactEcsRenderer.setUiRenderer(teleportMenu, { virtualWidth: 1920, virtualHeight: 1080 })
            }}></Button>
    </UiEntity >
)


const teleportMenu = () => (
    <UiEntity
        onMouseUp={() => {
            ReactEcsRenderer.setUiRenderer(teleportButton, { virtualWidth: 1920, virtualHeight: 1080 })
        }}
        uiTransform={{
            width: "100%",
            height: "100%",
            flexDirection: "row",
            justifyContent: "center"
        }}>
        <UiEntity
            onMouseUp={() => { }}
            uiBackground={{
                color: Color4.create(0.3, 0.1, 0.8, 1.),
            }}
            uiTransform={{
                alignSelf: "center",
                width: "800px",
                position: { top: "32px" },
                borderRadius: { bottomLeft: "5px", bottomRight: "5px", topLeft: "5px", topRight: "5px" },
                flexWrap: "wrap"
            }}>
            {
                TESTS.map((test) => {
                    var name;
                    if (test.name) {
                        name = `${test.test}\n${test.name}`
                    } else {
                        name = `${test.test}`
                    }
                    return <Button
                        value={name}
                        uiBackground={{
                            color: Color4.create(0.5, 0.2, 0.8, 1.),
                        }}
                        uiTransform={{
                            width: "192px",
                            height: "64px",
                            margin: { top: "4px", bottom: "4px", left: "4px", right: "4px", },
                            padding: { top: "4px", bottom: "4px", left: "4px", right: "4px", },
                            borderRadius: { bottomLeft: "5px", bottomRight: "5px", topLeft: "5px", topRight: "5px" }
                        }}
                        onMouseUp={() => {
                            if (test.base) {
                                teleportTo({ worldCoordinates: Vector2.create(test.base[0], test.base[1]) })
                            }
                            ReactEcsRenderer.setUiRenderer(teleportButton, { virtualWidth: 1920, virtualHeight: 1080 })
                        }}
                    ></Button>

                })
            }
        </UiEntity>
    </UiEntity>
);
