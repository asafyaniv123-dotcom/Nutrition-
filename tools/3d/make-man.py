# The man for the exercise poses, shaped toward the approved character sheet: a V-taper (broad shoulders,
# narrow hips, compact glutes) and a slightly smaller head; then the rig and the muscular proxy body.
import bpy, os
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
d = TargetService.get_default_macro_info_dict()
d['gender'] = 1.0; d['muscle'] = 0.7; d['weight'] = 0.5; d['proportions'] = 0.8; d['height'] = 0.55
h = HumanService.create_human(macro_detail_dict=d, feet_on_ground=True, scale=0.1)
T = r'C:\Users\asafy\AppData\Roaming\Blender Foundation\Blender\5.2\extensions\blender_org\mpfb\data\targets'
for rel, w in (('torso/torso-vshape-incr', 0.9), ('torso/measure-shoulder-dist-incr', 0.6), ('hip/hip-scale-horiz-decr', 0.5),
               ('buttocks/buttocks-volume-incr', 1.0), ('head/head-scale-horiz-decr', 0.25),
               ('head/head-scale-vert-decr', 0.2), ('head/head-scale-depth-decr', 0.2),
               # a smooth head for the guide: the drawing copies ears and a nose from it (x20)
               ('ears/l-ear-scale-decr', 1.0), ('ears/r-ear-scale-decr', 1.0), ('ears/l-ear-flap-decr', 1.0), ('ears/r-ear-flap-decr', 1.0),
               ('ears/l-ear-scale-depth-decr', 1.0), ('ears/r-ear-scale-depth-decr', 1.0),
               ('nose/nose-scale-depth-decr', 1.0), ('nose/nose-volume-decr', 1.0), ('nose/nose-scale-vert-decr', 0.6)):
    TargetService.load_target(h, os.path.join(T, *rel.split('/')) + '.target.gz', weight=w)
rig = HumanService.add_builtin_rig(h, 'default')
P = r'C:\Users\asafy\AppData\Roaming\Blender Foundation\Blender\5.2\extensions\.user\blender_org\mpfb\data\proxymeshes\male_muscle_13290\male_muscle_13290.proxy'
px = HumanService.add_mhclo_asset(P, h, asset_type='Proxymeshes', subdiv_levels=1)
print('MAN5', h.dimensions[:], px.name)
bpy.ops.wm.save_as_mainfile(filepath=r'C:\Users\asafy\AppData\Local\Temp\claude\C--Projects-Nutrition-\745c06f2-c953-5ac2-ba7d-7e682c847577\scratchpad\r33\man12.blend')
