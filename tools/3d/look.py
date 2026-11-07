# The glow look: an amber body lit from inside with a bright rim, on a transparent film (the ground and the
# bloom are added afterwards, the same for every frame). Run after scene.py, before pose.py.
import bpy
from mathutils import Vector
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'
sc.render.resolution_x = sc.render.resolution_y = 1024
sc.render.film_transparent = True
sc.view_settings.view_transform = 'Standard'
sc.eevee.taa_render_samples = 32
if 'Floor' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Floor'])
cam = bpy.data.objects['Cam']
cam.location = Vector((-2.55, -1.35, 1.15)); look = Vector((0, -0.08, 0.38))
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = 50
m = bpy.data.materials.new('Glow'); m.use_nodes = True
nt = m.node_tree; N = nt.nodes; L = nt.links
for n in list(N): N.remove(n)
out = N.new('ShaderNodeOutputMaterial')
lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.22
core = N.new('ShaderNodeEmission'); core.inputs['Color'].default_value = (1.0, 0.42, 0.08, 1); core.inputs['Strength'].default_value = 0.12
rim = N.new('ShaderNodeEmission'); rim.inputs['Color'].default_value = (1.0, 0.78, 0.42, 1); rim.inputs['Strength'].default_value = 2.2
dif = N.new('ShaderNodeBsdfDiffuse'); dif.inputs['Color'].default_value = (0.9, 0.38, 0.08, 1)
mix = N.new('ShaderNodeMixShader'); add1 = N.new('ShaderNodeAddShader')
L.new(lw.outputs['Facing'], mix.inputs['Fac']); L.new(core.outputs[0], mix.inputs[1]); L.new(rim.outputs[0], mix.inputs[2])
L.new(mix.outputs[0], add1.inputs[0]); L.new(dif.outputs[0], add1.inputs[1]); L.new(add1.outputs[0], out.inputs['Surface'])
body = bpy.data.objects['Human']
body.data.materials.clear(); body.data.materials.append(m)
for o in bpy.data.objects:
    if o.type == 'MESH' and o is not body and o.parent and o.parent.name == 'Human.rig': o.hide_render = True
# one soft key light from above-front for the muscle forms, warm; the world stays black
ld = bpy.data.lights.new('Key', 'AREA'); ld.energy = 60; ld.size = 3; ld.color = (1, 0.8, 0.6)
lo = bpy.data.objects.new('Key', ld); sc.collection.objects.link(lo)
lo.location = (-1.5, -2.0, 3.0); lo.rotation_euler = (Vector((0, -0.1, 0.4)) - lo.location).to_track_quat('-Z', 'Y').to_euler()
w = sc.world or bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0
