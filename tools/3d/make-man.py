import bpy
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
d = TargetService.get_default_macro_info_dict()
d['gender'] = 1.0; d['muscle'] = 1.0; d['weight'] = 0.62; d['proportions'] = 1.0; d['height'] = 0.6
h = HumanService.create_human(macro_detail_dict=d, feet_on_ground=True, scale=0.1)
rig = HumanService.add_builtin_rig(h, 'default')
P = r'C:\Users\asafy\AppData\Roaming\Blender Foundation\Blender\5.2\extensions\.user\blender_org\mpfb\data\proxymeshes\male_muscle_13290\male_muscle_13290.proxy'
px = HumanService.add_mhclo_asset(P, h, asset_type='Proxymeshes', subdiv_levels=1)
print('PROXY', px.name if px else None, [o.name for o in bpy.data.objects if o.type == 'MESH'])
bpy.ops.wm.save_as_mainfile(filepath=r'C:\Users\asafy\AppData\Local\Temp\claude\C--Projects-Nutrition-\745c06f2-c953-5ac2-ba7d-7e682c847577\scratchpad\r33\man3.blend')
