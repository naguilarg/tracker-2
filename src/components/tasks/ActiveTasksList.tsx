import { useState } from 'react';
import type { Task, Project } from '../../store';
import { useStore } from '../../store';
import { TaskRow } from './TaskRow';
import { ChevronDown, ChevronRight, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';

interface ActiveTasksListProps {
    tasks: Task[];
    projects: Project[];
}

export const ActiveTasksList = ({ tasks, projects }: ActiveTasksListProps) => {
    const { startTimer, pauseTimer, stopTask } = useStore();

    // Group tasks by projectId
    const groupedTasks = tasks.reduce((acc, task) => {
        const projectId = task.projectId;
        if (!acc[projectId]) acc[projectId] = [];
        acc[projectId].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    // Collapsed state
    const [collapsedProjects, setCollapsedProjects] = useState<Record<string, boolean>>({});

    const toggleCollapse = (projectId: string) => {
        setCollapsedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                <p>No tienes tareas activas.</p>
                <p className="text-sm">Crea una nueva tarea para empezar.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {Object.entries(groupedTasks).map(([projectId, projectTasks]) => {
                const project = projects.find(p => p.id === projectId);
                const isCollapsed = collapsedProjects[projectId];
                const projectName = project ? project.name : 'Sin Proyecto';

                return (
                    <div key={projectId} className="border border-border rounded-lg overflow-hidden bg-card/30">
                        <div
                            className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => toggleCollapse(projectId)}
                        >
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground">
                                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                                <Briefcase className="h-4 w-4 text-primary" />
                                <h3 className="font-medium text-sm text-foreground">{projectName}</h3>
                                <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                                    {projectTasks.length}
                                </span>
                            </div>
                        </div>

                        {!isCollapsed && (
                            <div className="p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                {projectTasks.map(task => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        project={project}
                                        onStart={() => startTimer(task.id)}
                                        onPause={() => pauseTimer(task.id)}
                                        onStop={() => stopTask(task.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
