import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const GanttView = () => {
    const { projects, tasks } = useStore();
    const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
    const [zoomLevel, setZoomLevel] = useState(1); // 0.5 = zoomed out, 1 = normal, 2 = zoomed in

    // Timeline Range: Find min and max dates
    const { startDate, endDate, totalDays, useHourScale } = useMemo(() => {
        let min = Date.now();
        let max = Date.now();

        projects.forEach(p => {
            if (p.createdAt < min) min = p.createdAt;
        });

        tasks.forEach(t => {
            if (t.createdAt < min) min = t.createdAt;
            const end = t.completedAt || (t.status === 'active' ? Date.now() : t.createdAt);
            if (end > max) max = end;
        });

        const rangeDays = differenceInDays(max, min);

        // If range is less than 3 days, use hour-based scale
        if (rangeDays < 3) {
            // Use hour scale with 2 hour buffer
            const bufferMs = 2 * 60 * 60 * 1000; // 2 hours
            min = min - bufferMs;
            max = max + bufferMs;
            const rangeHours = Math.ceil((max - min) / (60 * 60 * 1000));
            return { startDate: min, endDate: max, totalDays: rangeHours, useHourScale: true };
        }

        // Use day scale
        min = startOfDay(addDays(min, -1)).getTime();
        max = startOfDay(addDays(max, 2)).getTime();
        const diff = differenceInDays(max, min);
        return { startDate: min, endDate: max, totalDays: diff > 0 ? diff : 7, useHourScale: false };
    }, [projects, tasks]);

    // Generate date/time headers
    const dates = useMemo(() => {
        if (useHourScale) {
            // Generate hourly intervals
            return Array.from({ length: totalDays + 1 }).map((_, i) =>
                new Date(startDate + i * 60 * 60 * 1000)
            );
        }
        return Array.from({ length: totalDays + 1 }).map((_, i) => addDays(startDate, i));
    }, [startDate, totalDays, useHourScale]);

    const toggleExpand = (pid: string) => {
        setExpandedProjects(prev => ({ ...prev, [pid]: !prev[pid] }));
    };

    const dayWidth = 40 * zoomLevel; // Dynamic width based on zoom
    const containerWidth = dates.length * dayWidth;

    const getPosition = (start: number, end?: number) => {
        const s = Math.max(start, startDate);
        const e = end ? Math.min(end, endDate) : Date.now();

        const totalMs = endDate - startDate;
        const startOffset = s - startDate;
        const duration = Math.max(e - s, 0);

        // Calculate position in pixels based on the containerWidth
        const leftPx = (startOffset / totalMs) * containerWidth;
        const widthPx = Math.max((duration / totalMs) * containerWidth, 2); // Min 2px for visibility

        return { left: `${leftPx}px`, width: `${widthPx}px` };
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));

    // Helper function to calculate task end time consistently
    const getTaskEndTime = (task: typeof tasks[0]): number => {
        if (task.completedAt) return task.completedAt;
        if (task.isRunning) return Date.now();
        if (task.sessions.length > 0) {
            const lastSession = task.sessions[task.sessions.length - 1];
            return lastSession.end || Date.now();
        }
        // For tasks without sessions (newly created), use current time
        // This makes the bar visible and span to "now"
        return Date.now();
    };

    return (
        <div className="p-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Diagrama de Gantt</h2>
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-muted-foreground mr-2">Zoom: {Math.round(zoomLevel * 100)}%</span>
                    <Button size="sm" variant="outline" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 border border-border rounded-lg overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm">
                {/* Header Grid */}
                <div className="flex border-b border-border bg-muted/50 z-20 sticky top-0">
                    <div className="w-64 flex-shrink-0 p-3 border-r border-border font-medium text-sm sticky left-0 bg-background/95 z-30">
                        Proyecto / Tarea
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <div className="overflow-hidden" style={{ width: '100%' }}>
                            <div className="flex" style={{ width: containerWidth }}>
                                {dates.map((d, i) => (
                                    <div key={i} className="flex-shrink-0 border-r border-border/30 text-[10px] text-center text-muted-foreground pt-1" style={{ width: dayWidth }}>
                                        {useHourScale ? (
                                            <>
                                                {format(d, 'HH:mm', { locale: es })}
                                                <br />
                                                {format(d, 'd MMM', { locale: es })}
                                            </>
                                        ) : (
                                            <>
                                                {format(d, 'd', { locale: es })}
                                                <br />
                                                {format(d, 'MMM', { locale: es })}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-auto">
                    <div className="relative min-w-full">
                        {projects.map(project => {
                            const projectTasks = tasks.filter(t => t.projectId === project.id);
                            const isExpanded = expandedProjects[project.id];

                            // Calculate project timeline based on tasks
                            let pStart = project.createdAt;
                            let pEnd = Date.now();

                            if (projectTasks.length > 0) {
                                const tStarts = projectTasks.map(t => t.createdAt);
                                pStart = Math.min(pStart, ...tStarts);

                                const tEnds = projectTasks.map(t => getTaskEndTime(t));
                                pEnd = Math.max(...tEnds);
                            }

                            const pPos = getPosition(pStart, pEnd);

                            return (
                                <div key={project.id} className="border-b border-border/50">
                                    {/* Project Row */}
                                    <div className="flex hover:bg-accent/20 transition-colors group">
                                        <div className="w-64 flex-shrink-0 p-2 pl-4 border-r border-border flex items-center gap-2 sticky left-0 bg-background z-10 group-hover:bg-accent/20 transition-colors">
                                            <button
                                                onClick={() => toggleExpand(project.id)}
                                                className="p-1 hover:bg-muted rounded"
                                            >
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </button>
                                            <span className="font-medium text-sm truncate" title={project.name}>{project.name}</span>
                                        </div>

                                        <div className="flex-1 relative h-10" style={{ width: containerWidth }}>
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {dates.map((_, i) => (
                                                    <div key={i} className="border-r border-border/10 flex-shrink-0 h-full" style={{ width: dayWidth }} />
                                                ))}
                                            </div>

                                            <div
                                                className="absolute h-6 top-2 rounded bg-primary/20 border border-primary/50"
                                                style={pPos} // No conflicting left property
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Tasks Rows */}
                                    {isExpanded && projectTasks.map(task => {
                                        const taskEnd = getTaskEndTime(task);
                                        const tPos = getPosition(task.createdAt, taskEnd);

                                        return (
                                            <div key={task.id} className="flex hover:bg-accent/10 transition-colors bg-muted/5 group">
                                                <div className="w-64 flex-shrink-0 p-2 pl-12 border-r border-border text-xs flex items-center gap-2 sticky left-0 bg-background/95 z-10 group-hover:bg-accent/10 transition-colors">
                                                    <span className={`w-2 h-2 rounded-full ${task.user === 'Nacho' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
                                                    <span className="truncate" title={task.name}>{task.name}</span>
                                                </div>
                                                <div className="flex-1 relative h-8" style={{ width: containerWidth }}>
                                                    <div className="absolute inset-0 flex pointer-events-none">
                                                        {dates.map((_, i) => (
                                                            <div key={i} className="border-r border-border/10 flex-shrink-0 h-full" style={{ width: dayWidth }} />
                                                        ))}
                                                    </div>

                                                    <div
                                                        className={`absolute h-4 top-2 rounded text-[10px] pl-1 overflow-hidden whitespace-nowrap leading-4 text-white border
                                                    ${task.user === 'Nacho' ? 'bg-blue-500/60 border-blue-500' : 'bg-purple-500/60 border-purple-500'}
                                                `}
                                                        style={tPos}
                                                    >
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
