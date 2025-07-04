const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const atpDisplay = document.getElementById('atp');
const healthDisplay = document.getElementById('health');
const waveDisplay = document.getElementById('wave');
const basicBtn = document.getElementById('basicBtn');
const neuronBtn = document.getElementById('neuronBtn');
const plantBtn = document.getElementById('plantBtn');

// === 게임 상태 변수 ===
let ATP = 200;       
let health = 5;
let wave = 1;
let waveInProgress = false;
let enemiesToSpawn = 0;
let enemiesSpawned = 0;
let spawnInterval = null;
const cells = [];
const enemies = [];
const projectiles = [];
let selectedCell = null;

// === 적 타입 데이터 ===
const enemyTypes = [
  { hp: 40, speed: 1.3, color: '#d22', size: 20 },
  { hp: 60, speed: 0.7, color: '#720072', size: 30 },
  { hp: 50, speed: 1.0, color: '#ff6', size: 25 },
  { hp: 70, speed: 0.5, color: '#339933', size: 35 },
  { hp: 30, speed: 2.0, color: '#3399cc', size: 15 },
];
const cellTypes = {
  basic: { damage: 10, range: 80, cooldownMax: 40, color: 'cyan', cost: 50, projectileSpeed: 10},
  neuron: { damage: 6, range: 120, cooldownMax: 100, color: 'yellow', cost: 80},
  plant: { hp: 200, color: '#4caf50', cost: 60 }
};
let enemiesKilled = 0;

// === UI 버튼 ===
function updateUIButtons() {
  basicBtn.disabled = ATP < 50;
  neuronBtn.disabled = ATP < 80;
  plantBtn.disabled = ATP < 60;
}
function selectCell(type) {
  selectedCell = type;
  basicBtn.style.background = (type === 'basic') ? '#0c0' : '#0f0';
  neuronBtn.style.background = (type === 'neuron') ? '#0c0' : '#0f0';
  plantBtn.style.background = (type === 'plant') ? '#0c0' : '#0f0';
}
basicBtn.addEventListener('click', () => selectCell('basic'));
neuronBtn.addEventListener('click', () => selectCell('neuron'));
plantBtn.addEventListener('click', () => selectCell('plant'));

// === 웨이브 시스템 ===
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
  enemies.push({
    x: 0,
    y: 300,
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
      alert('축하합니다! 모든 웨이브를 클리어했습니다!');
    }
  }
}

// === ATP 지급량 감소 (조절 주석) ===
setInterval(() => {
  ATP += Math.floor(cells.length * 3); // 지급량 줄임 (원래 5 -> 3)
  atpDisplay.textContent = ATP;
  updateUIButtons();
}, 1000);

// === 세포 배치 ===
canvas.addEventListener('click', (e) => {
  if (!selectedCell) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let cost = cellTypes[selectedCell].cost;
  if (ATP < cost) return;
  if (selectedCell === 'plant') {
    if (y < 280 || y > 320) {
      alert('식물 세포는 적이 지나가는 라인에만 설치 가능합니다.');
      return;
    }
  } else {
    if (y >= 280 && y <= 320) {
      alert('적이 지나가는 라인에는 설치할 수 없습니다.');
      return;
    }
  }
  let cell = { x, y, type: selectedCell, cooldown: 0, hp: cellTypes[selectedCell].hp };
  if (selectedCell === 'plant') {
    cell.hp = cellTypes.plant.hp;
    cell.width = 40;
    cell.height = 60;
  }
  cells.push(cell);
  ATP -= cost;
  atpDisplay.textContent = ATP;
  selectedCell = null;
  basicBtn.style.background = '#0f0';
  neuronBtn.style.background = '#0f0';
  plantBtn.style.background = '#0f0';
  updateUIButtons();
});

// === 게임 루프 ===
function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(800, 300);
  ctx.stroke();

  // === 세포 그리기 ===
  cells.forEach(cell => {
    if (cell.type === 'plant') {
      ctx.fillStyle = cellTypes.plant.color;
      ctx.fillRect(cell.x - cell.width/2, cell.y - cell.height/2, cell.width, cell.height);
      ctx.strokeStyle = '#070';
      ctx.lineWidth = 3;
      ctx.strokeRect(cell.x - cell.width/2, cell.y - cell.height/2, cell.width, cell.height);
      drawHealthBar(cell.x - cell.width/2, cell.y - cell.height/2 - 10, cell.width, 6, cell.hp, cellTypes.plant.hp);
    } else {
      ctx.fillStyle = cellTypes[cell.type].color;
      ctx.beginPath();
      ctx.arc(cell.x, cell.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (cell.hp) drawHealthBar(cell.x - 20, cell.y - 35, 40, 6, cell.hp, cellTypes[cell.type].hp);
    }
  });

  // === 세포 공격 ===
  cells.forEach(cell => {
    if (cell.type === 'plant') return;
    const ctype = cellTypes[cell.type];
    if (cell.cooldown > 0) {
      cell.cooldown--;
      return;
    }
    if (cell.type === 'basic') {
      let target = null;
      let minDist = Infinity;
      enemies.forEach(e => {
        const dx = e.x - cell.x;
        const dy = e.y - cell.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist <= ctype.range && dist < minDist) {
          minDist = dist;
          target = e;
        }
      });
      if (target) {
        projectiles.push({ x: cell.x, y: cell.y, target: target, damage: ctype.damage, speed: ctype.projectileSpeed });
        cell.cooldown = ctype.cooldownMax;
      }
    } else if (cell.type === 'neuron') {
      const targets = enemies.filter(e => Math.hypot(e.x - cell.x, e.y - cell.y) <= ctype.range);
      if (targets.length > 0) {
        targets.forEach(t => t.hp -= ctype.damage);
        cell.arcTargets = targets;
        cell.cooldown = ctype.cooldownMax;
      }
    }
  });

  // === 적 이동 및 세포 충돌 ===
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
  });

  // === 투사체 ===
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

  // === 적 제거 및 health 감소 ===
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      enemies.splice(i, 1);
      enemiesKilled++;
    } else if (enemies[i].x > 800) {
      health--;
      healthDisplay.textContent = health;
      enemies.splice(i, 1);
      if (health <= 0) {
        alert('게임 종료! 세포가 모두 파괴되었습니다.');
        window.location.reload();
      }
    }
  }

  // === 웨이브 클리어 ===
  checkWaveClear();
  requestAnimationFrame(loop);
}
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

// === 시작 ===
updateUIButtons();
waveDisplay.textContent = wave;
startWave();
loop();