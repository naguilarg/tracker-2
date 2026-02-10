import { create } from 'zustand';
import { supabase } from './lib/supabase';

export interface Project {
    id: string;
    name: string;
    client?: string;
    deadline?: string;
    budgetHours?: number;
    status: 'active' | 'paused' | 'completed';
    createdAt: number;
}

export interface TaskSession {
    id?: string;
    start: number;
    end?: number;
    duration: number;
}

export interface Task {
    id: string;
    name: string;
    projectId: string;
    user: 'Nacho' | 'Flo';
    accumulatedTime: number;
    status: 'active' | 'completed';
    isRunning: boolean;
    createdAt: number;
    completedAt?: number;
    sessions: TaskSession[];
}

interface AppState {
    projects: Project[];
    tasks: Task[];
    activeTab: string;
    isLoading: boolean;
    setActiveTab: (tab: string) => void;

    fetchData: () => Promise<void>;
    addProject: (p: Project) => Promise<void>;
    updateProject: (id: string, data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;

    addTask: (t: Task) => Promise<void>;
    updateTask: (id: string, data: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    recoverTask: (id: string) => Promise<void>;

    startTimer: (taskId: string) => Promise<void>;
    pauseTimer: (taskId: string) => Promise<void>;
    stopTask: (taskId: string) => Promise<void>;

    updateTaskSession: (taskId: string, sessionIndex: number, updates: { start?: number; end?: number }) => Promise<void>;
    addManualSession: (taskId: string, start: number, end: number) => Promise<void>;
    deleteTaskSession: (taskId: string, sessionIndex: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    projects: [],
    tasks: [],
    activeTab: 'Nacho',
    isLoading: false,
    setActiveTab: (tab) => set({ activeTab: tab }),

    fetchData: async () => {
        set({ isLoading: true });
        try {
            const [projectsRes, tasksRes, sessionsRes] = await Promise.all([
                supabase.from('projects').select('*').order('created_at', { ascending: false }),
                supabase.from('tasks').select('*').order('created_at', { ascending: false }),
                supabase.from('sessions').select('*')
            ]);

            if (projectsRes.error) throw projectsRes.error;
            if (tasksRes.error) throw tasksRes.error;
            if (sessionsRes.error) throw sessionsRes.error;

            const projects: Project[] = projectsRes.data.map(p => ({
                id: p.id,
                name: p.name,
                client: p.client,
                deadline: p.deadline,
                budgetHours: p.budget_hours,
                status: p.status,
                createdAt: new Date(p.created_at).getTime()
            }));

            const sessionsMap = (sessionsRes.data || []).reduce((acc, s) => {
                if (!acc[s.task_id]) acc[s.task_id] = [];
                acc[s.task_id].push({
                    id: s.id,
                    start: new Date(s.start_time).getTime(),
                    end: s.end_time ? new Date(s.end_time).getTime() : undefined,
                    duration: s.duration
                });
                return acc;
            }, {} as Record<string, TaskSession[]>);

            const tasks: Task[] = tasksRes.data.map(t => ({
                id: t.id,
                name: t.name,
                projectId: t.project_id,
                user: t.user_name as 'Nacho' | 'Flo',
                accumulatedTime: t.accumulated_time,
                status: t.status as 'active' | 'completed',
                isRunning: t.is_running,
                createdAt: new Date(t.created_at).getTime(),
                completedAt: t.completed_at ? new Date(t.completed_at).getTime() : undefined,
                sessions: sessionsMap[t.id] || []
            }));

            set({ projects, tasks });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addProject: async (p) => {
        const { error } = await supabase.from('projects').insert({
            id: p.id,
            name: p.name,
            client: p.client,
            deadline: p.deadline,
            budget_hours: p.budgetHours,
            status: p.status
        });
        if (error) console.error('Error adding project:', error);
        else set((state) => ({ projects: [p, ...state.projects] }));
    },

    updateProject: async (id, data) => {
        const { error } = await supabase.from('projects').update({
            name: data.name,
            client: data.client,
            deadline: data.deadline,
            budget_hours: data.budgetHours,
            status: data.status
        }).eq('id', id);
        if (error) console.error('Error updating project:', error);
        else set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p))
        }));
    },

    deleteProject: async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) console.error('Error deleting project:', error);
        else set((state) => ({
            projects: state.projects.filter(p => p.id !== id),
            tasks: state.tasks.filter(t => t.projectId !== id)
        }));
    },

    addTask: async (t) => {
        const { error } = await supabase.from('tasks').insert({
            id: t.id,
            name: t.name,
            project_id: t.projectId,
            user_name: t.user,
            accumulated_time: t.accumulatedTime,
            status: t.status,
            is_running: t.isRunning
        });
        if (error) console.error('Error adding task:', error);
        else set((state) => ({ tasks: [t, ...state.tasks] }));
    },

    updateTask: async (id, data) => {
        const { error } = await supabase.from('tasks').update({
            name: data.name,
            status: data.status,
            is_running: data.isRunning,
            accumulated_time: data.accumulatedTime,
            completed_at: data.completedAt ? new Date(data.completedAt).toISOString() : undefined
        }).eq('id', id);
        if (error) console.error('Error updating task:', error);
        else set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...data } : t))
        }));
    },

    deleteTask: async (id) => {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error('Error deleting task:', error);
        else set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id)
        }));
    },

    recoverTask: async (id) => {
        const { error } = await supabase.from('tasks').update({
            status: 'active',
            completed_at: null
        }).eq('id', id);
        if (error) console.error('Error recovering task:', error);
        else set((state) => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, status: 'active', completedAt: undefined } : t)
        }));
    },

    startTimer: async (taskId) => {
        const now = Date.now();
        const state = get();
        const tToStart = state.tasks.find(t => t.id === taskId);
        if (!tToStart) return;

        const user = tToStart.user;
        const rTask = state.tasks.find(t => t.user === user && t.isRunning);

        try {
            if (rTask) await get().pauseTimer(rTask.id);

            const { data: sData, error: sErr } = await supabase.from('sessions').insert({
                task_id: taskId,
                start_time: new Date(now).toISOString(),
                duration: 0
            }).select().single();

            if (sErr) throw sErr;

            await supabase.from('tasks').update({ is_running: true }).eq('id', taskId);

            set(state => ({
                tasks: state.tasks.map(t => t.id === taskId ? {
                    ...t,
                    isRunning: true,
                    sessions: [...t.sessions, { id: sData.id, start: now, duration: 0 }]
                } : t)
            }));
        } catch (error) {
            console.error('Error starting timer:', error);
        }
    },

    pauseTimer: async (taskId) => {
        const now = Date.now();
        const task = get().tasks.find(t => t.id === taskId);
        if (!task || !task.isRunning) return;

        const lastSessionIdx = task.sessions.length - 1;
        const lastSession = task.sessions[lastSessionIdx];
        if (!lastSession || lastSession.end) return;

        const sessionDuration = Math.round((now - lastSession.start) / 1000);
        const newAccTime = task.accumulatedTime + sessionDuration;

        try {
            await Promise.all([
                supabase.from('sessions').update({
                    end_time: new Date(now).toISOString(),
                    duration: sessionDuration
                }).eq('id', lastSession.id),
                supabase.from('tasks').update({
                    is_running: false,
                    accumulated_time: newAccTime
                }).eq('id', taskId)
            ]);

            set(state => ({
                tasks: state.tasks.map(t => {
                    if (t.id === taskId) {
                        const updatedSessions = [...t.sessions];
                        updatedSessions[lastSessionIdx] = { ...lastSession, end: now, duration: sessionDuration };
                        return { ...t, isRunning: false, sessions: updatedSessions, accumulatedTime: newAccTime };
                    }
                    return t;
                })
            }));
        } catch (error) {
            console.error('Error pausing timer:', error);
        }
    },

    stopTask: async (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (task?.isRunning) await get().pauseTimer(taskId);

        const now = Date.now();
        const { error } = await supabase.from('tasks').update({
            status: 'completed',
            completed_at: new Date(now).toISOString()
        }).eq('id', taskId);

        if (error) console.error('Error stopping task:', error);
        else set(state => ({
            tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: 'completed', completedAt: now } : t)
        }));
    },

    updateTaskSession: async (taskId, sessionIndex, updates) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        const session = task.sessions[sessionIndex];
        if (!session || !session.id) return;

        const newStart = updates.start ?? session.start;
        const newEnd = updates.end ?? session.end;
        const newDuration = newEnd ? Math.round((newEnd - newStart) / 1000) : 0;

        try {
            await supabase.from('sessions').update({
                start_time: new Date(newStart).toISOString(),
                end_time: newEnd ? new Date(newEnd).toISOString() : null,
                duration: newDuration
            }).eq('id', session.id);

            await get().fetchData(); // Simplest way to ensure accTime is correct
        } catch (error) {
            console.error('Error updating session:', error);
        }
    },

    addManualSession: async (taskId, start, end) => {
        const duration = Math.round((end - start) / 1000);
        try {
            await supabase.from('sessions').insert({
                task_id: taskId,
                start_time: new Date(start).toISOString(),
                end_time: new Date(end).toISOString(),
                duration
            });
            await get().fetchData();
        } catch (error) {
            console.error('Error adding manual session:', error);
        }
    },

    deleteTaskSession: async (taskId, sessionIndex) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        const session = task.sessions[sessionIndex];
        if (!session || !session.id) return;

        try {
            await supabase.from('sessions').delete().eq('id', session.id);
            await get().fetchData();
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    }
}));
