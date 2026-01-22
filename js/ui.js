export function initUI(store) {
    ///////////////////////////////////////////////////// tags

    const addSquareBtn = document.getElementById('addSquare');
    const addCircleBtn = document.getElementById('addCircle');
    const recolorSquaresBtn = document.getElementById('recolorSquares');
    const recolorCirclesBtn = document.getElementById('recolorCircles');
    const cntSquaresEl = document.getElementById('cntSquares');
    const cntCirclesEl = document.getElementById('cntCircles');
    const board = document.getElementById('board');

    ///////////////////////////////////////////////////// listeners

    addSquareBtn.addEventListener('click', () => {
        store.addShape('square');
    });

    addCircleBtn.addEventListener('click', () => {
        store.addShape('circle');
    });

    recolorSquaresBtn.addEventListener('click', () => {
        store.recolorShapes('square');
    });

    recolorCirclesBtn.addEventListener('click', () => {
        store.recolorShapes('circle');
    });

    board.addEventListener('click', (e) => {
        if (!e.target.classList.contains('shape')) return;
        const id = e.target.dataset.id;
        if (!id) return;
        store.removeShape(id);
    });

    ///////////////////////////////////////////////////// DOM manipulation

    function createShapeElement(shape) {
        const el = document.createElement('div');
        el.classList.add('shape');

        el.style.backgroundColor = shape.color;
        el.dataset.type = shape.type;
        el.dataset.id = shape.id;
        return el;
    }

    function renderAllShapes(shapes) {
        board.innerHTML = '';
        shapes.forEach((shape) => {
            const el = createShapeElement(shape);
            board.appendChild(el);
        });
        updateCounters();
    }

    function addShapeToBoard(shape) {
        const el = createShapeElement(shape);
        board.appendChild(el);
        updateCounters();
    }

    function removeShapeFromBoard(id) {
        const el = board.querySelector(`[data-id="${id}"]`);
        el.remove();
        updateCounters();
    }

    function updateColorsForType(shapes, type) {
        shapes
            .filter((s) => s.type === type)
            .forEach((shape) => {
                const el = board.querySelector(`[data-id="${shape.id}"]`);
                el.style.backgroundColor = shape.color;
            });
    }

    function updateCounters() {
        const { square, circle } = store.getCounts();
        cntSquaresEl.textContent = square;
        cntCirclesEl.textContent = circle;
    }
    ///////////////////////////////////////////////////// store subscription

    const handlers = {
        initialize: (state, action) => renderAllShapes(state.shapes),
        addShape: (state, action) => addShapeToBoard(action.shape),
        removeShape: (state, action) => removeShapeFromBoard(action.id),
        recolorShapes: (state, action) =>
            updateColorsForType(state.shapes, action.shapeType),
    };

    store.subscribe((state, action) => {
        handlers[action.type]?.(state, action);
    });
}
