import { useMemo } from 'react';
import type { Project, Task } from '../../store';
import { Clock, Calendar, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectCardProps {
    project: Project;
    tasks: Task[];
    onEdit: (project: Project) => void;
}

export const ProjectCard = ({ project, tasks, onEdit }: ProjectCardProps) => {
    const totalSeconds = useMemo(() => {
        return tasks.reduce((acc, task) => {
            // Add accumulated time
            let time = task.accumulatedTime;
            // If task is running, add current session duration (handled by parent re-render ticker? No, usually component ticker)
            // For now, raw accumulated time from store.
            // Ideally App should ticket every second and update state or force re-render.
            return acc + time;
        }, 0);
    }, [tasks]);

    const totalHours = totalSeconds / 3600;
    const budgetPercent = project.budgetHours
        ? Math.min((totalHours / project.budgetHours) * 100, 100)
        : 0;

    const isOverBudget = project.budgetHours && totalHours > project.budgetHours;

    const statusColors = {
        active: 'bg-green-500/10 text-green-500 border-green-500/20',
        paused: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        completed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', // Gray
    };

    const statusLabels = {
        active: 'Activo',
        paused: 'Pausado',
        completed: 'Completado',
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    return (
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm hover:border-primary/20 transition-colors group relative">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-semibold text-lg text-foreground truncate max-w-[200px]" title={project.name}>
                        {project.name}
                    </h3>
                    {project.client && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                            {project.client}
                        </div>
                    )}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                </span>
            </div>

            <div className="space-y-4">
                {/* Progress Bar */}
                {project.budgetHours && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className={isOverBudget ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                                {formatDuration(totalSeconds)}
                            </span>
                            <span className="text-muted-foreground">
                                de {project.budgetHours}h
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isOverBudget ? 'bg-destructive' : 'bg-primary'}`}
                                style={{ width: `${budgetPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Footer Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        {project.deadline && (
                            <div className={`flex items-center ${new Date(project.deadline) < new Date() ? 'text-destructive' : ''}`}>
                                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                {format(new Date(project.deadline), 'd MMM', { locale: es })}
                            </div>
                        )}
                        <div className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5" />
                            {tasks.length} tareas
                        </div>
                    </div>

                    <button
                        onClick={() => onEdit(project)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:underline"
                    >
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
};
