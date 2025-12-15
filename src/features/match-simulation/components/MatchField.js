"use client";

import { useEffect, useRef } from "react";

export default function MatchField({ homeTeam, awayTeam, events = [] }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const width = 800;
        const height = 500;

        canvas.width = width;
        canvas.height = height;

        // Draw field
        const drawField = () => {
            // Grass gradient
            const grad = ctx.createLinearGradient(0, 0, 0, height);
            grad.addColorStop(0, "#2d6a4f");
            grad.addColorStop(1, "#1b4332");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Grass stripes
            ctx.fillStyle = "rgba(0,0,0,0.05)";
            for (let i = 0; i < width; i += 100) {
                ctx.fillRect(i, 0, 50, height);
            }

            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 2;

            // Border
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Center line
            ctx.beginPath();
            ctx.moveTo(width / 2, 20);
            ctx.lineTo(width / 2, height - 20);
            ctx.stroke();

            // Center circle
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
            ctx.stroke();

            // Center dot
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.fill();

            // Left penalty box
            ctx.strokeRect(20, height / 2 - 100, 120, 200);
            ctx.strokeRect(20, height / 2 - 50, 40, 100);

            // Right penalty box
            ctx.strokeRect(width - 140, height / 2 - 100, 120, 200);
            ctx.strokeRect(width - 60, height / 2 - 50, 40, 100);

            // Penalty spots
            ctx.beginPath();
            ctx.arc(100, height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width - 100, height / 2, 3, 0, Math.PI * 2);
            ctx.fill();
        };

        // Draw player
        const drawPlayer = (x, y, color, number) => {
            // Player circle
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);

            // Gradient
            const grad = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 12);
            if (color === "home") {
                grad.addColorStop(0, "#54a0ff");
                grad.addColorStop(1, "#2980b9");
            } else {
                grad.addColorStop(0, "#ff6b6b");
                grad.addColorStop(1, "#c0392b");
            }
            ctx.fillStyle = grad;
            ctx.fill();

            // Border
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.stroke();

            // Number
            ctx.fillStyle = "#fff";
            ctx.font = "10px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(number, x, y);
        };

        // Draw teams
        const drawTeams = () => {
            drawField();

            // Draw home team (left side, blue)
            if (homeTeam && homeTeam.players) {
                homeTeam.players.forEach((player, idx) => {
                    // Convert position percentage to canvas coordinates
                    const x = (player.x / 100) * width;
                    const y = (player.y / 100) * height;
                    drawPlayer(x, y, "home", idx + 1);
                });
            }

            // Draw away team (right side, red - mirrored)
            if (awayTeam && awayTeam.players) {
                awayTeam.players.forEach((player, idx) => {
                    // Mirror x position for away team
                    const x = width - (player.x / 100) * width;
                    const y = height - (player.y / 100) * height;
                    drawPlayer(x, y, "away", idx + 1);
                });
            }
        };

        drawTeams();
    }, [homeTeam, awayTeam]);

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                className="rounded-lg shadow-2xl border-4 border-slate-800"
            />
        </div>
    );
}
