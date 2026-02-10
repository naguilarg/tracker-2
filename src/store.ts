import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
    id: string;
    name: string;
    client?: string;
    deadline?: string; // ISO date string
    budgetHours?: number;
    status: 'active' | 'paused' | 'completed';
    createdAt: number;
}

export interface TaskSession {
    start: number;
    end?: number;
    duration: number; // Duration in seconds
}

export interface Task {
    id: string;
    name: string;
    projectId: string;
    user: 'Nacho' | 'Flo';
    accumulatedTime: number; // in seconds
    status: 'active' | 'paused' | 'completed'; // active means running NOW? No, creating 'running' logic separately might be safer, but user request implies 'active' = running timer? 
    // Wait, task status 'active' usually means 'not archived'. Timer running is ephemeral.
    // Actually request says: 'Opción de eliminar permanentemente del histórico' (implies tasks have lifecycle).
    // AND 'any active task must pause automatically'.
    // Let's separate 'isRunning' from 'status'.
    // But to persist running state (e.g. reload page), we need to store start time.
    isRunning: boolean;
    createdAt: number;
    completedAt?: number;
    sessions: TaskSession[];
}

interface AppState {
    projects: Project[];
    tasks: Task[];
    activeTab: string;
    setActiveTab: (tab: string) => void;

    addProject: (p: Project) => void;
    updateProject: (id: string, data: Partial<Project>) => void;
    deleteProject: (id: string) => void;

    addTask: (t: Task) => void;
    updateTask: (id: string, data: Partial<Task>) => void;
    deleteTask: (id: string) => void;
    recoverTask: (id: string) => void; // Move from completed back to active

    // Timer actions
    startTimer: (taskId: string) => void;
    pauseTimer: (taskId: string) => void;
    stopTask: (taskId: string) => void; // Mark as completed

    // Session management
    updateTaskSession: (taskId: string, sessionIndex: number, updates: { start?: number; end?: number }) => void;
    addManualSession: (taskId: string, start: number, end: number) => void;
    deleteTaskSession: (taskId: string, sessionIndex: number) => void;

    // Computed helpers could be here or in components
}

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            projects: [],
            tasks: [],
            activeTab: 'Nacho',
            setActiveTab: (tab) => set({ activeTab: tab }),

            addProject: (p) => set((state) => ({ projects: [...state.projects, p] })),
            updateProject: (id, data) => set((state) => ({
                projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p))
            })),
            deleteProject: (id) => set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                tasks: state.tasks.filter(t => t.projectId !== id) // Cascade delete tasks
            })),

            addTask: (t) => set((state) => ({ tasks: [...state.tasks, t] })),
            updateTask: (id, data) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
            })),
            deleteTask: (id) => set((state) => ({
                tasks: state.tasks.filter(t => t.id !== id)
            })),
            recoverTask: (id) => set((state) => ({
                tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'active', completedAt: undefined } : t)
            })),

            startTimer: (taskId) => {
                const now = Date.now();
                const state = get();
                const taskToStart = state.tasks.find(t => t.id === taskId);
                if (!taskToStart) return;

                // Find currently running task for THIS USER and pause it
                const user = taskToStart.user;
                const runningTask = state.tasks.find(t => t.user === user && t.isRunning);

                const newTasks = state.tasks.map(t => {
                    // Pause currently running task (if any)
                    if (t.id === runningTask?.id) {
                        const lastSessionIdx = t.sessions.length - 1;
                        const lastSession = t.sessions[lastSessionIdx];
                        // If there is an open session, close it
                        if (lastSession && !lastSession.end) {
                            const sessionDuration = Math.round((now - lastSession.start) / 1000);
                            const updatedSessions = [...t.sessions];
                            updatedSessions[lastSessionIdx] = { ...lastSession, end: now, duration: sessionDuration };
                            return {
                                ...t,
                                isRunning: false,
                                sessions: updatedSessions,
                                accumulatedTime: t.accumulatedTime + sessionDuration
                            };
                        }
                        return { ...t, isRunning: false };
                    }
                    // Start the target task
                    if (t.id === taskId) {
                        return {
                            ...t,
                            isRunning: true,
                            sessions: [...t.sessions, { start: now, duration: 0 }]
                        };
                    }
                    return t;
                });

                set({ tasks: newTasks });
            },

            pauseTimer: (taskId) => {
                const now = Date.now();
                set((state) => ({
                    tasks: state.tasks.map(t => {
                        if (t.id === taskId && t.isRunning) {
                            const lastSessionIdx = t.sessions.length - 1;
                            const lastSession = t.sessions[lastSessionIdx];
                            if (lastSession && !lastSession.end) {
                                const sessionDuration = Math.round((now - lastSession.start) / 1000);
                                const updatedSessions = [...t.sessions];
                                updatedSessions[lastSessionIdx] = { ...lastSession, end: now, duration: sessionDuration };
                                return {
                                    ...t,
                                    isRunning: false,
                                    sessions: updatedSessions,
                                    accumulatedTime: t.accumulatedTime + sessionDuration
                                };
                            }
                            return { ...t, isRunning: false };
                        }
                        return t;
                    })
                }));
            },

            stopTask: (taskId) => {
                // Pauses if running, and sets status to completed
                const state = get();
                const task = state.tasks.find(t => t.id === taskId);
                if (task?.isRunning) {
                    get().pauseTimer(taskId); // Re-fetch logic or call internal? Calling internal from set is tricky with persist middleware sometimes.
                    // Better to duplicate logic or call actions.
                    // Zustand actions can call other actions from get().
                    get().pauseTimer(taskId);
                }

                set((state) => ({
                    tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', completedAt: Date.now() } : t)
                }));
            },

            // Session management
            updateTaskSession: (taskId: string, sessionIndex: number, updates: { start?: number; end?: number }) =>
                set((state) => ({
                    tasks: state.tasks.map((task) => {
                        if (task.id !== taskId) return task;

                        const updatedSessions = [...task.sessions];
                        const session = updatedSessions[sessionIndex];
                        if (!session) return task;

                        updatedSessions[sessionIndex] = {
                            start: updates.start ?? session.start,
                            end: updates.end ?? session.end,
                            duration: session.duration
                        };

                        // Recalculate accumulated time
                        const accumulatedTime = updatedSessions.reduce((total, s) => {
                            if (s.end) {
                                return total + Math.round((s.end - s.start) / 1000);
                            }
                            return total;
                        }, 0);

                        return { ...task, sessions: updatedSessions, accumulatedTime };
                    }),
                })),

            addManualSession: (taskId: string, start: number, end: number) =>
                set((state) => ({
                    tasks: state.tasks.map((task) => {
                        if (task.id !== taskId) return task;

                        const duration = Math.round((end - start) / 1000);
                        const newSession = { start, end, duration };
                        const updatedSessions = [...task.sessions, newSession];

                        // Recalculate accumulated time
                        const accumulatedTime = updatedSessions.reduce((total, s) => {
                            if (s.end) {
                                return total + Math.round((s.end - s.start) / 1000);
                            }
                            return total;
                        }, 0);

                        return { ...task, sessions: updatedSessions, accumulatedTime };
                    }),
                })),

            deleteTaskSession: (taskId: string, sessionIndex: number) =>
                set((state) => ({
                    tasks: state.tasks.map((task) => {
                        if (task.id !== taskId) return task;

                        const updatedSessions = task.sessions.filter((_, i) => i !== sessionIndex);

                        // Recalculate accumulated time
                        const accumulatedTime = updatedSessions.reduce((total, s) => {
                            if (s.end) {
                                return total + Math.round((s.end - s.start) / 1000);
                            }
                            return total;
                        }, 0);

                        return { ...task, sessions: updatedSessions, accumulatedTime };
                    }),
                })),

        }),
        {
            name: 'colmillo-storage', // unique name
        }
    )
);
