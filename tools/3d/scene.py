# Camera and a quick workbench look, for checking the pose (the glow comes later).
import bpy, sys
from mathutils import Vector
sc = bpy.context.scene
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
sc.render.engine = 'BLENDER_WORKBENCH'
sc.render.resolution_x = sc.render.resolution_y = 640
sc.render.film_transparent = True
cam = bpy.data.objects.get('Cam')
if not cam:
    cam = bpy.data.objects.new('Cam', bpy.data.cameras.new('Cam')); sc.collection.objects.link(cam)
cam.location = Vector((-3.3, -1.1, 1.05))
look = Vector((0, -0.08, 0.42))
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 50
sc.camera = cam
# a floor line so contact can be judged
if 'Floor' not in bpy.data.objects:
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, 0)); bpy.context.object.name = 'Floor'
