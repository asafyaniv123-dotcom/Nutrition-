import bpy
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
d = TargetService.get_default_macro_info_dict()
print('MACRO', d)
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
d['gender'] = 1.0; d['muscle'] = 1.0; d['weight'] = 0.62; d['proportions'] = 1.0; d['height'] = 0.6
h = HumanService.create_human(macro_detail_dict=d, feet_on_ground=True, scale=0.1)
rig = HumanService.add_builtin_rig(h, 'default')
print('HUMAN', h.name, h.dimensions[:], 'RIG', rig.name)
print('BONES', [b.name for b in rig.data.bones])
bpy.ops.wm.save_as_mainfile(filepath=r'C:\Users\asafy\AppData\Local\Temp\claude\C--Projects-Nutrition-\745c06f2-c953-5ac2-ba7d-7e682c847577\scratchpad\r33\man2.blend')
