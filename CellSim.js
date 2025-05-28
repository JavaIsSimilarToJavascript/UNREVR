let state = {
    glucose: 100,
    energy: 70
};

function updateUI() {
    document.getElementById('glucose').textContent = state.glucose;
    document.getElementById('amino').textContent = state.amino;
    document.getElementById('lipid').textContent = state.lipid;
    document.getElementById('energy-bar').style.width = state.energy + '%';
    document.getElementById('energy-text').textContent = state.energy + '%';
}

function synthesizeProtein() {
    if (state.amino >= 10 && state.energy >= 10) {
    state.amino -= 10;
    state.energy -= 10;
    alert('단백질 합성 성공!');
    } else {
    alert('자원이 부족합니다.');
    }
    updateUI();
}

function cellDivision() {
    if (state.energy >= 40) {
    state.energy -= 40;
    alert('세포가 분열했습니다!');
    const newCell = document.createElement('div');
    newCell.className = 'absolute w-6 h-6 bg-green-400 rounded-full animate-ping';
    newCell.style.left = Math.random() * 80 + '%';
    newCell.style.top = Math.random() * 80 + '%';
    document.querySelector('.h-72').appendChild(newCell);
    setTimeout(() => newCell.remove(), 1000);
    } else {
    alert('에너지가 부족합니다.');
    }
    updateUI();
}

function defendCell() {
    if (state.energy >= 20 && state.lipid >= 10) {
    state.energy -= 20;
    state.lipid -= 10;
    alert('방어 성공!');
    } else {
    alert('자원이 부족합니다.');
    }
    updateUI();
}

function generateResource() {
    state.glucose += 10;
    state.amino += 5;
    state.lipid += 5;
    state.energy += 5;
    if (state.energy > 100) state.energy = 100;
    alert('재화가 생성되었습니다!');
    updateUI();
}

updateUI();