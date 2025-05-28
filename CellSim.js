const specific = document.querySelector('.specific');
const 핵 = document.querySelector('.핵');
const 소포체 = document.querySelector('.소포체');
const 골지체 = document.querySelector('.골지체');
const 리보솜 = document.querySelector('.리보솜');
const 미토콘드리아 = document.querySelector('.미토콘드리아');
const 리소좀 = document.querySelector('.리소좀');

let state = {
    glucose: 100,
    energy: 70
};

let choose;

function updateUI(){
    document.getElementById('glucose').textContent = state.glucose;
    document.getElementById('energy-bar').style.width = state.energy + '%';
    document.getElementById('energy-text').textContent = state.energy + '%';

    switch (choose){
        case 'nucleus':
            specific.textContent = '핵';
            break;
        case 'endoplasmicReticulum':
            specific.textContent = '소포체';
            break;
        case 'golgiApparatus':
            specific.textContent = '골지체';
            break;
        case 'ribosome':
            specific.textContent = '리보솜';
            break;
        case 'mitochondria':
            specific.textContent = '미토콘드리아';
            break;
        case 'lysosome':
            specific.textContent = '리소좀';
            break;
        default:
            specific.textContent = '선택 안 함';
            break;
    }
}


function nucleus(){
    choose = 'nucleus';
    핵.classList.toggle('active');
    updateUI()
}

function endoplasmicReticulum(){
    choose = 'endoplasmicReticulum';
    소포체.classList.toggle('active');
    updateUI()
}

function golgiApparatus(){
    choose = 'golgiApparatus';
    골지체.classList.toggle('active');
    updateUI()
}

function ribosome(){
    choose = 'ribosome';
    리보솜.classList.toggle('active');
    updateUI()
}

function mitochondria(){
    choose = 'mitochondria';
    미토콘드리아.classList.toggle('active');
    updateUI()
}

function lysosome(){
    choose = 'lysosome';
    리소좀.classList.toggle('active');
    updateUI()
}

updateUI();