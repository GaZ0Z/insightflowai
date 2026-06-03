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
  const { currentStep, setUser, goToStep, setShopDomain, setIsMockData } = useWorkflowStore();

  // Auto-skip Step 1 if shop integration is already persisted in local storage
  useEffect(() => {
    const savedShop = localStorage.getItem('connectedShop');
    const savedIsMock = localStorage.getItem('insightflow_is_mock') === 'true';
    if (savedShop) {
      setShopDomain(savedShop);
      setIsMockData(savedIsMock);
      goToStep(2);
    }
  }, [goToStep, setShopDomain, setIsMockData]);

  // Catch successful integration OAuth redirections
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('integration') === 'success') {
      const shop = params.get('shop');
      if (shop) {
        localStorage.setItem('connectedShop', shop);
        localStorage.removeItem('insightflow_is_mock');
        setIsMockData(false);
        setShopDomain(shop);
      }
      goToStep(2);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [goToStep, setShopDomain, setIsMockData]);

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
