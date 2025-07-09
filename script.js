// === 전체 수정된 JavaScript 코드 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const atpDisplay = document.getElementById('atp');
const healthDisplay = document.getElementById('health');
const waveDisplay = document.getElementById('wave');
const basicBtn = document.getElementById('basicBtn');
const neuronBtn = document.getElementById('neuronBtn');
const plantBtn = document.getElementById('plantBtn');
const upgradeBtn = document.getElementById('upgradeBtn');

let ATP = 200;
let health = 5;
let wave = 1;
let waveInProgress = false;
let enemiesToSpawn = 0;
let enemiesSpawned = 0;
let spawnInterval = null;
let selectedCell = null;
let selectedUpgradeTarget = null;
const lines = [200, 400];
const cells = [];
const enemies = [];
const projectiles = [];

const baseCellTypes = {
  basic: { damage: 5, range: 60, cooldownMax: 50, cost: 50, projectileSpeed: 8 },
  neuron: { damage: 3, range: 100, cooldownMax: 120, cost: 80 },
  plant: { hp: 150, cost: 60 }
};

const enemyTypes = [
  { hp: 30, speed: 1.0, color: '#d22', size: 20 },
  { hp: 45, speed: 0.7, color: '#720072', size: 30 },
  { hp: 35, speed: 0.9, color: '#ff6', size: 25 }
];

function updateUIButtons() {
  basicBtn.disabled = ATP < 50;
  neuronBtn.disabled = ATP < 80;
  plantBtn.disabled = ATP < 60;
  upgradeBtn.disabled = !selectedUpgradeTarget || ATP < 50;
}

function selectCell(type) {
  selectedCell = type;
  selectedUpgradeTarget = null;
  [basicBtn, neuronBtn, plantBtn].forEach(btn => btn.style.background = '#0f0');
  if (type === 'basic') basicBtn.style.background = '#0c0';
  if (type === 'neuron') neuronBtn.style.background = '#0c0';
  if (type === 'plant') plantBtn.style.background = '#0c0';
  updateUIButtons();
}

basicBtn.addEventListener('click', () => selectCell('basic'));
neuronBtn.addEventListener('click', () => selectCell('neuron'));
plantBtn.addEventListener('click', () => selectCell('plant'));

upgradeBtn.addEventListener('click', () => {
  if (!selectedUpgradeTarget || ATP < 50) return;
  ATP -= 50;
  selectedUpgradeTarget.upgrade = (selectedUpgradeTarget.upgrade || 0) + 1;
  const u = selectedUpgradeTarget.upgrade;

  if (selectedUpgradeTarget.type === 'basic') {
    selectedUpgradeTarget.damage = baseCellTypes.basic.damage + u * 2;
    selectedUpgradeTarget.range = baseCellTypes.basic.range + u * 10;
  } else if (selectedUpgradeTarget.type === 'neuron') {
    selectedUpgradeTarget.damage = baseCellTypes.neuron.damage + u * 1.5;
    selectedUpgradeTarget.range = baseCellTypes.neuron.range + u * 8;
  } else if (selectedUpgradeTarget.type === 'plant') {
    selectedUpgradeTarget.hp += 30;
  }

  atpDisplay.textContent = ATP;
  updateUIButtons();
});

function drawEnemyStats(e) {
  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.fillText(`HP:${Math.round(e.hp)}`, e.x - 15, e.y - e.size - 18);
  ctx.fillText(`DMG:${e.damageToCell}`, e.x - 15, e.y - e.size - 6);
}

function startWave() {
  waveInProgress = true;
  enemiesSpawned = 0;
  enemiesToSpawn = 5 + wave * 2;
  spawnInterval = setInterval(spawnEnemy, Math.max(2000 - wave * 150, 500));
}

function spawnEnemy() {
  if (enemiesSpawned >= enemiesToSpawn) {
    clearInterval(spawnInterval);
    waveInProgress = false;
    return;
  }
  enemiesSpawned++;
  const base = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const yLine = lines[Math.floor(Math.random() * lines.length)];
  enemies.push({
    x: 0,
    y: yLine,
    hp: base.hp + wave * 5,
    maxHp: base.hp + wave * 5,
    damageToCell: 1 + Math.floor(wave / 3),
    speed: base.speed + wave * 0.05,
    color: base.color,
    size: base.size,
    blocked: false,
    blockTimer: 0
  });
}

function checkWaveClear() {
  if (!waveInProgress && enemies.length === 0) {
    if (wave < 10) {
      wave++;
      waveDisplay.textContent = wave;
      alert(`Wave ${wave} 시작!`);
      startWave();
    } else {
      alert('🎉 모든 웨이브 클리어!');
    }
  }
}

setInterval(() => {
  ATP += Math.floor(cells.length * 3);
  atpDisplay.textContent = ATP;
  updateUIButtons();
}, 1000);

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (selectedCell) {
    const cost = baseCellTypes[selectedCell].cost;
    if (ATP < cost) return;
    if (selectedCell === 'plant') {
      if (!lines.some(line => Math.abs(y - line) <= 20)) return;
    } else {
      if (lines.some(line => Math.abs(y - line) <= 20)) return;
    }
    const cell = {
      x, y, type: selectedCell, cooldown: 0, hp: baseCellTypes[selectedCell].hp,
      damage: baseCellTypes[selectedCell].damage,
      range: baseCellTypes[selectedCell].range,
      upgrade: 0
    };
    if (selectedCell === 'plant') {
      cell.width = 40;
      cell.height = 60;
    }
    cells.push(cell);
    ATP -= cost;
    atpDisplay.textContent = ATP;
    selectedCell = null;
    [basicBtn, neuronBtn, plantBtn].forEach(btn => btn.style.background = '#0f0');
    updateUIButtons();
    return;
  }

  for (const cell of cells) {
    const dx = x - cell.x;
    const dy = y - cell.y;
    if ((cell.type === 'plant' && Math.abs(dx) <= 20 && Math.abs(dy) <= 30) ||
        (cell.type !== 'plant' && Math.hypot(dx, dy) <= 20)) {
      selectedUpgradeTarget = cell;
      updateUIButtons();
      return;
    }
  }
  selectedUpgradeTarget = null;
  updateUIButtons();
});

function drawHealthBar(x, y, width, height, hp, maxHp) {
  ctx.fillStyle = 'black';
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = 'lime';
  ctx.fillRect(x, y, width * (hp / maxHp), height);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(x, y, width, height);
}

function drawElectricArc(x, y, targets) {
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 3;
  targets.forEach(t => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
  });
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 3;
  lines.forEach(y => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  });

  cells.forEach(cell => {
    if (cell.type === 'plant') {
      ctx.fillStyle = baseCellTypes.plant.color;
      ctx.fillRect(cell.x - cell.width/2, cell.y - cell.height/2, cell.width, cell.height);
    } else {
      ctx.fillStyle = cell.type === 'basic' ? 'cyan' : 'yellow';
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    drawHealthBar(cell.x - 20, cell.y - 35, 40, 6, cell.hp, baseCellTypes[cell.type].hp);
    if (cell.upgrade > 0) {
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`Lv.${cell.upgrade}`, cell.x - 12, cell.y + 30);
    }
  });

  cells.forEach(cell => {
    if (cell.type === 'plant') return;
    if (cell.cooldown > 0) {
      cell.cooldown--;
      return;
    }
    if (cell.type === 'basic') {
      let target = null;
      let minDist = Infinity;
      enemies.forEach(e => {
        const dist = Math.hypot(e.x - cell.x, e.y - cell.y);
        if (dist <= cell.range && dist < minDist) {
          minDist = dist;
          target = e;
        }
      });
      if (target) {
        projectiles.push({ x: cell.x, y: cell.y, target, damage: cell.damage, speed: baseCellTypes.basic.projectileSpeed });
        cell.cooldown = baseCellTypes.basic.cooldownMax;
      }
    } else if (cell.type === 'neuron') {
      const targets = enemies.filter(e => Math.hypot(e.x - cell.x, e.y - cell.y) <= cell.range);
      if (targets.length > 0) {
        targets.forEach(t => t.hp -= cell.damage);
        cell.arcTargets = targets;
        cell.cooldown = baseCellTypes.neuron.cooldownMax;
      }
    }
  });

  enemies.forEach(e => {
    if (!e.blocked) e.speedCurrent = e.speed;
    else {
      e.blockTimer--;
      if (e.blockTimer <= 0) {
        e.blocked = false;
        e.speedCurrent = e.speed;
      }
    }
    let blockedNow = false;
    for (const cell of cells) {
      const dx = Math.abs(e.x - cell.x);
      const dy = Math.abs(e.y - cell.y);
      if (cell.type === 'plant') {
        if (dx <= (cell.width/2 + e.size) && dy <= (cell.height/2 + e.size*0.6)) {
          e.blocked = true;
          e.blockTimer = 30;
          e.speedCurrent = 0;
          cell.hp -= e.damageToCell;
          if (cell.hp <= 0) cells.splice(cells.indexOf(cell), 1);
          blockedNow = true;
        }
      } else {
        if (Math.hypot(dx, dy) < 25) {
          cell.hp -= e.damageToCell;
          if (cell.hp <= 0) cells.splice(cells.indexOf(cell), 1);
        }
      }
    }
    if (!blockedNow) e.x += e.speedCurrent || e.speed;
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.ellipse(e.x, e.y, e.size, e.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();
    drawHealthBar(e.x - e.size, e.y - e.size - 10, e.size * 2, 6, e.hp, e.maxHp);
    drawEnemyStats(e);
  });

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (!p.target || p.target.hp <= 0) { projectiles.splice(i, 1); continue; }
    const dx = p.target.x - p.x;
    const dy = p.target.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < p.speed) {
      p.target.hp -= p.damage;
      projectiles.splice(i, 1);
    } else {
      p.x += (dx / dist) * p.speed;
      p.y += (dy / dist) * p.speed;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  cells.forEach(cell => {
    if (cell.type === 'neuron' && cell.arcTargets && cell.cooldown > 0) {
      drawElectricArc(cell.x, cell.y, cell.arcTargets);
      if (cell.cooldown === 1) cell.arcTargets = null;
    }
  });

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      enemies.splice(i, 1);
    } else if (enemies[i].x > 800) {
      health--;
      healthDisplay.textContent = health;
      enemies.splice(i, 1);
      if (health <= 0) {
        cancelAnimationFrame(loopId);
        alert('게임 종료!');
        return;
      }
    }
  }
  checkWaveClear();
  loopId = requestAnimationFrame(loop);
}

let loopId;
updateUIButtons();
waveDisplay.textContent = wave;
startWave();
loop();
