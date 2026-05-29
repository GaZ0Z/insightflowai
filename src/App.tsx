import { useEffect } from 'react';
import { useWorkflowStore } from './store/useWorkflowStore';
import { AuthGuard } from './components/AuthGuard';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { StepIntegrations } from './components/StepIntegrations';
import { StepCampaigns } from './components/StepCampaigns';
import { Toaster } from './components/ui/Toast';
import { supabase } from './lib/supabase';

function App() {
  const { currentStep, setUser } = useWorkflowStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const activeUser = session?.user ? { email: session.user.email || '' } : null;
      setUser(activeUser);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const activeUser = session?.user ? { email: session.user.email || '' } : null;
      setUser(activeUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepIntegrations />;
      case 2:
        return <StepCampaigns />;
      default:
        return <StepIntegrations />;
    }
  };

  return (
    <>
      <AuthGuard fallback={<Login />}>
        <Layout>
          {renderStep()}
        </Layout>
      </AuthGuard>
      <Toaster />
    </>
  );
}

export default App;
