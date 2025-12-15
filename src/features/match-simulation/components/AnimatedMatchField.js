"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedMatchField({
    homeTeam,
    awayTeam,
    onMatchEnd,
    onGoal
}) {
    const canvasRef = useRef(null);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [matchTime, setMatchTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [commentary, setCommentary] = useState([]);
    const animationRef = useRef(null);
    const gameStateRef = useRef(null);
    const lastEventTimeRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !homeTeam || !awayTeam) return;

        const ctx = canvas.getContext("2d");
        const width = 400;  // Much smaller width
        const height = 600; // Much smaller height
        canvas.width = width;
        canvas.height = height;

        // Game constants
        const PLAYER_RADIUS = 12;
        const BALL_RADIUS = 5;
        const MATCH_DURATION = 90; // 90 minutes game time
        const REAL_DURATION = 240; // 4 minutes real time (240 seconds)
        const TIME_SCALE = MATCH_DURATION / REAL_DURATION; // 0.375 min per second

        // Vector helper class
        class Vector {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
            add(v) {
                return new Vector(this.x + v.x, this.y + v.y);
            }
            sub(v) {
                return new Vector(this.x - v.x, this.y - v.y);
            }
            mult(n) {
                return new Vector(this.x * n, this.y * n);
            }
            mag() {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            }
            normalize() {
                const m = this.mag();
                return m === 0 ? new Vector(0, 0) : new Vector(this.x / m, this.y / m);
            }
            static dist(v1, v2) {
                return v1.sub(v2).mag();
            }
        }

        // Ball class
        class Ball {
            constructor() {
                this.reset();
            }
            reset() {
                this.pos = new Vector(width / 2, height / 2);
                this.vel = new Vector(0, 0);
                this.friction = 0.97;
                this.owner = null;
            }
            update() {
                if (!this.owner) {
                    this.pos = this.pos.add(this.vel);
                    this.vel = this.vel.mult(this.friction);

                    // Wall bounce
                    if (this.pos.x < 20 || this.pos.x > width - 20) this.vel.x *= -1;
                    if (this.pos.y < 20 || this.pos.y > height - 20) this.vel.y *= -1;

                    // Goal detection (top and bottom) - smaller goal area
                    if (this.pos.y < 30 && Math.abs(this.pos.x - width / 2) < 50) { // Reduced from 60
                        handleGoal("away"); // Top goal = away scores
                    }
                    if (this.pos.y > height - 30 && Math.abs(this.pos.x - width / 2) < 50) { // Reduced from 60
                        handleGoal("home"); // Bottom goal = home scores
                    }
                } else {
                    const angle = Math.atan2(this.owner.vel.y, this.owner.vel.x);
                    this.pos.x = this.owner.pos.x + Math.cos(angle) * (PLAYER_RADIUS + 5);
                    this.pos.y = this.owner.pos.y + Math.sin(angle) * (PLAYER_RADIUS + 5);
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, BALL_RADIUS, 0, Math.PI * 2);
                ctx.fillStyle = "#fff";
                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        // Player class
        class Player {
            constructor(team, x, y, number, playerData) {
                this.team = team;
                this.baseX = x;
                this.baseY = y;
                this.number = number;
                this.playerData = playerData;
                this.pos = new Vector(x, y);
                this.vel = new Vector(0, 0);
                this.maxSpeed = 1.0; // Reduced from 1.5 for much slower pace
                this.isGK = playerData?.position === 'GK' || number === 1;

                // Load player image
                if (playerData?.imgUrl) {
                    this.img = new Image();
                    // Don't set crossOrigin to avoid CORS issues
                    this.img.src = playerData.imgUrl;
                }
            }

            update(ball, players) {
                if (!gameStateRef.current?.isPlaying) return;

                let target = new Vector(this.baseX, this.baseY);
                const distToBall = Vector.dist(this.pos, ball.pos);

                // Enhanced AI Logic
                if (ball.owner === this) {
                    // If I have the ball
                    if (this.isGK) {
                        // GK: Pass immediately, NEVER shoot
                        if (!this.pass(ball, players)) {
                            // If no teammate available, just clear the ball forward
                            const clearTarget = this.team === "home"
                                ? new Vector(width / 2, this.pos.y - 100)
                                : new Vector(width / 2, this.pos.y + 100);
                            this.kick(ball, clearTarget, 12);
                        }
                        return; // Exit early, GK never dribbles or shoots
                    } else {
                        // Field player: Dribble to goal
                        const goalPos = this.team === "home"
                            ? new Vector(width / 2, 50)
                            : new Vector(width / 2, height - 50);
                        target = goalPos;

                        const distToGoal = Vector.dist(this.pos, goalPos);

                        // Try to pass if teammate is in better position (very high priority)
                        if (Math.random() < 0.18) { // Increased from 0.12 - prefer passing
                            if (!this.pass(ball, players)) {
                                // If pass failed, try to shoot if VERY close to goal
                                if (distToGoal < 100 && Math.random() < 0.08) { // Much stricter: 100px and 8%
                                    this.shoot(ball, goalPos);
                                }
                            }
                        } else if (distToGoal < 100 && Math.random() < 0.01) { // Very rare: 100px and 1%
                            // Shoot only if extremely close to goal
                            this.shoot(ball, goalPos);
                        }
                    }
                } else if (ball.owner && ball.owner.team !== this.team) {
                    // Opponent has ball - defend
                    if (this.isGK) {
                        // GK: Stay in goal area, track ball Y position
                        const goalX = this.team === "home" ? width / 2 : width / 2;
                        const goalY = this.team === "home" ? height - 50 : 50;

                        // Only move if ball is close to goal
                        const distBallToGoal = this.team === "home"
                            ? (height - ball.pos.y)
                            : ball.pos.y;

                        if (distBallToGoal < 200) {
                            // Track ball X, stay near goal Y
                            target = new Vector(
                                Math.max(100, Math.min(width - 100, ball.pos.x)),
                                goalY
                            );
                        } else {
                            // Stay at goal center
                            target = new Vector(goalX, goalY);
                        }
                    } else {
                        // Field player: Press if close, otherwise hold position
                        if (distToBall < 120) {
                            target = ball.pos;
                        } else {
                            // Move slightly toward ball but stay in formation
                            const home = new Vector(this.baseX, this.baseY);
                            const toBall = ball.pos.sub(home).normalize().mult(30);
                            target = home.add(toBall);
                        }
                    }
                } else if (ball.owner && ball.owner.team === this.team) {
                    // Teammate has ball - support
                    if (this.isGK) {
                        // GK stays at goal
                        target = new Vector(this.baseX, this.baseY);
                    } else {
                        // Move forward to support attack
                        const attackDir = this.team === "home" ? -50 : 50;
                        const home = new Vector(this.baseX, this.baseY);

                        // Wing players move to center
                        let xAdjust = 0;
                        if (this.baseX < width * 0.3) xAdjust = 40;
                        if (this.baseX > width * 0.7) xAdjust = -40;

                        target = new Vector(
                            home.x + xAdjust,
                            home.y + attackDir
                        );
                    }
                } else if (!ball.owner) {
                    // Loose ball - chase it
                    if (this.isGK) {
                        // GK only chases if ball very close to goal
                        const distToGoal = this.team === "home"
                            ? (height - ball.pos.y)
                            : ball.pos.y;

                        if (distToGoal < 100 && distToBall < 150) {
                            target = ball.pos;
                        } else {
                            target = new Vector(this.baseX, this.baseY);
                        }
                    } else if (distToBall < 200) {
                        target = ball.pos;
                    }
                }

                // Move towards target
                const steer = target.sub(this.pos);
                const d = steer.mag();
                if (d > 0) {
                    const normalized = steer.normalize();
                    this.vel = normalized.mult(Math.min(this.maxSpeed, d / 10));
                }

                this.pos = this.pos.add(this.vel);

                // Get ball if close
                if (!ball.owner && distToBall < PLAYER_RADIUS + BALL_RADIUS) {
                    ball.owner = this;
                    // Removed commentary spam
                } else if (ball.owner && ball.owner.team !== this.team && distToBall < PLAYER_RADIUS * 1.5) {
                    if (Math.random() < 0.08) {
                        ball.owner = this;
                        // Only comment on important tackles
                        if (Math.random() < 0.3) {
                            addCommentary(`Great tackle by ${this.playerData?.name || 'Player'}!`, 'tackle');
                        }
                    }
                }
            }

            pass(ball, players) {
                // Find best teammate to pass to
                let bestMate = null;
                let maxScore = -Infinity;

                players.forEach(p => {
                    if (p.team === this.team && p !== this && !p.isGK) {
                        const dist = Vector.dist(this.pos, p.pos);

                        // Calculate forward progress
                        const forwardProgress = this.team === "home"
                            ? (this.pos.y - p.pos.y) // Home attacks upward (lower Y)
                            : (p.pos.y - this.pos.y); // Away attacks downward (higher Y)

                        // Prefer forward passes to players not too far
                        if (forwardProgress > -50 && dist < 300 && dist > 40) {
                            let score = forwardProgress * 2 - dist * 0.3;
                            score += Math.random() * 30;

                            if (score > maxScore) {
                                maxScore = score;
                                bestMate = p;
                            }
                        }
                    }
                });

                if (bestMate) {
                    this.kick(ball, bestMate.pos, 10);
                    // Removed pass commentary to reduce spam
                    return true;
                }
                return false;
            }

            shoot(ball, target) {
                const dir = target.sub(this.pos).normalize();
                // More inaccuracy for harder shots
                dir.y += (Math.random() - 0.5) * 0.4; // Increased from 0.3
                dir.x += (Math.random() - 0.5) * 0.3; // Increased from 0.2
                this.kick(ball, target, 12); // Reduced from 14
            }

            kick(ball, target, power) {
                ball.owner = null;
                const dir = target.sub(this.pos).normalize();
                dir.x += (Math.random() - 0.5) * 0.1;
                dir.y += (Math.random() - 0.5) * 0.1;
                ball.vel = dir.mult(power);
                ball.pos = ball.pos.add(dir.mult(PLAYER_RADIUS + 5));
            }

            draw() {
                // Draw player image if available
                if (this.img && this.img.complete && this.img.naturalWidth > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
                    ctx.closePath();
                    ctx.clip();

                    ctx.drawImage(
                        this.img,
                        this.pos.x - PLAYER_RADIUS,
                        this.pos.y - PLAYER_RADIUS,
                        PLAYER_RADIUS * 2,
                        PLAYER_RADIUS * 2
                    );
                    ctx.restore();

                    // Border with team color
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
                    ctx.lineWidth = 3;
                    const borderColor = this.team === "home" ? "#54a0ff" : "#ff6b6b";
                    ctx.strokeStyle = gameStateRef.current?.ball?.owner === this ? "#f1c40f" : borderColor;
                    ctx.stroke();
                } else {
                    // Fallback: colored circle
                    ctx.beginPath();
                    ctx.arc(this.pos.x, this.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);

                    const grad = ctx.createRadialGradient(
                        this.pos.x - 3,
                        this.pos.y - 3,
                        2,
                        this.pos.x,
                        this.pos.y,
                        PLAYER_RADIUS
                    );

                    if (this.team === "home") {
                        grad.addColorStop(0, "#54a0ff");
                        grad.addColorStop(1, "#2980b9");
                    } else {
                        grad.addColorStop(0, "#ff6b6b");
                        grad.addColorStop(1, "#c0392b");
                    }

                    ctx.fillStyle = grad;
                    ctx.fill();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = gameStateRef.current?.ball?.owner === this ? "#f1c40f" : "rgba(0,0,0,0.3)";
                    ctx.stroke();
                }

                // Team label above player
                ctx.fillStyle = this.team === "home" ? "#54a0ff" : "#ff6b6b";
                ctx.font = "bold 8px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.fillText(this.team.toUpperCase(), this.pos.x, this.pos.y - PLAYER_RADIUS - 2);

                // Number badge (small, bottom-right)
                ctx.fillStyle = "rgba(0,0,0,0.7)";
                ctx.beginPath();
                ctx.arc(this.pos.x + 8, this.pos.y + 8, 6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = "#fff";
                ctx.font = "8px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.number, this.pos.x + 8, this.pos.y + 8);
            }
        }

        // Draw field (vertical orientation)
        const drawField = () => {
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            grad.addColorStop(0, "#2d6a4f");
            grad.addColorStop(1, "#1b4332");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "rgba(0,0,0,0.05)";
            for (let i = 0; i < height; i += 100) {
                ctx.fillRect(0, i, width, 50);
            }

            ctx.strokeStyle = "rgba(255,255,255,0.6)";
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, width - 40, height - 40);

            // Center line (horizontal)
            ctx.beginPath();
            ctx.moveTo(20, height / 2);
            ctx.lineTo(width - 20, height / 2);
            ctx.stroke();

            // Center circle
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
            ctx.stroke();

            // Top penalty box (away goal)
            ctx.strokeRect(width / 2 - 100, 20, 200, 120);
            ctx.strokeRect(width / 2 - 50, 20, 100, 40);

            // Bottom penalty box (home goal)
            ctx.strokeRect(width / 2 - 100, height - 140, 200, 120);
            ctx.strokeRect(width / 2 - 50, height - 60, 100, 40);
        };

        // Initialize game
        const initGame = () => {
            const ball = new Ball();
            const players = [];

            // Create home team players (bottom half)
            if (homeTeam?.players) {
                homeTeam.players.forEach((p, idx) => {
                    // Builder field is already vertical, use coordinates directly
                    const x = (p.x / 100) * width;
                    const y = (p.y / 100) * height;
                    players.push(new Player("home", x, y, idx + 1, p));
                });
            }

            // Create away team players (top half, mirrored)
            if (awayTeam?.players) {
                awayTeam.players.forEach((p, idx) => {
                    // Mirror both x and y for opponent
                    const x = width - (p.x / 100) * width;
                    const y = height - (p.y / 100) * height;
                    players.push(new Player("away", x, y, idx + 1, p));
                });
            }

            gameStateRef.current = {
                ball,
                players,
                isPlaying: false,
                matchTime: 0,
                score: { home: 0, away: 0 },
            };
        };

        // Add commentary helper
        const addCommentary = (message, type = 'info') => {
            const currentTime = gameStateRef.current?.matchTime || 0;
            const minute = Math.floor(currentTime);

            setCommentary(prev => [
                { minute, message, type, time: Date.now() },
                ...prev.slice(0, 19) // Keep last 20 events
            ]);
        };

        // Generate random events
        const generateRandomEvents = () => {
            if (!gameStateRef.current?.isPlaying) return;

            const currentTime = gameStateRef.current.matchTime;
            if (currentTime - lastEventTimeRef.current < 15) return; // Min 15 sec between events (increased from 5)

            const events = [
                { msg: 'Counter attack opportunity!', chance: 0.008, type: 'counter' },
                { msg: 'Dangerous cross into the box!', chance: 0.006, type: 'crossing' },
                { msg: 'Corner kick awarded', chance: 0.005, type: 'corner' },
                { msg: 'Free kick in a dangerous position', chance: 0.004, type: 'freekick' },
                { msg: 'Yellow card shown for a foul', chance: 0.002, type: 'card' },
                // Removed: pressing, possession, dribbling, sliding tackle (too spammy)
            ];

            events.forEach(event => {
                if (Math.random() < event.chance) {
                    addCommentary(event.msg, event.type);
                    lastEventTimeRef.current = currentTime;
                }
            });
        };

        // Handle goal
        const handleGoal = (scoringTeam) => {
            if (!gameStateRef.current) return;

            console.log('[Goal] Before - matchTime:', gameStateRef.current.matchTime);

            // Don't stop the game, just update score
            const newScore = { ...gameStateRef.current.score };
            newScore[scoringTeam]++;
            gameStateRef.current.score = newScore;
            setScore(newScore);

            if (onGoal) {
                onGoal(scoringTeam, newScore);
            }

            // Reset ball and player positions without stopping timer
            gameStateRef.current.ball.reset();
            gameStateRef.current.players.forEach(p => {
                p.pos = new Vector(p.baseX, p.baseY);
                p.vel = new Vector(0, 0);
            });

            console.log('[Goal] After - matchTime:', gameStateRef.current.matchTime, 'isPlaying:', gameStateRef.current.isPlaying);
        };

        // Animation loop
        let lastTime = 0;
        const animate = (timestamp) => {
            if (!gameStateRef.current) return;

            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            drawField();

            if (gameStateRef.current.isPlaying) {
                gameStateRef.current.matchTime += deltaTime * TIME_SCALE;
                setMatchTime(Math.floor(gameStateRef.current.matchTime));

                if (gameStateRef.current.matchTime >= MATCH_DURATION) {
                    gameStateRef.current.isPlaying = false;
                    if (onMatchEnd) {
                        onMatchEnd(gameStateRef.current.score);
                    }
                    addCommentary('Full time! Match finished.', 'info');
                    return;
                }

                // Generate random events
                generateRandomEvents();

                gameStateRef.current.players.forEach(p =>
                    p.update(gameStateRef.current.ball, gameStateRef.current.players)
                );
                gameStateRef.current.ball.update();
            }

            gameStateRef.current.players.forEach(p => p.draw());
            gameStateRef.current.ball.draw();

            animationRef.current = requestAnimationFrame(animate);
        };

        initGame();
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [homeTeam, awayTeam]); // Only re-init if teams change

    const togglePlay = () => {
        if (gameStateRef.current) {
            gameStateRef.current.isPlaying = !gameStateRef.current.isPlaying;
            setIsPlaying(gameStateRef.current.isPlaying);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Left Column - Field */}
            <div className="flex flex-col gap-4">
                <canvas
                    ref={canvasRef}
                    className="rounded-lg shadow-2xl border-4 border-slate-800 w-full h-auto"
                />
            </div>

            {/* Right Column - Commentary & Stats */}
            <div className="flex flex-col gap-4">
                {/* Score and Timer */}
                <div className="bg-slate-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                            <div className="text-sm text-slate-400 mb-1">Home</div>
                            <div className="text-4xl font-bold text-cyan-400">{score.home}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-400 mb-1">Time</div>
                            <div className="text-2xl font-mono text-yellow-400">
                                {Math.floor(matchTime / 60)}:{String(matchTime % 60).padStart(2, '0')}'
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-slate-400 mb-1">Away</div>
                            <div className="text-4xl font-bold text-orange-400">{score.away}</div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center">
                        <button
                            onClick={togglePlay}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-colors w-full"
                        >
                            {isPlaying ? "⏸ Pause" : "▶ Play"}
                        </button>
                    </div>
                </div>

                {/* Commentary Box */}
                <div className="bg-slate-800 rounded-lg p-6 flex-1 overflow-hidden">
                    <h3 className="text-xl font-bold text-white mb-4">Match Commentary</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {commentary.length === 0 ? (
                            <div className="text-slate-400 text-sm">
                                <p>⚽ Match is live!</p>
                                <p className="mt-2">Commentary will appear here...</p>
                            </div>
                        ) : (
                            commentary.map((event, idx) => (
                                <div key={event.time} className="text-sm border-l-2 border-cyan-500 pl-3 py-1">
                                    <span className="text-slate-400 font-mono text-xs">{event.minute}' </span>
                                    <span className={`${event.type === 'goal' ? 'text-green-400 font-bold' :
                                        event.type === 'card' ? 'text-yellow-400' :
                                            event.type === 'tackle' ? 'text-orange-400' :
                                                event.type === 'pass' ? 'text-blue-400' :
                                                    'text-slate-300'
                                        }`}>{event.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
