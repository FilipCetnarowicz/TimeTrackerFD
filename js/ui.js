// export function initUI(store)
export function initUI(store) {
    ///////////////////////////////////////////////////// tags

    // const addSquareBtn = document.getElementById('addSquare');
    // const addCircleBtn = document.getElementById('addCircle');
    // const recolorSquaresBtn = document.getElementById('recolorSquares');
    // const recolorCirclesBtn = document.getElementById('recolorCircles');
    // const cntSquaresEl = document.getElementById('cntSquares');
    // const cntCirclesEl = document.getElementById('cntCircles');

    const board = document.getElementById('board');

    const btnStartStop = document.getElementById('btnStartStop');
    const timer = document.getElementById('timer');

    let uiTimerId = null;

    const taskInput = document.getElementById('inputTask');
    const projectSelect = document.getElementById('selectProject');

    const asideToggle = document.getElementById('asideToggle');

    ///////////////////////////////////////////////////// listeners

    asideToggle.addEventListener('click', () => {
        document.body.classList.toggle('asideToggleCollapsed');
    });

    btnStartStop.addEventListener('click', () => {
        btnStartStop.dataset.state === 'running'
            ? store.stopTimer()
            : store.startTimer();
    });

    board.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const entry = btn.closest('.entry');
        if (!entry) return;

        if (btn.dataset.action === 'delete') {
            store.deleteRecord(entry.dataset.id);
        }
    });

    taskInput.addEventListener('input', () => {
        store.setTask(taskInput.value, projectSelect.value);
    });

    projectSelect.addEventListener('change', () => {
        store.setTask(taskInput.value, projectSelect.value);
    });

    // addSquareBtn.addEventListener('click', () => {
    //     store.addShape('square');
    // });

    // addCircleBtn.addEventListener('click', () => {
    //     store.addShape('circle');
    // });

    // recolorSquaresBtn.addEventListener('click', () => {
    //     store.recolorShapes('square');
    // });

    // recolorCirclesBtn.addEventListener('click', () => {
    //     store.recolorShapes('circle');
    // });

    // board.addEventListener('click', (e) => {
    //     if (!e.target.classList.contains('shape')) return;
    //     const id = e.target.dataset.id;
    //     if (!id) return;
    //     store.removeShape(id);
    // });

    ///////////////////////////////////////////////////// DOM manipulation

    function createHistoryElement(record) {
        const el = document.createElement('div');
        el.className = 'entry';
        el.dataset.id = record.id;

        const start = new Date(record.startedAt * 1000);
        const end = new Date(record.endedAt * 1000);
        const hhmm = (d) =>
            `${String(d.getHours()).padStart(2, '0')}:${String(
                d.getMinutes(),
            ).padStart(2, '0')}`;

        el.innerHTML = `
        <button data-action="changeTime">
            ${start.toLocaleDateString()} ${hhmm(start)}-${hhmm(end)}
        </button>
        <button data-action="changeTask">
            ${record.task || '—'}
        </button>
        <button data-action="changeProject">
            ${record.project || '—'}
        </button>
        <button data-action="continue">▶</button>
        <button data-action="delete">✖</button>
        <button data-action="split">✂</button>
    `;

        return el;
    }

    function addHistoryElement(record) {
        board.appendChild(createHistoryElement(record));
    }

    function renderStartStop(running) {
        btnStartStop.dataset.state = running ? 'running' : 'stopped';
        btnStartStop.textContent = running ? '⏸' : '▶';
    }

    function renderTimer(sec) {
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        timer.textContent = `${h}:${m}:${s}`;
    }

    function startUITimer(startedAt) {
        stopUITimer();

        uiTimerId = setInterval(() => {
            const sec = Math.floor(Date.now() / 1000) - startedAt;
            renderTimer(sec);
        }, 1000);
    }

    function stopUITimer() {
        if (uiTimerId) {
            clearInterval(uiTimerId);
            uiTimerId = null;
        }
    }

    // function createShapeElement(shape) {
    //     const el = document.createElement('div');
    //     el.classList.add('shape');

    //     el.style.backgroundColor = shape.color;
    //     el.dataset.type = shape.type;
    //     el.dataset.id = shape.id;
    //     return el;
    // }

    // function renderAllShapes(shapes) {
    //     board.innerHTML = '';
    //     shapes.forEach((shape) => {
    //         const el = createShapeElement(shape);
    //         board.appendChild(el);
    //     });
    //     updateCounters();
    // }

    // function addShapeToBoard(shape) {
    //     const el = createShapeElement(shape);
    //     board.appendChild(el);
    //     updateCounters();
    // }

    // function removeShapeFromBoard(id) {
    //     const el = board.querySelector(`[data-id="${id}"]`);
    //     el.remove();
    //     updateCounters();
    // }

    // function updateColorsForType(shapes, type) {
    //     shapes
    //         .filter((s) => s.type === type)
    //         .forEach((shape) => {
    //             const el = board.querySelector(`[data-id="${shape.id}"]`);
    //             el.style.backgroundColor = shape.color;
    //         });
    // }

    // function updateCounters() {
    //     const { square, circle } = store.getCounts();
    //     cntSquaresEl.textContent = square;
    //     cntCirclesEl.textContent = circle;
    // }
    ///////////////////////////////////////////////////// store subscription

    const handlers = {
        initialize: (state) => {
            renderStartStop(state.isRunning);

            if (state.isRunning && state.startedAt) {
                const sec = Math.floor(Date.now() / 1000) - state.startedAt;
                renderTimer(sec);
                startUITimer(state.startedAt);
            } else {
                renderTimer(0);
            }

            board.innerHTML = '';
            state.history.forEach(addHistoryElement);
        },

        timerStarted: (state) => {
            renderStartStop(true);
            startUITimer(state.startedAt);
        },

        timerStopped: (_, action) => {
            renderStartStop(false);
            stopUITimer();
            renderTimer(0);
            addHistoryElement(action.record);
        },

        recordDeleted: (_, action) => {
            const el = board.querySelector(`.entry[data-id="${action.id}"]`);
            el?.remove();
        },

        //         initialize: (state, action) => renderAllShapes(state.shapes),
        //         addShape: (state, action) => addShapeToBoard(action.shape),
        //         removeShape: (state, action) => removeShapeFromBoard(action.id),
        //         recolorShapes: (state, action) =>
        //             updateColorsForType(state.shapes, action.shapeType),
    };

    store.subscribe((state, action) => {
        handlers[action.type]?.(state, action);
    });
}
