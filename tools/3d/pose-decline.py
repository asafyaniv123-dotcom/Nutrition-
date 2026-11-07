# Decline push-up on the MPFB man: the feet on a bench, the hands on the floor, both IK-pinned, the body one
# straight line from the ankles to the shoulders. t = 0 top (arms straight), 1 bottom (chest near the floor).
# blender -b man7.blend --python scene.py --python look2.py --python pose-decline.py -- <out-prefix> <t0> [t1 ...]
import bpy, sys, math
from mathutils import Vector, Matrix
args = sys.argv[sys.argv.index('--') + 1:]
OUT, TS = args[0], [float(t) for t in args[1:]]
rig = bpy.data.objects['Human.rig']; sc = bpy.context.scene
mw0 = rig.matrix_world.copy(); B = rig.data.bones
hip = (mw0 @ B['upperleg01.L'].head_local + mw0 @ B['upperleg01.R'].head_local) / 2
sho = (mw0 @ B['upperarm01.L'].head_local + mw0 @ B['upperarm01.R'].head_local) / 2
TORSO = (sho - hip).length
ARM = (B['upperarm01.L'].head_local - B['lowerarm01.L'].head_local).length + (B['lowerarm01.L'].head_local - B['wrist.L'].head_local).length
LEG = 0.995 * ((B['upperleg01.L'].head_local - B['lowerleg01.L'].head_local).length + (B['lowerleg01.L'].head_local - B['foot.L'].head_local).length)
K = ARM / 0.5182

BENCH_Z = 0.48 * K
HAND_X, WRIST_Z = 0.24 * K, 0.055 * K
ANK_Y, ANK_Z, ANK_X = 0.62 * K, BENCH_Z + 0.10 * K, 0.10 * K
A = Vector((ANK_Y, ANK_Z))

def circles(c1, r1, c2, r2):
    d = (c2 - c1).length; x = (r1 * r1 - r2 * r2 + d * d) / (2 * d); h = math.sqrt(max(0.0, r1 * r1 - x * x))
    base = c1 + (c2 - c1).normalized() * x; perp = Vector((-(c2 - c1).y, (c2 - c1).x)).normalized()
    return base + perp * h, base - perp * h

# the wrist sits under the shoulder at the top: place it where a straight body reaches over a vertical arm
W = Vector((ANK_Y - math.sqrt((LEG + TORSO) ** 2 - (ARM * 0.985 + WRIST_Z - ANK_Z) ** 2), WRIST_Z))

def solve(t):
    r = ARM * (0.985 - 0.56 * t)           # shoulder-to-wrist: straight arms at the top, elbows ~85 deg at the bottom
    s = max(circles(A, LEG + TORSO, W, r), key=lambda v: v.y)   # the upper answer
    d = (s - A).normalized()
    h = A + d * LEG
    return Vector((0, h.x, h.y)), Vector((0, s.x, s.y))

def empty(name, loc):
    e = bpy.data.objects.get(name) or bpy.data.objects.new(name, None)
    if e.name not in sc.collection.objects: sc.collection.objects.link(e)
    e.location = loc; return e

pb = rig.pose.bones
for n, side in (('L', 1), ('R', -1)):
    empty('hand.' + n, (side * HAND_X, W.x, WRIST_Z))
    empty('fing.' + n, (side * (HAND_X + 0.01), W.x - 0.14, 0.01))
    empty('palm.' + n, (side * HAND_X, W.x - 0.06, -1.0))
    empty('elbP.' + n, (side * 0.35, W.x + 0.6, 0.6))
    empty('ank.' + n, (side * ANK_X, ANK_Y, ANK_Z))
    empty('toe.' + n, (side * ANK_X, ANK_Y - 0.03, BENCH_Z))          # on the toes, the soles facing back
    empty('kneeP.' + n, (side * 0.12, 0.2, -0.5))
    for bn, tgt, pole in (('lowerarm02.' + n, 'hand.' + n, 'elbP.' + n), ('lowerleg02.' + n, 'ank.' + n, 'kneeP.' + n)):
        c = pb[bn].constraints.get('IK') or pb[bn].constraints.new('IK')
        c.target = bpy.data.objects[tgt]; c.pole_target = bpy.data.objects[pole]; c.chain_count = 4; c.use_tail = True
    for bn, tgt in (('wrist.' + n, 'fing.' + n), ('foot.' + n, 'toe.' + n)):
        c = pb[bn].constraints.get('DT') or pb[bn].constraints.new('DAMPED_TRACK'); c.name = 'DT'; c.target = bpy.data.objects[tgt]
    c = pb['wrist.' + n].constraints.get('LT') or pb['wrist.' + n].constraints.new('LOCKED_TRACK'); c.name = 'LT'
    c.target = bpy.data.objects['palm.' + n]; c.lock_axis = 'LOCK_Y'; c.track_axis = 'TRACK_X' if n == 'L' else 'TRACK_NEGATIVE_X'

# the bench: a flat padded top on a dark frame, under the feet
if 'Bench' not in bpy.data.objects:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, ANK_Y + 0.12 * K, BENCH_Z - 0.04 * K))
    bn = bpy.context.object; bn.name = 'Bench'; bn.scale = (0.30 * K, 0.60 * K, 0.08 * K)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, ANK_Y + 0.12 * K, (BENCH_Z - 0.08 * K) / 2))
    lg = bpy.context.object; lg.name = 'BenchLeg'; lg.scale = (0.08 * K, 0.08 * K, BENCH_Z - 0.08 * K)
    bm = bpy.data.materials.new('BenchM'); bm.use_nodes = True
    p = bm.node_tree.nodes['Principled BSDF']; p.inputs['Base Color'].default_value = (0.09, 0.06, 0.045, 1); p.inputs['Roughness'].default_value = 0.45
    for o in (bn, lg): o.data.materials.append(bm)

cam = bpy.data.objects['Cam']
look = Vector((0, (W.x + ANK_Y) / 2, 0.38 * K))
cam.location = look + Vector((-3.3, -0.9, 0.55)) * K
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = 50

rest_dir = (sho - hip).normalized()
for k, t in enumerate(TS):
    Ht, St = solve(t)
    R = rest_dir.rotation_difference((St - Ht).normalized()).to_matrix().to_4x4()
    rig.matrix_world = Matrix.Translation(Ht) @ R @ Matrix.Translation(-hip) @ mw0
    bpy.context.view_layer.update()
    sc.render.filepath = f'{OUT}{k}.png'
    bpy.ops.render.render(write_still=True)
    print('RENDERED', k, 'hip', tuple(round(v, 3) for v in Ht), 'sho', tuple(round(v, 3) for v in St), 'wrist', round(W.x, 3))

# the empty scene: the same camera and bench with the man hidden - the one background every frame is placed on
for o in bpy.data.objects:
    if o.type == 'MESH' and o.name not in ('Bench', 'BenchLeg', 'Floor'): o.hide_render = True
sc.render.filepath = f'{OUT}empty.png'
bpy.ops.render.render(write_still=True)
print('RENDERED empty')
