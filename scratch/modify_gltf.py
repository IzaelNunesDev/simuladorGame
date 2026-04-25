import json
import base64
import struct

def create_animation_data():
    # 3 keyframes: 0s, 0.5s, 1s
    times = [0.0, 0.5, 1.0]
    # 4 rotations (quaternions) around local X axis (assuming X is the spin axis)
    # Actually, let's just do a 360 around Y for now as a test
    import math
    
    def q_from_axis_angle(axis, angle):
        half_angle = angle / 2.0
        s = math.sin(half_angle)
        return [axis[0] * s, axis[1] * s, axis[2] * s, math.cos(half_angle)]

    rotations = [
        q_from_axis_angle([1, 0, 0], 0),
        q_from_axis_angle([1, 0, 0], math.pi),
        q_from_axis_angle([1, 0, 0], 2 * math.pi)
    ]
    
    time_buf = struct.pack('fff', *times)
    rot_buf = struct.pack('ffffffffffff', *[item for sublist in rotations for item in sublist])
    
    return time_buf, rot_buf

def main():
    path = r"c:\Users\izael\Downloads\simuladorGame\public\planer\Export.gltf"
    with open(path, 'r') as f:
        data = json.load(f)
    
    # 1. Position Correction
    # Set Airplane container (Node 1) to origin
    data['nodes'][1]['translation'] = [0, 5, 0]
    # Reset rotation of Node 1 to identity (facing forward)
    data['nodes'][1]['rotation'] = [0, 0, 0, 1]
    
    # 2. Add Animation for Propeller (Node 16)
    time_data, rot_data = create_animation_data()
    
    # Create data URIs
    time_uri = "data:application/octet-stream;base64," + base64.b64encode(time_data).decode('utf-8')
    rot_uri = "data:application/octet-stream;base64," + base64.b64encode(rot_data).decode('utf-8')
    
    # Add new buffers for animation
    if 'buffers' not in data:
        data['buffers'] = []
    
    time_buffer_idx = len(data['buffers'])
    data['buffers'].append({
        "name": "AnimTime",
        "uri": time_uri,
        "byteLength": len(time_data)
    })
    
    rot_buffer_idx = len(data['buffers'])
    data['buffers'].append({
        "name": "AnimRot",
        "uri": rot_uri,
        "byteLength": len(rot_data)
    })
    
    # Add bufferViews
    if 'bufferViews' not in data:
        data['bufferViews'] = []
        
    time_bv_idx = len(data['bufferViews'])
    data['bufferViews'].append({
        "buffer": time_buffer_idx,
        "byteLength": len(time_data),
        "name": "AnimTimeBV"
    })
    
    rot_bv_idx = len(data['bufferViews'])
    data['bufferViews'].append({
        "buffer": rot_buffer_idx,
        "byteLength": len(rot_data),
        "name": "AnimRotBV"
    })
    
    # Add Accessors
    if 'accessors' not in data:
        data['accessors'] = []
        
    time_acc_idx = len(data['accessors'])
    data['accessors'].append({
        "bufferView": time_bv_idx,
        "componentType": 5126, # FLOAT
        "count": 3,
        "type": "SCALAR",
        "max": [1.0],
        "min": [0.0]
    })
    
    rot_acc_idx = len(data['accessors'])
    data['accessors'].append({
        "bufferView": rot_bv_idx,
        "componentType": 5126, # FLOAT
        "count": 3,
        "type": "VEC4"
    })
    
    # Add Animation
    if 'animations' not in data:
        data['animations'] = []
        
    data['animations'].append({
        "name": "PropellerSpin",
        "channels": [
            {
                "sampler": 0,
                "target": {
                    "node": 16,
                    "path": "rotation"
                }
            }
        ],
        "samplers": [
            {
                "input": time_acc_idx,
                "interpolation": "LINEAR",
                "output": rot_acc_idx
            }
        ]
    })
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    print("Successfully modified GLTF")

if __name__ == "__main__":
    main()
