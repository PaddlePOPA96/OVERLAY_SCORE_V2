import React from 'react';

import { Box, Button, Typography, Paper, Grid, IconButton } from '@mui/material';

import { useScoreboard } from '@/shared/hooks/useScoreboard';

export default function StreamsPreviewDashboard({ roomId, theme }) {
    const { data, updateMatch } = useScoreboard(roomId);
    const isLight = theme === 'light';

    const handleScore = (team, increment) => {
        const currentScore = team === 'home' ? (data.homeScore || 0) : (data.awayScore || 0);
        const newScore = Math.max(0, currentScore + increment);

        updateMatch({
            [team === 'home' ? 'homeScore' : 'awayScore']: newScore
        });
    };

    return (
        <Box display="flex" flexDirection="column" gap={1.5} height="100%" width="100%">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>Live Streams & Quick Score</Typography>
                </Box>
                <Button variant="outlined" color="primary" size="small" href="/streams" target="_blank" sx={{ textTransform: 'none' }}>
                    Buka di Tab Baru
                </Button>
            </Box>

            {/* Quick Score Controls */}
            <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', bgcolor: isLight ? '#fff' : '#1e293b' }}>
                <Grid container spacing={1} alignItems="center">
                    {/* HOME */}
                    <Grid item xs={6} display="flex" flexDirection="column" alignItems="center" gap={0.5} sx={{ borderRight: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>
                            {data.homeName || 'HOME'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton size="small" onClick={() => handleScore('home', -1)} sx={{ bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', color: isLight ? '#000' : '#fff' }}>
                                <i className="ri-subtract-line"></i>
                            </IconButton>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff', minWidth: '30px', textAlign: 'center' }}>
                                {data.homeScore || 0}
                            </Typography>
                            <IconButton size="small" onClick={() => handleScore('home', 1)} sx={{ bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', color: isLight ? '#000' : '#fff' }}>
                                <i className="ri-add-line"></i>
                            </IconButton>
                        </Box>
                    </Grid>

                    {/* AWAY */}
                    <Grid item xs={6} display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                        <Typography variant="caption" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff' }}>
                            {data.awayName || 'AWAY'}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton size="small" onClick={() => handleScore('away', -1)} sx={{ bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', color: isLight ? '#000' : '#fff' }}>
                                <i className="ri-subtract-line"></i>
                            </IconButton>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: isLight ? '#000' : '#fff', minWidth: '30px', textAlign: 'center' }}>
                                {data.awayScore || 0}
                            </Typography>
                            <IconButton size="small" onClick={() => handleScore('away', 1)} sx={{ bgcolor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', color: isLight ? '#000' : '#fff' }}>
                                <i className="ri-add-line"></i>
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Iframe Preview */}
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', height: '680px', border: '1px solid', borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
                <iframe
                    src="/streams?minimal=true"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                    allowFullScreen
                    title="Live Streams Preview"
                ></iframe>
            </Paper>
        </Box>
    );
}
