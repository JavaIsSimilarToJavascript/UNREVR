const specific = document.querySelector('.specific');
const btns = document.querySelector('.btns');
let btnClicked = false;

btns.addEventListener('click',()=>{
  if (!btnClicked){
    document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    specific.textContent = '선택 안 함';
  }
  btnClicked = false;
})

let state = {
  glucose: 100,
  energy: 70
};

let choose;

function updateUI() {
  document.getElementById('glucose').textContent = state.glucose;
  document.getElementById('energy-bar').style.width = state.energy + '%';
  document.getElementById('energy-text').textContent = state.energy + '%';

  switch (choose) {
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

function selectOrganelle(name) {
  choose = name;

  document.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
  const button = document.querySelector(`button[onclick="selectOrganelle('${name}')"]`);
  if (button) button.classList.add('active');
  btnClicked = true;
  updateUI();
}

updateUI();