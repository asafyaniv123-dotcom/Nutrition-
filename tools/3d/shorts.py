# Shorts cut from the body itself: a copy of the muscle mesh between mid-thigh and the navel, pushed out a
# little and thickened, keeping the armature modifier and weights so it moves with the legs. man3 -> man4.
import bpy, bmesh
body = [o for o in bpy.data.objects if o.type == 'MESH' and 'muscle' in o.name][0]
sh = body.copy(); sh.data = body.data.copy(); sh.name = 'Shorts'; bpy.context.scene.collection.objects.link(sh)
mw = sh.matrix_world
H = max((mw @ v.co).z for v in body.data.vertices)
lo, hi = 0.33 * H, 0.58 * H
bm = bmesh.new(); bm.from_mesh(sh.data)
gone = [v for v in bm.verts if not (lo <= (mw @ v.co).z <= hi)]
bmesh.ops.delete(bm, geom=gone, context='VERTS')
for v in bm.verts: v.co += v.normal * 0.016
bm.to_mesh(sh.data); bm.free()
for md in list(sh.modifiers):
    if md.type in ('MASK', 'SUBSURF'): sh.modifiers.remove(md)
s = sh.modifiers.new('Thick', 'SOLIDIFY'); s.thickness = 0.006; s.offset = 1
sub = sh.modifiers.new('Sub', 'SUBSURF'); sub.levels = sub.render_levels = 1
print('SHORTS', len(sh.data.vertices), 'verts, z', round(lo, 3), '-', round(hi, 3))
bpy.ops.wm.save_as_mainfile(filepath=r'C:\Users\asafy\AppData\Local\Temp\claude\C--Projects-Nutrition-\745c06f2-c953-5ac2-ba7d-7e682c847577\scratchpad\r33\man6.blend')
