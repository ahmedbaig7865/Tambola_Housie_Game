const modeElements = document.querySelectorAll('.mode');
const playerInputs = document.getElementById('playerInputs');
const startBtn = document.getElementById('startBtn');
const gamePage = document.getElementById('gamePage');
const modeSelection = document.getElementById('modeSelection');
const calledNumbers = document.getElementById('calledNumbers');
const playersTickets = document.getElementById('playersTickets');
const numberList = document.getElementById('numberList');
const backBtn = document.getElementById('backBtn');
const winnersList = document.getElementById('winnersList');

let selectedMode = '';
let playerNames = [];
let remainingNumbers = [...Array(90).keys()].map(n => n + 1);
let computerTicket = null;
let ticketsData = [];
let winners = [];
let activePlayers = [];

modeElements.forEach(mode => {
  mode.addEventListener('click', () => {
    console.log('Mode clicked:', mode.dataset.mode);
    modeElements.forEach(m => m.classList.remove('selected'));
    mode.classList.add('selected');
    selectedMode = mode.dataset.mode;
    showInputsForMode(selectedMode);
  });
});

function showInputsForMode(mode) {
  console.log('Showing inputs for mode:', mode);
  playerInputs.innerHTML = '';
  startBtn.disabled = true;

  if (mode === 'solo' || mode === 'computer') {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter your name';
    nameInput.addEventListener('input', () => {
      const isFilled = nameInput.value.trim() !== '';
      console.log('Name input changed, isFilled:', isFilled);
      startBtn.disabled = !isFilled;
    });
    playerInputs.appendChild(nameInput);
  } else if (mode === 'friends') {
    const select = document.createElement('select');
    for (let i = 2; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} Players`;
      select.appendChild(option);
    }
    playerInputs.appendChild(select);

    const nameContainer = document.createElement('div');
    playerInputs.appendChild(nameContainer);

    select.addEventListener('change', () => {
      console.log('Number of players selected:', select.value);
      nameContainer.innerHTML = '';
      for (let i = 1; i <= select.value; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter name of Player ${i}`;
        input.required = true;
        input.addEventListener('input', () => {
          const allFilled = [...nameContainer.querySelectorAll('input')].every(inp => inp.value.trim() !== '');
          console.log('Friends mode inputs changed, allFilled:', allFilled);
          startBtn.disabled = !allFilled;
        });
        nameContainer.appendChild(input);
      }
      startBtn.disabled = true;
    });

    select.value = 2;
    select.dispatchEvent(new Event('change'));
  }
}

startBtn.addEventListener('click', () => {
  console.log('Start button clicked');
  console.log('Selected mode:', selectedMode);

  if (selectedMode === 'solo') {
    const name = playerInputs.querySelector('input').value.trim();
    playerNames = [name];
  } else if (selectedMode === 'computer') {
    const name = playerInputs.querySelector('input').value.trim();
    playerNames = [name, 'Computer'];
  } else {
    playerNames = [...playerInputs.querySelectorAll('input')].map(input => input.value.trim());
  }

  console.log('Player names:', playerNames);

  if (playerNames.length === 0 || playerNames.some(name => name === '')) {
    console.error('Player names are empty or invalid');
    alert('Please enter valid names for all players.');
    return;
  }

  modeSelection.style.display = 'none';
  gamePage.style.display = 'block';

  remainingNumbers = [...Array(90).keys()].map(n => n + 1);
  calledNumbers.innerHTML = '';
  playersTickets.innerHTML = '';
  numberList.innerHTML = '';
  winnersList.innerHTML = '';
  winnersList.style.display = 'none';
  computerTicket = null;
  ticketsData = [];
  winners = [];
  activePlayers = [...playerNames];

  console.log('Game state reset, generating UI elements');
  generateNumberList();
  generateTickets();
});

function callNumber() {
  console.log('Call Number button clicked');
  if (remainingNumbers.length === 0) {
    alert("All numbers have been called!");
    document.querySelectorAll('.call-number-btn').forEach(btn => btn.disabled = true);
    return;
  }
  const index = Math.floor(Math.random() * remainingNumbers.length);
  const number = remainingNumbers.splice(index, 1)[0];

  const span = document.createElement('span');
  span.textContent = number;
  calledNumbers.appendChild(span);

  markNumberAsCalled(number);
  speakNumber(number);

  if (selectedMode === 'computer' && computerTicket) {
    const computerTicketDiv = playersTickets.querySelector('.player-ticket-container:nth-child(2) .ticket');
    if (computerTicketDiv) {
      const flatTicket = computerTicket.flat();
      const cells = computerTicketDiv.querySelectorAll('.ticket-cell');
      cells.forEach((cell, idx) => {
        if (flatTicket[idx] === number) {
          cell.classList.add('crossed');
        }
      });
    }
  }

  checkForWinners();

  if (remainingNumbers.length === 0) {
    document.querySelectorAll('.call-number-btn').forEach(btn => btn.disabled = true);
  }
}

function resetGame() {
  console.log('Reset button clicked');
  
  calledNumbers.innerHTML = '';
  playersTickets.innerHTML = '';
  numberList.innerHTML = '';
  winnersList.innerHTML = '';
  winnersList.style.display = 'none';
  remainingNumbers = [...Array(90).keys()].map(n => n + 1);
  computerTicket = null;
  ticketsData = [];
  winners = [];
  activePlayers = [...playerNames];

  console.log('Game state reset, regenerating UI elements');
  generateNumberList();
  generateTickets();
}

backBtn.addEventListener('click', () => {
  console.log('Back button clicked');
  gamePage.style.display = 'none';
  modeSelection.style.display = 'block';
  
  calledNumbers.innerHTML = '';
  playersTickets.innerHTML = '';
  numberList.innerHTML = '';
  winnersList.innerHTML = '';
  winnersList.style.display = 'none';
  remainingNumbers = [...Array(90).keys()].map(n => n + 1);
  playerNames = [];
  selectedMode = '';
  computerTicket = null;
  ticketsData = [];
  winners = [];
  activePlayers = [];
  
  modeElements.forEach(m => m.classList.remove('selected'));
  showInputsForMode('solo');
});

function generateNumberList() {
  console.log('Generating number list');
  console.log('numberList element:', numberList);
  numberList.innerHTML = '';

  const ranges = [
    [1, 10],
    [11, 20],
    [21, 30],
    [31, 40],
    [41, 50],
    [51, 60],
    [61, 70],
    [71, 80],
    [81, 90],
  ];

  ranges.forEach(([start, end], rowIndex) => {
    console.log(`Generating row ${rowIndex + 1}: ${start} to ${end}`);
    const row = document.createElement('div');
    row.className = 'number-row';
    
    for (let i = start; i <= Math.min(end, 90); i++) {
      const cell = document.createElement('div');
      cell.className = 'number-cell';
      cell.textContent = i;
      cell.dataset.number = i;
      row.appendChild(cell);
      console.log(`Added number ${i} to row`);
    }
    
    numberList.appendChild(row);
    console.log(`Appended row ${rowIndex + 1} to numberList`);
  });

  console.log('Number list generated, numberList content:', numberList.innerHTML);
}

function generateTickets() {
  console.log('Starting generateTickets');
  console.log('playersTickets element:', playersTickets);
  playersTickets.innerHTML = '';
  ticketsData = [];

  console.log('Generating tickets for players:', playerNames);

  if (playerNames.length === 0) {
    console.error('No players to generate tickets for');
    return;
  }

  playerNames.forEach((name, index) => {
    console.log(`Creating ticket for ${name} (index: ${index})`);
    const container = document.createElement('div');
    container.classList.add('player-ticket-container');
    container.innerHTML = `<h3>${name}'s Ticket</h3>`;
    const ticket = generateTicket();
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket';

    ticketsData[index] = ticket;

    if (name === 'Computer') {
      computerTicket = ticket;
    }

    ticket.flat().forEach(num => {
      const cell = document.createElement('div');
      cell.className = 'ticket-cell';
      cell.textContent = num === 0 ? '' : num;
      ticketDiv.appendChild(cell);
    });

    container.appendChild(ticketDiv);
    playersTickets.appendChild(container);
    console.log(`Appended ticket container for ${name} to playersTickets`);
  });

  const callNumberBtn = document.createElement('button');
  callNumberBtn.className = 'call-number-btn';
  callNumberBtn.textContent = 'Call Number';
  playersTickets.appendChild(callNumberBtn);
  console.log('Added Call Number button after all tickets');

  const resetBtn = document.createElement('button');
  resetBtn.className = 'reset-btn';
  resetBtn.textContent = 'Reset';
  playersTickets.appendChild(resetBtn);
  console.log('Added Reset button after Call Number button');

  if (selectedMode === 'friends') {
    winnersList.style.display = 'block';
    winnersList.innerHTML = '<h3>Winners</h3><ul id="winnersListItems"></ul>';
  }

  console.log('Finished generateTickets, playersTickets content:', playersTickets.innerHTML);
}

function generateTicket() {
  console.log('Generating a ticket');
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(0));

  for (let row = 0; row < 3; row++) {
    let positions = [];
    while (positions.length < 5) {
      const pos = Math.floor(Math.random() * 9);
      if (!positions.includes(pos)) positions.push(pos);
    }
    positions.sort((a, b) => a - b);

    positions.forEach(pos => {
      let min = pos * 10 + 1;
      let max = (pos === 8) ? 90 : (pos + 1) * 10;
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (ticket.some(row => row.includes(num)));

      ticket[row][pos] = num;
    });
  }

  console.log('Generated ticket:', ticket);
  return ticket;
}

function markNumberAsCalled(number) {
  console.log(`Marking number ${number} as called`);
  const cell = numberList.querySelector(`.number-cell[data-number="${number}"]`);
  if (cell) {
    cell.classList.add('called');
    console.log(`Marked number ${number} as called`);
  } else {
    console.log(`Number ${number} not found in number list`);
  }
}

function triggerConfetti() {
  console.log('Triggering confetti animation');
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function checkForWinners() {
  console.log('Checking for winners');
  let gameEnded = false;

  ticketsData.forEach((ticket, playerIndex) => {
    if (gameEnded || winners.includes(playerIndex) || !activePlayers.includes(playerNames[playerIndex])) return;

    const ticketDiv = playersTickets.querySelectorAll('.player-ticket-container')[playerIndex];
    const cells = ticketDiv.querySelectorAll('.ticket-cell');
    const flatTicket = ticket.flat();
    const nonEmptyCells = flatTicket.filter(num => num !== 0).length;
    const crossedCells = Array.from(cells).filter(cell => cell.classList.contains('crossed')).length;

    if (crossedCells === nonEmptyCells) {
      winners.push(playerIndex);
      const position = winners.length;
      const positionText = getPositionText(position);

      ticketDiv.style.display = 'none';
      activePlayers = activePlayers.filter(name => name !== playerNames[playerIndex]);

      if (selectedMode === 'solo') {
        const gameMessage = document.createElement('div');
        gameMessage.className = 'game-message';
        gameMessage.textContent = 'Game Completed';
        playersTickets.appendChild(gameMessage);
        triggerConfetti();
        document.querySelectorAll('.call-number-btn').forEach(btn => btn.disabled = true);
        gameEnded = true;
      } else if (selectedMode === 'computer') {
        const gameMessage = document.createElement('div');
        gameMessage.className = 'game-message';
        gameMessage.textContent = playerIndex === 0 ? 'Player Wins!' : 'Computer Wins!';
        playersTickets.appendChild(gameMessage);
        triggerConfetti();
        document.querySelectorAll('.call-number-btn').forEach(btn => btn.disabled = true);
        gameEnded = true;
      } else if (selectedMode === 'friends') {
        const gameMessage = document.createElement('div');
        gameMessage.className = 'game-message';
        gameMessage.textContent = `${playerNames[playerIndex]} is the ${positionText} Winner!`;
        playersTickets.appendChild(gameMessage);
        triggerConfetti();

        const winnersListItems = document.getElementById('winnersListItems');
        const listItem = document.createElement('li');
        listItem.textContent = `${positionText}: ${playerNames[playerIndex]}`;
        winnersListItems.appendChild(listItem);

        if (activePlayers.length === 0) {
          const finalMessage = document.createElement('div');
          finalMessage.className = 'game-message';
          finalMessage.textContent = 'Game Over! All Players Have Won!';
          playersTickets.appendChild(finalMessage);
          triggerConfetti();
          document.querySelectorAll('.call-number-btn').forEach(btn => btn.disabled = true);
          gameEnded = true;
        }
      }
    }
  });
}

function getPositionText(position) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const suffix = position > 3 ? suffixes[0] : suffixes[position];
  return `${position}${suffix}`;
}

function speakNumber(number) {
  console.log(`Speaking number ${number}`);
  const utter = new SpeechSynthesisUtterance(`Number ${number}`);
  utter.pitch = 1;
  utter.rate = 1;
  speechSynthesis.speak(utter);
}