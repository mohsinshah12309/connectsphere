import { useEffect, useRef } from "react";
import styles from "./SpaceBackground.module.css";

/**
 * Full-viewport space scene, mounted ONCE at the app root (outside <Routes>)
 * so it never resets on navigation. Three layers, back to front:
 *   1. Canvas starfield — hundreds of stars across 3 depth layers, each
 *      twinkling on its own cycle and drifting at a different speed so
 *      near/far actually reads (parallax), plus rare shooting stars.
 *   2. CSS-animated planets — glowing radial-gradient orbs with rings,
 *      each on a slow independent float/drift loop.
 *   3. Everything else in the app renders on top, and — since navbar/cards
 *      use backdrop-filter blur — visibly blurs this scene, giving real depth.
 */
function SpaceBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width, height;
    let stars = [];
    let shootingStars = [];
    let animationId;
    let lastShootingStarAt = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Three depth layers: far (small, dim, slow), mid, near (bigger, brighter, faster).
    // This is what actually sells "spatial" rather than a flat sprinkle of dots.
    const LAYERS = [
      {
        count: 140,
        sizeRange: [0.5, 1.1],
        speed: 0.015,
        alphaRange: [0.25, 0.55],
      },
      { count: 90, sizeRange: [1, 1.8], speed: 0.035, alphaRange: [0.4, 0.75] },
      { count: 45, sizeRange: [1.5, 2.6], speed: 0.06, alphaRange: [0.6, 1] },
    ];

    const initStars = () => {
      stars = [];
      LAYERS.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size:
              layer.sizeRange[0] +
              Math.random() * (layer.sizeRange[1] - layer.sizeRange[0]),
            baseAlpha:
              layer.alphaRange[0] +
              Math.random() * (layer.alphaRange[1] - layer.alphaRange[0]),
            speed: layer.speed,
            layerIndex,
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.0006 + Math.random() * 0.0012,
          });
        }
      });
    };

    const maybeSpawnShootingStar = (time) => {
      if (time - lastShootingStarAt < 3500) return; // don't spam them
      if (Math.random() > 0.994) {
        lastShootingStarAt = time;
        const startX = Math.random() * width * 0.6;
        const startY = Math.random() * height * 0.3;
        shootingStars.push({
          x: startX,
          y: startY,
          length: 80 + Math.random() * 60,
          angle: Math.PI / 6 + Math.random() * (Math.PI / 12),
          speed: 9 + Math.random() * 5,
          life: 1,
        });
      }
    };

    const step = (time) => {
      ctx.clearRect(0, 0, width, height);

      // subtle vertical drift downward per layer — depth via parallax speed
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > height + 4) {
          s.y = -4;
          s.x = Math.random() * width;
        }

        const twinkle =
          0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        const alpha = s.baseAlpha * (0.55 + twinkle * 0.45);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // faint glow on the brightest, nearest layer only — keeps cost low
        if (s.layerIndex === 2 && twinkle > 0.75) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(180, 170, 255, ${alpha * 0.25})`;
          ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!prefersReducedMotion) {
        maybeSpawnShootingStar(time);
      }

      // shooting stars: short bright streak, fades out, then removed
      shootingStars = shootingStars.filter((star) => star.life > 0);
      for (const star of shootingStars) {
        const dx = Math.cos(star.angle) * star.speed;
        const dy = Math.sin(star.angle) * star.speed;
        star.x += dx;
        star.y += dy;
        star.life -= 0.02;

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.life})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(step);
    };

    resize();
    initStars();
    window.addEventListener("resize", () => {
      resize();
      initStars();
    });

    if (prefersReducedMotion) {
      step(0); // one static frame, no shooting stars, no loop
    } else {
      animationId = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className={styles.scene} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Nebula glow — big, soft, barely-moving color washes for atmosphere */}
      <div className={styles.nebulaA} />
      <div className={styles.nebulaB} />

      {/* Planets — each on its own slow float loop via the shared
          orbitFloat keyframe (defined once in index.css), staggered with
          negative delays and different durations so they never sync up. */}
      <div className={`${styles.planet} ${styles.planetViolet}`}>
        <span className={styles.ring} />
      </div>
      <div className={`${styles.planet} ${styles.planetTeal}`} />
      <div className={`${styles.planet} ${styles.planetSmall}`} />
    </div>
  );
}

export default SpaceBackground;
