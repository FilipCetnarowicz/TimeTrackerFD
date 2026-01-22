import { generateColor, generateID } from './helpers.js';

const storageKey = 'shapesAppState';

class Store {
    ///////////////////////////////////////////////////// variables

    #state = {
        tasks: [],
        projects: [],
        tags: [],
        // users: [], - to raczej powinien być już zalogowany człowiek przez http
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
            if (parsed && Array.isArray(parsed.shapes)) {
                this.#state.shapes = parsed.shapes;
                this.#state.shapes = parsed.projects;
                this.#state.shapes = parsed.shapes;
            } else {
                this.#state.tasks = [];
                this.#state.projects = [];
                this.#state.tags = [];
                // this.#state.users = [];
            }
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

    /////////////////////////////////////////////////////

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

    /////////////////////////////////////////////////////

    addShape(type) {
        const shape = {
            id: generateID(),
            type: type,
            color: generateColor(),
        };

        const newState = {
            shapes: [...this.#state.shapes, shape],
        };

        this.#setState(newState, { type: 'addShape', shape });
    }

    removeShape(id) {
        const newState = {
            shapes: this.#state.shapes.filter((s) => s.id !== id),
        };

        this.#setState(newState, { type: 'removeShape', id });
    }

    recolorShapes(type) {
        for (const s of this.#state.shapes) {
            if (s.type === type) {
                s.color = generateColor();
            }
        }

        this.#setState(this.#state, { type: 'recolorShapes', shapeType: type });
    }

    getCounts() {
        const counts = { square: 0, circle: 0 };
        for (const s of this.#state.shapes) {
            counts[s.type]++;
        }
        return counts;
    }
}

export const store = new Store();
