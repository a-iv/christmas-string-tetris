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
    FIGURE_MAPS = [getFigureJMap()]
    FIGURE_COLORS = [getFigureJColor()]
    BASE_DELAY = 100
    COLLAPSE_LINE_MELODY = "G C5"
    COLLAPSE_LINE_BPM = 8000
    NEXT_FIGURE_MELODY = "G C"
    NEXT_FIGURE_BPM = 8000
    MOVE_MELODY = "C"
    MOVE_BPM = 20000
    ROTATE_MELODY = "C5"
    ROTATE_BPM = 20000
    christmasString = neopixel.create(DigitalPin.P1, CHRISTMAS_STRING_WIDTH * CHRISTMAS_STRING_HEIGHT, NeoPixelMode.RGB)
    currentTask = 0
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

function testGetRotatedFigure() {
    assertArrayEquals(getRotatedFigure(getFigureJ()), [
        [3, 0, 0],
        [3, 3, 3],
        [0, 0, 0]
    ])
    assertArrayEquals(getRotatedFigure(getRotatedFigure(getFigureJ())), [
        [0, 3, 3],
        [0, 3, 0],
        [0, 3, 0]
    ])
    assertArrayEquals(getRotatedFigure(getRotatedFigure(getRotatedFigure(getFigureJ()))), [
        [0, 0, 0],
        [3, 3, 3],
        [0, 0, 3]
    ])
    assertArrayEquals(
        getRotatedFigure(getRotatedFigure(getRotatedFigure(getRotatedFigure(getFigureJ())))), getFigureJ())
}

function testGetCollapsedField() {
    collapsedLines = 0
    assertArrayEquals(getCollapsedField([
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 9, 0, 2],
        [2, 8, 7, 6, 5, 2],
        [2, 0, 4, 0, 0, 2],
        [2, 3, 3, 3, 3, 2],
        [0, 2, 2, 2, 2, 0],
    ]), [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 9, 0, 2],
        [2, 0, 4, 0, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ])
    control.assert(collapsedLines == 2)
}

function testGetNumberOfTopEmptyRows() {
    control.assert(getNumberOfTopEmptyRows([
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0]
    ]) == 0)
    control.assert(getNumberOfTopEmptyRows([
        [0, 0, 0],
        [3, 3, 3],
        [0, 0, 3]
    ]) == 1)
}

function testGenerateNextFigureConfiguration() {
    generateNextFigureConfiguration()
    control.assert(nextFigureIndex >= 0 && nextFigureIndex < FIGURE_MAPS.length)
    control.assert(nextRotateCount >= 0 && nextRotateCount < 4)
}

function testGetNextFigure() {
    nextFigureIndex = 0
    nextRotateCount = 0
    assertArrayEquals(getNextFigure(), getFigureJ())

    nextFigureIndex = 0
    nextRotateCount = 1
    assertArrayEquals(getNextFigure(), getRotatedFigure(getFigureJ()))
}

function setUpGameTest(field: number[][], figure: number[][], x: number, y: number, next: number[][]) {
    isGameOver = false
    isPaused = false
    currentField = field
    currentFigure = figure
    currentX = x
    currentY = y
    nextFigure = next
    collapsedLines = 0
    lastMelody = undefined
    lastBPM = undefined
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
        [0, 0, 0],
        [3, 3, 3],
        [0, 0, 3]
    ], 2, 0)
    assertChangeFigure([
        [4, 4],
        [4, 4],
    ], 2, 1)
    assertChangeFigure([
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
    ], 1, -1)
}

function assertMusic(melody: string, bpm: number) {
    control.assert(lastMelody == melody)
    control.assert(lastBPM == bpm)
}

function testMusic() {
    lastMelody = undefined
    lastBPM = undefined
    playMusic(COLLAPSE_LINE_MELODY, COLLAPSE_LINE_BPM)
    assertMusic(COLLAPSE_LINE_MELODY, COLLAPSE_LINE_BPM)
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
    control.assert(collapsedLines == 0)
    control.assert(!isGameOver)
    assertMusic(NEXT_FIGURE_MELODY, NEXT_FIGURE_BPM)

    setUpGameTest([
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 4, 0, 0, 0, 2],
        [2, 4, 4, 0, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ], getFigureJ(), 3, 5, getFigureO())
    endMovements()
    assertArrayEquals(currentField, [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 3, 2],
        [2, 4, 0, 0, 3, 2],
        [0, 2, 2, 2, 2, 0],
    ])
    assertArrayEquals(currentFigure, getFigureO())
    control.assert(collapsedLines == 1)
    control.assert(!isGameOver)
    assertMusic(COLLAPSE_LINE_MELODY, COLLAPSE_LINE_BPM)

    setUpGameTest([
        [0, 2, 2, 2, 2, 0],
        [2, 0, 0, 0, 0, 2],
        [2, 0, 0, 4, 0, 2],
        [2, 0, 0, 4, 0, 2],
        [2, 0, 4, 4, 4, 2],
        [2, 4, 4, 4, 0, 2],
        [2, 0, 4, 4, 4, 2],
        [2, 4, 4, 4, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ], getFigureJ(), 1, 1, getFigureO())
    endMovements()
    assertArrayEquals(currentField, [
        [0, 2, 2, 2, 2, 0],
        [2, 0, 3, 0, 0, 2],
        [2, 0, 3, 4, 0, 2],
        [2, 3, 3, 4, 0, 2],
        [2, 0, 4, 4, 4, 2],
        [2, 4, 4, 4, 0, 2],
        [2, 0, 4, 4, 4, 2],
        [2, 4, 4, 4, 0, 2],
        [0, 2, 2, 2, 2, 0],
    ])
    assertArrayEquals(currentFigure, getFigureO())
    control.assert(collapsedLines == 0)
    control.assert(isGameOver)
    assertMusic(NEXT_FIGURE_MELODY, NEXT_FIGURE_BPM)
}

function testShowField() {
    showField(getEmptyField())
}

function testShowFieldWithFigure() {
    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    showFieldWithFigure()
}

function testCanGame() {
    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    control.assert(canGame())

    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    isGameOver = true
    control.assert(!canGame())
}

function testPauseGame() {
    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    control.assert(canGame())

    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO())
    pauseGame()
    control.assert(!canGame())
}

function testMoveLeft() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    pauseGame()
    moveLeft()
    control.assert(currentX == 2)
    assertMusic(undefined, undefined)

    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    moveLeft()
    control.assert(currentX == 1)
    assertMusic(MOVE_MELODY, MOVE_BPM)

    setUpGameTest(getEmptyField(), getFigureJ(), 1, 1, getFigureO());
    moveLeft()
    control.assert(currentX == 1, "Left border")
    assertMusic(MOVE_MELODY, MOVE_BPM)
}

function testMoveRight() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    pauseGame()
    moveRight()
    control.assert(currentX == 2)
    assertMusic(undefined, undefined)

    setUpGameTest(getEmptyField(), getFigureJ(), 2, 1, getFigureO());
    moveRight()
    control.assert(currentX == 3)
    assertMusic(MOVE_MELODY, MOVE_BPM)

    setUpGameTest(getEmptyField(), getFigureJ(), 3, 1, getFigureO());
    moveRight()
    control.assert(currentX == 3, "Right border")
    assertMusic(MOVE_MELODY, MOVE_BPM)
}

function testRotate() {
    let field = [
        [0, 2, 2, 2, 2, 0],
        [2, 4, 0, 0, 0, 2],
        [2, 4, 0, 0, 0, 2],
        [2, 4, 0, 0, 4, 2],
        [2, 4, 0, 0, 4, 2],
        [2, 4, 0, 0, 4, 2],
        [2, 4, 0, 0, 4, 2],
        [2, 4, 0, 0, 4, 2],
        [0, 2, 2, 2, 2, 0],
    ]
    setUpGameTest(field, getFigureJ(), 2, 1, getFigureO())
    pauseGame()
    rotate()
    assertArrayEquals(currentFigure, getFigureJ())
    assertMusic(undefined, undefined)

    setUpGameTest(field, getFigureJ(), 2, 1, getFigureO())
    rotate()
    assertArrayEquals(currentFigure, getRotatedFigure(getFigureJ()))
    assertMusic(ROTATE_MELODY, ROTATE_BPM)

    setUpGameTest(field, getFigureJ(), 2, 2, getFigureO())
    rotate()
    assertArrayEquals(currentFigure, getFigureJ())
    assertMusic(ROTATE_MELODY, ROTATE_BPM)
}

function testMoveDown() {
    setUpGameTest(getEmptyField(), getFigureJ(), 2, 4, getFigureO())
    pauseGame()
    moveDown()
    control.assert(currentY == 4)
    assertArrayEquals(currentFigure, getFigureJ())
    assertMusic(undefined, undefined)

    setUpGameTest(getEmptyField(), getFigureJ(), 2, 4, getFigureO())
    moveDown()
    control.assert(currentY == 5)
    assertArrayEquals(currentFigure, getFigureJ())
    assertMusic(undefined, undefined)

    setUpGameTest(getEmptyField(), getFigureJ(), 2, 5, getFigureO())
    moveDown()
    control.assert(currentY == 1)
    assertArrayEquals(currentFigure, getFigureO())
    assertMusic(NEXT_FIGURE_MELODY, NEXT_FIGURE_BPM)
}

function testGetDelay() {
    collapsedLines = 0
    control.assert(getDelay() == 100)
    collapsedLines = 9
    control.assert(getDelay() == 100)
    collapsedLines = 10
    control.assert(getDelay() == 99)
    collapsedLines = 100
    control.assert(getDelay() == 90)
    collapsedLines = 999
    control.assert(getDelay() == 1)
    collapsedLines = 1000
    control.assert(getDelay() == 100)
}

function testStartGame() {
    startGame()
    control.assert(canGame())
}

function testResumeGame() {
    startGame()
    control.assert(canGame())

    pauseGame()
    control.assert(!canGame())
    resumeGame()
    control.assert(canGame())

    for (let i = 0; i < 100; i++) {
        moveDown()
    }
    control.assert(!canGame())
    resumeGame()
    control.assert(canGame())
}

if (RUN_TESTS) {
    setUp()
    testGetEmptyRow()
    testGetEmptyField()
    testGetFigureWidth()
    testGetColorFigure()
    testGetFieldWithFigure()
    testIsFieldPossibleWithFigure()
    testGetRotatedFigure()
    testGetCollapsedField()
    testGetNumberOfTopEmptyRows()
    testGenerateNextFigureConfiguration()
    testGetNextFigure()
    testChangeFigure()
    testMusic()
    testEndMovements()
    testShowField()
    testShowFieldWithFigure()
    testCanGame()
    testPauseGame()
    testMoveLeft()
    testMoveRight()
    testRotate()
    testMoveDown()
    testGetDelay()
    testStartGame()
    testResumeGame()
    console.log("PASSED")
}
