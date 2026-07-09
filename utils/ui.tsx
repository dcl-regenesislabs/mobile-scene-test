import { UiEntity, ReactEcs, PositionType, Label, Dropdown } from '@dcl/sdk/react-ecs';
import { Color4, Vector2 } from '@dcl/sdk/math';
import { teleportTo } from '~system/RestrictedActions';

function selectOption(index: number) {
    switch (index) {
        case 0:
            teleportTo({ worldCoordinates: Vector2.create(0, 0) })
            break
        case 1:
            teleportTo({ worldCoordinates: Vector2.create(0, 2) })
            break
        case 2:
            teleportTo({ worldCoordinates: Vector2.create(0, 4) })
            break
        case 3:
            teleportTo({ worldCoordinates: Vector2.create(1, 2) })
            break
        case 4:
            teleportTo({ worldCoordinates: Vector2.create(0, 3) })
            break
        case 5:
            teleportTo({ worldCoordinates: Vector2.create(2, 2) })
            break
        case 6:
            teleportTo({ worldCoordinates: Vector2.create(-1, 2) })
            break
        case 7:
            teleportTo({ worldCoordinates: Vector2.create(0, -2) })
            break
        case 8:
            teleportTo({ worldCoordinates: Vector2.create(-4, 0) })
            break
        case 9:
            teleportTo({ worldCoordinates: Vector2.create(-4, -1) })
            break
        case 10:
            teleportTo({ worldCoordinates: Vector2.create(2, 0) })
            break
        case 11:
            teleportTo({ worldCoordinates: Vector2.create(2, -2) })
            break
        case 12:
            break
        case 13:
            teleportTo({ worldCoordinates: Vector2.create(-7, 1) })
            break
        case 14:
            teleportTo({ worldCoordinates: Vector2.create(6, 0) })
            break
        case 15:
            teleportTo({ worldCoordinates: Vector2.create(-2, -1) })
            break
        case 16:
            teleportTo({ worldCoordinates: Vector2.create(-2, -2) })
            break
        case 17:
            teleportTo({ worldCoordinates: Vector2.create(1, -3) })
            break
        case 18:
            teleportTo({ worldCoordinates: Vector2.create(-4, -6) })
            break
        case 19:
            teleportTo({ worldCoordinates: Vector2.create(3, -4) })
            break
        case 20:
            teleportTo({ worldCoordinates: Vector2.create(1, -2) })
            break
        case 21:
            teleportTo({ worldCoordinates: Vector2.create(-3, -3) })
            break
        default:
            teleportTo({ worldCoordinates: Vector2.create(0, 0) })
            break
    }
}

export const uiMenu = () => (
    <UiEntity
        uiTransform={{
            positionType: 'absolute',
            width: "auto",
            height: "auto",
            minWidth: "48px",
            minHeight: "48px",
            flexDirection: "column",
            position: { top: '20%', right: '48px' },
            padding: { top: "16px", bottom: "16px", left: "16px", right: "16px", }
        }}
        uiBackground={{ color: Color4.create(0.25, 0.25, 0.25, 0.75) }}
    >
        <UiEntity
            uiTransform={{
                width: "auto",
                height: "auto",
            }}
            uiText={{ value: "Go to scene", fontSize: 40 }}
        />
        <UiEntity uiTransform={{ flexDirection: "row" }}>
            <Label
                value="Scene"
                fontSize={18}
                uiTransform={{
                    width: '140px',
                    height: '40px',
                }}
            />
            <Dropdown
                fontSize={18}
                options={[
                    `Landing`,
                    `Test 1: Staircase`,
                    `Test 2: Jumping`,
                    `Test 3: Platforms`,
                    `Test 4: Step height`,
                    `Test 5: Ramps`,
                    `Test 6: Corridor`,
                    `Test 7: Controls`,
                    `Test 8: Triggers`,
                    `Test 9: Teleport`,
                    `Test 10: Continuous Tweens`,
                    `Test 11: Texture Tweens`,
                    `Test 12: UNIMPLEMENTED`,
                    `Test 13: Boundary Trigger`,
                    `Test 14: Video Streaming`,
                    `Test 15: Misc`,
                    `Test 16: Meshes`,
                    `Test 17: Materials`,
                    `Test 18: glTF Models`,
                    `Test 19: Animations`,
                    `Test 20: Morph targets`,
                    `Test 21: Anchor points`,
                ]}
                onChange={selectOption}
            />
        </UiEntity>
    </UiEntity>
);
