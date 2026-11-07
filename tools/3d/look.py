# Look v2, matched against an approved frame (x19 start): saturated orange, not peach; a bright gold rim;
# muscle forms picked out by curvature (convex brighter, creases darker); a dark glossy floor that catches the
# figure's own light. Cycles, because only path tracing lets the glowing body light the floor.
import bpy
from mathutils import Vector
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.samples = 48; sc.cycles.use_denoising = True
try: sc.cycles.device = 'GPU'
except Exception: pass
sc.render.resolution_x = sc.render.resolution_y = 1024
sc.render.film_transparent = False
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
if 'Floor' in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects['Floor'])
cam = bpy.data.objects['Cam']
cam.location = Vector((-2.9, -1.05, 0.78)); look = Vector((0, -0.12, 0.42))
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam.data.lens = 50

m = bpy.data.materials.new('Glow2'); m.use_nodes = True
N = m.node_tree.nodes; L = m.node_tree.links
for n in list(N): N.remove(n)
out = N.new('ShaderNodeOutputMaterial')
geo = N.new('ShaderNodeNewGeometry')
# curvature: pointiness is ~0.5 on flat skin, higher on ridges, lower in creases - stretched to 0..1
ramp = N.new('ShaderNodeValToRGB'); ramp.color_ramp.elements[0].position = 0.48; ramp.color_ramp.elements[1].position = 0.53
L.new(geo.outputs['Pointiness'], ramp.inputs['Fac'])
lw = N.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.3
# body colour: deep orange in the creases, bright orange on the forms
col = N.new('ShaderNodeMix'); col.data_type = 'RGBA'
col.inputs[6].default_value = (0.32, 0.05, 0.0, 1); col.inputs[7].default_value = (1.0, 0.33, 0.02, 1)
L.new(ramp.outputs['Color'], col.inputs[0])
body_em = N.new('ShaderNodeEmission'); body_em.inputs['Strength'].default_value = 0.85
L.new(col.outputs[2], body_em.inputs['Color'])
rim = N.new('ShaderNodeEmission'); rim.inputs['Color'].default_value = (1.0, 0.45, 0.08, 1); rim.inputs['Strength'].default_value = 1.8
mix = N.new('ShaderNodeMixShader')
L.new(lw.outputs['Facing'], mix.inputs['Fac']); L.new(body_em.outputs[0], mix.inputs[1]); L.new(rim.outputs[0], mix.inputs[2])
L.new(mix.outputs[0], out.inputs['Surface'])
body = bpy.data.objects['Human']
body.data.materials.clear(); body.data.materials.append(m)
if not any(md.type == 'SUBSURF' for md in body.modifiers):
    s = body.modifiers.new('Sub', 'SUBSURF'); s.levels = s.render_levels = 1
for o in bpy.data.objects:
    if o.type == 'MESH' and o is not body and o.parent and o.parent.name == 'Human.rig': o.hide_render = True

# floor: near-black, slightly glossy, so the figure's glow pools and reflects under the contacts
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0)); fl = bpy.context.object; fl.name = 'Floor'
fm = bpy.data.materials.new('FloorM'); fm.use_nodes = True
p = fm.node_tree.nodes['Principled BSDF']
p.inputs['Base Color'].default_value = (0.035, 0.02, 0.012, 1); p.inputs['Roughness'].default_value = 0.42
fl.data.materials.append(fm)
w = sc.world or bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.006, 0.0028, 0.001, 1); bg.inputs['Strength'].default_value = 1.0
