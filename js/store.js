const storageKey = 'timeTrackerState';

//store dla Taskow
class Store {
    ///////////////////////////////////////////////////// variables
    #state = {
        isRunning: false,
        startedAt: null, // sec
        task: null,
        project: null,
        history: [],
    };

    #stateProjects = [
        {
            id: crypto.randomUUID(),
            name: 'Opieka nad Jamnikiem',
            details: ''
        },
        {
            id: crypto.randomUUID(),
            name: 'Projekt Strona WWW',
            details: ''
        },
        {
            id: crypto.randomUUID(),
            name: 'Kontakt z klientami',
            details: ''
        }
        ];

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
///////----------------PROJECTS-----------------///////

    // Save the current state of projects to localStorage
    saveStateProject() {
        localStorage.setItem('projects', JSON.stringify(this.#stateProjects));
    } 

    // Load the state of projects from localStorage
    loadStateProject() {
        const savedState = localStorage.getItem('projects');
        if (savedState) {
            this.#stateProjects = JSON.parse(savedState);
            //this.#notify({ type: 'stateLoaded', projects: this.#stateProjects });
        } else {
            this.#stateProjects = []; // Initialize with an empty array if no saved state exists
        }
    }

    // Set the state of projects
    #setStateProject(newState, action) {
        this.#stateProjects = newState; // Update the state with the new projects array
        this.saveStateProject(); // Save the updated state to localStorage
        //this.#notify(action); // Notify listeners about the state change
    }

    // Get the current state of projects
    getStateProject() {
        return structuredClone(this.#stateProjects); // Return a deep copy of the projects array
    }
    getProjects() {
        return this.#stateProjects; // Return the array of projects directly
    }
    
    addProject(name) {
        const project = {
            id: crypto.randomUUID(),
            name: name,
            details: '', // Initialize with empty details
        };
    
        this.#setStateProject(
            [...this.#stateProjects, project], // Add the new project to the array
            { type: 'projectAdded', project }
        );
    }
    
    editProject(id, newName) {
        const updatedProjects = this.#stateProjects.map((project) => {
            if (project.id === id) {
                return { ...project, name: newName }; // Update the project name
            }
            return project;
        });
    
        this.#setStateProject(
            updatedProjects, // Update the array with the modified project
            { type: 'projectUpdated', id, newName }
        );
    }
    
    deleteProject(id) {
        const filteredProjects = this.#stateProjects.filter((project) => project.id !== id);
    
        this.#setStateProject(
            filteredProjects, // Remove the project from the array
            { type: 'projectDeleted', id }
        );
    }
    
    getProjectDetails(id) {
        const project = this.#stateProjects.find((project) => project.id === id);
        return project ? project.details : null; // Return the details of the project
    }
    
    setProjectDetails(id, details) {
        const updatedProjects = this.#stateProjects.map((project) => {
            if (project.id === id) {
                return { ...project, details: details }; // Update the project details
            }
            return project;
        });
    
        this.#setStateProject(
            updatedProjects, // Update the array with the modified project
            { type: 'projectDetailsSet', id, details }
        );
    }

}
export const store = new Store();
