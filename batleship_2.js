let view = {
    displayMessage: function (msg) { // вывод сообщений
        let messageArea = document.getElementById("messageArea");
        messageArea.innerHTML = msg;
    },
    displayHit: function (location) { // вывод изображения при попадании
        let cell = document.getElementById(location);
        cell.setAttribute("class", "hit");
        let audio = document.getElementById("audiohit");
        audio.play();
    },
    displayMiss: function (location) { // вывод изображения промаха
        let cell = document.getElementById(location);
        cell.setAttribute("class", "bottontdMiss");
        let audio = document.getElementById("audioMiss");
        audio.play();
    }
};
let model = {
    boardSize: 7,
    numShips: 3,
    ShipLength: 3,
    shipsunk: 0,
    ships: [{ locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] }],
    fire: function (guess) { // проверка выстрела
        for (let i = 0; i < this.numShips; i++) { // для каждого корабля
            let ship = this.ships[i];
            locations = ship.locations;
            let index = locations.indexOf(guess); // ищем соответствие координат кораблей сделанному выстрелу
            if (index >= 0) { // проверка на попадание
                ship.hits[index] = "hit"; // отмечаем попадание
                view.displayHit(guess); // отображаем попадание
                view.displayMessage("Вы попали, дерите меня черти")
                if (this.isSunk(ship)) { // проверка на "потовление"
                    this.shipsunk++;
                    view.displayMessage("Вы потопитил мой корабль, кашалот мне под ребро");
                    let audio = document.getElementById("audioBang");
                    audio.play();
                }
                return true;
            }

        }
        // отработка при промахе
        view.displayMiss(guess);
        view.displayMessage("Мимо,юнга");
        return false;
    },
    isSunk: function (ship) { // проверка на потовление корабля
        for (let i = 0; i < this.ShipLength; i++) {
            if (ship.hits[i] !== "hit") {
                return false;
            }
        }
        return true;
    },
    generateShipLocation: function () { // метод сохрания созданного корабля
        let location;
        for (let i = 0; i < this.numShips; i++) {
            do {
                location = this.generateShip();
            } // создаем новый пока не пройдем проверку на пересечение клеток с уже созданными кораблямми
            while (this.collision(location));
            this.ships[i].locations = location
        }
    },
    generateShip: function () { // метод создания корабля
        let row;
        let col;
        let direction;
        direction = Math.floor(Math.random() * 2); // выбор на правления постройки
        if (direction === 1) {
            // делаем по горизонтали определяем координаты первой клетки в допустимых пределах
            row = Math.floor(Math.random() * this.boardSize);
            col = Math.floor(Math.random() * (this.boardSize - this.ShipLength));
        }
        else {
            // делаем по вертикали определяем координаты первой клетки в допустимых пределах
            col = Math.floor(Math.random() * this.boardSize);
            row = Math.floor(Math.random() * (this.boardSize - this.ShipLength));
        }
        let newShipLocation = []; // заполняем массив с координатами кораблей
        for (i = 0; i < this.ShipLength; i++)
            if (direction === 1) {
                newShipLocation.push(row + "" + (col + i))
            }
            else {
                newShipLocation.push((row + i) + "" + col)
            }
        return newShipLocation;
    },
    collision: function (location) { // проверка на пересечение с существующими кораблями
        for (i = 0; i < this.numShips; i++) { // для каждого корабля
            for (j = 0; j < model.ShipLength; j++) { // каждую часть нового корабля
                if (model.ships[i].locations.indexOf(location[j]) >= 0) { // ищем в массиве клеток созданных кораблей элементы нового корабля  
                    return true;
                }
            }
        }

        return false;
    }
};
function parseGuess(guess) { // функция получения координат выстрела
    let column = guess.charAt(1); //возвращаем номер столбца
    let row = guess.charAt(0); // возвращаем номер строки
    if (isNaN(row) || isNaN(column) || row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize) { // проверяем коректность введенных координат
        alert("Цельтесь лучше, для начала хотябы в поле попадите");
    }
    else {
        return row + column;
    }

    return null;
}

let controller = { // контролер состояния игры
    guesses: 0, // счетчик выстрелов
    processGuess: function (guess) {
        let location = parseGuess(guess);
        if (location) {
            this.guesses++;
            let hit = model.fire(location);
            if (hit && model.numShips == model.shipsunk) { // если было попадание и потовлены все кораби игра завершается
                view.displayMessage("Насади меня на мачту, да вы потопили мою флотилию за " + this.guesses + " выстрелов");
                let audioPobeda = document.getElementById("audioPobeda");
                audioPobeda.play();
            }
        }
    }
};
function init() { // функция инициализации

    fireButton = document.getElementById("board");
    function handleFireButton(e) {
        let guess = e.target.id;
        controller.processGuess(guess)
    };
    fireButton.addEventListener('click', handleFireButton);
    model.generateShipLocation();
}
window.onload = init;