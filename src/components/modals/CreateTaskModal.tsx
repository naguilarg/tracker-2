import { useState } from 'react';
import type { Task, Project } from '../../store';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: 'Nacho' | 'Flo'; // Optional - if not provided, user can select
}

export const CreateTaskModal = ({ isOpen, onClose, user: initialUser }: CreateTaskModalProps) => {
    const { projects, addTask, addProject } = useStore();
    const [taskName, setTaskName] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedUser, setSelectedUser] = useState<'Nacho' | 'Flo'>(initialUser || 'Nacho');
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    const activeProjects = projects.filter(p => p.status !== 'completed');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskName.trim()) return;

        let finalProjectId = selectedProjectId;

        if (isCreatingProject) {
            if (!newProjectName.trim()) return;
            const newProject: Project = {
                id: crypto.randomUUID(),
                name: newProjectName,
                status: 'active',
                createdAt: Date.now(),
            };
            addProject(newProject);
            finalProjectId = newProject.id;
        }

        if (!finalProjectId) return;

        const newTask: Task = {
            id: crypto.randomUUID(),
            name: taskName,
            projectId: finalProjectId,
            user: selectedUser,
            accumulatedTime: 0,
            status: 'active',
            isRunning: false,
            createdAt: Date.now(),
            sessions: [],
        };

        addTask(newTask);
        onClose();
        setTaskName('');
        setSelectedProjectId('');
        setNewProjectName('');
        setIsCreatingProject(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialUser ? `Nueva Tarea para ${initialUser}` : 'Nueva Tarea'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nombre de la tarea"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="Ej: Edición de video promo"
                    required
                />

                {!initialUser && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Usuario</label>
                        <select
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value as 'Nacho' | 'Flo')}
                        >
                            <option value="Nacho">Nacho</option>
                            <option value="Flo">Flo</option>
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium">Proyecto</label>
                    {!isCreatingProject ? (
                        <div className="flex gap-2">
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Seleccionar proyecto...</option>
                                {activeProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <Button type="button" variant="outline" size="icon" onClick={() => setIsCreatingProject(true)} title="Nuevo Proyecto">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Input
                                label="Nombre del Nuevo Proyecto"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Ej: Proyecto Urgente"
                                required
                            />
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreatingProject(false)}>
                                Cancelar creación de proyecto
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit">
                        Crear Tarea
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
