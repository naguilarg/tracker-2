import type { Task, Project } from '../../store';
import { useStore } from '../../store';
import { RefreshCw, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskHistoryListProps {
    tasks: Task[];
    projects: Project[];
}

export const TaskHistoryList = ({ tasks, projects }: TaskHistoryListProps) => {
    const { recoverTask, deleteTask } = useStore();

    const groupedTasks = tasks.reduce((acc, task) => {
        const projectId = task.projectId;
        if (!acc[projectId]) acc[projectId] = [];
        acc[projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                <p>No hay tareas en el histórico.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedTasks).map(([projectId, projectTasks]) => {
                const project = projects.find(p => p.id === projectId);
                const projectName = project ? project.name : 'Sin Proyecto';

                return (
                    <div key={projectId} className="space-y-2">
                        <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2 px-1">
                            {projectName}
                            <span className="text-xs font-normal opacity-70">({projectTasks.length})</span>
                        </h3>

                        <div className="space-y-2">
                            {projectTasks.map(task => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-md border border-border bg-card/30 hover:bg-card/50 transition-colors group">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <h4 className="font-medium text-sm truncate text-muted-foreground/80 line-through decoration-muted-foreground/50">{task.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatTime(task.accumulatedTime)}
                                            </span>
                                            {task.completedAt && (
                                                <span className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {format(task.completedAt, 'd MMM', { locale: es })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            onClick={() => recoverTask(task.id)}
                                            title="Recuperar tarea"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                if (confirm('¿Estás seguro de eliminar esta tarea permanentemente?')) {
                                                    deleteTask(task.id);
                                                }
                                            }}
                                            title="Eliminar permanentemente"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
