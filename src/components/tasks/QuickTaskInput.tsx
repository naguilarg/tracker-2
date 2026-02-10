import { useState } from 'react';
import type { Task } from '../../store';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface QuickTaskInputProps {
    user: 'Nacho' | 'Flo';
}

export const QuickTaskInput = ({ user }: QuickTaskInputProps) => {
    const { projects, addTask } = useStore();
    const [taskName, setTaskName] = useState('');
    const [projectId, setProjectId] = useState('');

    const activeProjects = projects.filter(p => p.status !== 'completed');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim() || !projectId) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            name: taskName,
            projectId,
            user,
            accumulatedTime: 0,
            status: 'active',
            isRunning: false,
            createdAt: Date.now(),
            sessions: [],
        };

        addTask(newTask);
        setTaskName('');
        // Keep project selected for rapid entry? Or clear? 
        // Usually keep project if entering multiple tasks for same project.
    };

    return (
        <form onSubmit={handleAdd} className="flex gap-2 items-center bg-card border border-border p-2 rounded-lg shadow-sm">
            <input
                type="text"
                placeholder="Nombre de tarea rápida..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 placeholder:text-muted-foreground"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                required
            />
            <select
                className="h-8 max-w-[150px] rounded-md border border-input bg-transparent px-2 text-xs"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
            >
                <option value="" disabled>Proyecto...</option>
                {activeProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
            <Button size="sm" type="submit" disabled={!taskName || !projectId}>
                <Plus className="h-4 w-4" />
            </Button>
        </form>
    );
};
