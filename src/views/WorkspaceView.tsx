import { useState } from 'react';
import { useStore } from '../store';
import { ActiveTasksList } from '../components/tasks/ActiveTasksList';
import { TaskHistoryList } from '../components/tasks/TaskHistoryList';
import { QuickTaskInput } from '../components/tasks/QuickTaskInput';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Plus, CheckCircle, Clock } from 'lucide-react';

interface WorkspaceViewProps {
    user: 'Nacho' | 'Flo';
}

export const WorkspaceView = ({ user }: WorkspaceViewProps) => {
    const { tasks, projects } = useStore();
    const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter tasks for this user
    const userTasks = tasks.filter(t => t.user === user);

    const activeTasks = userTasks.filter(t => t.status !== 'completed');
    const historyTasks = userTasks.filter(t => t.status === 'completed');

    // Sort active tasks: running first, then newest
    const sortedActiveTasks = [...activeTasks].sort((a, b) => {
        if (a.isRunning && !b.isRunning) return -1;
        if (!a.isRunning && b.isRunning) return 1;
        return b.createdAt - a.createdAt;
    });

    // Sort history: newest completed first
    const sortedHistoryTasks = [...historyTasks].sort((a, b) => {
        return (b.completedAt || 0) - (a.completedAt || 0);
    });

    return (
        <div className="p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Workspace de {user}</h2>
                    <p className="text-muted-foreground mt-1">
                        {viewMode === 'active'
                            ? 'Organiza tus tareas y trackea tu tiempo.'
                            : 'Revisa tu trabajo completado.'}
                    </p>
                </div>

                {viewMode === 'active' && (
                    <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Tarea
                    </Button>
                )}
            </div>

            {/* Tabs / Toggle */}
            <div className="flex items-center gap-4 border-b border-border pb-1">
                <button
                    onClick={() => setViewMode('active')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'active'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Clock className="h-4 w-4" />
                    Tareas Activas
                    <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">{activeTasks.length}</span>
                </button>
                <button
                    onClick={() => setViewMode('history')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <CheckCircle className="h-4 w-4" />
                    Histórico
                    <span className="ml-1 text-xs bg-muted px-2 py-0.5 rounded-full">{historyTasks.length}</span>
                </button>
            </div>

            {viewMode === 'active' && (
                <div className="space-y-6">
                    <div className="max-w-2xl">
                        <QuickTaskInput user={user} />
                    </div>

                    <ActiveTasksList
                        tasks={sortedActiveTasks}
                        projects={projects}
                    />
                </div>
            )}

            {viewMode === 'history' && (
                <TaskHistoryList
                    tasks={sortedHistoryTasks}
                    projects={projects}
                />
            )}

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={user}
            />
        </div>
    );
};
