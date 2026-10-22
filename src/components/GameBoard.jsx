import { useEffect, useRef, useState } from "react";
import GameOverModal from "./modals/GameOverModal";

function GameBoard({
  gameMode,
  difficulty,
  score,
  setScore,
  highScore,
  onReplay,
  isPaused,
  isSoundOn,
  onGameOver,
}) {
  // Track whether the game has ended.
  const [isGameOver, setIsGameOver] = useState(false);

  // Track whether the player has filled the entire board and won.
  const [isWinner, setIsWinner] = useState(false);

  // Save a new best score only after the game ends.
  useEffect(() => {
    if (!isGameOver) return;

    // Read the nest score previously saved in the broswer.
    const savedScore = Number(localStorage.getItem("snake-best-score")) || 0;

    // Save only if this game's best score beats the stored record.
    if (highScore > savedScore) {
      localStorage.setItem("snake-best-score", String(highScore));
    }
  }, [isGameOver, highScore]);

  // Keep the latest game-over state available to the game loop.
  const isGameOverRef = useRef(false);

  // Keep the latest score available to the game loop.
  const scoreRef = useRef(score);

  const hasReportedGameOverRef = useRef(false);

  // Update the reference whenever the score changes.
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (!isGameOver && !isWinner) return;

    if (hasReportedGameOverRef.current) return;

    hasReportedGameOverRef.current = true;

    onGameOver?.({
      score: scoreRef.current,
      gameMode,
      difficulty,
    });
  }, [isGameOver, isWinner, onGameOver, gameMode, difficulty]);

  const isSoundOnRef = useRef(isSoundOn);

  useEffect(() => {
    isSoundOnRef.current = isSoundOn;
  }, [isSoundOn]);

  // Create a single shared AudioContext (reuse it to avoid lag)
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioContextRef = useRef(null);

  function playFoodSound() {
    if (!isSoundOnRef.current) return;

    // Initialize the audio context once
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const sharedAudioCtx = audioContextRef.current;

    // Resume if suspended (browsers block audio until a user gesture occurs)
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume();
    }

    const now = sharedAudioCtx.currentTime;

    // Create oscillator and gain node
    const oscillator = sharedAudioCtx.createOscillator();
    const gainNode = sharedAudioCtx.createGain();

    // "Sine" or "triangle" gives a softer, cleaner arcade tone
    oscillator.type = "triangle";

    // Make it a classic pleasant rising pitch (300Hz -> 600Hz)
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    // Smooth volume envelope (louder start, quick clean fade)
    gainNode.gain.setValueAtTime(1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(sharedAudioCtx.destination);

    // Start and stop
    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  //Keep a reference to the Canvas element in our HTML.
  const canvasRef = useRef(null);

  // gives the game loop a way to read the latest pause state without rebuilding the entire loop.
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Store the snake's starting body between renders.
  const snakeRef = useRef([
    { x: 10, y: 10 }, // Head
    { x: 9, y: 10 }, // First body segment
    { x: 8, y: 10 }, // Second body segment
  ]);

  // Remember which direction the snake is moving.
  const directionRef = useRef({ x: 1, y: 0 });

  // Store the food's position on the grid.
  const foodRef = useRef({ x: 15, y: 6 });

  // Remembering where the player's finger starts a swipe.
  const touchStartRef = useRef(null);

  // Handle keyboard input from the player.
  function handleKeyDown(event) {
    // Ignore movement keys after the game has ended.
    if (isGameOverRef.current) return;

    // Convert the pressed key to Lowercase for aswd.
    const key = event.key.toLowerCase();

    // Read the direction the snake is currently moving.
    const currentDirection = directionRef.current;

    // Work out the direction requested by the pressed key.
    let nextDirection = null;

    // Move Up
    if (key === "arrowup" || key === "w") {
      nextDirection = { x: 0, y: -1 };
    }
    // Move down
    else if (key === "arrowdown" || key === "s") {
      nextDirection = { x: 0, y: 1 };
    }
    // Move left
    else if (key === "arrowleft" || key === "a") {
      nextDirection = { x: -1, y: 0 };
    }
    // Move right
    else if (key === "arrowright" || key === "d") {
      nextDirection = { x: 1, y: 0 };
    }

    // Ignore keys that do not request a movement direction.
    if (nextDirection === null) {
      return;
    }

    // Check whther the requested direction is the exact opposite.
    const isReverse =
      currentDirection.x * nextDirection.x +
        currentDirection.y * nextDirection.y ===
      -1;

    // Reject the turn if it would reverse the snake.
    if (isReverse) {
      return;
    }

    // Store the new direction if the turn is allowed.
    directionRef.current = nextDirection;
  }

  // Run this effect after React displays the Canvas.
  useEffect(() => {
    // Find the actual Canvas element using our reference.
    const canvas = canvasRef.current;

    // Don't start the game loop while the game is paused.
    if (isPaused) return;

    // Stop if the Canvas element hasn't been found.
    if (!canvas) return;

    // Start this game with the game-over flag turned off.
    isGameOverRef.current = false;

    // Start listening  for the keyboard presses.
    window.addEventListener("keydown", handleKeyDown);

    const ctx = canvas.getContext("2d"); //Get the Canvas drawing tools (acts like grabbing a digital paintbrush and paint palette for 2D graphics.)

    const cellSize = 32; // Each cell on our 20 × 20 board is 32 pixels.

    // Choose a grid position for our first snake segment.
    // Store the snake's body as an ordered list of grid positions.
    // The first object represents the head.
    const snake = snakeRef.current;

    // Choose a random grid cell for the food.
    function spawnFood() {
      // There are 400 cells in the game board.
      const totalCells = 20 * 20;

      // If the snake occupies every cell, there is nowhere to place the food.
      if (snake.length >= totalCells) {
        return false;
      }

      let newFood;

      // Keep choosing a position until it doesn't overlap the snake.
      do {
        newFood = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20),
        };
      } while (
        snake.some(
          (segment) => segment.x === newFood.x && segment.y === newFood.y,
        )
      );

      // Save the chosen position so the game can draw the food there.
      foodRef.current = newFood;

      // Tell the caller that food was successfully placed.
      return true;
    }

    // Choose the food's initial position when the game starts.
    spawnFood();

    // Create a function that moves the snake one grid cell.
    function moveSnake() {
      // Store the direction in which the snake will move.
      // As default without any key pressed the The snake starts facing right.
      // If a key is pressed then it will read the latest direction whenever the snake moves.
      const direction = directionRef.current;

      //Get the snake's current head (the first segment in the array).
      const head = snake[0];

      //Calculate where the head would move on the next step.
      //We add the direction to the current grid coordinates.
      let nextX = head.x + direction.x;
      let nextY = head.y + direction.y;

      // Check whether the next position is outside the 20 x 20 board.
      const hitWall = nextX < 0 || nextX >= 20 || nextY < 0 || nextY >= 20;

      // In classic mode, stop moving if the snake hits a wall.
      if (gameMode === "classic" && hitWall) {
        // Update React state so the UI knows the game has ended.
        setIsGameOver(true);

        // Update the ref so the game loop sees the latest value immediately.
        isGameOverRef.current = true;

        return;
      }

      // In wrap-Around modem move the snake to the opposite edge.
      if (gameMode === "wrap") {
        if (nextX < 0) nextX = 19;
        else if (nextX >= 20) nextX = 0;

        if (nextY < 0) nextY = 19;
        else if (nextY >= 20) nextY = 0;
      }

      //Store the calculated position as an object.
      const nextHead = { x: nextX, y: nextY };

      // Check whehter the snake is about to eat the food.
      const food = foodRef.current;
      const ateFood = nextHead.x === food.x && nextHead.y === food.y;

      // Check whther the next head position overlaps with the snake's body.
      // The last segment is excluded because it will move away
      // If the snake eats, its tail stays in place.
      // Otherwise, the tail moves away, so we can exclude it.
      const bodyToCheck = ateFood ? snake : snake.slice(0, -1);

      const hitSelf = bodyToCheck.some(
        (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
      );

      // End the game if the snake runs into its own body.
      if (hitSelf) {
        setIsGameOver(true);
        isGameOverRef.current = true;
        return;
      }

      //Add the new head to the beginning of the snake array.
      snake.unshift(nextHead);

      // If the snake didn't eat, remove its tail to keep the same length.
      if (!ateFood) {
        // Remove the last segment so the snake stays the same length.
        snake.pop();
      } else {
        // Play the eating sound if sound is enabled.
        playFoodSound();

        //Add points when the snake eats food.
        setScore((currentScore) => currentScore + 1);

        // Try to place a new apple on an empty cell.
        const foodWasPlaced = spawnFood();

        // If no food could be placed, the board is full.
        if (!foodWasPlaced) {
          // The player has filled every cell and won the game.
          setIsWinner(true);

          // Stop the game loop from moving the snake again.
          isGameOverRef.current = true;
        }
      }
    }

    // Draw a rounded square. Used for every box-shaped snake segment.
    function roundedRect(x, y, w, h, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    // Draw the snake in its current position.
    function drawSnake() {
      // Remove the previous pixels from the Canvas.
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // ---------- Body (box segments) ----------

      // Draw from the tail up to the neck so the head ends up on top.
      for (let i = snake.length - 1; i >= 1; i--) {
        const segment = snake[i];

        // 0 near the head, 1 at the tail. Used to make the tail slightly smaller.
        const t = snake.length > 1 ? i / (snake.length - 1) : 0;

        // Gap between the box and the cell edge (grows a little toward the tail).
        const inset = 1.5 + 2.5 * t;
        const size = cellSize - inset * 2;
        const x = segment.x * cellSize + inset;
        const y = segment.y * cellSize + inset;

        // Alternate two greens so each box is easy to tell apart.
        const base = i % 2 === 0 ? "#6DB07E" : "#5FA371";

        // Vertical gradient: lighter on top, darker at the bottom, like a raised tile.
        const fill = ctx.createLinearGradient(x, y, x, y + size);
        fill.addColorStop(0, "#9AD6A8");
        fill.addColorStop(0.45, base);
        fill.addColorStop(1, "#4A8A5E");

        // Box with rounded corners.
        roundedRect(x, y, size, size, 6);
        ctx.fillStyle = fill;
        ctx.fill();

        // Darker border around the box.
        ctx.strokeStyle = "#3F7A58";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Soft shine along the top edge of the box.
        roundedRect(
          x + size * 0.14,
          y + size * 0.1,
          size * 0.72,
          size * 0.16,
          3,
        );
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fill();

        // Diamond scale mark in the middle of the box.
        const cx = x + size / 2;
        const cy = y + size / 2 + 1;
        const d = size * 0.2;
        ctx.fillStyle = "rgba(31, 58, 43, 0.28)";
        ctx.beginPath();
        ctx.moveTo(cx, cy - d);
        ctx.lineTo(cx + d, cy);
        ctx.lineTo(cx, cy + d);
        ctx.lineTo(cx - d, cy);
        ctx.closePath();
        ctx.fill();
      }

      // ---------- Head ----------

      const head = snake[0];
      const headX = head.x * cellSize;
      const headY = head.y * cellSize;
      const headCx = headX + cellSize / 2;
      const headCy = headY + cellSize / 2;

      // Work out which way the head faces from the neck -> head direction.
      let faceX = directionRef.current.x;
      let faceY = directionRef.current.y;

      if (snake.length > 1) {
        faceX = head.x - snake[1].x;
        faceY = head.y - snake[1].y;

        // Correct for wrap-around, where the head jumps to the opposite edge.
        if (faceX > 1) faceX = -1;
        if (faceX < -1) faceX = 1;
        if (faceY > 1) faceY = -1;
        if (faceY < -1) faceY = 1;
      }

      // Perpendicular vector, used to place the eyes on either side.
      const sideX = -faceY;
      const sideY = faceX;

      // Forked tongue, drawn first so the head covers its base.
      const tongueStartX = headCx + faceX * cellSize * 0.4;
      const tongueStartY = headCy + faceY * cellSize * 0.4;
      const tongueMidX = headCx + faceX * cellSize * 0.72;
      const tongueMidY = headCy + faceY * cellSize * 0.72;

      ctx.strokeStyle = "#E5484D";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tongueStartX, tongueStartY);
      ctx.lineTo(tongueMidX, tongueMidY);
      ctx.lineTo(
        tongueMidX + (faceX + sideX * 0.7) * 3.5,
        tongueMidY + (faceY + sideY * 0.7) * 3.5,
      );
      ctx.moveTo(tongueMidX, tongueMidY);
      ctx.lineTo(
        tongueMidX + (faceX - sideX * 0.7) * 3.5,
        tongueMidY + (faceY - sideY * 0.7) * 3.5,
      );
      ctx.stroke();

      // Head box: full cell, darker green, more rounded than the body.
      const headInset = 0.5;
      const headSize = cellSize - headInset * 2;
      const headFill = ctx.createLinearGradient(
        headX,
        headY,
        headX,
        headY + cellSize,
      );
      headFill.addColorStop(0, "#4C8E69");
      headFill.addColorStop(1, "#1F3A2B");

      roundedRect(headX + headInset, headY + headInset, headSize, headSize, 9);
      ctx.fillStyle = headFill;
      ctx.fill();

      ctx.strokeStyle = "#14281E";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Eyes: white, with a pupil that looks where the snake is heading.
      const eyeForward = cellSize * 0.14;
      const eyeSide = cellSize * 0.22;
      const eyeRadius = cellSize * 0.12;

      for (const side of [-1, 1]) {
        const eyeX = headCx + faceX * eyeForward + sideX * eyeSide * side;
        const eyeY = headCy + faceY * eyeForward + sideY * eyeSide * side;

        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(
          eyeX + faceX * eyeRadius * 0.35,
          eyeY + faceY * eyeRadius * 0.35,
          eyeRadius * 0.55,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // ---------- Apple ----------

      // Read the food's current grid position.
      const food = foodRef.current;

      // Find the centre of the grid cell where the apple will appear.
      const appleX = food.x * cellSize + cellSize / 2;
      const appleY = food.y * cellSize + cellSize / 2 + 2;

      // Keep the apple small enough to fit inside one grid cell.
      const r = cellSize * 0.32;

      ctx.save();

      // Soft shadow under the apple so it sits on the grid.
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.beginPath();
      ctx.ellipse(
        appleX,
        appleY + r * 0.95,
        r * 0.65,
        r * 0.16,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Apple body: two symmetric halves, wide at the shoulders,
      // slightly tapered at the bottom, with a dip at the top where the stem sits.
      const topDipY = appleY - r * 0.6;
      const bottomY = appleY + r * 0.95;

      const body = ctx.createRadialGradient(
        appleX - r * 0.35,
        appleY - r * 0.3,
        r * 0.1,
        appleX,
        appleY,
        r * 1.2,
      );
      body.addColorStop(0, "#FF6B5E");
      body.addColorStop(0.55, "#E53935");
      body.addColorStop(1, "#B71C1C");
      ctx.fillStyle = body;

      ctx.beginPath();
      ctx.moveTo(appleX, topDipY);

      // Right half: shoulder bulge, then curve in toward the bottom.
      ctx.bezierCurveTo(
        appleX + r * 0.35,
        appleY - r * 1.0,
        appleX + r * 1.25,
        appleY - r * 0.7,
        appleX + r * 1.05,
        appleY + r * 0.15,
      );
      ctx.bezierCurveTo(
        appleX + r * 0.9,
        appleY + r * 0.75,
        appleX + r * 0.45,
        bottomY,
        appleX,
        bottomY - r * 0.08,
      );

      // Left half: mirror of the right.
      ctx.bezierCurveTo(
        appleX - r * 0.45,
        bottomY,
        appleX - r * 0.9,
        appleY + r * 0.75,
        appleX - r * 1.05,
        appleY + r * 0.15,
      );
      ctx.bezierCurveTo(
        appleX - r * 1.25,
        appleY - r * 0.7,
        appleX - r * 0.35,
        appleY - r * 1.0,
        appleX,
        topDipY,
      );
      ctx.closePath();
      ctx.fill();

      // Darker dimple around the stem cavity.
      ctx.fillStyle = "rgba(90, 10, 10, 0.35)";
      ctx.beginPath();
      ctx.ellipse(
        appleX,
        topDipY + r * 0.05,
        r * 0.2,
        r * 0.1,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Brown stem, slightly curved.
      ctx.strokeStyle = "#6D4C2F";
      ctx.lineWidth = Math.max(1.5, r * 0.12);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(appleX, topDipY + r * 0.05);
      ctx.quadraticCurveTo(
        appleX + r * 0.05,
        appleY - r * 1.05,
        appleX + r * 0.2,
        appleY - r * 1.35,
      );
      ctx.stroke();

      // Pointed green leaf attached near the top of the stem.
      const leafBaseX = appleX + r * 0.08;
      const leafBaseY = appleY - r * 0.98;
      const leaf = ctx.createLinearGradient(
        leafBaseX,
        leafBaseY,
        leafBaseX + r * 0.8,
        leafBaseY - r * 0.4,
      );
      leaf.addColorStop(0, "#2E7D32");
      leaf.addColorStop(1, "#66BB6A");
      ctx.fillStyle = leaf;
      ctx.beginPath();
      ctx.moveTo(leafBaseX, leafBaseY);
      ctx.quadraticCurveTo(
        leafBaseX + r * 0.35,
        leafBaseY - r * 0.55,
        leafBaseX + r * 0.85,
        leafBaseY - r * 0.35,
      );
      ctx.quadraticCurveTo(
        leafBaseX + r * 0.5,
        leafBaseY + r * 0.05,
        leafBaseX,
        leafBaseY,
      );
      ctx.closePath();
      ctx.fill();

      // Leaf centre vein.
      ctx.strokeStyle = "rgba(20, 70, 25, 0.6)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(leafBaseX, leafBaseY);
      ctx.quadraticCurveTo(
        leafBaseX + r * 0.4,
        leafBaseY - r * 0.25,
        leafBaseX + r * 0.8,
        leafBaseY - r * 0.33,
      );
      ctx.stroke();

      // Glossy highlight on the upper left shoulder.
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.beginPath();
      ctx.ellipse(
        appleX - r * 0.55,
        appleY - r * 0.3,
        r * 0.14,
        r * 0.28,
        -0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.restore();
    }

    // Choose the starting speed based on the selected difficulty.
    const startingSpeed = difficulty === "hard" ? 200 : 310;

    // Store the timer so we can cancel it during cleanup.
    let gameTimeout;

    // Move the snake, then schedule next move.
    function gameLoop() {
      // Stop the game permanently if it has ended.
      if (isGameOverRef.current) return;

      // If paused, wait briefly and check again.
      if (isPausedRef.current) {
        gameTimeout = setTimeout(gameLoop, 100);
        return;
      }

      // Update the snake's position.
      moveSnake();

      // Draw te updated snake on the Canvas.
      drawSnake();

      // Calculate the latest speed using the current score.
      // Speed up every 5 points.
      const speedIncrease = Math.floor(scoreRef.current / 15);

      // Reduce the interval as the score increases.
      const speedReduction = speedIncrease * 15;

      // Never let the game run faster than 80 milliseconds per move.
      const gameSpeed = Math.max(80, startingSpeed - speedReduction);

      // Schedule the next move using the calculated speed.
      gameTimeout = setTimeout(gameLoop, gameSpeed);
    }

    // Schedule the first move.
    gameTimeout = setTimeout(gameLoop, startingSpeed);

    // Clean up the timer when the component is removed.
    return () => {
      clearTimeout(gameTimeout);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      <section className="card !p-1.5 sm:!p-4 lg:!p-6 lg:flex lg:h-[calc(100svh-40px)] lg:min-h-0 lg:flex-col -mt-1.5 lg:mt-0">
        {/* Board heading */}
        <div className="mb-5 flex items-center justify-between px-3 lg:px-0">
          <div>
            <p className="label-mono">GAME ARENA</p>
            <h2 className="font-grotesk text-xl font-bold text-ink">
              Ready to play?
            </h2>
          </div>

          <span className="rounded-full bg-mint px-3 py-1 font-mono text-xs text-green-dark">
            20 × 20
          </span>
        </div>

        {/* Canvas game board */}
        <div className="game-board-frame ">
          <div className="board -mt-3 lg:mt-0">
            <canvas
              ref={canvasRef}
              width={640}
              height={640}
              className="block h-full w-full"
              aria-label="Snake game board"
              role="img"
              // Remember where the finger first touches the screen.
              onTouchStart={(event) => {
                const touch = event.touches[0];

                touchStartRef.current = {
                  x: touch.clientX,
                  y: touch.clientY,
                };
              }}
              // Detect when the finger lifts from the Canvas.
              onTouchEnd={(event) => {
                // Check whether we recorded a string a starting position
                if (touchStartRef.current === null) {
                  return;
                }

                // Get the finger's final position.
                const touch = event.changedTouches[0];

                const touchEndX = touch.clientX;
                const touchEndY = touch.clientY;

                // Calculate how far the finger travelled.
                const deltaX = touchEndX - touchStartRef.current.x;
                const deltaY = touchEndY - touchStartRef.current.y;

                // Decide which direction the swipe moved.
                let nextDirection = null;

                // Check whether the swipe was mainly horizontal.
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                  if (deltaX > 0) {
                    // Finger moved right.
                    nextDirection = { x: 1, y: 0 };
                  } else {
                    // Finger moved left.
                    nextDirection = { x: -1, y: 0 };
                  }
                } else {
                  // The swipe was mainly vertical.
                  if (deltaY > 0) {
                    // Finger moved down.
                    nextDirection = { x: 0, y: 1 };
                  } else {
                    // Finger moved up.
                    nextDirection = { x: 0, y: -1 };
                  }
                }

                // Applying a direction if a swipe was not detected.
                if (nextDirection !== null) {
                  const currentDirection = directionRef.current;

                  const isReverse =
                    currentDirection.x * nextDirection.x +
                      currentDirection.y * nextDirection.y ===
                    -1;

                  // Do not let the snake reverse into itself.
                  if (!isReverse) {
                    directionRef.current = nextDirection;
                  }
                }

                // Clear the starting position after the swipe.
                touchStartRef.current = null;
              }}
            />
          </div>
        </div>

        {/* Keyboard controls */}
        <p className="hint mt-5 text-center hidden lg:block">
          USE YOUR ARROW KEYS TO MOVE & SPACE BAR TO PAUSE
        </p>
      </section>

      {/* Show the result modal when the game ends or the player wins. */}
      {(isGameOver || isWinner) && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isWinner={isWinner}
          onReplay={onReplay}
        />
      )}
    </>
  );
}

export default GameBoard;
