# Equipment pictures (13 Nov)

Four generated sheets, 3x2 grid, five objects each, the sixth cell empty. gpt_image_2_6, 3:2, medium, 2k,
one credit each; Image 1 = assets/muscles/chest.jpg (the material, light, glow and grey).

| sheet | job | objects, in cell order |
|---|---|---|
| sheet1 | 1b39e400-25b5-499b-a952-c68bc13560cb | barbell, dumbbells, machine, cable, bodyweight |
| sheet2 | 58d66877-09b1-4dd9-b6c5-3a2f981b856f | pullup, kettlebell, bench, band, mat |
| sheet3 | 89b34d75-e282-4523-a86e-98fa2674667d | cardio, smith, ezbar, trapbar, plate |
| sheet4 | ebc73392-36cf-4f06-8a90-dac5ef1ee721 | trx, step, sled, ropes, medball |

Cut to assets/equipment/<slug>.jpg (420x420, grey 179) with
`node tools/sheets/eq-cut.mjs exercise-sheets/equipment-3d/sheet1.png assets/equipment barbell,dumbbells,machine,cable,bodyweight`.

## What ships now: three materials (13 Nov)

The amber sheets above were recoloured three times (graphite, stone, sunset) and set aside: the amber in them was
LIGHT, not a material, so no recolour could give it volume. Two new sheets, 4x3 grid, ten objects each, one credit
each, the same Image 1, each object in ivory porcelain, matte charcoal and a thin amber as specified per item:

| sheet | job | objects, in cell order |
|---|---|---|
| materials-1 | d7cc14f9-3d4d-44c0-89fd-e3292e00e68a | barbell, dumbbells, machine, cable, bodyweight, pullup, kettlebell, bench, band, mat |
| materials-2 | 62d5e657-829f-4478-aee4-838382817fe5 | cardio, smith, ezbar, trapbar, plate, trx, step, sled, ropes, medball |

`GRID=4x3 node tools/sheets/eq-cut.mjs exercise-sheets/equipment-3d/materials-1.png assets/equipment barbell,...` - onto
grey 179, the muscles' own ground.
