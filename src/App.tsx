import { useEffect } from 'react';
import { useStore } from './store';

import { WorkspaceView } from './views/WorkspaceView';
import { ProjectsView } from './views/ProjectsView';
import { GanttView } from './views/GanttView';
import { TasksView } from './views/TasksView';

function App() {
  const { activeTab, setActiveTab, fetchData, isLoading } = useStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Nacho': return <WorkspaceView user="Nacho" />;
      case 'Flo': return <WorkspaceView user="Flo" />;
      case 'Proyectos': return <ProjectsView />;
      case 'Tareas': return <TasksView />;
      case 'Diagrama Gantt': return <GanttView />;
      default: return <WorkspaceView user="Nacho" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white/10">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img src="/logo.png" alt="Colmillo" className="h-8 object-contain" />
            <span className="text-sm font-light tracking-widest opacity-50 hidden sm:block">TIME TRACKER</span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('Nacho')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Nacho' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Nacho
            </button>
            <button
              onClick={() => setActiveTab('Flo')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Flo' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Flo
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => setActiveTab('Proyectos')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Proyectos' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Proyectos
            </button>
            <button
              onClick={() => setActiveTab('Tareas')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Tareas' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Tareas
            </button>
            <button
              onClick={() => setActiveTab('Diagrama Gantt')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'Diagrama Gantt' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              Gantt
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : renderContent()}
      </main>
    </div>
  );
}

export default App;
