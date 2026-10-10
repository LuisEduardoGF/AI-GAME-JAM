import type Phaser from 'phaser';
import { SKILLS, type BattleEvent, type StyleId } from './modelo';

export const PATATA_SHEET = { key: 'patata-ataques', width: 64, height: 55 } as const;
export type PatataPose = 'idle' | 'jab' | 'hook' | 'kick' | 'slam' | 'flame' | 'hurt' | 'guard' | 'dodge' | 'victory' | 'defeat';
export type PatataPlayback = { pose: PatataPose; elapsed: number; seen: PatataPose[] };
const CLIPS: Record<PatataPose, readonly number[]> = {
  idle: [0], jab: [1, 2, 2, 5, 0], hook: [7, 8, 9, 11, 6],
  kick: [13, 14, 15, 17, 12], slam: [1, 3, 4, 5, 0], flame: [19, 20, 21, 22, 23, 18],
  hurt: [5, 5, 0], guard: [11, 11, 6], dodge: [17, 17, 12], victory: [18, 19, 20, 20], defeat: [4],
};
const FRAME_MS = 85;

/** Select presentation from actual combat events, without changing the simulation. */
export function poseForEvents(events: readonly BattleEvent[], style: StyleId, attacks: number, guarded: boolean): PatataPose | null {
  const skillEvent = events.filter(event => event.side === 'player' && event.kind === 'skill').at(-1);
  if (skillEvent) {
    const skill = SKILLS.find(item => item.name === skillEvent.label);
    if (skill?.style === 'stone') return 'slam';
    if (skill?.style === 'ember') return 'kick';
    return skill?.tier === 3 ? 'flame' : skill?.tier === 2 ? 'hook' : 'jab';
  }
  if (events.some(event => event.side === 'player' && event.kind === 'block' && event.label === 'Patata esquiva.')) return 'dodge';
  if (events.some(event => event.side === 'enemy' && event.kind === 'hit')) return guarded || style === 'stone' ? 'guard' : 'hurt';
  return events.some(event => event.side === 'player' && event.kind === 'hit') ? (attacks % 2 ? 'jab' : 'hook') : null;
}

/** Frame changes and motion share one clock which the scene stops during pause. */
export class PatataVisual {
  private pose: PatataPose;
  private elapsed: number;
  private seen: PatataPose[];
  private readonly x: number;
  private readonly y: number;
  private readonly scaleX: number;
  private readonly scaleY: number;

  constructor(private readonly sprite: Phaser.GameObjects.Image, saved?: PatataPlayback) {
    this.x = sprite.x; this.y = sprite.y;
    this.scaleX = sprite.scaleX; this.scaleY = sprite.scaleY;
    this.pose = saved?.pose ?? 'idle'; this.elapsed = saved?.elapsed ?? 0;
    this.seen = [...(saved?.seen ?? ['idle'])];
    this.render();
  }

  get frame(): number { return Number(this.sprite.frame.name); }
  snapshot(): PatataPlayback { return { pose: this.pose, elapsed: this.elapsed, seen: [...this.seen] }; }

  play(pose: PatataPose): void {
    if (this.pose === 'victory' || this.pose === 'defeat') return;
    this.pose = pose; this.elapsed = 0;
    if (!this.seen.includes(pose)) this.seen.push(pose);
    this.render();
  }

  finish(won: boolean): void {
    const pose = won ? 'victory' : 'defeat';
    if (this.pose !== pose) { this.pose = pose; this.elapsed = 0; if (!this.seen.includes(pose)) this.seen.push(pose); }
    this.render();
  }

  update(delta: number): void {
    if (!Number.isFinite(delta) || delta <= 0) return;
    this.elapsed += delta;
    if (!['idle', 'victory', 'defeat'].includes(this.pose) && this.elapsed >= CLIPS[this.pose].length * FRAME_MS) {
      this.pose = 'idle'; this.elapsed = 0;
    }
    this.render();
  }

  private render(): void {
    const clip = CLIPS[this.pose];
    this.sprite.setFrame(clip[Math.min(clip.length - 1, Math.floor(this.elapsed / FRAME_MS))]);
    const progress = Math.min(1, this.elapsed / (clip.length * FRAME_MS));
    const pulse = Math.sin(progress * Math.PI);
    const attack = ['jab', 'hook', 'kick', 'slam', 'flame'].includes(this.pose);
    const retreat = this.pose === 'hurt' || this.pose === 'dodge';
    this.sprite.setPosition(this.x + (attack ? 24 : retreat ? -22 : 0) * pulse, this.y);
    const breathing = this.pose === 'idle' ? Math.sin(this.elapsed / 190) * 0.012 : 0;
    this.sprite.setScale(this.scaleX * (1 + (attack ? 0.035 * pulse : 0)), this.scaleY * (1 + breathing));
    if (this.pose === 'hurt' && this.elapsed < FRAME_MS * 2) this.sprite.setTint(0xffa08b);
    else if (this.pose === 'guard') this.sprite.setTint(0xa9d5dc);
    else this.sprite.clearTint();
  }
}
