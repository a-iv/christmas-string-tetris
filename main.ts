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

function generateNextFigureConfiguration() {
    nextFigureIndex += 1
    if (nextFigureIndex >= FIGURE_MAPS.length) {
        nextFigureIndex = 0
    }
}

function getNextFigure(): number[][] {
    return getColorFigure(FIGURE_MAPS[nextFigureIndex], FIGURE_COLORS[nextFigureIndex])
}

function changeFigure(figure: number[][]) {
    currentFigure = figure
    currentX = Math.floor((getFieldWidth() - getFigureWidth(currentFigure) + 1) / 2)
    currentY = 1
    generateNextFigureConfiguration()
    nextFigure = getNextFigure()
}

function endMovements() {
    currentField = getFieldWithFigure(currentField, currentFigure, currentX, currentY)
    changeFigure(nextFigure)
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

function moveLeft() {
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX - 1, currentY)) {
        currentX -= 1
        showFieldWithFigure()
    }
}

function moveRight() {
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX + 1, currentY)) {
        currentX += 1
        showFieldWithFigure()
    }
}

function moveDown() {
    if (isFieldPossibleWithFigure(currentField, currentFigure, currentX, currentY + 1)) {
        currentY += 1
    } else {
        endMovements()
    }
    showFieldWithFigure()
}

function startGame() {
    currentField = getEmptyField()
    generateNextFigureConfiguration()
    changeFigure(getNextFigure())
    showFieldWithFigure()
}

input.onButtonPressed(Button.A, moveLeft)
input.onButtonPressed(Button.B, moveRight)
input.onButtonPressed(Button.AB, moveDown)

startGame()
