const modeElements = document.querySelectorAll('.mode');
const playerInputs = document.getElementById('playerInputs');
const startBtn = document.getElementById('startBtn');
const gamePage = document.getElementById('gamePage');
const modeSelection = document.getElementById('modeSelection');
const calledNumbers = document.getElementById('calledNumbers');
const callNumberBtn = document.getElementById('callNumberBtn');
const playersTickets = document.getElementById('playersTickets');
const numberList = document.getElementById('numberList');
const backBtn = document.getElementById('backBtn');
let numberListBackBtn = document.getElementById('numberListBackBtn');
const resetBtn = document.getElementById('resetBtn');
const winnerBlast = document.getElementById('winnerBlast');
const endGameMessage = document.getElementById('endGameMessage');
const loserMessage = document.getElementById('loserMessage');

let selectedMode = '';
let playerNames = [];
let remainingNumbers = [...Array(90).keys()].map(n => n + 1);
let computerTicket = null;
let ticketsData = [];
let winners = [];
let activePlayers = [];
let currentUtterance = null;

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");
  
  if (!modeSelection || !playerInputs || !startBtn || !gamePage || !calledNumbers || !callNumberBtn || !playersTickets || !numberList || !backBtn || !numberListBackBtn || !resetBtn || !winnerBlast || !endGameMessage || !loserMessage) {
    console.error("One or more DOM elements not found:", {
      modeSelection, playerInputs, startBtn, gamePage, calledNumbers, callNumberBtn, playersTickets, numberList, backBtn, numberListBackBtn, resetBtn, winnerBlast, endGameMessage, loserMessage
    });
    return;
  }
  
  modeSelection.style.display = 'block';
  console.log("modeSelection should be visible");

  console.log("Mode elements found:", modeElements.length);
});

modeElements.forEach(mode => {
  mode.addEventListener('click', () => {
    console.log("Mode clicked:", mode.dataset.mode);
    
    if (mode.classList.contains('selected')) {
      mode.classList.remove('selected');
      selectedMode = '';
    } else {
      modeElements.forEach(m => m.classList.remove('selected'));
      mode.classList.add('selected');
      selectedMode = mode.dataset.mode;
    }

    startBtn.disabled = selectedMode === '';
    console.log("Selected mode:", selectedMode, "startBtn disabled:", startBtn.disabled);

    showInputsForMode(selectedMode);
  });
});

function showInputsForMode(mode) {
  playerInputs.innerHTML = '';
  startBtn.disabled = mode === '';
  console.log("Showing inputs for mode:", mode);

  if (!mode) {
    return;
  }

  if (mode === 'solo' || mode === 'computer') {
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter your name';
    nameInput.classList.add('form-control', 'w-75', 'mx-auto');
    nameInput.addEventListener('input', () => {
      startBtn.disabled = nameInput.value.trim() === '';
      console.log("Name input changed, startBtn disabled:", startBtn.disabled);
    });
    playerInputs.appendChild(nameInput);
  } else if (mode === 'friends') {
    const select = document.createElement('select');
    select.classList.add('form-select', 'w-75', 'mx-auto');
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
      nameContainer.innerHTML = '';
      for (let i = 1; i <= select.value; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter name of Player ${i}`;
        input.classList.add('form-control', 'w-75', 'mx-auto', 'mt-2');
        input.required = true;
        input.addEventListener('input', () => {
          const allFilled = [...nameContainer.querySelectorAll('input')].every(inp => inp.value.trim() !== '');
          startBtn.disabled = !allFilled;
          console.log("Friends mode input changed, startBtn disabled:", startBtn.disabled);
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
  console.log("Start button clicked");
  if (selectedMode === 'solo') {
    const name = playerInputs.querySelector('input').value.trim();
    playerNames = [name];
  } else if (selectedMode === 'computer') {
    const name = playerInputs.querySelector('input').value.trim();
    playerNames = [name, 'Computer'];
  } else {
    playerNames = [...playerInputs.querySelectorAll('input')].map(input => input.value.trim());
  }

  console.log("Player names:", playerNames);

  modeSelection.style.display = 'none';
  gamePage.style.display = 'block';
  console.log("gamePage should be visible");

  remainingNumbers = [...Array(90).keys()].map(n => n + 1);
  calledNumbers.innerHTML = '';
  playersTickets.innerHTML = '';
  numberList.innerHTML = '';
  numberList.innerHTML = '<div class="number-heading">Numbers List</div><button id="numberListBackBtn" class="btn btn-success d-block mx-auto mb-3 d-none d-lg-block">⬅️ Back</button>';
  numberListBackBtn = document.getElementById('numberListBackBtn');
  numberListBackBtn.addEventListener('click', resetGame);
  
  computerTicket = null;
  ticketsData = [];
  winners = [];
  activePlayers = [...playerNames];
  callNumberBtn.disabled = false;
  endGameMessage.style.display = 'none';
  loserMessage.style.display = 'none';

  generateNumberList();
  generateTickets();
});

callNumberBtn.addEventListener('click', () => {
  if (remainingNumbers.length === 0) {
    endGameMessage.style.display = 'block';
    speakMessage("All Numbers are Generated, Press Reset Button to Reset the Game");
    callNumberBtn.disabled = true;
    return;
  }

  const index = Math.floor(Math.random() * remainingNumbers.length);
  const number = remainingNumbers.splice(index, 1)[0];
  console.log("Number called:", number);

  speakMessage(`Number ${number}`);

  const span = document.createElement('span');
  span.textContent = number;
  calledNumbers.appendChild(span);

  markNumberAsCalled(number);

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
      checkForWinners();
    }
  }

  checkForWinners();

  if (remainingNumbers.length === 0) {
    endGameMessage.style.display = 'block';
    speakMessage("All Numbers are Generated, Press Reset Button to Reset the Game");
    callNumberBtn.disabled = true;
  }
});

function markNumberAsCalled(number) {
  const cells = document.querySelectorAll('.number-cell');
  cells.forEach(cell => {
    if (parseInt(cell.dataset.number) === number) {
      cell.classList.add('called');
      console.log(`Marked number ${number} as called in number-list`);
    }
  });
}

function resetGame() {
  console.log("Back/Reset button clicked, resetting game");
  gamePage.style.display = 'none';
  modeSelection.style.display = 'block';
  
  calledNumbers.innerHTML = '';
  playersTickets.innerHTML = '';
  numberList.innerHTML = '';
  numberList.innerHTML = '<div class="number-heading">Numbers List</div><button id="numberListBackBtn" class="btn btn-success d-block mx-auto mb-3 d-none d-lg-block">⬅️ Back</button>';
  numberListBackBtn = document.getElementById('numberListBackBtn');
  numberListBackBtn.addEventListener('click', resetGame);
  
  winnerBlast.style.display = 'none';
  endGameMessage.style.display = 'none';
  loserMessage.style.display = 'none';
  remainingNumbers = [...Array(90).keys()].map(n => n + 1);
  playerNames = [];
  selectedMode = '';
  computerTicket = null;
  ticketsData = [];
  winners = [];
  activePlayers = [];
  
  modeElements.forEach(m => m.classList.remove('selected'));
  showInputsForMode('solo');
}

backBtn.addEventListener('click', resetGame);
resetBtn.addEventListener('click', resetGame);
numberListBackBtn.addEventListener('click', resetGame);

function generateNumberList() {
  const ranges = [
    [1, 10],
    [11, 20],
    [21, 30],
    [31, 40],
    [41, 50],
    [51, 60],
    [61, 70],
    [71, 80],
    [81, 90]
  ];

  ranges.forEach(([start, end]) => {
    const row = document.createElement('div');
    row.className = 'number-row';
    
    for (let i = start; i <= end; i++) {
      const cell = document.createElement('div');
      cell.className = 'number-cell';
      cell.textContent = i;
      cell.dataset.number = i;
      row.appendChild(cell);
    }
    
    numberList.appendChild(row);
  });
  console.log("Number list generated");
}

function generateTickets() {
  if (!playersTickets) {
    console.error("playersTickets element not found!");
    return;
  }

  playersTickets.innerHTML = '';
  ticketsData = [];

  if (!playerNames || playerNames.length === 0) {
    console.error("No player names found to generate tickets!");
    return;
  }

  try {
    playerNames.forEach((name, index) => {
      const container = document.createElement('div');
      container.classList.add('player-ticket-container');
      
      const header = document.createElement('h3');
      header.innerHTML = `<span class="player-name">${name}'s Ticket</span>`;
      container.appendChild(header);

      const ticket = generateTicket();
      const ticketDiv = document.createElement('div');
      ticketDiv.className = 'ticket';

      ticketsData[index] = ticket;

      if (name === 'Computer') {
        computerTicket = ticket;
      }

      ticket.flat().forEach((num, idx) => {
        const cell = document.createElement('div');
        cell.className = 'ticket-cell';
        cell.textContent = num === 0 ? '' : num;
        cell.dataset.index = idx;
        ticketDiv.appendChild(cell);
      });

      container.appendChild(ticketDiv);
      playersTickets.appendChild(container);

      console.log(`Generated ticket for ${name}:`, ticket);
      console.log(`Ticket HTML for ${name}:`, ticketDiv.outerHTML);
    });

    const ticketCells = playersTickets.querySelectorAll('.ticket-cell');
    console.log(`Total ticket cells created: ${ticketCells.length}`);
    console.log("Tickets generated for players:", playerNames);
    console.log("playersTickets content:", playersTickets.innerHTML);

    if (ticketCells.length === 0) {
      console.warn("No ticket cells were created. Check CSS visibility or DOM structure.");
    }
  } catch (error) {
    console.error("Error generating tickets:", error);
  }
}

function showWinnerBlast(playerName, positionText) {
  const winnerMessage = winnerBlast.querySelector('.winner-message');
  winnerMessage.textContent = `${playerName} is the ${positionText} Winner! 🎉`;
  winnerBlast.style.display = 'flex';
  winnerBlast.classList.remove('show');
  void winnerBlast.offsetWidth;
  winnerBlast.classList.add('show');
}

function checkForWinners() {
  ticketsData.forEach((ticket, playerIndex) => {
    if (winners.includes(playerIndex) || !activePlayers.includes(playerNames[playerIndex])) return;

    const ticketDiv = playersTickets.querySelectorAll('.player-ticket-container')[playerIndex].querySelector('.ticket');
    const cells = ticketDiv.querySelectorAll('.ticket-cell');
    const flatTicket = ticket.flat();
    const nonEmptyCells = flatTicket.filter(num => num !== 0).length;
    const crossedCells = Array.from(cells).filter(cell => cell.classList.contains('crossed')).length;

    if (crossedCells === nonEmptyCells) {
      winners.push(playerIndex);
      const position = winners.length;
      const positionText = getPositionText(position);
      
      showWinnerBlast(playerNames[playerIndex], positionText);
      
      activePlayers = activePlayers.filter(name => name !== playerNames[playerIndex]);
      ticketDiv.parentElement.style.display = 'none';

      if (activePlayers.length === 1 && playerNames.length >= 3) {
        const loserName = activePlayers[0];
        setTimeout(() => {
          loserMessage.textContent = `${loserName} is Loser`;
          loserMessage.style.display = 'block';
          callNumberBtn.disabled = true;
        }, 3000);
      }
    }
  });
}

function getPositionText(position) {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const suffix = position > 3 ? suffixes[0] : suffixes[position];
  return `${position}${suffix}`;
}

function generateTicket() {
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

  return ticket;
}

function speakMessage(message) {
  if (currentUtterance) {
    speechSynthesis.cancel();
  }

  currentUtterance = new SpeechSynthesisUtterance(message);
  currentUtterance.pitch = 1;
  currentUtterance.rate = 1;

  currentUtterance.onend = () => {
    currentUtterance = null;
  };

  speechSynthesis.speak(currentUtterance);
}