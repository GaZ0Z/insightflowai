import { useState } from 'react';
import { useWorkflowStore } from '../store/useWorkflowStore';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { toast } from './ui/Toast';

export const StepCampaigns = () => {
  const { shopifyOrders, generatedCampaigns, updateEmailStatus, resetWorkflow } = useWorkflowStore();
  const [selectedEmailIdx, setSelectedEmailIdx] = useState<number>(0);
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');

  // Totals calculations
  const totalOrders = shopifyOrders.length;
  const atRiskCount = shopifyOrders.filter(o => o.isAtRisk).length;
  const campaignsCount = generatedCampaigns.length;
  const sentCount = generatedCampaigns.filter(e => e.status === 'sent').length;

  const currentEmail = generatedCampaigns[selectedEmailIdx];

  // Send single email via SMTP Mailtrap
  const sendEmail = async (
    emailAddress: string, 
    name: string, 
    subject: string, 
    body: string, 
    productName?: string, 
    productImageUrl?: string,
    htmlBody?: string
  ) => {
    updateEmailStatus(emailAddress, 'sending');
    toast.info(`Relaying SMTP packet for ${name}...`);

    try {
      const response = await fetch('http://localhost:8000/api/send-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: name,
          email: emailAddress,
          subject,
          body,
          productName,
          productImageUrl,
          htmlBody
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Server failed to send email.");
      }

      const res = await response.json();
      updateEmailStatus(emailAddress, 'sent');
      
      if (res.status === 'simulated') {
        toast.warning(res.message);
      } else {
        toast.success(res.message);
      }
    } catch (err: any) {
      console.error("SMTP sending error:", err);
      updateEmailStatus(emailAddress, 'failed');
      toast.error(`SMTP Dispatch failed: ${err.message || err}`);
    }
  };

  // Export campaigns list to CSV
  const downloadCampaignList = () => {
    if (generatedCampaigns.length === 0) {
      toast.error("No campaigns drafted to export.");
      return;
    }

    try {
      const csvRows = [
        ["Customer Name", "Email Address", "Email Subject", "Email Body", "Delivery Status"].join(','),
        ...generatedCampaigns.map(e => [
          `"${e.customerName.replace(/"/g, '""')}"`,
          `"${e.email.replace(/"/g, '""')}"`,
          `"${e.subject.replace(/"/g, '""')}"`,
          `"${e.body.replace(/\n/g, ' ').replace(/"/g, '""')}"`,
          e.status
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `insightflow_winback_campaign_list.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Outbound campaign list exported successfully.");
    } catch (err: any) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  // Format status badge variant
  const getStatusBadgeVariant = (status: typeof generatedCampaigns[0]['status']) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'sending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'draft':
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand animate-pulse" />
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Autonomous Campaign Center
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Store node status: <span className="text-[#95BF47] font-semibold">Shopify Connected</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadCampaignList} className="hover:border-brand hover:text-brand">
            <svg className="h-4 w-4 mr-1.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV List
          </Button>
          <Button variant="danger" size="sm" onClick={resetWorkflow}>
            Disconnect Shopify
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-panel">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Active Orders</span>
            <div className="text-2xl font-extrabold text-white">{totalOrders}</div>
            <div className="text-xs text-slate-400 font-medium">Synchronized transaction history</div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel text-rose-450 border-rose-500/10">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-rose-500/70">At-Risk Churns</span>
            <div className="text-2xl font-extrabold text-white">{atRiskCount}</div>
            <div className="text-xs text-slate-400 font-medium">Inactive &gt; 90 days tenure</div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel text-brand/90 border-brand/10">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-brand/70">AI Drafts Compiled</span>
            <div className="text-2xl font-extrabold text-white">{campaignsCount}</div>
            <div className="text-xs text-slate-400 font-medium">Personalized win-back drafts</div>
          </CardContent>
        </Card>

        <Card className="glass-panel text-emerald-450 border-emerald-500/10">
          <CardContent className="p-5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-emerald-500/70">Dispatched Campaigns</span>
            <div className="text-2xl font-extrabold text-white">{sentCount}</div>
            <div className="text-xs text-slate-400 font-medium">Sent to Mailtrap SMTP relay</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Campaign Builder Workspace Grid */}
      {campaignsCount > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Email Selection Queue */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">At-Risk Customer Cohort</h3>
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {generatedCampaigns.map((email, index) => {
                const isActive = selectedEmailIdx === index;
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedEmailIdx(index)}
                    className={`cursor-pointer p-4 rounded-large border text-left transition-all duration-300 flex flex-col gap-2.5 ${
                      isActive 
                        ? 'border-brand bg-slate-900/90 shadow-brand/5 shadow-md' 
                        : 'border-slate-900 bg-slate-950/40 hover:border-slate-800 hover:bg-slate-900/40'
                    }`}
                  >
                    {email.identifiedProblem && (
                      <div className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-bold uppercase tracking-wider">
                        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Friction: {email.identifiedProblem}
                      </div>
                    )}
                    <div className="flex gap-3">
                      {email.productImageUrl && (
                        <img 
                          src={email.productImageUrl} 
                          alt={email.productName || "Product"} 
                          className="w-10 h-10 rounded object-cover border border-slate-800 bg-slate-900 shrink-0" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-100 truncate">{email.customerName}</h4>
                            <p className="text-[10px] text-slate-500 font-medium truncate">{email.email}</p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(email.status)}>
                            {email.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      Subject: {email.subject}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: AI Email Copy Editor */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Campaign copy review & dispatch</h3>
            <Card className="border border-slate-850 h-full flex flex-col justify-between min-h-[460px] bg-slate-900/40 backdrop-blur-md">
              <div className="p-6 space-y-6">
                
                {/* Email details bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Recipient Address</div>
                    <div className="text-sm font-bold text-white">
                      {currentEmail.customerName} <span className="text-brand font-medium text-xs font-mono ml-2">&lt;{currentEmail.email}&gt;</span>
                    </div>
                  </div>
                  <div>
                    <Button
                      disabled={['sending', 'sent'].includes(currentEmail.status)}
                      onClick={() => sendEmail(
                        currentEmail.email, 
                        currentEmail.customerName, 
                        currentEmail.subject, 
                        currentEmail.body,
                        currentEmail.productName,
                        currentEmail.productImageUrl,
                        currentEmail.htmlBody
                      )}
                      className="bg-brand hover:bg-brand-light text-slate-950 font-bold border-0 shadow-lg shadow-brand/10 w-full sm:w-auto"
                    >
                      {currentEmail.status === 'sent' ? 'Dispatched' : currentEmail.status === 'sending' ? 'Sending...' : 'Send Campaign Email'}
                    </Button>
                  </div>
                </div>

                {/* AI Reasoning Deduction Warning Box */}
                {currentEmail.identifiedProblem && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-large flex items-start gap-3 text-left">
                    <div className="h-8 w-8 rounded-full bg-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Friction Diagnosis</h4>
                      <p className="text-xs font-medium text-slate-200 mt-0.5 leading-relaxed">
                        {currentEmail.identifiedProblem}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal font-medium">
                        Tone and content have been dynamically adjusted to offer a direct solution with coupon code WELCOMEBACK15.
                      </p>
                    </div>
                  </div>
                )}

                {/* Product Detail Banner */}
                {currentEmail.productName && (
                  <div className="flex items-center gap-3 bg-slate-950/30 border border-slate-850 p-3 rounded-large">
                    {currentEmail.productImageUrl && (
                      <img 
                        src={currentEmail.productImageUrl} 
                        alt={currentEmail.productName} 
                        className="w-12 h-12 rounded object-cover border border-slate-800 shrink-0" 
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Abandoned Item / Last Purchase</div>
                      <div className="text-xs font-bold text-slate-300 truncate">{currentEmail.productName}</div>
                      <div className="text-[10px] text-brand font-semibold">Incentive Offer: 15% OFF (WELCOMEBACK15)</div>
                    </div>
                  </div>
                )}

                {/* Email Subject line */}
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Subject Line</div>
                  <div className="text-sm font-bold text-slate-200 border border-slate-800/80 bg-slate-950/40 px-3 py-2 rounded-large">
                    {currentEmail.subject}
                  </div>
                </div>

                {/* Email Body content */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Email Body Draft</div>
                    {currentEmail.htmlBody && (
                      <div className="flex bg-slate-950/80 p-0.5 rounded border border-slate-800">
                        <button
                          onClick={() => setEditorMode('visual')}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase transition-all ${
                            editorMode === 'visual'
                              ? 'bg-brand text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Visual Preview
                        </button>
                        <button
                          onClick={() => setEditorMode('code')}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold uppercase transition-all ${
                            editorMode === 'code'
                              ? 'bg-brand text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          HTML Source
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editorMode === 'visual' && currentEmail.htmlBody ? (
                    <div 
                      className="w-full h-72 text-xs bg-white text-slate-900 rounded-large p-4 overflow-y-auto border border-slate-200 select-text email-html-preview"
                      dangerouslySetInnerHTML={{ __html: currentEmail.htmlBody }}
                    />
                  ) : (
                    <textarea
                      readOnly
                      className="w-full h-72 text-xs text-slate-300 font-mono bg-slate-950/40 border border-slate-800/85 rounded-large p-4 leading-relaxed focus:outline-none select-text"
                      value={currentEmail.htmlBody || currentEmail.body}
                    />
                  )}
                </div>

              </div>

              {/* Status footer banner */}
              <div className="bg-slate-950/80 px-6 py-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500 rounded-b-large">
                <div>
                  Campaign Relay: <span className="font-semibold text-slate-400 capitalize">{currentEmail.status}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="brand">WELCOMEBACK15 (15% Off)</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No campaigns drafted. Connect your store first.</p>
        </div>
      )}

    </div>
  );
};
