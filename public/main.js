function getBetAmount() {
  return Number(document.querySelector('.bet-amount').innerHTML);
}

function getPendingSquare() {
  return Number(document.querySelector('.pending-square').innerHTML);
}

function addChips(e) {
  const betAmount = Number(e.target.getAttribute('data-value'));

  document.querySelector('.bet-amount').innerHTML = getBetAmount() + betAmount;
}

function selectSquare(e) {
  const square = Number(e.target.innerHTML);
  const color = e.target.dataset.value;
  const betAmount = getBetAmount();
  const selectionText = `You have a pending bet for ${betAmount} on ${color} ${square}`;

  document.querySelector('.pending-square').innerHTML = square;
  document.querySelector('.player-selection').innerHTML = selectionText;
}

function onSubmitBet() {
  const betAmount = getBetAmount();
  const square = getPendingSquare();

  if (!square) {
    alert('A square needs to be selected');
    return;
  }

  if (!betAmount) {
    alert('A bet greater than 0 must be made');
    return;
  }

  fetch('bets', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      betAmount,
      square,
    }),
  }).then(function () {
    window.location.reload();
  });
}

function onResetBet() {
  document.querySelector('.pending-square').innerHTML = 'Not yet selected';
  document.querySelector('.bet-amount').innerHTML = 0;
  document.querySelector('.player-selection').innerHTML = '';
}

document.querySelector('#submit-bet').addEventListener('click', onSubmitBet);
document.querySelector('#reset-bet').addEventListener('click', onResetBet);

document.querySelectorAll('.num').forEach((element) => {
  element.addEventListener('click', selectSquare);
});

document.querySelectorAll('.pokerchips').forEach((element) => {
  element.addEventListener('click', addChips);
});
