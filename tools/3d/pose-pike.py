# Pike push-up on the MPFB man: the body is placed by the hips and the torso direction, and the hands and feet
# are IK-pinned to fixed floor points - identical in every frame by construction.
# blender -b man.blend --python pose.py -- <out-prefix> <t0> [t1 ...]   (t: 0 = top, 1 = bottom)
import bpy, sys, math
from mathutils import Vector, Matrix, Quaternion
args = sys.argv[sys.argv.index('--') + 1:]
OUT, TS = args[0], [float(t) for t in args[1:]]
rig = bpy.data.objects['Human.rig']; body = bpy.data.objects['Human']
sc = bpy.context.scene
mw0 = rig.matrix_world.copy()
B = rig.data.bones
hip = (mw0 @ B['upperleg01.L'].head_local + mw0 @ B['upperleg01.R'].head_local) / 2
sho = (mw0 @ B['upperarm01.L'].head_local + mw0 @ B['upperarm01.R'].head_local) / 2
TORSO = (sho - hip).length
upper = (B['upperarm01.L'].head_local - B['lowerarm01.L'].head_local).length
fore = (B['lowerarm01.L'].head_local - B['wrist.L'].head_local).length
ARM = upper + fore
print('TORSO', TORSO, 'ARM', ARM)

def empty(name, loc):
    e = bpy.data.objects.get(name) or bpy.data.objects.new(name, None)
    if e.name not in sc.collection.objects: sc.collection.objects.link(e)
    e.location = loc; return e

# fixed floor points (metres): hands ahead (-Y), feet behind (+Y)
HAND_Y, WRIST_Z, HAND_X = -0.56, 0.055, 0.25
ANK_Y, ANK_Z, ANK_X = 0.42, 0.11, 0.11
H = Vector((0, 0.0, 0.83))          # hip joint centre
W = Vector((0, HAND_Y, WRIST_Z))

LEG = 0.845
A = Vector((0, ANK_Y, ANK_Z))
def yz(v): return Vector((v.y, v.z))
def solve(t):
    """hip H and shoulder S in the YZ plane for t in 0..1 (0 top, 1 bottom)"""
    w, a2 = yz(W), yz(A)
    # top: the straight line wrist-shoulder-hip, its angle chosen so the straight legs reach the feet
    best = None
    for i in range(3000):
        ang = math.radians(30 + i * 0.02)
        u = Vector((math.cos(ang), math.sin(ang)))          # from the wrist up and back toward the hips
        h = w + u * (ARM * 0.985 + TORSO)
        e = abs((h - a2).length - LEG)
        if best is None or e < best[0]: best = (e, w + u * ARM * 0.985)
    s0 = best[1]
    s1 = w + Vector((0.03, 0.33))                          # bottom: shoulders just behind the hands, elbows ~85 deg
    s = s0.lerp(s1, t)
    # hip: TORSO from the shoulder and LEG from the ankle, the upper of the two answers
    d = (a2 - s).length
    x = (TORSO ** 2 - LEG ** 2 + d ** 2) / (2 * d); hgt = math.sqrt(max(0, TORSO ** 2 - x ** 2))
    base = s + (a2 - s).normalized() * x; perp = Vector((-(a2 - s).y, (a2 - s).x)).normalized()
    h = max(base + perp * hgt, base - perp * hgt, key=lambda v: v.y * 0 + v[1])
    return Vector((0, h.x, h.y)), Vector((0, s.x, s.y))

for n, side in (('L', 1), ('R', -1)):
    empty('hand.' + n, (side * HAND_X, HAND_Y, WRIST_Z))
    empty('fing.' + n, (side * (HAND_X + 0.01), HAND_Y - 0.14, 0.01))
    empty('elbP.' + n, (side * 0.75, 0.25, 0.55))
    empty('ank.' + n, (side * ANK_X, ANK_Y, ANK_Z))
    empty('toe.' + n, (side * ANK_X, ANK_Y - 0.10, 0.0))
    empty('kneeP.' + n, (side * 0.12, -0.3, 0.2))
    pb = rig.pose.bones
    for bn, tgt, pole, cnt, pa in (('lowerarm02.' + n, 'hand.' + n, 'elbP.' + n, 4, 0), ('lowerleg02.' + n, 'ank.' + n, 'kneeP.' + n, 4, 0)):
        c = pb[bn].constraints.get('IK') or pb[bn].constraints.new('IK')
        c.target = bpy.data.objects[tgt]; c.pole_target = bpy.data.objects[pole]; c.chain_count = cnt
        c.pole_angle = math.radians(pa); c.use_tail = True
    for bn, tgt in (('wrist.' + n, 'fing.' + n), ('foot.' + n, 'toe.' + n)):
        c = pb[bn].constraints.get('DT') or pb[bn].constraints.new('DAMPED_TRACK'); c.name = 'DT'
        c.target = bpy.data.objects[tgt]
    empty('palm.' + n, (side * HAND_X, HAND_Y - 0.06, -1.0))
    c = pb['wrist.' + n].constraints.get('LT') or pb['wrist.' + n].constraints.new('LOCKED_TRACK'); c.name = 'LT'
    c.target = bpy.data.objects['palm.' + n]; c.lock_axis = 'LOCK_Y'
    c.track_axis = 'TRACK_X' if n == 'L' else 'TRACK_NEGATIVE_X'

rest_dir = (sho - hip).normalized()
for k, t in enumerate(TS):
    Ht, St = solve(t)
    d = (St - Ht).normalized()
    q = rest_dir.rotation_difference(d)
    R = q.to_matrix().to_4x4()
    # rotate the rig about the rest hip, then move the hip to Ht
    M = Matrix.Translation(Ht) @ R @ Matrix.Translation(-hip) @ mw0
    rig.matrix_world = M
    bpy.context.view_layer.update()
    sc.render.filepath = f'{OUT}{k}.png'
    bpy.ops.render.render(write_still=True)
    print('RENDERED', sc.render.filepath, 'hip', tuple(round(v, 3) for v in Ht), 'sho', tuple(round(v, 3) for v in St))
