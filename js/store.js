const storageKey = 'timeTrackerState';

class Store {
    ///////////////////////////////////////////////////// variables
    #state = {
        isRunning: false,
        startedAt: null, // sec
        task: null,
        project: null,
        history: [],
    };

    #subscribers = new Set();

    constructor() {
        this.#loadState();
    }

    ///////////////////////////////////////////////////// localStorage
    #loadState() {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.history)) {
                this.#state = parsed;
            }
            // else {
            //     this.#state = []; // tu by trzeba było podmienić na pusty wzór tabeli
            // }
        } catch (error) {
            console.warn('localStorage loading error:', error);
        }
    }
    #saveState() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(this.#state));
        } catch (error) {
            console.warn('localStorage saving error:', error);
        }
    }

    ///////////////////////////////////////////////////

    subscribe(callback) {
        this.#subscribers.add(callback);
        callback(this.getState(), { type: 'initialize' });
        return () => this.#subscribers.delete(callback);
    }

    #notify(action) {
        this.#saveState();
        const copy = this.getState();
        for (const cb of this.#subscribers) {
            cb(copy, action);
        }
    }

    #setState(newState, action) {
        this.#state = newState;
        this.#notify(action);
    }

    getState() {
        return structuredClone(this.#state);
    }

    ///////////////////////////////////////////////////// praca z ui.js v

    startTimer() {
        if (this.#state.isRunning) return;

        this.#setState(
            {
                ...this.#state,
                isRunning: true,
                startedAt: Math.floor(Date.now() / 1000),
            },
            { type: 'timerStarted' },
        );
    }

    stopTimer() {
        if (!this.#state.isRunning) return;

        const record = {
            id: crypto.randomUUID(),
            startedAt: this.#state.startedAt,
            endedAt: Math.floor(Date.now() / 1000),
            task: this.#state.task,
            project: this.#state.project,
        };

        this.#setState(
            {
                isRunning: false,
                startedAt: null,
                task: '',
                project: '',
                history: [...this.#state.history, record],
            },
            { type: 'timerStopped', record },
        );
    }

    deleteRecord(id) {
        this.#setState(
            {
                ...this.#state,
                history: this.#state.history.filter((r) => r.id !== id),
            },
            { type: 'recordDeleted', id },
        );
    }

    setTask(task, project) {
        this.#setState(
            {
                ...this.#state,
                task,
                project,
            },
            { type: 'taskChanged' },
        );
    }

    //     addShape(type) {
    //         const shape = {
    //             id: generateID(),
    //             type: type,
    //             color: generateColor(),
    //         };
    //         const newState = {
    //             shapes: [...this.#state.shapes, shape],
    //         };
    //         this.#setState(newState, { type: 'addShape', shape });
    //     }
    //     removeShape(id) {
    //         const newState = {
    //             shapes: this.#state.shapes.filter((s) => s.id !== id),
    //         };
    //         this.#setState(newState, { type: 'removeShape', id });
    //     }
    //     recolorShapes(type) {
    //         for (const s of this.#state.shapes) {
    //             if (s.type === type) {
    //                 s.color = generateColor();
    //             }
    //         }
    //         this.#setState(this.#state, { type: 'recolorShapes', shapeType: type });
    //     }
    //     getCounts() {
    //         const counts = { square: 0, circle: 0 };
    //         for (const s of this.#state.shapes) {
    //             counts[s.type]++;
    //         }
    //         return counts;
    //     }
}

export const store = new Store();
