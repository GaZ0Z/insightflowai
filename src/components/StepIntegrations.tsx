import { useState } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { toast } from './ui/Toast';

export const StepIntegrations = () => {
  const { setShopifyOrders, setGeneratedCampaigns, user } = useWorkflowStore();
  const [loadingState, setLoadingState] = useState<'idle' | 'fetching' | 'generating'>('idle');
  const [progressVal, setProgressVal] = useState(0);

  const connectShopify = async () => {
    setLoadingState('fetching');
    setProgressVal(15);
    toast.info("Connecting to Shopify API gateway...");

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://insightflowai-9qko.onrender.com';
      
      // 1. Fetch mock orders from backend
      const ordersResponse = await fetch(`${API_BASE_URL}/api/mock-shopify-orders`);
      if (!ordersResponse.ok) {
        throw new Error(`Shopify connection returned status ${ordersResponse.status}`);
      }
      
      const orders = await ordersResponse.json();
      setShopifyOrders(orders);
      setProgressVal(50);
      setLoadingState('generating');
      toast.success(`Imported ${orders.length} Shopify customer records.`);

      // 2. Trigger Gemini AI Campaign write proxy
      toast.info("Analyzing churn metrics & generating AI copy...");
      const campaignResponse = await fetch(`${API_BASE_URL}/api/generate-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orders }),
      });

      if (!campaignResponse.ok) {
        throw new Error(`AI Engine returned status ${campaignResponse.status}`);
      }

      const campaignData = await campaignResponse.json();
      
      // Inject campaign state with 'draft' status
      const draftedEmails = (campaignData.emails || []).map((email: any, idx: number) => ({
        ...email,
        id: `email-${idx + 1}-${Date.now()}`,
        status: 'draft' as const,
      }));

      setProgressVal(100);
      setGeneratedCampaigns(draftedEmails);
      toast.success(`Successfully drafted ${draftedEmails.length} personalized win-back campaigns!`);
    } catch (err: any) {
      console.error("Shopify connection integration error:", err);
      toast.error(`Integration Connection Unreachable: ${err.message || err}`);
      
      // Fallback sandbox simulation if uvicorn is not running locally
      toast.warning("Entering Local Sandbox Simulation Mode.");
      setProgressVal(35);
      
      setTimeout(() => {
        const mockOrders = [
          { customerName: "Alice Smith", email: "alice.smith@example.com", lastOrderDate: "2026-01-15", totalSpent: 1250.50, daysInactive: 110, isAtRisk: true, productName: "Wireless Noise-Cancelling Headphones", productImageUrl: "https://picsum.photos/seed/AliceSmith/300/300" },
          { customerName: "Sarah Connor", email: "sarah.c@example.com", lastOrderDate: "2026-01-05", totalSpent: 3200.00, daysInactive: 120, isAtRisk: true, productName: "Tactical LED Flashlight", productImageUrl: "https://picsum.photos/seed/SarahConnor/300/300" },
          { customerName: "David Miller", email: "d.miller@example.com", lastOrderDate: "2026-02-10", totalSpent: 190.00, daysInactive: 95, isAtRisk: true, productName: "Ergonomic Mesh Office Chair", productImageUrl: "https://picsum.photos/seed/DavidMiller/300/300" },
          { customerName: "Linda Taylor", email: "linda.t@example.com", lastOrderDate: "2025-12-15", totalSpent: 410.00, daysInactive: 150, isAtRisk: true, productName: "Premium Ceramic Coffee Mug", productImageUrl: "https://picsum.photos/seed/LindaTaylor/300/300" }
        ];
        
        setShopifyOrders(mockOrders);
        setProgressVal(75);
        
        const mockEmails = mockOrders.map((o, idx) => ({
          customerName: o.customerName,
          email: o.email,
          subject: `We miss you, ${o.customerName.split(' ')[0]}! Enjoy 15% off`,
          body: (
            `Hi ${o.customerName.split(' ')[0]},\n\n` +
            `It's been a while since your last purchase. We noticed your loyalty in the past (total spent: $${o.totalSpent.toFixed(2)}). ` +
            `We'd love to see you back, so please enjoy a **15% discount** using code: **WELCOMEBACK15** on your next order.\n\n` +
            `Best regards,\nE-commerce Team`
          ),
          productName: o.productName,
          productImageUrl: o.productImageUrl,
          id: `email-mock-${idx + 1}-${Date.now()}`,
          status: 'draft' as const
        }));
        
        setTimeout(() => {
          setProgressVal(100);
          setGeneratedCampaigns(mockEmails);
          toast.success("Sandbox mock campaign compiled successfully.");
        }, 800);
        
      }, 1000);
    }
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

      {loadingState !== 'idle' ? (
        <Card className="p-8 border border-slate-800 text-center space-y-6 max-w-md mx-auto animate-pulse">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center glow-brand">
              <svg className="animate-spin h-8 w-8 text-brand" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">
              {loadingState === 'fetching' ? 'Connecting Shopify Stores' : 'Generating Personalizations'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {loadingState === 'fetching' 
                ? 'Retrieving dynamic customer orders, spent profiles, and purchase calendar offsets...'
                : 'Enforcing strict JSON rules and calling Gemini 2.5 Flash to write custom discount copy...'}
            </p>
          </div>
          <div className="space-y-1.5 max-w-xs mx-auto">
            <Progress value={progressVal} />
            <div className="text-[10px] text-slate-500 font-semibold uppercase">{progressVal}% Complete</div>
          </div>
        </Card>
      ) : (
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
              <Button disabled className="w-full bg-slate-800 text-slate-600 border border-slate-700/30">
                Connect WooCommerce
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
