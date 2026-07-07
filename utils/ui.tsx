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
            position: { top: '20%', right: '20px' },
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
                ]}
                onChange={selectOption}
            />
        </UiEntity>
    </UiEntity>
);
