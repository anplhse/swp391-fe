import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import AppProvider from './providers/AppProvider';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AppProvider>
      <AppRoutes />
      <Toaster />
      <Sonner />
    </AppProvider>
  );
}

export default App;
