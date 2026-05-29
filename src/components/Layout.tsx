import type { ReactNode } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

export const Layout = ({ children }: { children: ReactNode }) => {
  const { user, logout, currentStep, goToStep, shopifyOrders, generatedCampaigns } = useWorkflowStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const steps = [
    { number: 1, label: 'Connect Store', allowed: true },
    { number: 2, label: 'AI Campaigns Dashboard', allowed: shopifyOrders.length > 0 && generatedCampaigns.length > 0 },
  ];

  const handleStepClick = (stepNumber: number, allowed: boolean) => {
    if (allowed) {
      goToStep(stepNumber);
    }
  };

  // Get user avatar initials
  const initials = user?.email
    ? user.email.split('@')[0].substring(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-brand selection:text-white">
      {/* Sticky top navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-[10px] bg-brand flex items-center justify-center shadow-lg shadow-brand/20 glow-brand">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">InsightFlow</span>
              <span className="text-brand font-black text-xs ml-1 select-none">AI</span>
            </div>
          </div>

          {/* Dynamic Wizard Steps Indicator */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {steps.map((st, index) => {
              const isActive = currentStep === st.number;
              const isCompleted = currentStep > st.number;
              const isAllowed = st.allowed;

              return (
                <div key={st.number} className="flex items-center">
                  <button
                    disabled={!isAllowed}
                    onClick={() => handleStepClick(st.number, isAllowed)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-brand/10 border-brand text-brand shadow-md shadow-brand/5'
                        : isCompleted
                        ? 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10'
                        : isAllowed
                        ? 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                        : 'border-slate-900 bg-transparent text-slate-650 cursor-not-allowed opacity-40'
                    }`}
                  >
                    <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-brand text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        st.number
                      )}
                    </span>
                    <span>{st.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <svg className="h-4 w-4 text-slate-700 mx-1 lg:mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User profile actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Profile Avatar */}
              <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-brand shadow-inner">
                {initials}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 max-w-[120px] truncate" title={user?.email}>
                {user?.email}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-8 px-3 border-slate-800 hover:bg-slate-900 hover:text-white"
            >
              Sign Out
            </Button>
          </div>

        </div>
      </header>

      {/* Main Wizard Step Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 InsightFlow AI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">Data Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Support Desk</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
