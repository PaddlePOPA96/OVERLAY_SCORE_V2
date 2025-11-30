const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

// --- KONFIGURASI ---
const API_KEY = '0ea6f9faf31246dcb907c52fa33062b6'; 
const BASE_URL = 'https://api.football-data.org/v4';

// Helper Tanggal
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// 1. ENDPOINT KLASEMEN
app.get('/api/klasemen', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/competitions/PL/standings`, {
            headers: { 'X-Auth-Token': API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. ENDPOINT PERTANDINGAN (Hasil & Jadwal)
app.get('/api/pertandingan', async (req, res) => {
    try {
        const today = new Date();
        const pastDate = new Date(); pastDate.setDate(today.getDate() - 7);
        const futureDate = new Date(); futureDate.setDate(today.getDate() + 7);

        const url = `${BASE_URL}/competitions/PL/matches?dateFrom=${formatDate(pastDate)}&dateTo=${formatDate(futureDate)}`;
        const response = await axios.get(url, { headers: { 'X-Auth-Token': API_KEY } });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. ENDPOINT DETAIL TIM (NEW FEATURE!)
app.get('/api/teams/:id', async (req, res) => {
    try {
        const teamId = req.params.id;
        // Kita ambil data tim lengkap dengan squad
        const url = `${BASE_URL}/teams/${teamId}`;
        console.log(`🔍 Mengambil data tim ID: ${teamId}`);
        
        const response = await axios.get(url, { headers: { 'X-Auth-Token': API_KEY } });
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Gagal mengambil data tim" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});