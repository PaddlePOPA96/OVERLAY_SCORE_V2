import json
import os
import shutil

input_file = 'public/fix-player.json'

def main():
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    # Buat backup untuk jaga-jaga
    backup_file = 'public/fix-player-backup.json'
    if not os.path.exists(backup_file):
        shutil.copy2(input_file, backup_file)
        print(f"Backup saved to {backup_file}")

    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    slim_data = []

    if 'players' in data:
        for club_data in data['players']:
            club_name = club_data.get('club', 'Unknown Club')
            players = club_data.get('players', [])
            
            slim_players = []
            for player in players:
                slim_players.append({
                    "name": player.get("name", ""),
                    "img_url": player.get("img_url", "")
                })
            
            # Urutkan berdasarkan nama
            slim_players.sort(key=lambda x: x['name'])
            
            slim_data.append({
                "club": club_name,
                "players": slim_players
            })
    
    # Urutkan berdasarkan nama klub
    slim_data.sort(key=lambda x: x['club'])
    
    # Format akhir disamakan dengan struktur aslinya {"players": [...]}
    final_data = {
        "players": slim_data
    }
    
    print(f"Extracted {len(slim_data)} clubs.")
    
    # Timpa file aslinya
    with open(input_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, separators=(',', ':'))
        
    print(f"Successfully slimmed down {input_file}")

if __name__ == '__main__':
    main()
