import json

def main():
    path = r"c:\Users\izael\Downloads\simuladorGame\public\planer\Export.gltf"
    with open(path, 'r') as f:
        data = json.load(f)
    
    # 1. Total Centering
    # Set all root-level container offsets to 0
    # Node 1 and Node 3 were the ones with translations
    data['nodes'][1]['translation'] = [0, 0, 0]
    data['nodes'][1]['rotation'] = [0, 0, 0, 1]
    
    if len(data['nodes']) > 3:
        data['nodes'][3]['translation'] = [0, 0, 0]
        data['nodes'][3]['rotation'] = [0, 0, 0, 1]
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    print("Successfully re-centered GLTF to absolute origin")

if __name__ == "__main__":
    main()
