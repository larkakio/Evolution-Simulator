"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LevelDef, Vec2 } from "@/lib/game/types";
import { completeLevel } from "@/lib/game/progress";

function dist(a: Vec2, b: Vec2) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

type Props = {
  level: LevelDef;
  onClose: () => void;
  onCompleted: (levelId: number) => void;
};

export function EvolutionGame({ level, onClose, onCompleted }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Vec2 | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const winHandledRef = useRef(false);
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  const [hud, setHud] = useState({
    evolution: 0,
    portal: false,
    won: false,
    lost: false,
    timeLeft: level.timeSeconds,
  });

  const stateRef = useRef({
    player: { ...level.spawn } as Vec2,
    nodes: level.nodes.map((n) => ({ ...n, alive: true })),
    evolution: 0,
    portal: false,
    portalPos: { x: level.world.w / 2, y: 140 } as Vec2,
    won: false,
    lost: false,
    timeLeft: level.timeSeconds,
  });

  const resetState = useCallback(() => {
    stateRef.current = {
      player: { ...level.spawn },
      nodes: level.nodes.map((n) => ({ ...n, alive: true })),
      evolution: 0,
      portal: false,
      portalPos: { x: level.world.w / 2, y: 140 },
      won: false,
      lost: false,
      timeLeft: level.timeSeconds,
    };
    targetRef.current = null;
    winHandledRef.current = false;
    setHud({
      evolution: 0,
      portal: false,
      won: false,
      lost: false,
      timeLeft: level.timeSeconds,
    });
  }, [level]);

  useEffect(() => {
    resetState();
  }, [level, resetState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const cvs = canvas;
    const root = wrap;
    const maybeGfx = cvs.getContext("2d");
    if (!maybeGfx) return;
    const graphics: CanvasRenderingContext2D = maybeGfx;

    const maxSpeed = 360;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const r = root.getBoundingClientRect();
      const w = Math.max(1, r.width);
      const h = Math.max(1, r.height);
      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      graphics.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    function loop(t: number) {
      const last = lastRef.current || t;
      const dt = Math.min(0.05, (t - last) / 1000);
      lastRef.current = t;

      const s = stateRef.current;
      const lv = level;

      if (!s.won && !s.lost) {
        if (s.timeLeft !== null) {
          s.timeLeft -= dt;
          if (s.timeLeft <= 0) {
            s.timeLeft = 0;
            s.lost = true;
          }
        }

        const p = s.player;
        const tgt = targetRef.current;
        if (tgt) {
          const d = dist(p, tgt);
          if (d > 2) {
            const step = Math.min(d, maxSpeed * dt);
            p.x += ((tgt.x - p.x) / d) * step;
            p.y += ((tgt.y - p.y) / d) * step;
          }
        }

        p.x = Math.max(lv.playerRadius, Math.min(lv.world.w - lv.playerRadius, p.x));
        p.y = Math.max(lv.playerRadius, Math.min(lv.world.h - lv.playerRadius, p.y));

        for (const tox of lv.toxins) {
          if (dist(s.player, tox.c) < tox.r + lv.playerRadius * 0.85) {
            s.lost = true;
            break;
          }
        }

        for (const n of s.nodes) {
          if (!n.alive) continue;
          if (dist(s.player, n) < lv.nutrientRadius + lv.playerRadius) {
            n.alive = false;
            s.evolution = Math.min(
              lv.evolutionTarget,
              s.evolution + lv.evolutionPerNode,
            );
            if (s.evolution >= lv.evolutionTarget) s.portal = true;
          }
        }

        if (s.portal && dist(s.player, s.portalPos) < lv.portalRadius + lv.playerRadius * 0.75) {
          s.won = true;
          completeLevel(lv.id);
          onCompleted(lv.id);
        }
      }

      setHud({
        evolution: s.evolution,
        portal: s.portal,
        won: s.won,
        lost: s.lost,
        timeLeft: s.timeLeft,
      });

      const r = root.getBoundingClientRect();
      const vw = r.width;
      const vh = r.height;
      const camX = Math.min(
        Math.max(0, s.player.x - vw / 2),
        Math.max(0, lv.world.w - vw),
      );
      const camY = Math.min(
        Math.max(0, s.player.y - vh / 2),
        Math.max(0, lv.world.h - vh),
      );

      graphics.save();
      graphics.clearRect(0, 0, vw, vh);
      graphics.translate(-camX, -camY);

      const animT = t / 1000;
      graphics.fillStyle = "#05060a";
      graphics.fillRect(0, 0, lv.world.w, lv.world.h);

      graphics.strokeStyle = "rgba(0,255,255,0.08)";
      graphics.lineWidth = 1;
      const grid = 48;
      const off = (animT * 18) % grid;
      for (let x = -off; x < lv.world.w + grid; x += grid) {
        graphics.beginPath();
        graphics.moveTo(x, 0);
        graphics.lineTo(x, lv.world.h);
        graphics.stroke();
      }
      for (let y = -off; y < lv.world.h + grid; y += grid) {
        graphics.beginPath();
        graphics.moveTo(0, y);
        graphics.lineTo(lv.world.w, y);
        graphics.stroke();
      }

      for (const tox of lv.toxins) {
        const pulse = 0.65 + 0.35 * Math.sin(animT * 5 + tox.c.x * 0.01);
        const grd = graphics.createRadialGradient(
          tox.c.x,
          tox.c.y,
          0,
          tox.c.x,
          tox.c.y,
          tox.r,
        );
        grd.addColorStop(0, `rgba(255,60,120,${0.45 * pulse})`);
        grd.addColorStop(1, "rgba(120,0,40,0.05)");
        graphics.fillStyle = grd;
        graphics.beginPath();
        graphics.arc(tox.c.x, tox.c.y, tox.r, 0, Math.PI * 2);
        graphics.fill();
        graphics.strokeStyle = `rgba(255,0,80,${0.5 * pulse})`;
        graphics.lineWidth = 2;
        graphics.stroke();
      }

      for (const n of s.nodes) {
        if (!n.alive) continue;
        graphics.save();
        graphics.translate(n.x, n.y);
        graphics.rotate(Math.PI / 4);
        graphics.fillStyle = "rgba(0,255,240,0.25)";
        graphics.strokeStyle = "rgba(0,255,255,0.85)";
        graphics.lineWidth = 2;
        const sz = lv.nutrientRadius * 1.35;
        graphics.fillRect(-sz, -sz, sz * 2, sz * 2);
        graphics.strokeRect(-sz, -sz, sz * 2, sz * 2);
        graphics.restore();
      }

      if (s.portal) {
        const pr = lv.portalRadius + Math.sin(animT * 4) * 4;
        const g2 = graphics.createRadialGradient(
          s.portalPos.x,
          s.portalPos.y,
          0,
          s.portalPos.x,
          s.portalPos.y,
          pr,
        );
        g2.addColorStop(0, "rgba(255,0,255,0.55)");
        g2.addColorStop(0.5, "rgba(120,0,255,0.2)");
        g2.addColorStop(1, "rgba(0,255,200,0)");
        graphics.fillStyle = g2;
        graphics.beginPath();
        graphics.arc(s.portalPos.x, s.portalPos.y, pr, 0, Math.PI * 2);
        graphics.fill();
        graphics.strokeStyle = "rgba(255,100,255,0.9)";
        graphics.lineWidth = 3;
        graphics.stroke();
      }

      const tier = Math.min(3, Math.floor(s.evolution / 40));
      const hue = 120 + tier * 35;
      graphics.beginPath();
      graphics.arc(s.player.x, s.player.y, lv.playerRadius + 6, 0, Math.PI * 2);
      graphics.strokeStyle = `hsla(${hue},100%,60%,0.35)`;
      graphics.lineWidth = 4;
      graphics.stroke();
      graphics.beginPath();
      graphics.arc(s.player.x, s.player.y, lv.playerRadius, 0, Math.PI * 2);
      const pg = graphics.createRadialGradient(
        s.player.x - 6,
        s.player.y - 6,
        2,
        s.player.x,
        s.player.y,
        lv.playerRadius,
      );
      pg.addColorStop(0, `hsl(${hue},100%,78%)`);
      pg.addColorStop(1, `hsl(${hue + 40},90%,42%)`);
      graphics.fillStyle = pg;
      graphics.fill();
      graphics.strokeStyle = "rgba(200,255,255,0.9)";
      graphics.lineWidth = 2;
      graphics.stroke();

      graphics.restore();

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- parent callback via onCompletedRef
  }, [level]);

  function onPointer(ev: React.PointerEvent, wrap: HTMLDivElement) {
    const rect = wrap.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const s = stateRef.current;
    const lv = level;
    const vw = rect.width;
    const vh = rect.height;
    const camX = Math.min(
      Math.max(0, s.player.x - vw / 2),
      Math.max(0, lv.world.w - vw),
    );
    const camY = Math.min(
      Math.max(0, s.player.y - vh / 2),
      Math.max(0, lv.world.h - vh),
    );
    targetRef.current = { x: px + camX, y: py + camY };
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black/90">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-cyan-500/30 px-3 py-2">
        <div>
          <p className="font-display text-xs uppercase tracking-[0.2em] text-cyan-300">
            Level {level.id}
          </p>
          <p className="text-sm text-fuchsia-200">{level.name}</p>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <p>
            Evolution{" "}
            <span className="font-mono text-lime-300">
              {Math.round(hud.evolution)}/{level.evolutionTarget}
            </span>
          </p>
          {level.timeSeconds !== null ? (
            <p>
              Time{" "}
              <span className="font-mono text-orange-300">
                {hud.timeLeft !== null ? Math.max(0, Math.ceil(hud.timeLeft)) : "—"}s
              </span>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          Exit
        </button>
      </header>
      <div
        ref={wrapRef}
        className="relative min-h-0 flex-1 touch-none"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          const el = wrapRef.current;
          if (!el) return;
          el.setPointerCapture(e.pointerId);
          onPointer(e, el);
        }}
        onPointerMove={(e) => {
          const el = wrapRef.current;
          if (!el) return;
          if (!el.hasPointerCapture(e.pointerId) && e.buttons === 0) return;
          onPointer(e, el);
        }}
        onPointerUp={(e) => {
          const el = wrapRef.current;
          if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={(e) => {
          const el = wrapRef.current;
          if (el?.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        {(hud.won || hud.lost) && (
          <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/55 p-6 backdrop-blur-[2px]">
            <div className="neon-panel max-w-sm rounded-2xl border border-cyan-500/40 p-6 text-center">
              {hud.won ? (
                <>
                  <h3 className="font-display text-xl text-cyan-200">Stage cleared</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Evolution threshold reached. The portal accepted your signal.
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="neon-pulse mt-6 w-full rounded-xl border border-fuchsia-400/50 bg-fuchsia-500/10 py-2 text-sm font-semibold text-fuchsia-100"
                  >
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-display text-xl text-orange-200">Signal lost</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                    Avoid glitch fields and manage your timer.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={resetState}
                      className="flex-1 rounded-xl border border-lime-400/50 py-2 text-sm text-lime-100"
                    >
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-xl border border-zinc-600 py-2 text-sm text-zinc-300"
                    >
                      Back
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="shrink-0 border-t border-cyan-500/20 px-3 py-2 text-center text-[11px] text-zinc-500">
        Drag anywhere — your cell follows your touch on the field.
      </p>
    </div>
  );
}
