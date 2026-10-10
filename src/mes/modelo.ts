/** Campaña determinista: este módulo no depende del navegador ni de Phaser. */
export type CampaignMode = 'demo' | 'month';
export type Phase = 'hub' | 'debt' | 'prepare' | 'fight' | 'result' | 'ending';
export type StatId = 'strength' | 'agility' | 'resistance';
export type ProductId = 'potato' | 'tomato' | 'carrot';
export type StyleId = 'flame' | 'ember' | 'stone';
export type UpgradeId = 'gym' | 'stall' | 'storage';
type Side = 'player' | 'enemy';
type Numbers<T extends string> = Record<T, number>;
export interface Skill {
  id: string; name: string; style: StyleId; tier: number; cost: number;
  stat: StatId; minimum: number; prerequisite?: string; description: string;
}
export interface Encounter {
  id: string; name: string; kind: 'debt' | 'boss'; bossId: string; amount: number;
  hp: number; damage: number; intervalMs: number; reward: number; texture: string;
}
export interface Fighter {
  hp: number; maxHp: number; stamina: number; maxStamina: number;
  nextAttack: number; burn: number; guard: number;
}
export interface BattleEvent {
  id: number; side: Side; kind: 'hit' | 'block' | 'burn' | 'skill' | 'recover';
  amount: number; label: string;
}
export interface CombatState {
  player: Fighter; enemy: Fighter; elapsedMs: number; accumulatorMs: number;
  playerAttacks: number; enemyAttacks: number; eventSerial: number;
  log: string[]; events: BattleEvent[]; winner?: Side;
}
export interface CampaignState {
  version: 2; mode: CampaignMode; phase: Phase; day: number; slot: number;
  coins: number; stats: Numbers<StatId>; energy: number; hp: number; maxHp: number;
  heat: number; xp: number; style: StyleId; learned: string[]; equipped: string[];
  inventory: Numbers<ProductId>; demand: Numbers<ProductId>; sold: Numbers<ProductId>;
  upgrades: Numbers<UpgradeId>; heart: number; bossWins: string[];
  trained: StatId[]; neglect: Numbers<StatId>; encounter?: Encounter;
  combat?: CombatState; ending?: string; message: string;
}
export interface Outcome { state: CampaignState; message: string; ok: boolean }
export type Action = { type: 'buy' | 'sell'; product: ProductId; quantity?: number }
  | { type: 'train'; stat: StatId } | { type: 'rest' | 'talk' }
  | { type: 'upgrade'; upgrade: UpgradeId };

export const AJUSTES = {
  slots: 6, days: 30, demoDays: 3, statMin: 2, statMax: 12,
  initialCoins: 22, hpBase: 24, hpPerResistance: 4, energyBase: 10,
  trainCost: 4, trainEnergy: 2, trainXp: 2, restEnergy: 5, restHp: 12,
  nightHp: 8, nightEnergy: 4, neglectNights: 3, upgradeBase: 25,
  maxUpgrade: 2, inventoryBase: 30, storageCapacity: 15,
  battleStepMs: 100, battleLimitMs: 60_000, attackBaseMs: 1800,
  agilityMs: 75, attackMinMs: 850, baseDamage: 2, strengthDamage: 0.9,
  staminaBase: 10, staminaPerResistance: 0.6, staminaRegen: 1.9,
  attackCost: 2, recoveryMs: 500, heatPerAttack: 5, heatDecay: 2.5,
  heatThreshold: 85,
} as const;
const STAT_IDS: StatId[] = ['strength', 'agility', 'resistance'];
const PRODUCT_IDS: ProductId[] = ['potato', 'tomato', 'carrot'];
const STYLE_IDS: StyleId[] = ['flame', 'ember', 'stone'];
const UPGRADE_IDS: UpgradeId[] = ['gym', 'stall', 'storage'];
const PHASES: Phase[] = ['hub', 'debt', 'prepare', 'fight', 'result', 'ending'];
export const PRODUCTS: { id: ProductId; name: string }[] = [
  { id: 'potato', name: 'Papa' }, { id: 'tomato', name: 'Tomate' },
  { id: 'carrot', name: 'Zanahoria' },
];
export const STYLES: { id: StyleId; name: string; description: string }[] = [
  { id: 'flame', name: 'Golpes Flameantes', description: 'Fuerza, quemadura y presión.' },
  { id: 'ember', name: 'Golpes Ardientes', description: 'Agilidad, ráfagas y evasión.' },
  { id: 'stone', name: 'Flujo de Roca', description: 'Resistencia, guardia y contraataque.' },
];
export const BOSSES = [
  { id: 'yuca', name: 'Don Yuca', day: 7, hp: 82, damage: 5, intervalMs: 1650, texture: 'yuca-boxer' },
  { id: 'rabano', name: 'Rábano de Lluvia', day: 14, hp: 150, damage: 7, intervalMs: 1500, texture: 'rabano-boxer' },
  { id: 'remolacha', name: 'General Remolacha', day: 21, hp: 220, damage: 9, intervalMs: 1400, texture: 'remolacha-boxer' },
  { id: 'batata', name: 'Batata', day: 30, hp: 280, damage: 9, intervalMs: 1400, texture: 'batata-boxer' },
];
export const SKILLS: Skill[] = [
  { id: 'flame-1', name: 'Brasa Directa', style: 'flame', tier: 1, cost: 0, stat: 'strength', minimum: 2, description: 'Cada 2 golpes: +2 daño y 3 s de quemadura.' },
  { id: 'flame-2', name: 'Horno Abierto', style: 'flame', tier: 2, cost: 6, stat: 'strength', minimum: 4, prerequisite: 'flame-1', description: 'Cada 4 golpes: +4 daño, quemadura y +10 calor.' },
  { id: 'flame-3', name: 'Sol de Barrio', style: 'flame', tier: 3, cost: 12, stat: 'strength', minimum: 7, prerequisite: 'flame-2', description: 'Cada 6 golpes: +7 daño. A 85 calor añade +2.' },
  { id: 'ember-1', name: 'Paso Ardiente', style: 'ember', tier: 1, cost: 0, stat: 'agility', minimum: 2, description: 'Cada 2 golpes: +2 daño y recupera 1 estamina.' },
  { id: 'ember-2', name: 'Ráfaga de Sartén', style: 'ember', tier: 2, cost: 6, stat: 'agility', minimum: 4, prerequisite: 'ember-1', description: 'Cada 4 golpes: +4 daño y próximo golpe más rápido.' },
  { id: 'ember-3', name: 'Danza del Comal', style: 'ember', tier: 3, cost: 12, stat: 'agility', minimum: 7, prerequisite: 'ember-2', description: 'Cada 6 golpes: +6 daño y guardia de 4.' },
  { id: 'stone-1', name: 'Raíz Firme', style: 'stone', tier: 1, cost: 0, stat: 'resistance', minimum: 2, description: 'Cada 2 golpes: +1 daño y guardia de 2.' },
  { id: 'stone-2', name: 'Roca que Fluye', style: 'stone', tier: 2, cost: 6, stat: 'resistance', minimum: 4, prerequisite: 'stone-1', description: 'Cada 4 golpes: +3 daño y guardia de 4.' },
  { id: 'stone-3', name: 'Roca Aplastante', style: 'stone', tier: 3, cost: 12, stat: 'resistance', minimum: 7, prerequisite: 'stone-2', description: 'Cada 6 golpes: +6 daño y cura 3 vida.' },
];
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const copy = (state: CampaignState): CampaignState => structuredClone(state);
function outcome(state: CampaignState, message: string, ok = true): Outcome {
  return { state: { ...state, message }, message, ok };
}
export function deriveStats(state: CampaignState) {
  const { strength, agility, resistance } = state.stats;
  return {
    maxHp: AJUSTES.hpBase + resistance * AJUSTES.hpPerResistance,
    maxEnergy: AJUSTES.energyBase, maxStamina: AJUSTES.staminaBase + resistance * AJUSTES.staminaPerResistance,
    damage: AJUSTES.baseDamage + strength * AJUSTES.strengthDamage + (state.style === 'flame' ? 0.8 : 0),
    intervalMs: Math.max(AJUSTES.attackMinMs, AJUSTES.attackBaseMs - agility * AJUSTES.agilityMs),
    guard: resistance * 0.2 + (state.style === 'stone' ? 0.7 : 0),
    dodgeEvery: state.style === 'ember' ? Math.max(3, 7 - Math.floor(agility / 3)) : Math.max(4, 10 - Math.floor(agility / 3)),
  };
}
export function inventoryCapacity(state: CampaignState): number {
  return AJUSTES.inventoryBase + state.upgrades.storage * AJUSTES.storageCapacity;
}
export function marketPrices(state: CampaignState): Record<ProductId, { buy: number; sell: number; demand: number }> {
  return Object.fromEntries(PRODUCT_IDS.map((id, i) => {
    const base = 4 + ((state.day * 3 + i * 2) % 4);
    const demand = Math.max(0, state.demand[id] - state.sold[id]);
    return [id, { buy: base - 2, sell: base + state.upgrades.stall + Math.min(2, Math.floor(demand / 3)), demand }];
  })) as Record<ProductId, { buy: number; sell: number; demand: number }>;
}
function dailyDemand(day: number, stall: number): Numbers<ProductId> {
  return { potato: 3 + day % 3 + stall * 2, tomato: 3 + (day + 1) % 3 + stall * 2, carrot: 3 + (day + 2) % 3 + stall * 2 };
}
export function newCampaign(mode: CampaignMode): CampaignState {
  return {
    version: 2, mode, phase: 'hub', day: 1, slot: 0, coins: AJUSTES.initialCoins,
    stats: { strength: 2, agility: 2, resistance: 2 }, energy: 10, hp: 32, maxHp: 32,
    heat: 0, xp: 0, style: 'flame', learned: ['flame-1', 'ember-1', 'stone-1'], equipped: ['flame-1'],
    inventory: { potato: 9, tomato: 6, carrot: 6 }, demand: dailyDemand(1, 0), sold: { potato: 0, tomato: 0, carrot: 0 },
    upgrades: { gym: 0, stall: 0, storage: 0 }, heart: 0, bossWins: [], trained: [],
    neglect: { strength: 0, agility: 0, resistance: 0 }, message: 'Vende un lote, entrena y descansa. Tu preparación pelea por ti.',
  };
}
export function applyAction(state: CampaignState, action: Action): Outcome {
  if (state.phase !== 'hub' || state.slot >= AJUSTES.slots) return outcome(state, 'Cierra el día para continuar.', false);
  const next = copy(state);
  let message = '';
  if (action.type === 'buy' || action.type === 'sell') {
    const product = PRODUCTS.find(p => p.id === action.product);
    if (!product) return outcome(state, 'Producto desconocido.', false);
    const rawQuantity = action.quantity ?? 3;
    if (!Number.isFinite(rawQuantity) || !Number.isInteger(rawQuantity) || rawQuantity <= 0) return outcome(state, 'Cantidad inválida.', false);
    const requested = Math.min(rawQuantity, 9);
    const price = marketPrices(state)[product.id];
    if (action.type === 'buy') {
      const occupied = PRODUCT_IDS.reduce((n, id) => n + state.inventory[id], 0);
      if (occupied + requested > inventoryCapacity(state)) return outcome(state, 'La despensa está llena.', false);
      if (next.coins < price.buy * requested) return outcome(state, 'No alcanza para ese lote.', false);
      next.coins -= price.buy * requested;
      next.inventory[product.id] += requested;
      message = `Compras ${requested} ${product.name}: -$${price.buy * requested}.`;
    } else {
      const quantity = Math.min(requested, next.inventory[product.id], price.demand);
      if (quantity < 1) return outcome(state, 'Sin producto o sin compradores hoy. Prueba otro vívere.', false);
      next.inventory[product.id] -= quantity;
      next.sold[product.id] += quantity;
      next.coins += price.sell * quantity;
      message = `Vendes ${quantity} ${product.name}: +$${price.sell * quantity}.`;
    }
    next.energy = Math.max(0, next.energy - 1);
  } else if (action.type === 'train') {
    if (!STAT_IDS.includes(action.stat)) return outcome(state, 'Atributo desconocido.', false);
    const cost = AJUSTES.trainCost - Math.min(1, next.upgrades.gym);
    if (next.coins < cost || next.energy < AJUSTES.trainEnergy) return outcome(state, `Entrenar requiere $${cost} y 2 energía.`, false);
    if (next.stats[action.stat] >= AJUSTES.statMax) return outcome(state, 'Atributo al máximo.', false);
    next.coins -= cost; next.energy -= AJUSTES.trainEnergy;
    next.stats[action.stat] = Math.min(AJUSTES.statMax, next.stats[action.stat] + (next.upgrades.gym >= 2 ? 2 : 1));
    next.xp += AJUSTES.trainXp;
    next.trained = [...new Set([...next.trained, action.stat])];
    next.maxHp = deriveStats(next).maxHp;
    next.hp = Math.min(next.maxHp, next.hp + (action.stat === 'resistance' ? 4 : 0));
    message = `Entrenamiento: +${next.upgrades.gym >= 2 ? 2 : 1} atributo, +2 experiencia.`;
  } else if (action.type === 'rest') {
    next.energy = Math.min(10, next.energy + AJUSTES.restEnergy);
    next.hp = Math.min(next.maxHp, next.hp + AJUSTES.restHp);
    next.heat = Math.max(0, next.heat - 25);
    message = 'Descansas: +5 energía, +12 vida y menos calor.';
  } else if (action.type === 'talk') {
    next.heart = Math.min(10, next.heart + 1); next.xp += 1;
    message = 'El barrio te apoya: +1 vínculo y +1 experiencia.';
  } else if (action.type === 'upgrade') {
    if (!UPGRADE_IDS.includes(action.upgrade)) return outcome(state, 'Mejora desconocida.', false);
    const level = next.upgrades[action.upgrade];
    const cost = AJUSTES.upgradeBase * (level + 1);
    if (level >= AJUSTES.maxUpgrade || next.coins < cost) return outcome(state, level >= 2 ? 'Mejora al máximo.' : `La mejora cuesta $${cost}.`, false);
    next.coins -= cost; next.upgrades[action.upgrade] += 1;
    next.demand = dailyDemand(next.day, next.upgrades.stall);
    message = `Mejora adquirida por $${cost}.`;
  } else {
    return outcome(state, 'Acción desconocida.', false);
  }
  next.slot += 1;
  return outcome(next, message);
}
export function skillStatus(state: CampaignState, id: string): string | null {
  const skill = SKILLS.find(s => s.id === id);
  if (!skill) return 'Habilidad desconocida';
  if (state.learned.includes(id)) return 'Aprendida';
  if (skill.prerequisite && !state.learned.includes(skill.prerequisite)) return 'Aprende el nodo anterior';
  const statName: Record<StatId, string> = { strength: 'fuerza', agility: 'agilidad', resistance: 'resistencia' };
  if (state.stats[skill.stat] < skill.minimum) return `Requiere ${skill.minimum} ${statName[skill.stat]}`;
  if (state.xp < skill.cost) return `Requiere ${skill.cost} experiencia`;
  return null;
}
function canConfigure(state: CampaignState) { return ['hub', 'debt', 'prepare'].includes(state.phase); }
export function learnSkill(state: CampaignState, id: string): Outcome {
  if (!canConfigure(state)) return outcome(state, 'Configura las habilidades antes de combatir.', false);
  const reason = skillStatus(state, id);
  const skill = SKILLS.find(s => s.id === id);
  if (reason || !skill) return outcome(state, reason ?? 'Habilidad desconocida', false);
  return outcome({ ...state, xp: state.xp - skill.cost, learned: [...state.learned, id] }, `Aprendes ${skill.name}. Equípala antes de luchar.`);
}
export function equipSkill(state: CampaignState, id: string): Outcome {
  if (!canConfigure(state) || !state.learned.includes(id)) return outcome(state, 'La habilidad debe estar aprendida y fuera del combate.', false);
  const equipped = state.equipped.includes(id) ? state.equipped.filter(s => s !== id) : [...state.equipped, id];
  if (equipped.length > 3) return outcome(state, 'Máximo tres habilidades. Quita una primero.', false);
  return outcome({ ...state, equipped }, equipped.includes(id) ? 'Habilidad equipada.' : 'Habilidad retirada.');
}
export function chooseStyle(state: CampaignState, style: StyleId): Outcome {
  if (!canConfigure(state) || !STYLE_IDS.includes(style)) return outcome(state, 'Elige estilo antes de combatir.', false);
  return outcome({ ...state, style }, `Estilo: ${STYLES.find(s => s.id === style)?.name}. Tus habilidades equipadas se conservan.`);
}
function bossToday(state: CampaignState) {
  return state.mode === 'demo' ? (state.day === 3 ? BOSSES[0] : undefined) : BOSSES.find(b => b.day === state.day);
}
function makeBoss(state: CampaignState): Encounter | undefined {
  const boss = bossToday(state);
  if (!boss) return undefined;
  return { ...boss, id: `boss-${boss.id}-${state.day}`, kind: 'boss', bossId: boss.id,
    amount: 0, reward: 24 + BOSSES.findIndex(b => b.id === boss.id) * 6,
    hp: state.mode === 'demo' ? 68 : boss.hp, damage: state.mode === 'demo' ? 4 : boss.damage,
    intervalMs: state.mode === 'demo' ? 1750 : boss.intervalMs };
}
function makeDebt(state: CampaignState): Encounter {
  const stage = state.mode === 'demo' ? 0 : Math.min(3, Math.floor((state.day - 1) / 7));
  const boss = BOSSES[stage];
  return { id: `debt-${state.day}`, name: `Cobrador de ${boss.name}`, kind: 'debt', bossId: boss.id,
    amount: Math.max(4, 8 + stage * 3 - state.bossWins.length), hp: 22 + stage * 7,
    damage: 3 + stage, intervalMs: 1800 - stage * 70, reward: 6 + stage * 2, texture: `esbirro-${boss.id}` };
}
export function nextEvent(state: CampaignState): string {
  const total = state.mode === 'demo' ? 3 : 30;
  const boss = state.mode === 'demo' ? { ...BOSSES[0], day: 3 } : BOSSES.find(b => b.day >= state.day);
  const debtDay = state.day % 2 === 0 ? state.day : state.day + 1;
  const debtNotice = debtDay <= total ? `Cobro: día ${debtDay}.` : 'No quedan cobros.';
  return `${debtNotice} ${boss ? `${boss.name}: día ${boss.day}.` : 'Último día.'}`;
}
function advanceDay(state: CampaignState): CampaignState {
  const next = copy(state);
  if (next.day >= (next.mode === 'demo' ? 3 : AJUSTES.days)) {
    next.phase = 'ending';
    next.ending = next.mode === 'demo' ? (next.bossWins.includes('yuca') ? 'El barrio vio nacer a su campeón. Continúa en la campaña mensual.' : 'Caíste ante Yuca, pero tu puesto sigue abierto. Entrena y vuelve a intentarlo.')
      : next.bossWins.includes('batata') ? (next.heart >= 5 ? 'Batata baja los puños. Dos hermanos reconstruyen el mercado.' : 'La mafia retrocede. El barrio recupera su mercado.')
      : 'Batata gana esta noche. La Patata conserva el puesto y al barrio: habrá otra oportunidad.';
    next.encounter = undefined; next.combat = undefined;
    return next;
  }
  for (const stat of STAT_IDS) {
    next.neglect[stat] = next.trained.includes(stat) ? 0 : next.neglect[stat] + 1;
    if (next.neglect[stat] >= AJUSTES.neglectNights) {
      next.stats[stat] = Math.max(AJUSTES.statMin, next.stats[stat] - 1); next.neglect[stat] = 0;
    }
  }
  if (next.upgrades.storage === 0) for (const id of PRODUCT_IDS) next.inventory[id] = Math.max(0, next.inventory[id] - 1);
  next.day += 1; next.slot = 0; next.phase = 'hub'; next.trained = [];
  next.maxHp = deriveStats(next).maxHp;
  next.hp = Math.min(next.maxHp, next.hp + AJUSTES.nightHp);
  next.energy = Math.min(10, next.energy + AJUSTES.nightEnergy);
  next.heat = Math.max(0, next.heat - 25);
  next.demand = dailyDemand(next.day, next.upgrades.stall); next.sold = { potato: 0, tomato: 0, carrot: 0 };
  next.encounter = undefined; next.combat = undefined;
  return next;
}
function afterDebt(state: CampaignState): CampaignState {
  const boss = makeBoss(state);
  return boss ? { ...state, phase: 'prepare', encounter: boss, combat: undefined } : advanceDay(state);
}
export function endDay(state: CampaignState): Outcome {
  if (state.phase !== 'hub') return outcome(state, 'Resuelve el encuentro pendiente.', false);
  if (state.day % 2 === 0) return outcome({ ...state, phase: 'debt', encounter: makeDebt(state) }, 'Llegó el cobrador. Paga o defiende el puesto.');
  const boss = makeBoss(state);
  return boss ? outcome({ ...state, phase: 'prepare', encounter: boss }, `${boss.name} espera en el ring. Prepara tu estilo.`)
    : outcome(advanceDay(state), 'Nuevo día: revisa precios, entrena y cuida tu energía.');
}
export function payDebt(state: CampaignState): Outcome {
  if (state.phase !== 'debt' || state.encounter?.kind !== 'debt') return outcome(state, 'No hay cobro pendiente.', false);
  if (state.coins < state.encounter.amount) return outcome(state, 'No alcanza. Defiende el puesto en combate.', false);
  return outcome(afterDebt({ ...state, coins: state.coins - state.encounter.amount }), `Pagas $${state.encounter.amount}. El cobrador se retira.`);
}
export function startBattle(state: CampaignState): Outcome {
  if (!['debt', 'prepare'].includes(state.phase) || !state.encounter) return outcome(state, 'No hay rival preparado.', false);
  const derived = deriveStats(state);
  const fighter = (hp: number, maxHp: number, stamina: number, nextAttack: number): Fighter => ({ hp, maxHp, stamina, maxStamina: stamina, nextAttack, burn: 0, guard: 0 });
  return outcome({ ...state, phase: 'fight', combat: {
    player: { ...fighter(Math.max(1, state.hp), derived.maxHp, derived.maxStamina, 800), stamina: derived.maxStamina * (0.55 + state.energy * 0.045) },
    enemy: fighter(state.encounter.hp, state.encounter.hp, 12, 1200), elapsedMs: 0, accumulatorMs: 0,
    playerAttacks: 0, enemyAttacks: 0, eventSerial: 0, log: ['La preparación decide. Las habilidades se activan solas.'], events: [],
  } }, '¡Campana! El combate es automático.');
}
function event(combat: CombatState, side: Side, kind: BattleEvent['kind'], amount: number, label: string) {
  combat.eventSerial += 1;
  combat.events.push({ id: combat.eventSerial, side, kind, amount, label });
  combat.events = combat.events.slice(-16);
  combat.log = [...combat.log, label].slice(-5);
}
function playerAttack(state: CampaignState, derived: ReturnType<typeof deriveStats>) {
  const c = state.combat!;
  const n = c.playerAttacks + 1;
  const skills = SKILLS.filter(s => state.equipped.includes(s.id) && state.learned.includes(s.id)
    && state.stats[s.stat] >= s.minimum && n % (s.tier * 2) === 0);
  const topTier = Math.max(0, ...skills.map(s => s.tier));
  const candidates = skills.filter(s => s.tier === topTier);
  // Same-tier skills rotate; equipping several roots must not silently disable two.
  const skill = candidates.length ? candidates[(Math.floor(n / 2) - 1) % candidates.length] : undefined;
  const cost = AJUSTES.attackCost + (skill ? skill.tier * 0.6 : 0);
  if (c.player.stamina < cost) {
    c.player.nextAttack = c.elapsedMs + AJUSTES.recoveryMs;
    event(c, 'player', 'recover', 0, 'Patata recupera el aliento.'); return;
  }
  c.playerAttacks = n; c.player.stamina -= cost;
  let damage = derived.damage;
  c.player.nextAttack = c.elapsedMs + derived.intervalMs;
  state.heat = Math.min(100, state.heat + AJUSTES.heatPerAttack);
  if (skill) {
    if (skill.style === 'flame') {
      damage += [0, 2, 4, 7][skill.tier]; c.enemy.burn = 3000;
      if (skill.tier === 2) state.heat = Math.min(100, state.heat + 10);
      if (skill.tier === 3 && state.heat >= 85) damage += 2;
    } else if (skill.style === 'ember') {
      damage += [0, 2, 4, 6][skill.tier];
      if (skill.tier === 1) c.player.stamina = Math.min(c.player.maxStamina, c.player.stamina + 1);
      if (skill.tier === 2) c.player.nextAttack -= 300;
      if (skill.tier === 3) c.player.guard = 4;
    } else {
      damage += [0, 1, 3, 6][skill.tier];
      c.player.guard = skill.tier === 1 ? 2 : 4;
      if (skill.tier === 3) c.player.hp = Math.min(c.player.maxHp, c.player.hp + 3);
    }
    event(c, 'player', 'skill', damage, skill.name);
  }
  if (state.encounter?.bossId === 'remolacha' && c.enemyAttacks % 3 === 2) {
    damage = Math.max(1, damage - 2); event(c, 'enemy', 'block', 2, 'La guardia de Remolacha absorbe 2 daño.');
  }
  c.enemy.hp = Math.max(0, c.enemy.hp - damage);
  event(c, 'player', 'hit', damage, `Patata golpea: ${damage.toFixed(1)}.`);
  if (state.heat >= AJUSTES.heatThreshold) {
    c.player.hp = Math.max(0, c.player.hp - 1);
    event(c, 'enemy', 'burn', 1, 'El exceso de calor quema a Patata.');
  }
}
function enemyAttack(state: CampaignState, derived: ReturnType<typeof deriveStats>) {
  const c = state.combat!; const encounter = state.encounter!;
  if (c.enemy.stamina < AJUSTES.attackCost) {
    c.enemy.nextAttack = c.elapsedMs + AJUSTES.recoveryMs;
    event(c, 'enemy', 'recover', 0, `${encounter.name} recupera el aliento.`); return;
  }
  c.enemy.stamina -= AJUSTES.attackCost;
  c.enemyAttacks += 1;
  const phaseTwo = encounter.kind === 'boss' && c.enemy.hp <= c.enemy.maxHp / 2;
  c.enemy.nextAttack = c.elapsedMs + encounter.intervalMs - (phaseTwo ? 150 : 0);
  if (c.enemyAttacks % derived.dodgeEvery === 0) { event(c, 'player', 'block', 0, 'Patata esquiva.'); return; }
  let damage = encounter.damage;
  if (encounter.kind === 'boss' && encounter.bossId === 'rabano' && c.enemyAttacks % 3 === 0) damage += 2;
  if (encounter.kind === 'boss' && encounter.bossId === 'batata' && phaseTwo) damage += 1;
  const guard = derived.guard + c.player.guard;
  damage = Math.max(0.6, damage - guard); c.player.guard = 0;
  c.player.hp = Math.max(0, c.player.hp - damage);
  event(c, 'enemy', 'hit', damage, `${encounter.name}: ${damage.toFixed(1)} daño.`);
}
export function tickBattle(state: CampaignState, deltaMs: number): CampaignState {
  if (state.phase !== 'fight' || !state.combat || !state.encounter || !Number.isFinite(deltaMs) || deltaMs <= 0) return state;
  const next = copy(state); const c = next.combat!; const derived = deriveStats(next);
  c.accumulatorMs += Math.min(AJUSTES.battleLimitMs, deltaMs);
  while (c.accumulatorMs >= AJUSTES.battleStepMs && !c.winner) {
    c.accumulatorMs -= AJUSTES.battleStepMs; c.elapsedMs += AJUSTES.battleStepMs;
    c.player.stamina = Math.min(c.player.maxStamina, c.player.stamina + (AJUSTES.staminaRegen + next.stats.resistance * 0.12) * 0.1);
    c.enemy.stamina = Math.min(c.enemy.maxStamina, c.enemy.stamina + 0.2);
    next.heat = Math.max(0, next.heat - AJUSTES.heatDecay * 0.1);
    if (c.enemy.burn > 0) {
      c.enemy.burn = Math.max(0, c.enemy.burn - AJUSTES.battleStepMs);
      if (c.elapsedMs % 1000 === 0) { c.enemy.hp = Math.max(0, c.enemy.hp - 1); event(c, 'player', 'burn', 1, 'Quemadura: 1 daño.'); }
    }
    if (c.player.hp > 0 && c.enemy.hp > 0 && c.elapsedMs >= c.player.nextAttack) playerAttack(next, derived);
    if (c.player.hp > 0 && c.enemy.hp > 0 && c.elapsedMs >= c.enemy.nextAttack) enemyAttack(next, derived);
    if (c.enemy.hp <= 0 || c.player.hp <= 0) c.winner = c.enemy.hp <= 0 && c.player.hp > 0 ? 'player' : 'enemy';
    if (!c.winner && c.elapsedMs >= AJUSTES.battleLimitMs) {
      c.winner = c.player.hp / c.player.maxHp >= c.enemy.hp / c.enemy.maxHp ? 'player' : 'enemy';
      event(c, c.winner, 'block', 0, 'Tiempo: gana quien conserva mayor porcentaje de vida; empate para Patata.');
    }
  }
  next.hp = c.player.hp;
  if (c.winner) { next.phase = 'result'; next.message = c.winner === 'player' ? 'Victoria. Tu preparación dio resultado.' : 'Derrota. El puesto sigue abierto: puedes seguir entrenando.'; }
  return next;
}
export function settleBattle(state: CampaignState): Outcome {
  if (state.phase !== 'result' || !state.combat?.winner || !state.encounter) return outcome(state, 'El combate aún no ha terminado.', false);
  const next = copy(state); const won = next.combat!.winner === 'player'; const encounter = next.encounter!;
  next.xp += won ? (encounter.kind === 'boss' ? 8 : 3) : 2;
  if (won) {
    next.coins += encounter.reward;
    if (encounter.kind === 'boss') next.bossWins = [...new Set([...next.bossWins, encounter.bossId])];
  } else {
    next.coins = Math.max(0, next.coins - Math.min(next.coins, encounter.amount || 6));
    next.hp = Math.max(next.hp, Math.ceil(next.maxHp * 0.55));
  }
  next.energy = Math.max(3, next.energy - 2);
  const advanced = encounter.kind === 'debt' ? afterDebt(next) : advanceDay(next);
  return outcome(advanced, won ? `Victoria: +$${encounter.reward} y experiencia.` : 'El barrio te recoge. Pierdes algunas monedas, conservas tu progreso y continúas.');
}

const record = (value: unknown): Record<string, unknown> | null => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
const number = (value: unknown, fallback: number, min: number, max: number, integer = true) => typeof value === 'number' && Number.isFinite(value) ? clamp(integer ? Math.floor(value) : value, min, max) : fallback;
function numericRecord<T extends string>(raw: unknown, ids: T[], fallback: Numbers<T>, min: number, max: number): Numbers<T> {
  const source = record(raw);
  return Object.fromEntries(ids.map(id => [id, number(source?.[id], fallback[id], min, max)])) as Numbers<T>;
}
function strings(raw: unknown, allowed: string[], limit = 30): string[] {
  return Array.isArray(raw) ? [...new Set(raw.filter((v): v is string => typeof v === 'string' && allowed.includes(v)))].slice(0, limit) : [];
}
/** Los valores derivados, rivales y requisitos se reconstruyen; nunca se confía en objetos del JSON. */
export function restoreCampaign(raw: unknown): CampaignState | null {
  const source = record(raw);
  if (!source || source.version !== 2 || (source.mode !== 'demo' && source.mode !== 'month')) return null;
  const mode = source.mode as CampaignMode; const base = newCampaign(mode);
  const next: CampaignState = {
    ...base, day: number(source.day, 1, 1, mode === 'demo' ? 3 : 30), slot: number(source.slot, 0, 0, 6),
    phase: PHASES.includes(source.phase as Phase) ? source.phase as Phase : 'hub',
    coins: number(source.coins, base.coins, 0, 10_000), stats: numericRecord(source.stats, STAT_IDS, base.stats, 2, 12),
    energy: number(source.energy, 10, 0, 10), heat: number(source.heat, 0, 0, 100, false), xp: number(source.xp, 0, 0, 1000),
    style: STYLE_IDS.includes(source.style as StyleId) ? source.style as StyleId : 'flame',
    inventory: numericRecord(source.inventory, PRODUCT_IDS, base.inventory, 0, 60),
    upgrades: numericRecord(source.upgrades, UPGRADE_IDS, base.upgrades, 0, 2), heart: number(source.heart, 0, 0, 10),
    bossWins: strings(source.bossWins, BOSSES.map(b => b.id)), trained: strings(source.trained, STAT_IDS, 3) as StatId[],
    neglect: numericRecord(source.neglect, STAT_IDS, base.neglect, 0, 2),
    sold: numericRecord(source.sold, PRODUCT_IDS, base.sold, 0, 9), message: 'Partida recuperada.',
  };
  next.maxHp = deriveStats(next).maxHp; next.hp = number(source.hp, next.maxHp, 0, next.maxHp, false);
  next.demand = dailyDemand(next.day, next.upgrades.stall);
  const capacity = inventoryCapacity(next); let used = 0;
  for (const id of PRODUCT_IDS) { next.inventory[id] = Math.min(next.inventory[id], capacity - used); used += next.inventory[id]; next.sold[id] = Math.min(next.sold[id], next.demand[id]); }
  next.learned = [...new Set([...base.learned, ...strings(source.learned, SKILLS.map(s => s.id))])];
  // Node order guarantees prerequisite validation without accepting an injected tier 3.
  next.learned = next.learned.filter(id => { const skill = SKILLS.find(s => s.id === id)!; return !skill.prerequisite || next.learned.includes(skill.prerequisite); });
  next.equipped = strings(source.equipped, next.learned, 3);
  if (next.phase === 'ending') {
    const finalDay = mode === 'demo' ? 3 : 30;
    if (next.day !== finalDay) return { ...next, phase: 'hub' };
    return advanceDay(next);
  }
  if (['debt', 'prepare', 'fight', 'result'].includes(next.phase)) {
    const storedEncounter = record(source.encounter);
    const encounter = storedEncounter?.kind === 'boss' ? makeBoss(next) : next.day % 2 === 0 ? makeDebt(next) : undefined;
    if (!encounter || storedEncounter?.id !== encounter.id) return { ...next, phase: 'hub' };
    next.encounter = encounter;
    if (next.phase === 'debt' && encounter.kind !== 'debt') next.phase = 'prepare';
    if (next.phase === 'prepare' && encounter.kind === 'debt') next.phase = 'debt';
    if (next.phase === 'fight' || next.phase === 'result') {
      const combat = record(source.combat); const player = record(combat?.player); const enemy = record(combat?.enemy);
      if (!combat || !player || !enemy) return { ...next, phase: encounter.kind === 'boss' ? 'prepare' : 'debt' };
      const elapsedMs = number(combat.elapsedMs, 0, 0, 60_000);
      const maxStamina = deriveStats(next).maxStamina;
      const fighter = (data: Record<string, unknown>, maxHp: number, stamina: number): Fighter => ({
        hp: number(data.hp, maxHp, 0, maxHp, false), maxHp, maxStamina: stamina,
        stamina: number(data.stamina, stamina, 0, stamina, false), nextAttack: number(data.nextAttack, elapsedMs + 800, elapsedMs, elapsedMs + 5000),
        burn: number(data.burn, 0, 0, 3000), guard: number(data.guard, 0, 0, 4, false),
      });
      next.combat = {
        player: fighter(player, next.maxHp, maxStamina), enemy: fighter(enemy, encounter.hp, 12), elapsedMs,
        accumulatorMs: number(combat.accumulatorMs, 0, 0, 60_000, false),
        playerAttacks: number(combat.playerAttacks, 0, 0, 500), enemyAttacks: number(combat.enemyAttacks, 0, 0, 500),
        eventSerial: number(combat.eventSerial, 0, 0, 10000), events: [], log: ['Combate recuperado.'],
      };
      if (next.phase === 'result') {
        const c = next.combat;
        if (c.player.hp <= 0 || c.enemy.hp <= 0) c.winner = c.enemy.hp <= 0 && c.player.hp > 0 ? 'player' : 'enemy';
        else if (c.elapsedMs >= AJUSTES.battleLimitMs) c.winner = c.player.hp / c.player.maxHp >= c.enemy.hp / c.enemy.maxHp ? 'player' : 'enemy';
        else next.phase = 'fight';
      }
      next.hp = next.combat.player.hp;
    }
  }
  return next;
}
