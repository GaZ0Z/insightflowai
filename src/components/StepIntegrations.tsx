import { useState } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Button } from './ui/Button';
import { toast } from './ui/Toast';
import { Input } from './ui/Input';

export const StepIntegrations = () => {
  const { user } = useWorkflowStore();
  const [shopDomain, setShopDomain] = useState('');

  const connectShopify = () => {
    if (!shopDomain.trim()) {
      toast.error("Please enter your Shopify store domain.");
      return;
    }
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://insightflowai-9qko.onrender.com';
    window.location.href = `${API_BASE_URL}/api/shopify/auth?shop=${encodeURIComponent(shopDomain.trim())}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Welcome back, {user ? user.email.split('@')[0] : 'Merchant'}!
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Connect your Shopify store to get started. Automatically fetch churn metrics and trigger autonomous AI win-back flows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Active Shopify Card */}
        <div className="glass-panel rounded-large border border-slate-800/80 p-6 flex flex-col justify-between hover:border-brand/40 transition-all duration-300 shadow-xl group">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-[12px] bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-all">
                {/* Shopify Bag Icon SVG */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-brand transition-colors">Shopify</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase">Supported</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Synchronize customer cohorts, purchase histories, and total spends. Identifies slip ratios and triggers auto-recommendation drafts.
            </p>
            
            {/* Shopify store domain input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">Shopify Domain</label>
              <Input
                type="text"
                placeholder="mystore.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-8">
            <Button onClick={connectShopify} className="w-full bg-[#95BF47] hover:bg-[#83aa3d] text-slate-950 font-bold border-0 shadow-lg shadow-[#95BF47]/10">
              Connect Shopify Store
            </Button>
          </div>
        </div>

        {/* Coming Soon WooCommerce Card */}
        <div className="glass-panel rounded-large border border-slate-900/60 p-6 flex flex-col justify-between opacity-50 cursor-not-allowed">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-[12px] bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                {/* Woocommerce Store Icon SVG */}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-400">WooCommerce</h3>
                <span className="text-[10px] bg-slate-800 text-slate-500 border border-slate-700/50 px-2 py-0.5 rounded-full font-bold uppercase">Coming Soon</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Integrate WordPress ledger checkouts, customer cards, and transaction history.
            </p>
          </div>
          
          <div className="mt-8">
            <Button disabled className="w-full bg-slate-800 text-slate-650 border border-slate-700/30">
              Connect WooCommerce
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
