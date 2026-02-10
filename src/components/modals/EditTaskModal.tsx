import { useState } from 'react';
import type { Task } from '../../store';
import { useStore } from '../../store';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trash2, Plus } from 'lucide-react';

interface EditTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
}

export const EditTaskModal = ({ isOpen, onClose, task }: EditTaskModalProps) => {
    const { updateTaskSession, addManualSession, deleteTaskSession, projects } = useStore();
    const [newSessionStart, setNewSessionStart] = useState('');
    const [newSessionEnd, setNewSessionEnd] = useState('');

    if (!task) return null;

    const project = projects.find(p => p.id === task.projectId);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const handleUpdateSession = (sessionIndex: number, field: 'start' | 'end', value: string) => {
        if (!value) return;
        const timestamp = new Date(value).getTime();
        updateTaskSession(task.id, sessionIndex, { [field]: timestamp });
    };

    const handleAddSession = () => {
        if (!newSessionStart || !newSessionEnd) {
            alert('Debes especificar inicio y fin de la sesión');
            return;
        }

        const start = new Date(newSessionStart).getTime();
        const end = new Date(newSessionEnd).getTime();

        if (end <= start) {
            alert('La hora de fin debe ser posterior a la de inicio');
            return;
        }

        addManualSession(task.id, start, end);
        setNewSessionStart('');
        setNewSessionEnd('');
    };

    const handleDeleteSession = (sessionIndex: number) => {
        if (confirm('¿Eliminar esta sesión?')) {
            deleteTaskSession(task.id, sessionIndex);
        }
    };

    const toDatetimeLocal = (timestamp: number) => {
        const date = new Date(timestamp);
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Editar Tiempos de Tarea">
            <div className="space-y-4">
                {/* Task Info */}
                <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                    <h3 className="font-semibold">{task.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        Proyecto: {project?.name || 'Sin proyecto'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Usuario: {task.user}
                    </p>
                    <p className="text-sm font-medium">
                        Tiempo total: {formatTime(Math.floor(task.accumulatedTime / 1000))}
                    </p>
                </div>

                {/* Sessions List */}
                <div className="space-y-2">
                    <h4 className="font-medium text-sm">Sesiones de trabajo</h4>
                    {task.sessions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay sesiones registradas</p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {task.sessions.map((session, index) => (
                                <div key={index} className="border border-border rounded-lg p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium">Sesión {index + 1}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteSession(index)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-muted-foreground">Inicio</label>
                                            <input
                                                type="datetime-local"
                                                value={toDatetimeLocal(session.start)}
                                                onChange={(e) => handleUpdateSession(index, 'start', e.target.value)}
                                                className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                                                disabled={task.isRunning && index === task.sessions.length - 1}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-muted-foreground">Fin</label>
                                            <input
                                                type="datetime-local"
                                                value={session.end ? toDatetimeLocal(session.end) : ''}
                                                onChange={(e) => handleUpdateSession(index, 'end', e.target.value)}
                                                className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                                                disabled={!session.end}
                                            />
                                        </div>
                                    </div>

                                    {session.end && (
                                        <p className="text-xs text-muted-foreground">
                                            Duración: {formatTime(Math.floor((session.end - session.start) / 1000))}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Manual Session */}
                <div className="border-t border-border pt-4 space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Añadir sesión manual
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-muted-foreground">Inicio</label>
                            <input
                                type="datetime-local"
                                value={newSessionStart}
                                onChange={(e) => setNewSessionStart(e.target.value)}
                                className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Fin</label>
                            <input
                                type="datetime-local"
                                value={newSessionEnd}
                                onChange={(e) => setNewSessionEnd(e.target.value)}
                                className="w-full text-xs px-2 py-1 rounded border border-input bg-background"
                            />
                        </div>
                    </div>
                    <Button onClick={handleAddSession} size="sm" className="w-full">
                        Añadir Sesión
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-border">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </div>
        </Modal>
    );
};
