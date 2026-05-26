import NewHomePage from '@/components/features/home/NewHomePage';
import { ToastProvider } from '@/core/hooks/useToast';

export default function Home() {
  return (
    <ToastProvider>
      <NewHomePage />
    </ToastProvider>
  );
}
