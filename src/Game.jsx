import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function Game() {
  const gameRef = useRef(null);

  useEffect(() => {

    let player;
    let grass;
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
    }

    function create() {

    const isMobile = window.innerWidth < 768;

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

    // VISUAL GRASS
    grass = this.add.tileSprite(
      0,
      window.innerHeight - 160,
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
      
    player.play("run");

    const playerScale = isMobile ? 0.08 : 0.12;
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

      // SCORE TEXT
      scoreText = this.add.text(30, 30, "Score: 0", {
        fontSize: "32px",
        color: "#000",
      });

      scoreText.setScrollFactor(0);

      // AUTO SCORE
      const scoreEvent = this.time.addEvent({
        delay: 100,
        loop: true,
        callback: () => {
          if (!gameEnded) {
            score += 1;
            scoreText.setText("Score: " + score);
          }
        },
      });
      
      const iconY = isMobile ? 40 : 90;
      const iconStartX = isMobile ? 100 : 500;
      const iconSpacing = isMobile ? 60 : 80;

      for (let i = 0; i < maxTreats; i++) {
        const icon = this.add.image(iconStartX + i * iconSpacing, iconY, "treat");
        isMobile ? icon.setScale(0.04) : icon.setScale(0.07);
        icon.setAlpha(0.25);
        treatIcons.push(icon);
      }
      
      for (let i = 0; i < maxRings; i++) {
        const icon = this.add.image(iconStartX + (maxTreats + i) * iconSpacing, iconY, "ring");
        isMobile ? icon.setScale(0.075) : icon.setScale(0.11);
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

        scoreText.setText("Score: " + score);

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
        scoreText.setText("Score: " + score);

        updateHUD();

        if (ringsCollected === maxRings) {
          this.add.text(
            window.innerWidth / 2 - 250,
            window.innerHeight / 2,
            "The rings made it safely 💍",
            { fontSize: "48px", color: "#000" }
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
        obstacle.destroy();

        if (endSequenceStarted || endSequenceReady) return;

        score -= 50;

        scoreText.setText("Score: " + score);

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
            startEndSequence();
          }
        }
      });
    }

    function update() {

        if (!endSequenceStarted) {
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

          const rightEdge = window.innerWidth * 0.60;
          if (player.x >= rightEdge) {
            gameEnded = true;
            console.log("🎮 Game Ended!", {
              finalScore: score,
              treatsCollected,
              ringsCollected,
              timestamp: new Date().toISOString(),
            });
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

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <div ref={gameRef} />

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
