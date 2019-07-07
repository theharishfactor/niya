function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
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