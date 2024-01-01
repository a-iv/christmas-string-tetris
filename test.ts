let RUN_TESTS = true

function getFigureJMap(): number[][] {
    return [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ]
}

function getFigureJColor(): number {
    return 3
}

function getFigureJ(): number[][] {
    return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]
    ]
}

function getFigureO(): number[][] {
    return [
        [4, 4],
        [4, 4],
    ]
}

function setUp() {
    CHRISTMAS_STRING_WIDTH = 4
    CHRISTMAS_STRING_HEIGHT = 7
    BORDER_COLOR = 2
    BACKGROUND_COLOR = 0
    christmasString = neopixel.create(DigitalPin.P1, CHRISTMAS_STRING_WIDTH * CHRISTMAS_STRING_HEIGHT, NeoPixelMode.RGB)
    FIGURE_MAPS = [getFigureJMap()]
    FIGURE_COLORS = [getFigureJColor()]
}

function assertArrayEquals(array1: any[], array2: any[]) {
    let string1 = JSON.stringify(array1)
    let string2 = JSON.stringify(array2)
    control.assert(string1 == string2, string1 + " != " + string2)
}

function testGetEmptyRow() {
    assertArrayEquals(getEmptyRow(2, 0), [2, 0, 0, 0, 0, 2])
}

function testGetEmptyField() {
    assertArrayEquals(getEmptyField(), [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ])
}

function testGetFigureWidth() {
    let figure = [
        [0, 0, 0],
        [0, 0, 0],
    ]
    control.assert(getFigureWidth(figure) == 3)
    control.assert(getFigureHeight(figure) == 2)
}

function testGetColorFigure() {
    assertArrayEquals(getColorFigure(getFigureJMap(), getFigureJColor()), getFigureJ())
}

function testGetFieldWithFigure() {
    assertArrayEquals(getFieldWithFigure(getEmptyField(), getFigureJ(), 1, 1), [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 3, 0, 0, 2],
        [2, 0, 3, 0, 0, 2],
        [2, 3, 3, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ])
}

function testIsFieldPossibleWithFigure() {
    control.assert(!isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 0, 1), "Left border")
    control.assert(isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 1, 1))
    control.assert(isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 3, 1))
    control.assert(!isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 4, 1), "Right border")
    control.assert(isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 1, 5))
    control.assert(!isFieldPossibleWithFigure(getEmptyField(), getFigureJ(), 1, 6), "Bottom border")
}

function testGenerateNextFigureConfiguration() {
    nextFigureIndex = 0
    generateNextFigureConfiguration()
    control.assert(nextFigureIndex >= 0 && nextFigureIndex < FIGURE_MAPS.length)
}

function testGetNextFigure() {
    nextFigureIndex = 0
    assertArrayEquals(getNextFigure(), getFigureJ())
}

function setUpGameTest(field: number[][], figure: number[][], x: number, y: number, next: number[][]) {
    currentField = field
    currentFigure = figure
    currentX = x
    currentY = y
    nextFigure = next
}

function assertChangeFigure(figure: number[][], resultX: number, resultY: number) {
    setUpGameTest(getEmptyField(), [], -1, -1, [])
    changeFigure(figure)
    assertArrayEquals(currentFigure, figure)
    control.assert(currentX == resultX)
    control.assert(currentY == resultY)
    control.assert(nextFigure.length > 0)
}

function testChangeFigure() {
    assertChangeFigure([
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]
    ], 2, 1)
    assertChangeFigure([
        [4, 4],
        [4, 4],
    ], 2, 1)
    assertChangeFigure([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
    ], 1, 1)
}

function testEndMovements() {
    setUpGameTest(getEmptyField(), getFigureJ(), 1, 5, getFigureO())
    endMovements()
    assertArrayEquals(currentField, [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 3, 0, 0, 2],
        [2, 0, 3, 0, 0, 2],
        [2, 3, 3, 0, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ])
    assertArrayEquals(currentFigure, getFigureO())
}

function testShowField() {
    showField(getEmptyField())
}

function testShowFieldWithFigure() {
    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    showFieldWithFigure()
}

function testMoveLeft() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    moveLeft()
    control.assert(currentX == 1)

    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO());
    moveLeft()
    control.assert(currentX == 1, "Left border")
}

function testMoveRight() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    moveRight()
    control.assert(currentX == 3)

    setUpGameTest(getEmptyField(), getFigureJ(), 3, 1, getFigureO());
    moveRight()
    control.assert(currentX == 3, "Right border")
}

function testMoveDown() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 4, getFigureO())
    moveDown()
    control.assert(currentY == 5)
    assertArrayEquals(currentFigure, getFigureJ())

    setUpGameTest(getEmptyField(), getFigureJ(), 2, 5, getFigureO())
    moveDown()
    control.assert(currentY == 1)
    assertArrayEquals(currentFigure, getFigureO())
}

function testStartGame() {
    startGame()
}

if (RUN_TESTS) {
    setUp()
    testGetEmptyRow()
    testGetEmptyField()
    testGetFigureWidth()
    testGetColorFigure()
    testGetFieldWithFigure()
    testIsFieldPossibleWithFigure()
    testGenerateNextFigureConfiguration()
    testGetNextFigure()
    testChangeFigure()
    testEndMovements()
    testShowField()
    testShowFieldWithFigure()
    testMoveLeft()
    testMoveRight()
    testMoveDown()
    testStartGame()
    console.log("PASSED")
}
