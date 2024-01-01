let MAX_BRIGHTNESS = 255
let GAMEOVER_BRIGHTNESS = 3

let CHRISTMAS_STRING_HEIGHT = 20
let CHRISTMAS_STRING_WIDTH = 10
let christmasString = neopixel.create(DigitalPin.P1, CHRISTMAS_STRING_WIDTH * CHRISTMAS_STRING_HEIGHT, NeoPixelMode.RGB)
let BORDER_COLOR = neopixel.colors(NeoPixelColors.White)
let BACKGROUND_COLOR = neopixel.colors(NeoPixelColors.Black)

let FIGURE_MAPS = [
    [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ],
    [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ],
    [
        [1, 1],
        [1, 1]
    ],
    [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
    ]
]
let FIGURE_COLORS = [
    neopixel.colors(NeoPixelColors.Indigo),
    neopixel.colors(NeoPixelColors.Blue),
    neopixel.colors(NeoPixelColors.Orange),
    neopixel.colors(NeoPixelColors.Yellow),
    neopixel.colors(NeoPixelColors.Green),
    neopixel.colors(NeoPixelColors.Violet),
    neopixel.colors(NeoPixelColors.Red)
]

let currentField: number[][]
let currentFigure: number[][]
let currentX: number
let currentY: number
let nextFigure: number[][]
let nextFigureIndex: number
let nextRotateCount: number
let collapsedLines: number
let isPaused: boolean
let isGameOver: boolean
let BASE_DELAY = 500
let currentTask = 0

function getFieldWidth() {
    return 1 + CHRISTMAS_STRING_WIDTH + 1
}

function getFieldHeight() {
    return 1 + CHRISTMAS_STRING_HEIGHT + 1
}

function getEmptyRow(edgeColor: number, middleColor: number): number[] {
    let result: number[] = []
    for (let column = 0; column < getFieldWidth(); column++) {
        if (column == 0 || column == getFieldWidth() - 1) {
            result.push(edgeColor)
        } else {
            result.push(middleColor)
        }
    }
    return result
}

function getEmptyField(): number[][] {
    let result: number[][] = []
    for (let row = 0; row < getFieldHeight(); row++) {
        if (row == 0 || row == getFieldHeight() - 1) {
            result.push(getEmptyRow(BACKGROUND_COLOR, BORDER_COLOR))
        } else {
            result.push(getEmptyRow(BORDER_COLOR, BACKGROUND_COLOR))
        }
    }
    return result
}

function getFigureWidth(figure: number[][]): number {
    return figure[0].length
}

function getFigureHeight(figure: number[][]): number {
    return figure.length
}

function getColorFigure(map: number[][], color: number): number[][] {
    let result: number[][] = []
    let width = getFigureWidth(map)
    let height = getFigureHeight(map)
    let resultRow: number[];
    for (let row = 0; row < height; row++) {
        resultRow = []
        for (let column = 0; column < width; column++) {
            if (map[row][column]) {
                resultRow.push(color)
            } else {
                resultRow.push(BACKGROUND_COLOR)
            }
        }
        result.push(resultRow)
    }
    return result
}

function getFieldWithFigure(field: number[][], figure: number[][], x: number, y: number): number[][] {
    let resultField: number[][] = []
    let resultRow: number[];
    for (let row = 0; row < getFieldHeight(); row++) {
        if (row >= y && row < y + figure.length) {
            resultRow = []
            for (let column = 0; column < getFieldWidth(); column++) {
                if (column >= x && column < x + figure[row - y].length && figure[row - y][column - x] != BACKGROUND_COLOR) {
                    resultRow.push(figure[row - y][column - x])
                } else {
                    resultRow.push(field[row][column])
                }
            }
        } else {
            resultRow = field[row]
        }
        resultField.push(resultRow)
    }
    return resultField
}

function isFieldPossibleWithFigure(field: number[][], figure: number[][], x: number, y: number): boolean {
    for (let row = 0; row < getFieldHeight(); row++) {
        if (row >= y && row < y + figure.length) {
            for (let column = 0; column < getFieldWidth(); column++) {
                if (column >= x && column < x + figure[row - y].length &&
                    figure[row - y][column - x] != BACKGROUND_COLOR &&
                    field[row][column] != BACKGROUND_COLOR) {
                    return false
                }
            }
        }
    }
    return true
}

function getRotatedFigure(figure: number[][]): number[][] {
    let resultFigure: number[][] = []
    let figureHeight = getFigureHeight(figure)
    let resultWidth = getFigureHeight(figure)
    let resultHeight = getFigureWidth(figure)
    let resultRow: number[]
    for (let row = 0; row < resultHeight; row++) {
        resultRow = []
        for (let column = 0; column < resultWidth; column++) {
            resultRow.push(figure[figureHeight - 1 - column][row])
        }
        resultFigure.push(resultRow)
    }
    return resultFigure
}

function getCollapsedField(field: number[][]): number[][] {
    let resultField: number[][] = []
    for (let row = 0; row < getFieldHeight(); row++) {
        let hasEmpty = false
        for (let column = 0; column < getFieldWidth(); column++) {
            if (field[row][column] == BACKGROUND_COLOR) {
                hasEmpty = true
                break;
            }
        }
        if (hasEmpty) {
            resultField.push(field[row])
        }
    }
    while (resultField.length < getFieldHeight()) {
        resultField.insertAt(1, getEmptyRow(BORDER_COLOR, BACKGROUND_COLOR))
        collapsedLines += 1
    }
    return resultField
}

function getNumberOfTopEmptyRows(figure: number[][]): number {
    let width = getFigureWidth(figure)
    let height = getFigureHeight(figure)
    for (let row = 0; row < height; row++) {
        for (let column = 0; column < width; column++) {
            if (figure[row][column] != BACKGROUND_COLOR) {
                return row
            }
        }
    }
    return height
}

function generateNextFigureConfiguration() {
    nextFigureIndex = randint(0, FIGURE_MAPS.length - 1)
    nextRotateCount = randint(0, 4 - 1)
}

function getNextFigure(): number[][] {
    let result = getColorFigure(FIGURE_MAPS[nextFigureIndex], FIGURE_COLORS[nextFigureIndex])
    for (let index = 0; index < nextRotateCount; index++) {
        result = getRotatedFigure(result)
    }
    return result
}

function changeFigure(figure: number[][]) {
    currentFigure = figure
    currentX = Math.floor((getFieldWidth() - getFigureWidth(currentFigure) + 1) / 2)
    currentY = 1 - getNumberOfTopEmptyRows(currentFigure)
    generateNextFigureConfiguration()
    nextFigure = getNextFigure()
}

function endMovements() {
    currentField = getFieldWithFigure(currentField, currentFigure, currentX, currentY)
    currentField = getCollapsedField(currentField)
    changeFigure(nextFigure)
    if (!isFieldPossibleWithFigure(currentField, currentFigure, currentX, currentY)) {
        isGameOver = true
    }
}

function showField(field: number[][]) {
    for (let row = 0; row < CHRISTMAS_STRING_HEIGHT; row++) {
        for (let column = 0; column < CHRISTMAS_STRING_WIDTH; column++) {
            let shift: number
            if (column % 2 == 0) {
                shift = CHRISTMAS_STRING_HEIGHT - 1 - row
            } else {
                shift = row
            }
            christmasString.setPixelColor(shift + column * CHRISTMAS_STRING_HEIGHT, field[row + 1][column + 1])
        }
    }
    christmasString.show()
}

function showFieldWithFigure() {
    showField(getFieldWithFigure(currentField, currentFigure, currentX, currentY))
}

function canGame(): boolean {
    return !isGameOver && !isPaused
}

function pauseGame() {
    isPaused = true
}

function moveLeft() {
    if (!canGame()) {
        return
    }
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX - 1, currentY)) {
        currentX -= 1
        showFieldWithFigure()
    }
}

function moveRight() {
    if (!canGame()) {
        return
    }
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX + 1, currentY)) {
        currentX += 1
        showFieldWithFigure()
    }
}

function rotate() {
    if (!canGame()) {
        return
    }
    let rotatedFigure = getRotatedFigure(currentFigure)
    if (isFieldPossibleWithFigure(currentField, rotatedFigure, currentX, currentY)) {
        currentFigure = rotatedFigure
        showFieldWithFigure()
    }
}

function moveDown() {
    if (!canGame()) {
        return
    }
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX, currentY + 1)) {
        currentY += 1
    } else {
        endMovements()
        if (isGameOver)
            christmasString.setBrightness(GAMEOVER_BRIGHTNESS)
    }
    showFieldWithFigure()
}

function getDelay(): number {
    let level = Math.floor(collapsedLines / 10) % 100
    return BASE_DELAY * (100 - level) / 100
}

function startMovingDown() {
    currentTask += 1
    let task = currentTask
    control.inBackground(function () {
        while (true) {
            basic.pause(getDelay())
            if (task != currentTask)
                break
            moveDown()
        }
    })
}

function startGame() {
    currentField = getEmptyField()
    collapsedLines = 0
    isPaused = false
    isGameOver = false
    generateNextFigureConfiguration()
    changeFigure(getNextFigure())
    christmasString.setBrightness(MAX_BRIGHTNESS)
    showFieldWithFigure()
    startMovingDown()
}

function resumeGame() {
    if (isPaused) {
        startMovingDown()
    }
    isPaused = false
}

input.onButtonPressed(Button.A, moveLeft)
input.onButtonPressed(Button.B, moveRight)
input.onButtonPressed(Button.AB, moveDown)
input.onLogoEvent(TouchButtonEvent.Pressed, rotate)
input.onGesture(Gesture.ScreenDown, pauseGame)
input.onGesture(Gesture.ScreenUp, resumeGame)

startGame()
