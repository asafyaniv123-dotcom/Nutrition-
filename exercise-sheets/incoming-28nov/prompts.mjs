// node exercise-sheets/incoming-28nov/prompts.mjs - writes exercise-sheets/<id>/prompt-frame1.txt for the 28 Nov round (Asaf approved frame 1
//   for eight by name). One template, so the fixed wording (style anchor, reference authority, figure lock, AVOID) is identical in all eight;
//   the per-exercise part is read off each ref-start crop. ref-gate.mjs runs on every file before any credit.
import fs from 'node:fs';
const EL = '<<<ce70bd4e-e33c-416c-97cd-3d9f7c02a603>>>';
const AVOID_BASE = 'extra arm, extra hand, extra leg, extra limb, three arms, three legs, mutated limbs, blocky segmented muscles, changed camera angle, mirrored image, flipped orientation, background walls, background structures, gym machines in the background, female anatomy, high-cut underwear, speedo briefs, bikini lines, dark waist seams, female bottom cut, opaque human skin, fabric shorts, black shorts, dark clothing, double sole, split sole, detached sole, floating sole layer, barefoot, socks without shoes, detailed human facial features, eyes, lips texture, ear lobes, featureless smooth sphere head, head distortion, long neck, distorted body, partial figure cut by the frame, text, watermark, logo, lettering, caption box';
const X = {
  x345: {
    what: 'a figure in a straight-arm plank with her shins resting on a large exercise ball',
    ignore: "the person's skin, hair, clothes, socks, the wooden wall panel, the column and the plant",
    only: 'one large dark exercise ball and one thin dark mat, nothing else',
    camera: "a straight side view from the figure's left side at about hand height; the head at the LEFT of the picture, the ball at the RIGHT; the whole figure, the mat and the whole ball in the frame with margin all around",
    depth: "the figure's left arm and left leg are nearest the camera; the right arm is directly behind the left arm, parallel to it; the right leg is directly behind the left leg, both shins side by side on top of the ball. Nothing crosses the midline.",
    name: 'the start of a stability ball pike',
    pose: 'a straight-arm plank. Both hands flat on the mat directly under the shoulders, arms straight and vertical. The body in one straight line from the shoulders to the ankles, level with the floor, sloping very slightly down toward the head; the waist neither sagging nor raised. Both legs straight, the shins and the top of the feet resting on the top of the ball, toes pointing back. The head in line with the spine, looking down at the mat just in front of the hands.',
    equip: 'one large dark exercise ball, its top at about shoulder height, under the shins; a thin dark mat under the hands.',
    support: 'both hands on the mat; both shins on the top of the ball; nothing else touches anything.',
    glow: 'the abdominal wall',
    glow2: 'the front of the shoulders a little brighter',
    avoid: 'knees on the ball, bent knees, sagging waist, raised waist, bent arms, hands forward of the shoulders, ball under the thighs, small ball, two balls',
  },
  x346: {
    what: 'a man standing on one leg on a low box holding one dumbbell upright at his chest',
    ignore: "the person's skin, hair, clothes, socks, the rowing machine, the foam roller and the gym behind. The person's head is above the top edge of Image 2 - draw the figure's whole head, upright, looking straight forward at the camera, above the shoulders where it belongs",
    only: 'one low dark box and one dumbbell, nothing else',
    camera: 'a straight front view at about knee height, the figure facing the camera; the box in the middle of the picture; the whole figure from the top of the head to the floor and the whole box in the frame with margin all around',
    depth: "the figure's left leg (on the RIGHT of the picture) is the standing leg on the box; the right leg (on the LEFT of the picture) hangs free beside the box, its foot in the air in front of the box's left front corner, a little lower than the box top. The dumbbell is held in front of the chest, both hands around its upper head.",
    name: 'the start of a curtsy step down',
    pose: "standing tall on the left leg on the box top, the left knee almost straight, the left foot flat on the box, toes pointing at the camera. The right leg hangs beside the box, slightly bent at the knee, the right foot off the box and in the air just in front of the box's front edge, toes pointing down at the floor. The torso upright. Both elbows bent and close to the ribs, both hands cupping the top head of ONE dumbbell held vertically against the middle of the chest. The head upright, looking straight forward.",
    equip: 'one low dark box about knee high, square; one dark dumbbell held vertically at the chest.',
    support: 'only the left shoe, flat on the box top; nothing else touches anything.',
    glow: 'the front of the standing (left) thigh',
    glow2: 'the seat of the standing leg a little brighter',
    avoid: 'both feet on the box, right foot on the box, right foot on the floor, two dumbbells, dumbbell held horizontally, bent standing knee, head missing, head cut off, tilted torso',
  },
  x347: {
    what: 'a man standing on one leg with the other leg straight out to the side, its foot resting on a high bench, a dumbbell in one hand',
    ignore: "the person's skin, hair, clothes, socks, the low plyo box in front, the bag, the cardio machines and the windows",
    only: 'one high dark bench and one dumbbell, nothing else',
    camera: "a front three-quarter view at about knee height, the figure facing the camera turned slightly to the picture's right; the figure at the LEFT of the picture, the bench at the RIGHT; the whole figure, the raised leg, the raised foot and the bench in the frame with margin all around",
    depth: "the figure's right leg (on the LEFT of the picture) is the standing leg; the left leg (on the RIGHT of the picture) is raised straight out to the side toward the bench. The right hand is on the chest; the left hand hangs straight down in front of the body holding the dumbbell beside the standing right knee.",
    name: 'the start of a single-leg abducted contralateral dumbbell Romanian deadlift',
    pose: 'standing tall on the straight right leg, the right foot flat on the floor, toes forward. The left leg straight and raised out to the side, nearly level, at about waist height, its foot resting on its inner edge on the top of the bench. The torso upright. The right hand resting flat on the middle of the chest, the elbow down at the side. The left arm straight down, the hand holding ONE dumbbell, the dumbbell hanging just in front of the right knee. The head upright, looking straight at the camera.',
    equip: "one high dark bench, its top at about the figure's waist height, to the right of the figure; one dark dumbbell in the left hand.",
    support: 'the right shoe on the floor; the left shoe on the bench top; nothing else touches anything.',
    glow: 'the back of the standing (right) thigh',
    glow2: 'the seat of the standing leg a little brighter',
    avoid: 'raised leg bent, raised foot on the floor, both feet on the floor, dumbbell in the right hand, two dumbbells, low box, torso bent forward at the start, standing leg bent',
  },
  x161: {
    what: 'a man sitting on the floor with his upper back against a padded box, a band around both thighs above the knees',
    ignore: "the person's skin, hair, clothes, socks, the earbud, the watch, the curtain, the weight plates and the racks",
    only: 'one padded dark box, one flat elastic band around both thighs and the floor, nothing else',
    camera: "a side view from the figure's left side at about knee height, slightly from the front; the box and the head at the LEFT of the picture, the feet at the RIGHT; the whole figure, the box and both feet in the frame with margin all around",
    depth: "the figure's left side is nearest the camera. The left leg is the working leg: knee bent, foot flat on the floor. The right leg lies straight along the floor further from the camera, its shoe at the far right of the picture. The left arm is bent with its elbow on the top of the box and its fist near the chin; the right arm is behind the torso, its elbow on the box.",
    name: 'the start of a single-leg hip thrust',
    pose: 'sitting on the floor, the seat ON the floor, the upper back and the back of the shoulders leaning against the top edge of the box, the torso inclined back at about 45 degrees. The left knee bent to about 80 degrees, the left foot flat on the floor about a shin-length from the seat. The right leg straight on the floor, extended forward and a little out, its heel on the floor, toes up. Both elbows resting on the top of the box, the left fist near the chin. The head upright, chin slightly down, looking forward along the body. One flat elastic band around both thighs just above the knees, stretched between them.',
    equip: 'one padded dark box about knee-high behind the upper back; one flat elastic band around both thighs just above the knees.',
    support: 'the seat on the floor; the upper back on the top edge of the box; both elbows on the box top; the left shoe flat on the floor; the right heel on the floor; nothing else touches anything.',
    glow: 'the seat (gluteus maximus) of the working left leg',
    glow2: 'the back of the left thigh a little brighter',
    avoid: 'seat lifted at the start, both knees bent, both feet planted, band on the ankles, band on the shins, band below the knees, no band, two bands, lying flat, bench instead of the box',
  },
  x348: {
    what: 'a figure on all fours with the knees hovering just above the mat',
    ignore: "the person's skin, hair, clothes, socks, the wooden wall panel and the column",
    only: 'one thin dark mat, nothing else',
    camera: "a straight side view from the figure's left side at about knee height; the head at the LEFT of the picture, the feet at the RIGHT; the whole figure and the mat in the frame with margin all around",
    depth: "the figure's left arm and left leg are nearest the camera; the right arm is directly behind the left arm, the right leg directly behind the left leg, parallel. Nothing crosses the midline.",
    name: 'a bear plank hover, held',
    pose: 'both hands flat on the mat directly under the shoulders, arms straight. The knees bent to about 90 degrees and directly under the waist, HOVERING a few centimetres above the mat - not touching it. The shins level with the mat, the toes of both shoes tucked under and resting on the mat. The back flat and level from the shoulders to the waist. The head in line with the spine, looking down at the mat just in front of the hands.',
    equip: 'one thin dark mat under the hands and feet.',
    support: 'both hands and the toes of both shoes on the mat; the knees do NOT touch the mat; nothing else touches anything.',
    glow: 'the abdominal wall',
    glow2: 'the front of the shoulders and the front of the thighs a little brighter',
    avoid: 'knees on the mat, kneeling, knees touching the floor, raised seat, rounded back, sagging back, arms bent, feet flat, head up looking forward',
  },
  x349: {
    what: 'a man leaning into a wall with his forearms, driving one knee up into an exercise ball pinned against the wall',
    ignore: "the person's skin, hair, clothes, socks, the earbud, the watch, the punching bags, the ducts and the pattern on the wall",
    only: 'one plain dark wall at the right, one large exercise ball and the floor, nothing else',
    camera: "a side view from the figure's left side, at about waist height and slightly from behind; the wall at the RIGHT of the picture, the standing foot at the bottom LEFT; the whole figure, the ball and the floor in the frame with margin all around",
    depth: "the figure's left side is nearest the camera. The right leg (the far one) is the standing leg, straight and slanted back. The left leg (near) is lifted: its knee is pressed into the ball, the ball wedged between the front of the left thigh and the wall. Both forearms and both hands are on the wall above the head.",
    name: 'a wall ball isometric hip flexion hold',
    pose: 'the body leaning forward into the wall in one long diagonal line from the standing foot to the head, about 60 degrees to the floor. The right leg straight, its foot on the floor well behind the body, on the ball of the foot. The left thigh raised forward and up to level or a little above, the left knee bent to about 90 degrees, the left shin hanging down and slightly back, the left foot off the floor. One large exercise ball pinned between the top of the left thigh and the wall, at waist height. Both forearms flat on the wall above the head, hands together, the forehead close to the forearms, looking down at the ball.',
    equip: 'one large dark exercise ball against the wall at waist height; one plain dark wall at the right edge of the picture.',
    support: 'the right shoe on the floor; both forearms on the wall; the left thigh against the ball; the ball against the wall; nothing else touches anything.',
    glow: 'the top of the front of the raised (left) thigh where it meets the body',
    glow2: 'the abdominal wall a little brighter',
    avoid: 'both feet on the floor, standing upright, ball on the floor, ball under the foot, hands on the ball, lifted leg straight, punching bag, patterned wall',
  },
  x351: {
    what: 'a man kneeling on a mat, sitting back on his heels, ready to jump',
    ignore: "the person's skin, hair, glasses, clothes and bare feet, the door and the wall",
    only: 'one thin dark mat on the floor, nothing else',
    camera: "a front view at mat height, turned very slightly to the picture's right, the figure facing the camera; the kneeling figure in the LOWER part of the picture with a LARGE empty space above the head (room for a jump to come); the whole figure and the mat in the frame with margin all around",
    depth: 'both knees side by side on the mat, a little apart, facing the camera; both shins flat on the mat behind the knees, the shoes behind the seat. Both arms hang down at the sides, the hands just outside the knees.',
    name: 'the start of a knee jump',
    pose: 'kneeling on both knees on the mat, sitting back so the seat rests on the heels, the shins flat on the mat, the tops of the shoes resting on the mat, the soles facing up. The torso upright, leaning very slightly forward. Both arms hanging relaxed at the sides, the hands just touching the mat beside the knees. The head upright, looking straight forward.',
    equip: 'one thin dark mat on the floor.',
    support: 'both knees, both shins and the tops of both shoes on the mat, the seat on the heels; the fingertips near the mat; nothing else touches anything.',
    glow: 'the seat (gluteus maximus)',
    glow2: 'the front of both thighs a little brighter',
    avoid: 'standing, squatting, one knee up, toes tucked under, feet flat on the floor, seat off the heels, barbell, weight, door',
  },
  x352: {
    what: 'a man kneeling on a mat, sitting back on his heels, a barbell across his upper back, ready to jump',
    ignore: "the person's skin, hair, glasses, clothes and bare feet, the door and the wall",
    only: 'one thin dark mat on the floor and one bare barbell with a dark foam pad in the middle, nothing else',
    camera: "a front view at mat height, turned very slightly to the picture's right, the figure facing the camera; the kneeling figure in the LOWER part of the picture with a LARGE empty space above the head (room for a jump to come); the whole figure, the mat and the whole bar in the frame with margin all around",
    depth: 'both knees side by side on the mat, a little apart, facing the camera; both shins flat on the mat behind the knees. The bar lies across the back of the shoulders BEHIND the neck, its middle covered by a dark foam pad; both hands grip the bar wide, each a little outside the shoulder, elbows pointing down.',
    name: 'the start of a weighted knee jump',
    pose: "kneeling on both knees on the mat, sitting back so the seat rests on the heels, the shins flat on the mat, the tops of the shoes resting on the mat, the soles facing up. The torso upright. A bare barbell (no plates) rests across the upper back behind the neck on a dark foam pad; both hands grip it wide, the elbows bent and pointing down. The bar slightly tilted down to the picture's right. The head upright, looking straight forward.",
    equip: 'one bare barbell, no plates, a dark foam pad around its middle, across the upper back; one thin dark mat on the floor.',
    support: 'both knees, both shins and the tops of both shoes on the mat, the seat on the heels; the bar on the upper back; nothing else touches anything.',
    glow: 'the seat (gluteus maximus)',
    glow2: 'the front of both thighs a little brighter',
    avoid: 'weight plates, dumbbells, bar in front of the neck, bar on the chest, standing, squatting, one knee up, toes tucked under, seat off the heels, door',
  },
};
const cap = (s) => s[0].toUpperCase() + s.slice(1);
for (const [id, e] of Object.entries(X)) {
  const p = `${EL} A 3D fitness app illustration of a translucent amber mannequin, ${e.what}.

Image 1 is ONLY a style reference: it only replaces the person with our mannequin - the translucent amber material, the transparent shorts, the mannequin head, the sneakers, the dark brown studio and glossy floor, the light. It must not change a single degree of the pose, the head angle or the camera. Use Image 1 strictly for body proportions, amber translucent material, transparent shorts, and clean studio. Use Image 2 ONLY for posture and gear grip.

Image 2 is the ONLY authority on the pose, the camera angle and the equipment. Copy Image 2 exactly. Ignore ${e.ignore}. Invent nothing: nothing that is not in Image 2 may appear - ${e.only}. Ignore the caption box with lettering in Image 2.

CAMERA - exactly as Image 2: ${e.camera}. 100% static camera, the same orientation as Image 2, nothing mirrored.

DEPTH ORDER - read from Image 2: ${e.depth}

POSE - exactly as Image 2 (${e.name}): ${cap(e.pose)} THE FIGURE HAS EXACTLY TWO ARMS AND TWO LEGS.

EQUIPMENT - exactly as Image 2: ${e.equip} Dark graphite with a thin amber edge light only, clearly different from the body.

SUPPORT: ${e.support}

FIGURE: VISUAL LOCK: translucent amber figure exactly as Image 1 - no opaque human skin. transparent amber mid-thigh athletic shorts with one straight waistband, exactly as in the CANONICAL-x106 anchor image (Image 1). Canonical mannequin head exactly as Image 1: bald, soft sculpted planes, no human detail. A short natural neck, the head close to the shoulders. Crisp 3D sneakers, each with ONE single solid contiguous sole. Smooth, even body surface. Clean seamless dark brown ambient background, dark glossy reflective floor with an amber reflection only. ${cap(e.glow)} lit noticeably brighter from inside - a warm brighter amber light, clearly visible but soft-edged, the same amber as the body, not yellow, not white; ${e.glow2}; everything else is the plain translucent amber material.

AVOID: ${e.avoid}, ${AVOID_BASE}.
`;
  fs.mkdirSync(`exercise-sheets/${id}`, { recursive: true });
  fs.writeFileSync(`exercise-sheets/${id}/prompt-frame1.txt`, p);
}
console.log(Object.keys(X).join(' '));
