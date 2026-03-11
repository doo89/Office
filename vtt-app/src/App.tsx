import { LeftPanel } from './components/layout/LeftPanel';
import { RightPanel } from './components/layout/RightPanel';
import { Canvas } from './components/layout/Canvas';
import { ThemeToggle } from './components/ThemeToggle';
import { EditingModal } from './components/EditingModal';
import { useVttStore } from './store';

function App() {
  const { isNight, editingEntity } = useVttStore();

  return (
    <div className={`h-screen w-screen flex overflow-hidden bg-background text-foreground transition-colors duration-300 ${isNight ? 'dark' : ''}`}>
      <ThemeToggle />
      <LeftPanel />
      <Canvas />
      <RightPanel />
      {editingEntity && <EditingModal />}
    </div>
  );
}

export default App;