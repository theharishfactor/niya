function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function removeLastPlayedClass() {
  const list = document.getElementsByClassName('lastPlayed');
  for (let i=0; i<list.length; i++) {
    list[i].classList.remove('lastPlayed');
  }
}

function modifyClickedTile(id, playedBy) {
  const tileEl = document.getElementById(id);
  tileEl.className = `${tileEl.className} ${playedBy}Covered lastPlayed`;
  document.getElementById('lastClicked').style.backgroundImage = `${tileEl.style.backgroundImage}`;
  document.getElementById('lastClickedPanel').style.display = 'block';
  tileEl.style.pointerEvents = 'none';
}

function setContent(divName, html) {
  const el = document.getElementsByClassName(divName);
  el.innerHTML = html;
}

function show(divName) {
  document.getElementById(divName).style.display = 'block';
}

function hide(divName) {
  document.getElementById(divName).style.display = 'none';
}

function getInputVaue(divName) {
  const el = document.getElementById(divName);
  return el.value;
}