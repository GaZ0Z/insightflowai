import { create } from 'zustand';
import type { User, ShopifyOrder, GeneratedEmail } from '../types';

interface WorkflowState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  shopDomain: string | null;
  setShopDomain: (shop: string | null) => void;

  // Workflow steps
  currentStep: number;
  shopifyOrders: ShopifyOrder[];
  generatedCampaigns: GeneratedEmail[];

  // Actions
  setShopifyOrders: (orders: ShopifyOrder[]) => void;
  setGeneratedCampaigns: (campaigns: GeneratedEmail[]) => void;
  updateEmailStatus: (emailAddress: string, status: GeneratedEmail['status']) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  // Authentication
  user: typeof window !== 'undefined' && localStorage.getItem('insightflow_user')
    ? { email: localStorage.getItem('insightflow_user') || '' }
    : null,
  isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('insightflow_user'),
  shopDomain: typeof window !== 'undefined' ? localStorage.getItem('insightflow_shop') : null,
  login: (email) => {
    localStorage.setItem('insightflow_user', email);
    set({ user: { email }, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('insightflow_user');
    localStorage.removeItem('insightflow_shop');
    set({
      user: null,
      isAuthenticated: false,
      shopDomain: null,
      currentStep: 1,
      shopifyOrders: [],
      generatedCampaigns: [],
    });
  },
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
  setShopDomain: (shop) => {
    if (shop) {
      localStorage.setItem('insightflow_shop', shop);
    } else {
      localStorage.removeItem('insightflow_shop');
    }
    set({ shopDomain: shop });
  },

  // Workflow State
  currentStep: 1,
  shopifyOrders: [],
  generatedCampaigns: [],

  // Actions
  setShopifyOrders: (shopifyOrders) =>
    set({
      shopifyOrders,
    }),
  setGeneratedCampaigns: (generatedCampaigns) =>
    set({
      generatedCampaigns,
      currentStep: 2, // Automate transition to results once campaigns are built
    }),
  updateEmailStatus: (emailAddress, status) =>
    set((state) => ({
      generatedCampaigns: state.generatedCampaigns.map((email) =>
        email.email === emailAddress ? { ...email, status } : email
      ),
    })),
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 2),
    })),
  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),
  goToStep: (step) =>
    set({
      currentStep: step,
    }),
  resetWorkflow: () => {
    localStorage.removeItem('insightflow_shop');
    set({
      shopDomain: null,
      currentStep: 1,
      shopifyOrders: [],
      generatedCampaigns: [],
    });
  },
}));
