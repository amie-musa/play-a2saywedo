import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";

const leaderboardKey = "a2saywedo-leaderboard";

function getStoredLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(leaderboardKey)) || [];
  } catch {
    return [];
  }
}

function saveLeaderboardEntry(name, score) {
  const entry = {
    name: name.trim() || "Player",
    score,
    date: new Date().toISOString(),
  };

  const leaderboard = [...getStoredLeaderboard(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
  return leaderboard;
}

export default function Game() {
  const gameRef = useRef(null);
  const [finalScore, setFinalScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState(() => getStoredLeaderboard());
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [username, setUsername] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  useEffect(() => {

    let player;
    let grass;
    let clouds;
    let cursors;
    let jumpPressed = false;

    let score = 0;
    let scoreText;

    // HUD ICONS
    const treatIcons = [];
    const ringIcons = [];

    const maxTreats = 3;  
    const maxRings = 2;

    let treatsCollected = 0;
    let ringsCollected = 0;
    let endSequenceStarted = false;
    let endSequenceReady = false;
    let gameEnded = false;

    let gameSpeed = 250;
    const isMobile = window.innerWidth < 768;

    const config = {
      type: Phaser.AUTO,

      width: window.innerWidth,
      height: window.innerHeight,

      backgroundColor: "#F4EFEA",

      parent: gameRef.current,

      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 800 },
          debug: false,
        },
      },

      scene: {
        preload,
        create,
        update,
      },

      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      
    };

    const game = new Phaser.Game(config);

    function preload() {

      // TEMP PLACEHOLDER ASSETS
      this.load.image(
        "grass",
        "grass.png"
      );

      this.load.image(
        "clouds",
        "clouds.png"
      );

      this.load.image(
        "collect",
        "collect.png"
      );

      this.load.image(
        "treat",
        "treat.png"
      );

      this.load.image(
        "ring",
        "ring.png"
      );
      

      this.load.image("rock1", "/rock/rock-1.png");
      this.load.image("rock2", "/rock/rock-2.png");
      this.load.image("rock3", "/rock/rock-3.png");
      this.load.image("rock4", "/rock/rock-4.png");
      
      this.load.image("fate1", "/fate/fate-1.png");
      this.load.image("fate2", "/fate/fate-2.png");
      this.load.image("fate3", "/fate/fate-3.png");
      this.load.image("fate4", "/fate/fate-4.png");
      this.load.image("fate5", "/fate/fate-5.png");
      this.load.image("fate6", "/fate/fate-6.png");
      this.load.image("final_fate", "/final_fate.png");
      
      this.load.image("us", "/us.png");
      this.load.image("milo", "/milo.png");
    }

    function create() {

    // FATE ANIMATION
    this.anims.create({
        key: "run",
        frames: [
            { key: "fate1" },
            { key: "fate2" },
            { key: "fate3" },
            { key: "fate4" },
            { key: "fate5" },
            { key: "fate6" },
        ],
        frameRate: 6,
        repeat: -1,
    });

    // SLOW BACKGROUND CLOUDS
    clouds = this.add.tileSprite(
      0,
      0,
      window.innerWidth,
      window.innerHeight,
      "clouds"
    );
    clouds.setOrigin(0, 0);
    clouds.setDepth(-1);
    const cloudTexture = this.textures.get("clouds").getSourceImage();
    const cloudScale = isMobile
      ? Math.max(window.innerHeight / cloudTexture.height, 0.45)
      : 0.6;
    clouds.setTileScale(cloudScale);

    // VISUAL GRASS
    grass = this.add.tileSprite(
      0,
      window.innerHeight - 140,
      window.innerWidth * 4,
    0,
      "grass"
    );
    grass.setOrigin(0, 0);

    grass.setScale(0.25);

    const groundY = window.innerHeight - 80;

    // INVISIBLE PHYSICS GROUND
    const ground = this.add.rectangle(
      window.innerWidth / 2,
      groundY,
      window.innerWidth,
      20,
      0x000000,
      0
    );

    this.physics.add.existing(ground, true);

      // PLAYER 
      const playerX = isMobile
        ? window.innerWidth * 0.22
        : 200;

      const playerY = isMobile
        ? groundY - 140
        : groundY - 200;

      player = this.physics.add.sprite(
        playerX,
        playerY,
        "fate1"
      );

    player.setDepth(1); 
      
    player.play("run");

    const playerScale = isMobile ? 0.07 : 0.12;
    player.setScale(playerScale);
 

    player.setCollideWorldBounds(true);

    player.body.setSize(
    player.width * 0.5,
    player.height * 0.6
    );

    this.physics.add.collider(player, ground);

      // CONTROLS
      cursors = this.input.keyboard.createCursorKeys();
      
      this.input.on("pointerdown", () => {
        jumpPressed = true;
      });

      this.input.on("pointerup", () => {
        jumpPressed = false;
      });

      // DEBUG: Press 'E' to trigger end sequence
      this.input.keyboard.on("keydown-E", () => {
        if (!endSequenceStarted && !gameEnded) {
          endSequenceReady = true;
          ringsCollected = maxRings;
          this.add.text(
            isMobile ? window.innerWidth / 2 : window.innerWidth / 2 - 350,
            isMobile ? window.innerHeight / 2 - 25 : window.innerHeight / 2 - 10,
            "The rings made it safely 💍",
            { fontSize: isMobile ? "10px" : "36px", color: "#000" }
          );
        }
      });

      // SCORE TEXT
      scoreText = this.add.text(30, 30, "Score: 0", {
        fontFamily: "Arial, sans-serif",
        fontSize: isMobile ? "20px" : "32px",
        color: "#000",
      });
      scoreText.setDepth(10);

      const updateScoreText = () => {
        scoreText.setText("Score: " + score);
      };

      // AUTO SCORE
      this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          if (!gameEnded) {
            score += 1;
            updateScoreText();
          }
        },
      });

      //COLLECT TRACKER
      const iconY = isMobile ? 100 : 90;
      const iconStartX = isMobile ? 150 : 230;
      const iconSpacing = isMobile ? 40 : 60;
      
      const collectIcon = this.add.image(isMobile ? iconStartX - 80 : iconStartX - 120, iconY, "collect");
      collectIcon.setScale(isMobile ? 0.07 : 0.12);

      for (let i = 0; i < maxTreats; i++) {
        const icon = this.add.image(iconStartX + i * iconSpacing, iconY, "treat");
        isMobile ? icon.setScale(0.04) : icon.setScale(0.06);
        icon.setAlpha(0.25);
        treatIcons.push(icon);
      }

      for (let i = 0; i < maxRings; i++) {
        const icon = this.add.image(iconStartX + (maxTreats + i) * iconSpacing, iconY, "ring");
        isMobile ? icon.setScale(0.075) : icon.setScale(0.10);
        icon.setAlpha(0.25);
        ringIcons.push(icon);
      }

      const updateHUD = () => {
        for (let i = 0; i < maxTreats; i++) {
          treatIcons[i].setAlpha(i < treatsCollected ? 1 : 0.25);
        }

        for (let i = 0; i < maxRings; i++) {
          ringIcons[i].setAlpha(i < ringsCollected ? 1 : 0.25);
        }
      };

      // TREATS GROUP
      const treats = this.physics.add.group({ allowGravity: false });
      const rings = this.physics.add.group({ allowGravity: false });

      let treatSpawnEvent;
      let ringSpawnEvent;

      treatSpawnEvent = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {

        if (treatsCollected >= 3) {
          treatSpawnEvent.remove(false);
          startRingPhase.call(this);
          return;
        }

        const randomY = isMobile ? Phaser.Math.Between(150, 350): Phaser.Math.Between(250, 650);

        const treat = treats.create(
          window.innerWidth + 100,
          randomY,
          "treat"
        );

        treat.setScale(isMobile ? 0.08 : 0.10);

        treat.setVelocityX(-gameSpeed);
        treat.body.allowGravity = false;
      },
    });

      // COLLECT TREATS
      this.physics.add.overlap(
        player,
        treats,
        collectTreat,
        null,
        this
      );

      function collectTreat(player, treat) {

        treat.destroy();

        treatsCollected++;

        score += 100;
        updateScoreText();

        // SPAWN RINGS AFTER 3 TREATS
        if (treatsCollected === 3) {
          startRingPhase.call(this);
        }

        updateHUD();
      }

      // SPAWN RINGS
           function startRingPhase() {
        if (ringSpawnEvent) return;

        ringSpawnEvent = this.time.addEvent({
          delay: 3000,
          loop: true,
          callback: () => {

            if (ringsCollected >= maxRings) {
              return;
            }

            const randomY = isMobile ? Phaser.Math.Between(150, 350): Phaser.Math.Between(250, 650);

            const ring = rings.create(
              window.innerWidth + 100,
              randomY,
              "ring"
            );

            ring.setScale(isMobile ? 0.12 : 0.15);
            ring.setVelocityX(-gameSpeed);
            ring.body.allowGravity = false;
          },
        });
      }

      this.physics.add.overlap(player, rings, collectRing, null, this);

      function collectRing(player, ring) {
        ring.destroy();
        ringsCollected++;
        score += 100;
        updateScoreText();

        updateHUD();

        if (ringsCollected === maxRings) {
          this.add.text(
            isMobile ? window.innerWidth/ 2 : window.innerWidth / 2 - 300,
            isMobile ? window.innerHeight / 2 - 25 : window.innerHeight / 2 - 25,
            "The rings made it safely 💍",
            { fontSize: isMobile ? "10px" : "36px", color: "#000" }
          );
          endSequenceReady = true;
        }
      }

      // OBSTACLES
      const rocks = ["rock1", "rock2", "rock3", "rock4"];

      const obstacles = this.physics.add.group();

      this.time.addEvent({
        delay: 4000,
        loop: true,
        callback: () => {
          if (endSequenceStarted) return;

          const randomRock = Phaser.Utils.Array.GetRandom(rocks);

          const obstacle = obstacles.create(
            window.innerWidth + 100,
            window.innerHeight - 120,
            randomRock
          );

          obstacle.setScale(isMobile ? 0.10 : 0.15);
          obstacle.setVelocityX(-gameSpeed);
          obstacle.setImmovable(true);
          obstacle.body.allowGravity = false;
        },
      });

      // HIT OBSTACLE
      const obstacleCollider = this.physics.add.collider(
        player,
        obstacles,
        hitObstacle,
        null,
        this
      );

      function hitObstacle(player, obstacle) {
        if (obstacle.getData("hit")) return;

        obstacle.setData("hit", true);
        obstacle.setTint(0xff8888);
        obstacle.body.checkCollision.none = true;

        this.time.delayedCall(600, () => {
          obstacle.destroy();
        });

        if (endSequenceStarted || endSequenceReady) return;

        score = Math.max(0, score - 50);
        updateScoreText();

        player.setVelocityX(0);
      }

      function startEndSequence() {
        if (endSequenceStarted) return;
        endSequenceStarted = true;

        // Disable obstacle collisions
        obstacleCollider.active = false;

        // Destroy all obstacles
        obstacles.clear(true);

        // Destroy all rings from screen
        rings.clear(true);

        // Stop spawning new rings and obstacles
        if (ringSpawnEvent) {
          ringSpawnEvent.remove(false);
        }

        const groundY = window.innerHeight - 80;

        // Create us.png - fade in at fixed position
        const usImage = this.physics.add.sprite(
          isMobile ? window.innerWidth * .52 :  window.innerWidth * .70,
          isMobile ? groundY - 85: groundY - 130,
          "us"
        );
        usImage.setScale(isMobile ? 0.13 : 0.20);
        usImage.setAlpha(0);
        usImage.body.allowGravity = false;

        // Create milo.png - fade in at fixed position
        const miloImage = this.physics.add.sprite(
          isMobile ? window.innerWidth * .80 : window.innerWidth * .87,
          isMobile ? groundY - 60: groundY - 90,
          "milo"
        );
        miloImage.setScale(isMobile ? 0.13 : 0.22);
        miloImage.setAlpha(0);
        miloImage.body.allowGravity = false;

        // Fade in both images
        this.tweens.add({
          targets: [usImage, miloImage],
          alpha: 1,
          duration: 1000,
          ease: "Power2.easeInOut",
        });

        // Player runs to the right
        player.setCollideWorldBounds(false);
        player.setVelocityX(320); // Run RIGHT
        player.play("run");
        // Don't disable gravity yet - let the player land naturally
      }

      this.events.on("update", () => {
        if (endSequenceReady && !endSequenceStarted) {
          // Disable collisions once ready
          obstacleCollider.active = false;
          
          if (player.body.blocked.down) {
            startEndSequence.call(this);
          }
        }
      });
    }

    function update() {

        if (!endSequenceStarted) {
          clouds.tilePositionX += gameSpeed * 0.008;
          grass.tilePositionX += gameSpeed * 0.064;
        }

        if (!endSequenceStarted && !gameEnded) {
          if (player.body.blocked.down) {
            player.anims.play("run", true);
          } else {
            player.setTexture("fate1"); // or jump frame
          }
        }

        if (endSequenceStarted && !gameEnded) {
          // Disable gravity once player lands on ground
          if (player.body.blocked.down) {
            player.body.setAllowGravity(false);
          }

          const rightEdge = isMobile ? window.innerWidth * 0.12 : window.innerWidth * 0.52;
          if (player.x >= rightEdge) {
            gameEnded = true;
            console.log("🎮 Game Ended!", {
              score,
              treatsCollected,
              ringsCollected,
              timestamp: new Date().toISOString(),
            });
            setFinalScore(score);
            setShowLeaderboard(true);
            player.setVelocityX(0);
            player.anims.stop();
            player.setTexture("final_fate");
            player.body.setAllowGravity(false);
          }
        }

      // JUMP
    if (!endSequenceStarted && !gameEnded &&
      (cursors.space.isDown ||
        cursors.up.isDown ||
        jumpPressed) &&
      player.body.blocked.down
    ) {
        player.setVelocityY(-800);

        jumpPressed = false;
      }
    }

    return () => {
      game.destroy(true);
    };

  }, []);

  const handleLeaderboardSubmit = (event) => {
    event.preventDefault();
    const nextLeaderboard = saveLeaderboardEntry(username, finalScore);
    setLeaderboard(nextLeaderboard);
    setScoreSubmitted(true);
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={gameRef} />

      {showLeaderboard && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: window.innerWidth < 768 ? "center" : "flex-start",
            padding: window.innerWidth < 768 ? "96px 24px 16px" : "120px 0 20px 56px",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: window.innerWidth < 768 ? "min(360px, 100%)" : 360,
              color: "#1f1f1f",
              fontFamily: "Arial, sans-serif",
              pointerEvents: "auto",
              textAlign: window.innerWidth < 768 ? "center" : "left",
            }}
          >
            <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Leaderboard</h2>
            {!scoreSubmitted ? (
              <form onSubmit={handleLeaderboardSubmit}>
                <label
                  htmlFor="leaderboard-name"
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Username
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <input
                    id="leaderboard-name"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    maxLength={18}
                    autoFocus
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: "2px solid #1f1f1f",
                      borderRadius: 6,
                      padding: "10px 12px",
                      fontSize: 16,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      border: "2px solid #1f1f1f",
                      borderRadius: 6,
                      background: "#f9cf5f",
                      padding: "10px 14px",
                      fontSize: 16,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Add
                  </button>
                </div>
              </form>
            ) : (
              <p style={{ margin: "0 0 12px", fontWeight: 700 }}>
                Score added.
              </p>
            )}

            <ol
              style={{
                margin: "20px 0 0",
                paddingLeft: window.innerWidth < 768 ? 0 : 24,
                listStylePosition: window.innerWidth < 768 ? "inside" : "outside",
              }}
            >
              {leaderboard.length === 0 ? (
                <li style={{ padding: "6px 0" }}>No scores yet</li>
              ) : (
                leaderboard.slice(0, 5).map((entry, index) => (
                  <li
                    key={`${entry.name}-${entry.score}-${entry.date}-${index}`}
                    style={{ padding: "6px 0", fontSize: 16 }}
                  >
                    <span>{entry.name}</span>
                    <p1 style={{ float: "right" }}>{entry.score}</p1>
                  </li>
                ))
              )}
            </ol>
          </div>
        </div>
      )}

      <img
        src="/rsvp_button.PNG"
        alt="RSVP"
        onClick={() => window.location.href = "https://a2saywedo.com/"}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 140,
          cursor: "pointer",
          zIndex: 10,
        }}
      />
    </div>
  );
}
