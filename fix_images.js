const fs = require('fs');
const file = 'src/features/formation/components/FormationOverlayControl.jsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `
          const data = snapshot.val();
          
          // Perbarui link_foto dari JSON lokal agar jika ada perubahan dari .jpg ke .webp otomatis terupdate
          const localTeamData = playerData.find(t => t.negara === selectedTeam);
          const updatePhoto = (player) => {
            if (!localTeamData || !player) return player;
            const freshPlayer = localTeamData.pemain.find(p => p.nama_pemain === player.nama_pemain);
            return freshPlayer ? { ...player, link_foto: freshPlayer.link_foto } : player;
          };

          const updatedPlayers = (data.players || []).map(updatePhoto);
          const updatedSubstitutes = (data.substitutes || []).map(updatePhoto);

          setPlayers(updatedPlayers);
          setSubstitutes(updatedSubstitutes);
`;

content = content.replace(
  /const data = snapshot\.val\(\);\s*setPlayers\(data\.players \|\| \[\]\);\s*setSubstitutes\(data\.substitutes \|\| \[\]\);/g,
  replacement
);

fs.writeFileSync(file, content);
console.log('Fixed link_foto updating logic!');
