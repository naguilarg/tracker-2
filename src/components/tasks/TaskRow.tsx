import { useEffect, useState } from 'react';
import type { Task, Project } from '../../store';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '../ui/Button';

interface TaskRowProps {
    task: Task;
    project?: Project;
    onStart: () => void;
    onPause: () => void;
    onStop: () => void;
}

export const TaskRow = ({ task, project, onStart, onPause, onStop }: TaskRowProps) => {
    const [elapsed, setElapsed] = useState(task.accumulatedTime);

    useEffect(() => {
        let interval: number | undefined;

        if (task.isRunning) {
            // Calculate initial elapsed time based on current session
            const currentSession = task.sessions[task.sessions.length - 1];
            const startTime = currentSession?.start || Date.now();

            const updateTimer = () => {
                const now = Date.now();
                const sessionDuration = Math.floor((now - startTime) / 1000);
                setElapsed(task.accumulatedTime + sessionDuration);
            };

            updateTimer(); // Initial update
            interval = window.setInterval(updateTimer, 1000);
        } else {
            setElapsed(task.accumulatedTime);
        }

        return () => clearInterval(interval);
    }, [task.isRunning, task.accumulatedTime, task.sessions]);

    const formatTime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (d > 0) return `${d}d ${h}h ${m}m ${s}s`;
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className={`group flex items-center justify-between p-3 rounded-md border border-border bg-card/50 transition-all ${task.isRunning ? 'border-primary/50 shadow-[0_0_15px_-5px_var(--primary)]' : 'hover:bg-accent/50'}`}>
            <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate" title={task.name}>{task.name}</h4>
                    {project && (
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                            {project.name}
                        </span>
                    )}
                </div>
                <div className={`text-xs font-mono font-medium ${task.isRunning ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}>
                    {formatTime(elapsed)}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                {!task.isRunning ? (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10" onClick={onStart} title="Iniciar timer">
                        <Play className="h-4 w-4 fill-current" />
                    </Button>
                ) : (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10" onClick={onPause} title="Pausar timer">
                        <Pause className="h-4 w-4 fill-current" />
                    </Button>
                )}

                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onStop} title="Finalizar tarea">
                    <Square className="h-4 w-4 fill-current" />
                </Button>
            </div>
        </div>
    );
};
