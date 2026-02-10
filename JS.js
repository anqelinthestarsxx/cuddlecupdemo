let selectedDrink = null;
let selectedBakery = null;
// -----------------------------
// LOGIN / TITLE NAV
// -----------------------------
const startBtn = document.getElementById('start-btn');
if (startBtn) {
    startBtn.onclick = () => location.href = "login.html";
}

function goToGame() {
    location.href = "game.html";
}

['signup-btn','login-btn','guest-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = goToGame;
});

// -----------------------------
// SCREEN NAVIGATION
// -----------------------------
const buttons = document.querySelectorAll('.nav-btn');
const screens = document.querySelectorAll('.screen');

buttons.forEach(btn => {
    btn.onclick = () => {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(btn.dataset.screen).classList.add('active');

        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
});

// default screen
const defaultScreen = document.getElementById('dining-room');
if (defaultScreen) defaultScreen.classList.add('active');

// -----------------------------
// TABLE CLEANLINESS
// -----------------------------
class Table {
    constructor(el) {
        this.el = el;
        this.isDirty = false;
        this.clicks = 0;

        this.mess = document.createElement('div');
        this.mess.style.position = 'absolute';
        this.mess.style.inset = '0';
        this.mess.style.display = 'flex';
        this.mess.style.alignItems = 'center';
        this.mess.style.justifyContent = 'center';
        this.mess.style.fontSize = '2rem';
        el.appendChild(this.mess);

        el.onclick = () => this.clean();
        this.startTimer();
    }

    startTimer() {
        setTimeout(() => {
            this.makeDirty();
            this.startTimer();
        }, 75000);
    }

    makeDirty() {
        if (this.isDirty) return;
        this.isDirty = true;
        this.clicks = 5;
        this.mess.textContent = '🍪';
        this.el.style.filter = 'brightness(0.8)';
    }

    clean() {
        if (!this.isDirty) return;
        this.clicks--;
        if (this.clicks <= 0) {
            this.isDirty = false;
            this.mess.textContent = '';
            this.el.style.filter = 'none';
        }
    }
}

document.querySelectorAll('.clickable-table').forEach(t => new Table(t));

// -----------------------------
// INVENTORY
// -----------------------------
const inventory = {};
const invDiv = document.getElementById('inventory');

function addItem(emoji) {
    if(!inventory[emoji]) {
        inventory[emoji] = 1;

        const div = document.createElement('div');
        div.dataset.item = emoji;
        div.className = 'inventory-item';
        div.textContent = `${emoji} x1`;

        //CLICK to select
        div.addEventListener('click', () => {
            const bakeryEmojis = ['🍪', '🧁', '🥐', '🍩'];
            const isDrink = !bakeryEmojis.includes(emoji);
            
            if (isDrink) {
                // Deselect previous drink
                document.querySelectorAll('.inventory-item').forEach(d => {
                    const item = d.dataset.item;
                    const isBakery = bakeryEmojis.includes(item);
                    if (!isBakery) d.style.background = 'none';
                });
                selectedDrink = emoji;
                div.style.background = '#ffb6c1';
            } else {
                // Deselect previous bakery
                document.querySelectorAll('.inventory-item').forEach(d => {
                    const item = d.dataset.item;
                    const isBakery = bakeryEmojis.includes(item);
                    if (isBakery) d.style.background = 'none';
                });
                selectedBakery = emoji;
                div.style.background = '#ffb6c1';
            }
        });
    
        invDiv.appendChild(div);
    } else {
        inventory[emoji]++;
        document.querySelector(`[data-item='${emoji}']`).textContent =
        `${emoji} x${inventory[emoji]}`;
    }
}

// -----------------------------
// DRINK STATION
// -----------------------------
let type = '', flavor = '', progress = 0, interval;

const typeDiv = document.getElementById('drink-type');
const flavorDiv = document.getElementById('drink-flavor');
const holdBox = document.getElementById('hold-box');
const progressText = document.getElementById('progress');

document.getElementById('make-drink-btn').onclick = () => {
    typeDiv.style.display = 'block';
};

window.chooseType = t => {
    type = t;
    typeDiv.style.display = 'none';
    flavorDiv.style.display = 'block';
};

window.chooseFlavor = f => {
    flavor = f;
    flavorDiv.style.display = 'none';
    holdBox.style.display = 'block';
};

const holdBtn = document.getElementById('hold-btn');

holdBtn.onmousedown = () => {
    interval = setInterval(() => {
        progress++;
        progressText.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            addItem(type + flavor);
            resetDrink();
        }
    }, 40);
};

['mouseup','mouseleave'].forEach(e =>
    holdBtn.addEventListener(e, () => clearInterval(interval))
);

function resetDrink() {
    type = flavor = '';
    progress = 0;
    progressText.textContent = '0%';
    holdBox.style.display = 'none';
}

// -----------------------------
// BAKERY
// -----------------------------
let bakeryItem = '';
let bakeryProgress = 0;
let bakeryInterval;

const bakeryTypeDiv = document.getElementById('bakery-type');
const packageBox = document.getElementById('package-box');
const packageProgress = document.getElementById('package-progress');

document.getElementById('make-bakery-btn').onclick = () => {
    bakeryTypeDiv.style.display = 'block';
};

window.chooseBakery = item => {
    bakeryItem = item;
    bakeryTypeDiv.style.display = 'none';
    packageBox.style.display = 'block';
};

const packageBtn = document.getElementById('package-btn');

packageBtn.onmousedown = () => {
    bakeryInterval = setInterval(() => {
        bakeryProgress++;
        packageProgress.textContent = `${bakeryProgress}%`;

        if (bakeryProgress >= 100) {
            clearInterval(bakeryInterval);
            addItem(bakeryItem);
            resetBakery();
        }
    }, 40);
};

['mouseup','mouseleave'].forEach(e =>
    packageBtn.addEventListener(e, () => clearInterval(bakeryInterval))
);

function resetBakery() {
    bakeryItem = '';
    bakeryProgress = 0;
    packageProgress.textContent = '0%';
    packageBox.style.display = 'none';
}

const drinkTypes = ['☕', '🧊', '🍫', '🥤'];

let currentRequest =' ';
let currentBakeryRequest = '';
let mistakes=0;

let customerTimer;
const customerWaitTime = 20000;

// -----------------------------
// CUSTOMER TIMER
// -----------------------------
let timerStartTime;

function startCustomerTimer() {
    clearTimeout(customerTimer);
    timerStartTime = Date.now();
    
    // Animate the timer bar
    const timerFill = document.getElementById('customer-timer-fill');
    const timerInterval = setInterval(() => {
        const elapsed = Date.now() - timerStartTime;
        const remaining = Math.max(0, customerWaitTime - elapsed);
        const percentage = (remaining / customerWaitTime) * 100;
        
        if (timerFill) {
            timerFill.style.width = percentage + '%';
        }
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
        }
    }, 30);
    
    customerTimer = setTimeout(() => {
        alert("The customer got tired of waiting! 😢");
        newCustomer(); // generate a new customer
    }, customerWaitTime);
}

// update newCustomer to start the timer
function newCustomer() {
    const drinkTypes = ['☕', '🧊', '🍫', '🥤'];
    const drinkFlavors = ['🍓', '🍫', '🍌', '🥭'];
    const bakeryItems = ['🍪', '🧁', '🥐', '🍩'];

    const randomType = drinkTypes[Math.floor(Math.random() * drinkTypes.length)];
    const randomFlavor = drinkFlavors[Math.floor(Math.random() * drinkFlavors.length)];
    const randomBakery = bakeryItems[Math.floor(Math.random() * bakeryItems.length)];

    currentRequest = randomType + randomFlavor;
    currentBakeryRequest = randomBakery;
    mistakes = 0;

    if (customer) customer.textContent = '🧑';
    if (customerRequest) {
        customerRequest.textContent = `I want: ${currentRequest} & ${currentBakeryRequest}`;
        customerRequest.style.fontWeight = 'bold';
        customerRequest.style.fontSize = '2rem';
        customerRequest.style.color = '#d72660';
    }

    startCustomerTimer(); // start countdown for this customer
}

// call startCustomerTimer() whenever a new customer shows up or they leave

// call once at start (after DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', newCustomer);
} else {
    newCustomer();
}



// -----------------------------
// COUNTER
// -----------------------------
let orders = 0;
const serveBtn = document.getElementById('serve-btn');
const customer = document.getElementById('customer');
const  customerRequest = document.getElementById('customer-request');
const orderCount = document.getElementById('order-count');

serveBtn.onclick = () => {
    if (!selectedDrink) return alert ('Select a drink from your inventory first!');
    if (!selectedBakery) return alert ('Select a baked good from your inventory too!');

    // Check if drink matches
    if (selectedDrink === currentRequest && selectedBakery === currentBakeryRequest) {
        // Correct
        orders++
        orderCount.textContent = `Orders Served: ${orders}`;
        alert('Customer is happy!');
        removeFromInventory(selectedDrink);
        removeFromInventory(selectedBakery);
        newCustomer();
    } else {
        //Incorrect
        mistakes++;
        alert(`Wrong order! ${mistakes === 1 ? "Be careful!" : "Customer left!"}`);

        if (mistakes >=2) {
            newCustomer();
        }
    }

    //unselect items
    document.querySelectorAll('.inventory-item').forEach(d => d.style.background = 'none');
    selectedDrink = null;
    selectedBakery = null;
};

// remove one item from inventory after serving
function removeFromInventory(emoji) {
    if (!inventory[emoji]) return;
    inventory[emoji]--;
    if (inventory[emoji] <=0) {
        inventory[emoji] = 0;
        const div = document.querySelector(`[data-item='${emoji}']`);
        if(div) div.remove();
    } else {
        document.querySelector(`[data-item='${emoji}']`).textContent =
        `${emoji} x${inventory[emoji]}`;
    }
}