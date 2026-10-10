import assert from 'node:assert/strict';
import { applyAction, chooseStyle, deriveStats, endDay, equipSkill, learnSkill, marketPrices, newCampaign,
  nextEvent, payDebt, restoreCampaign, settleBattle, startBattle, tickBattle, SKILLS } from '../src/mes/modelo.ts';

const checks = [];
function verify(name, run) { run(); checks.push(name); }
verify('La agenda no inventa cobros después del último día de la demo', () => {
  const state = newCampaign('demo');
  state.day = 3;
  assert.ok(nextEvent(state).includes('No quedan cobros.'));
  assert.ok(nextEvent(state).includes('día 3'));
  assert.ok(!nextEvent(state).includes('Cobro: día 3'));
});
function prepared(style, stats, day = 3, mode = 'demo') {
  let state = newCampaign(mode);
  state.stats = { strength: stats, agility: stats, resistance: stats };
  state.style = style;
  state.maxHp = deriveStats(state).maxHp;
  state.hp = state.maxHp;
  state.xp = 100;
  for (const skill of SKILLS.filter(skill => skill.style === style)) state = learnSkill(state, skill.id).state;
  state.equipped = state.learned.filter(id => id.startsWith(style)).slice(0, 3);
  state.day = day;
  state = endDay(state).state;
  if (state.phase === 'debt' && day !== 2) state = payDebt(state).state;
  return startBattle(state).state;
}
function simulate(initial) {
  let state = initial;
  for (let i = 0; i < 601 && state.phase === 'fight'; i++) state = tickBattle(state, 100);
  assert.equal(state.phase, 'result');
  assert.ok(state.combat.elapsedMs <= 60000);
  assert.ok(Number.isFinite(state.hp) && state.hp >= 0);
  return state;
}

verify('Las acciones son puras y las cantidades inválidas se rechazan', () => {
  const initial = newCampaign('demo');
  const before = JSON.stringify(initial);
  assert.ok(applyAction(initial, { type: 'sell', product: 'potato', quantity: 3 }).ok);
  assert.equal(JSON.stringify(initial), before);
  for (const quantity of [-3, 0, NaN, Infinity, 1.5]) {
    const result = applyAction(initial, { type: 'buy', product: 'tomato', quantity });
    assert.equal(result.ok, false);
    assert.equal(result.state.coins, initial.coins);
    assert.equal(result.state.slot, 0);
  }
});
verify('Demanda y franjas limitan ventas; no hay recursos negativos', () => {
  let state = newCampaign('month');
  state.inventory.potato = 30;
  const demand = marketPrices(state).potato.demand;
  for (let i = 0; i < 10; i++) state = applyAction(state, { type: 'sell', product: 'potato', quantity: 3 }).state;
  assert.ok(state.sold.potato <= demand);
  assert.ok(state.inventory.potato >= 0 && state.coins >= 0 && state.slot <= 6);
  const blocked = { ...state, slot: 6 };
  assert.equal(applyAction(blocked, { type: 'train', stat: 'strength' }).ok, false);
});
verify('El cobro se resuelve una vez; el día 14 conserva su jefe', () => {
  let state = newCampaign('month');
  state.day = 14;
  state = endDay(state).state;
  assert.equal(state.phase, 'debt');
  assert.equal(endDay(state).ok, false);
  state = payDebt(state).state;
  assert.equal(state.day, 14);
  assert.equal(state.phase, 'prepare');
  assert.equal(state.encounter.bossId, 'rabano');
  assert.equal(payDebt(state).ok, false);
});
verify('Sin dinero se puede combatir y una derrota no bloquea el día siguiente', () => {
  let state = newCampaign('demo');
  state.day = 2; state.coins = 0; state.hp = 1;
  state = endDay(state).state;
  assert.equal(payDebt(state).ok, false);
  state = simulate(startBattle(state).state);
  assert.equal(state.combat.winner, 'enemy');
  state = settleBattle(state).state;
  assert.equal(state.day, 3);
  assert.equal(state.phase, 'hub');
  assert.ok(state.hp > 0 && state.coins >= 0);
});
verify('Aprender respeta atributos y prerrequisitos; el plan admite tres técnicas', () => {
  let state = newCampaign('demo');
  state.xp = 100;
  assert.equal(learnSkill(state, 'flame-3').ok, false);
  for (const id of ['ember-1', 'stone-1']) state = equipSkill(state, id).state;
  assert.equal(state.equipped.length, 3);
  assert.equal(equipSkill(state, 'flame-2').ok, false);
  state = chooseStyle(state, 'stone').state;
  assert.equal(state.style, 'stone');
});
verify('Guardar y recuperar conserva exactamente el siguiente intercambio', () => {
  const mid = tickBattle(prepared('ember', 4), 2354.7);
  const restored = restoreCampaign(JSON.parse(JSON.stringify(mid)));
  assert.ok(restored);
  const a = tickBattle(mid, 2345.8);
  const b = tickBattle(restored, 2345.8);
  assert.deepEqual(a.combat.player, b.combat.player);
  assert.deepEqual(a.combat.enemy, b.combat.enemy);
  assert.equal(a.combat.playerAttacks, b.combat.playerAttacks);
  assert.equal(a.combat.enemyAttacks, b.combat.enemyAttacks);
  assert.equal(a.heat, b.heat);
});
verify('Guardados inválidos se rechazan y campos numéricos hostiles se saneean', () => {
  for (const value of [null, [], 'texto', { version: 2, mode: 'otro' }]) assert.equal(restoreCampaign(value), null);
  const state = restoreCampaign({ ...newCampaign('month'), coins: Infinity, stats: { strength: NaN, agility: -10, resistance: 999 },
    inventory: { potato: 10000, tomato: 10000, carrot: 10000 }, equipped: ['x', 'x'], phase: 'luna' });
  assert.ok(state && Number.isFinite(state.coins));
  assert.ok(state.stats.strength >= 2 && state.stats.agility >= 2 && state.stats.resistance <= 12);
  assert.ok(Object.values(state.inventory).reduce((a, b) => a + b, 0) <= 30);
  assert.equal(state.phase, 'hub');
});

const balance = [];
for (const style of ['flame', 'ember', 'stone']) {
  for (const stats of [2, 4]) {
    const state = simulate(prepared(style, stats));
    balance.push({ mode: 'demo', style, stats, winner: state.combat.winner, seconds: state.combat.elapsedMs / 1000, hp: Number(state.hp.toFixed(1)) });
    if (stats === 4) assert.equal(state.combat.winner, 'player', `${style}: la preparación debe poder superar la demo`);
  }
}
console.log(JSON.stringify({ checksPassed: checks.length, checks, balance }, null, 2));
