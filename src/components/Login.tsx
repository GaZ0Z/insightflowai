import { useState } from 'react';
import type { FormEvent } from 'react';
import { z } from 'zod';
import { toast } from './ui/Toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

const authSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate inputs with Zod
    const validation = authSchema.safeParse({ email, password });

    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === 'email') fieldErrors.email = issue.message;
        if (issue.path[0] === 'password') fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Form validation failed. Please check inputs.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user && !data.session) {
          toast.success("Registration successful! Check your email inbox for the verification link.");
        } else {
          toast.success("Successfully registered! Welcome to your new workspace.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success("Successfully authenticated. Welcome back!");
      }
    } catch (err: any) {
      console.error("Supabase auth error:", err);
      toast.error(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-brand selection:text-white">
      <Card className="w-full max-w-[420px] border border-slate-900 shadow-2xl relative overflow-hidden bg-slate-900/40 backdrop-blur-md glow-brand">
        {/* Sleek top brand accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand/40 via-brand to-brand/40" />

        <CardHeader className="space-y-2 text-center pt-8">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-[12px] bg-brand flex items-center justify-center shadow-lg shadow-brand/20 glow-brand">
              {/* Lightning Bolt logo symbol */}
              <svg className="h-6 w-6 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">InsightFlow AI</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            {isSignUp ? "Create a free developer account to get started." : "Enter your credentials to access your marketing workspace."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-2">
          {/* Tab Selector Toggle */}
          <div className="flex bg-slate-950/80 p-1 rounded-large border border-slate-900 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrors({});
              }}
              className={`flex-1 text-xs py-2 rounded font-bold uppercase transition-all ${
                !isSignUp
                  ? 'bg-brand text-slate-950 shadow-sm shadow-brand/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrors({});
              }}
              className={`flex-1 text-xs py-2 rounded font-bold uppercase transition-all ${
                isSignUp
                  ? 'bg-brand text-slate-950 shadow-sm shadow-brand/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">Email Address</label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500/50 focus-visible:ring-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase tracking-wider font-semibold text-slate-400">Password</label>
                {!isSignUp && (
                  <span className="text-[11px] text-brand hover:underline cursor-pointer font-semibold">Forgot password?</span>
                )}
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500/50 focus-visible:ring-red-500' : ''}
              />
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-brand hover:bg-brand-light text-slate-950 font-bold py-2.5 rounded-[12px] shadow-lg shadow-brand/20 transition-all glow-brand-hover mt-6"
              isLoading={isLoading}
            >
              {isSignUp ? "Create Workspace Account" : "Sign In to Workspace"}
            </Button>
          </form>

          {/* Quick instructions details */}
          <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Secure Cloud Sandbox Environment
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
