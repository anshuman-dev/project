'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PythPriceManager } from '@/lib/pyth';

interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  type: 'normal' | 'bonus' | 'danger';
}

interface Player {
  x: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isOnPlatform: boolean;
}

interface GameState {
  player: Player;
  platforms: Platform[];
  lavaHeight: number;
  score: number;
  level: number;
  gameStatus: 'waiting' | 'playing' | 'gameOver';
  cameraY: number;
}

const GAME_CONFIG = {
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 600,
  PLAYER_WIDTH: 20,
  PLAYER_HEIGHT: 30,
  PLATFORM_HEIGHT: 15,
  GRAVITY: 0.6,
  JUMP_FORCE: -12,
  LAVA_RISE_SPEED: 0.3,
  PLATFORM_GAP: 120,
  LEVEL_THRESHOLD: 10, // Platforms to clear for next level
};

interface LavaPlatformGameProps {
  onGameEnd: (score: number, level: number) => void;
}

export default function LavaPlatformGame({ onGameEnd }: LavaPlatformGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    player: {
      x: GAME_CONFIG.CANVAS_WIDTH / 2,
      y: GAME_CONFIG.CANVAS_HEIGHT - 100,
      velocityY: 0,
      isJumping: false,
      isOnPlatform: false,
    },
    platforms: [],
    lavaHeight: GAME_CONFIG.CANVAS_HEIGHT + 50,
    score: 0,
    level: 1,
    gameStatus: 'waiting',
    cameraY: 0,
  });

  // Generate initial platforms
  const generatePlatforms = useCallback((): Platform[] => {
    const platforms: Platform[] = [];

    // Ground platform
    platforms.push({
      id: 0,
      x: 0,
      y: GAME_CONFIG.CANVAS_HEIGHT - 30,
      width: GAME_CONFIG.CANVAS_WIDTH,
      type: 'normal',
    });

    // Generate platforms going up
    for (let i = 1; i < 50; i++) {
      const y = GAME_CONFIG.CANVAS_HEIGHT - 30 - (i * GAME_CONFIG.PLATFORM_GAP);
      const width = Math.random() * 100 + 80; // 80-180px wide
      const x = Math.random() * (GAME_CONFIG.CANVAS_WIDTH - width);

      let type: 'normal' | 'bonus' | 'danger' = 'normal';
      const rand = Math.random();
      if (rand < 0.1) type = 'bonus'; // 10% bonus platforms
      else if (rand < 0.15) type = 'danger'; // 5% danger platforms

      platforms.push({
        id: i,
        x,
        y,
        width,
        type,
      });
    }

    return platforms;
  }, []);

  // Initialize game
  const initGame = useCallback(() => {
    const platforms = generatePlatforms();
    setGameState({
      player: {
        x: GAME_CONFIG.CANVAS_WIDTH / 2,
        y: GAME_CONFIG.CANVAS_HEIGHT - 100,
        velocityY: 0,
        isJumping: false,
        isOnPlatform: false,
      },
      platforms,
      lavaHeight: GAME_CONFIG.CANVAS_HEIGHT + 50,
      score: 0,
      level: 1,
      gameStatus: 'playing',
      cameraY: 0,
    });
  }, [generatePlatforms]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              x: Math.max(0, prev.player.x - 8),
            },
          }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setGameState(prev => ({
            ...prev,
            player: {
              ...prev.player,
              x: Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_WIDTH, prev.player.x + 8),
            },
          }));
          break;
        case ' ':
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (prev.player.isOnPlatform || prev.player.y >= GAME_CONFIG.CANVAS_HEIGHT - 100) {
            setGameState(prev => ({
              ...prev,
              player: {
                ...prev.player,
                velocityY: GAME_CONFIG.JUMP_FORCE,
                isJumping: true,
                isOnPlatform: false,
              },
            }));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStatus]);

  // Touch controls for mobile
  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameState.gameStatus !== 'playing') return;

    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;

    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        x: Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.PLAYER_WIDTH, touchX - GAME_CONFIG.PLAYER_WIDTH / 2)),
      },
    }));
  };

  const handleTouchStart = () => {
    if (gameState.gameStatus !== 'playing') return;

    if (gameState.player.isOnPlatform || gameState.player.y >= GAME_CONFIG.CANVAS_HEIGHT - 100) {
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          velocityY: GAME_CONFIG.JUMP_FORCE,
          isJumping: true,
          isOnPlatform: false,
        },
      }));
    }
  };

  // Game physics and collision detection
  const updateGame = useCallback(() => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      const newPlayer = { ...prev.player };

      // Apply gravity
      newPlayer.velocityY += GAME_CONFIG.GRAVITY;
      newPlayer.y += newPlayer.velocityY;

      // Check platform collisions
      let onPlatform = false;
      for (const platform of prev.platforms) {
        const playerBottom = newPlayer.y + GAME_CONFIG.PLAYER_HEIGHT;
        const playerRight = newPlayer.x + GAME_CONFIG.PLAYER_WIDTH;

        // Check if player is landing on platform
        if (
          newPlayer.velocityY > 0 && // Falling
          playerBottom >= platform.y &&
          playerBottom <= platform.y + GAME_CONFIG.PLATFORM_HEIGHT + 5 &&
          newPlayer.x < platform.x + platform.width &&
          playerRight > platform.x
        ) {
          newPlayer.y = platform.y - GAME_CONFIG.PLAYER_HEIGHT;
          newPlayer.velocityY = 0;
          newPlayer.isJumping = false;
          newPlayer.isOnPlatform = true;
          onPlatform = true;

          // Handle platform types
          if (platform.type === 'bonus') {
            // Bonus points and higher jump
            prev.score += 5;
            newPlayer.velocityY = GAME_CONFIG.JUMP_FORCE * 1.3;
          } else if (platform.type === 'danger') {
            // Damage - reduce score
            prev.score = Math.max(0, prev.score - 2);
          }
          break;
        }
      }

      if (!onPlatform) {
        newPlayer.isOnPlatform = false;
      }

      // Update camera to follow player
      let newCameraY = prev.cameraY;
      const playerScreenY = newPlayer.y - newCameraY;
      if (playerScreenY < GAME_CONFIG.CANVAS_HEIGHT * 0.3) {
        newCameraY = newPlayer.y - GAME_CONFIG.CANVAS_HEIGHT * 0.3;
      }

      // Update lava height based on level
      const lavaSpeed = GAME_CONFIG.LAVA_RISE_SPEED * (1 + (prev.level - 1) * 0.2);
      const newLavaHeight = prev.lavaHeight - lavaSpeed;

      // Check if player touched lava
      if (newPlayer.y + GAME_CONFIG.PLAYER_HEIGHT >= newLavaHeight) {
        return {
          ...prev,
          gameStatus: 'gameOver',
        };
      }

      // Update score based on height
      const heightScore = Math.max(0, Math.floor((GAME_CONFIG.CANVAS_HEIGHT - newPlayer.y) / 10));
      const newScore = Math.max(prev.score, heightScore);

      // Level progression
      const newLevel = Math.floor(newScore / GAME_CONFIG.LEVEL_THRESHOLD) + 1;

      return {
        ...prev,
        player: newPlayer,
        lavaHeight: newLavaHeight,
        score: newScore,
        level: newLevel,
        cameraY: newCameraY,
      };
    });
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      gameLoopRef.current = requestAnimationFrame(function gameLoop() {
        updateGame();
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      });
    } else {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.gameStatus, updateGame]);

  // Handle game over
  useEffect(() => {
    if (gameState.gameStatus === 'gameOver') {
      onGameEnd(gameState.score, gameState.level);
    }
  }, [gameState.gameStatus, gameState.score, gameState.level, onGameEnd]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Save context for camera transform
    ctx.save();
    ctx.translate(0, -gameState.cameraY);

    // Draw platforms
    gameState.platforms.forEach(platform => {
      // Only draw platforms in view
      const platformScreenY = platform.y - gameState.cameraY;
      if (platformScreenY > -50 && platformScreenY < GAME_CONFIG.CANVAS_HEIGHT + 50) {
        let color = '#8B5A3C'; // Brown for normal
        if (platform.type === 'bonus') color = '#10B981'; // Green
        else if (platform.type === 'danger') color = '#EF4444'; // Red

        ctx.fillStyle = color;
        ctx.fillRect(platform.x, platform.y, platform.width, GAME_CONFIG.PLATFORM_HEIGHT);

        // Add platform outline
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x, platform.y, platform.width, GAME_CONFIG.PLATFORM_HEIGHT);
      }
    });

    // Draw player (stickman)
    const playerScreenY = gameState.player.y - gameState.cameraY;
    if (playerScreenY > -50 && playerScreenY < GAME_CONFIG.CANVAS_HEIGHT + 50) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      const px = gameState.player.x + GAME_CONFIG.PLAYER_WIDTH / 2;
      const py = gameState.player.y;

      // Head
      ctx.beginPath();
      ctx.arc(px, py + 6, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(px, py + 10);
      ctx.lineTo(px, py + 20);
      ctx.stroke();

      // Arms
      ctx.beginPath();
      ctx.moveTo(px - 6, py + 14);
      ctx.lineTo(px + 6, py + 14);
      ctx.stroke();

      // Legs
      const legOffset = gameState.player.isJumping ? 2 : 0;
      ctx.beginPath();
      ctx.moveTo(px, py + 20);
      ctx.lineTo(px - 4 + legOffset, py + 28);
      ctx.moveTo(px, py + 20);
      ctx.lineTo(px + 4 - legOffset, py + 28);
      ctx.stroke();
    }

    // Draw lava
    const lavaScreenY = gameState.lavaHeight - gameState.cameraY;
    if (lavaScreenY < GAME_CONFIG.CANVAS_HEIGHT + 50) {
      const gradient = ctx.createLinearGradient(0, lavaScreenY, 0, lavaScreenY + 100);
      gradient.addColorStop(0, '#FF4500');
      gradient.addColorStop(0.5, '#FF6347');
      gradient.addColorStop(1, '#DC143C');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, lavaScreenY, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    ctx.restore();

    // Draw UI overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 120, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 30);
    ctx.fillText(`Level: ${gameState.level}`, 20, 50);

    // Lava warning
    const lavaDistance = gameState.player.y - gameState.lavaHeight;
    if (lavaDistance < 200) {
      ctx.fillStyle = '#FF4500';
      ctx.font = 'bold 12px Arial';
      ctx.fillText(`Lava: ${Math.max(0, Math.floor(lavaDistance))}px`, 20, 70);
    }

  }, [gameState]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <canvas
        ref={canvasRef}
        width={GAME_CONFIG.CANVAS_WIDTH}
        height={GAME_CONFIG.CANVAS_HEIGHT}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        className="border-2 border-orange-500 rounded-lg bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800"
        style={{ touchAction: 'none' }}
      />

      {gameState.gameStatus === 'waiting' && (
        <div className="text-center">
          <button
            onClick={initGame}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105"
          >
            🌋 Start Climbing!
          </button>
        </div>
      )}

      {gameState.gameStatus === 'playing' && (
        <div className="text-center text-white space-y-2">
          <div className="text-sm">
            <strong>Controls:</strong> ←→ Move | ↑/Space Jump | Touch to move/jump
          </div>
          <div className="text-xs text-gray-300">
            🟫 Normal | 🟢 Bonus (+5 pts, higher jump) | 🔴 Danger (-2 pts)
          </div>
        </div>
      )}

      {gameState.gameStatus === 'gameOver' && (
        <div className="text-center bg-red-500/20 border border-red-500 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">🌋 Caught by Lava!</h3>
          <p className="text-red-200">Final Score: {gameState.score}</p>
          <p className="text-red-200">Level Reached: {gameState.level}</p>
        </div>
      )}
    </div>
  );
}