const pitch = document.getElementById('pitch');
const MAX_PLAYERS = 7;

let playersList = [];
let nextPlayerId = 1;
let selectedPlayerCard = null;

const formations = {
    "2-3-1": [
        { top: 85, left: 50 }, // GK
        { top: 70, left: 30 }, { top: 70, left: 70 }, // DF
        { top: 45, left: 25 }, { top: 45, left: 50 }, { top: 45, left: 75 }, // MF
        { top: 20, left: 50 } // FW
    ],
    "3-2-1": [
        { top: 85, left: 50 },
        { top: 70, left: 20 }, { top: 70, left: 50 }, { top: 70, left: 80 },
        { top: 45, left: 35 }, { top: 45, left: 65 },
        { top: 20, left: 50 }
    ],
    "3-1-2": [
        { top: 85, left: 50 },
        { top: 70, left: 20 }, { top: 70, left: 50 }, { top: 70, left: 80 },
        { top: 45, left: 50 },
        { top: 20, left: 35 }, { top: 20, left: 65 }
    ],
    "2-2-2": [
        { top: 85, left: 50 },
        { top: 70, left: 30 }, { top: 70, left: 70 },
        { top: 45, left: 30 }, { top: 45, left: 70 },
        { top: 20, left: 30 }, { top: 20, left: 70 }
    ]
};

function createPlayerCardElement(playerData) {
    const template = document.getElementById('playerCardTemplate').content.cloneNode(true);
    const cardContainer = template.querySelector('.player-card-container');
    
    cardContainer.dataset.playerId = playerData.id;
    cardContainer.querySelector('.player-head-img').src = playerData.imageUrl;
    cardContainer.querySelector('.player-position-text').textContent = playerData.position;
    cardContainer.querySelector('.player-number-text').textContent = `#${playerData.number}`;
    cardContainer.querySelector('.player-rating-text').textContent = playerData.rating;
    cardContainer.querySelector('.player-name-text').textContent = playerData.name;
    
    addDraggableBehavior(cardContainer);
    cardContainer.addEventListener('click', handlePlayerCardClick);
    
    return cardContainer;
}

function addDraggableBehavior(element) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    const startDrag = (clientX, clientY) => {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        element.style.zIndex = '1000';
    };

    const doDrag = (clientX, clientY) => {
        if (!isDragging) return;
        const dx = clientX - startX;
        const dy = clientY - startY;
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const maxLeft = pitch.clientWidth - element.clientWidth;
        const maxTop = pitch.clientHeight - element.clientHeight;

        element.style.left = `${Math.max(0, Math.min(maxLeft, newLeft))}px`;
        element.style.top = `${Math.max(0, Math.min(maxTop, newTop))}px`;
    };

    const stopDrag = () => {
        if (isDragging) {
            isDragging = false;
            element.style.zIndex = '10';
        }
    };

    element.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('touchmove', (e) => doDrag(e.touches[0].clientX, e.touches[0].clientY));
    document.addEventListener('touchend', stopDrag);

    element.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    document.addEventListener('mousemove', (e) => doDrag(e.clientX, e.clientY));
    document.addEventListener('mouseup', stopDrag);
}

function handlePlayerCardClick() {
    if (selectedPlayerCard) {
        selectedPlayerCard.classList.remove('active');
    }
    selectedPlayerCard = this;
    selectedPlayerCard.classList.add('active');

    const player = playersList.find(p => p.id == this.dataset.playerId);
    
    document.getElementById('playerNameInput').value = player.name;
    document.getElementById('playerNumberInput').value = player.number;
    document.getElementById('playerRatingInput').value = player.rating;
    document.getElementById('playerPositionInput').value = player.position;
}

function savePlayerChanges() {
    if (!selectedPlayerCard) {
        alert("اضغط على بطاقة لاعب في الملعب أولاً لتعديل بياناته!");
        return;
    }

    const playerId = selectedPlayerCard.dataset.playerId;
    const playerIndex = playersList.findIndex(p => p.id == playerId);

    if (playerIndex === -1) return;

    const newName = document.getElementById('playerNameInput').value || "لاعب";
    const newNumber = parseInt(document.getElementById('playerNumberInput').value) || 10;
    const newRating = parseInt(document.getElementById('playerRatingInput').value) || 80;
    const newPosition = document.getElementById('playerPositionInput').value;
    const imageInput = document.getElementById('playerImageInput');

    playersList[playerIndex].name = newName;
    playersList[playerIndex].number = newNumber;
    playersList[playerIndex].rating = newRating;
    playersList[playerIndex].position = newPosition;

    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            playersList[playerIndex].imageUrl = e.target.result;
            renderLineup();
            imageInput.value = "";
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        renderLineup();
    }
}

function renderLineup() {
    pitch.innerHTML = "";
    const selectedFormation = document.getElementById('formationSelect').value;
    const positions = formations[selectedFormation];

    while (playersList.length < MAX_PLAYERS) {
        const id = nextPlayerId++;
        playersList.push({
            id: id,
            name: `صديق ${id}`,
            number: id,
            rating: 85,
            position: "CMF",
            imageUrl: "https://via.placeholder.com/150/000000/FFFFFF/?text=رأس"
        });
    }

    playersList.forEach((player, index) => {
        const playerCard = createPlayerCardElement(player);
        const pos = positions[index];
        
        playerCard.style.top = `${pos.top}%`;
        playerCard.style.left = `${pos.left}%`;
        playerCard.style.transform = `translate(-50%, -50%)`;
        
        pitch.appendChild(playerCard);
    });

    updateStats();
}

function updateStats() {
    const avgRating = playersList.reduce((sum, p) => sum + p.rating, 0) / MAX_PLAYERS;
    document.getElementById('avgRating').textContent = avgRating.toFixed(1);
}

document.getElementById('formationSelect').addEventListener('change', renderLineup);
document.getElementById('savePlayerChangesBtn').addEventListener('click', savePlayerChanges);
document.getElementById('resetLineupBtn').addEventListener('click', () => {
    playersList = [];
    nextPlayerId = 1;
    renderLineup();
});

renderLineup();
