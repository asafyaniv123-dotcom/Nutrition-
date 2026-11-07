# The guide render is SMOOTH: the curvature shading of look2 is switched off, so the drawing does not copy
# every crease as a wrinkle (x20, 7 Nov). Run after look2.py.
import bpy
for name in ('Glow2', 'ShortsM'):
    m = bpy.data.materials.get(name)
    if not m: continue
    for l in list(m.node_tree.links):
        if l.to_node.type == 'MIX' and l.to_socket.name == 'Factor': m.node_tree.links.remove(l)
    for n in m.node_tree.nodes:
        if n.type == 'MIX': n.inputs[0].default_value = 0.75
# the shorts wear the body's own material in the guide: a darker shorts material with its own rim light made
# the top edge of the shorts glow like a separate bump, and the drawing turned it into glutes poking out (x20)
so = bpy.data.objects.get('Shorts')
if so:
    body = next((o for o in bpy.data.objects if o.type == 'MESH' and 'muscle' in o.name), None)
    if body and body.data.materials:
        so.data.materials.clear(); so.data.materials.append(body.data.materials[0])
