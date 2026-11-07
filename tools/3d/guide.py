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
