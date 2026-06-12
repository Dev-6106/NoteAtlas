import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bot, CheckCircle2, ChevronRight, Play, Loader2, ArrowLeft, FileText, Calendar, Search, Scale, GraduationCap, CheckCircle, Briefcase, Clock, BarChart, PenTool, RefreshCw } from 'lucide-react';
import type { AppDispatch, RootState } from '@/store';
import { closeAgentStudioModal } from '@/store/rightPanelSlice';
import { streamAgentReport, type AgentStreamEvent } from '@/api/streamAgents';
import { showError, showSuccess } from '@/util/toast-notification';
import { fetchNoteSourceResult } from '@/store/rightPanelSlice';

// Agent Data Structure
export type AgentInput = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'textarea';
  placeholder?: string;
  options?: { label: string, value: string }[];
  required?: boolean;
};

const AGENTS = [
  { id: 'RESEARCH_REPORT', title: 'Research Report Generator', desc: 'Synthesize all sources into a formal report with citations.', icon: FileText, inputs: [] },
  { id: 'STUDY_PLAN', title: 'Study Plan Generator', desc: 'Create a day-by-day exam schedule based on uploaded materials.', icon: Calendar, inputs: [
    { id: 'timeframe', label: 'Exam timeframe (days)', type: 'text', placeholder: 'e.g. 7', required: true },
    { id: 'focus_areas', label: 'Specific focus areas (optional)', type: 'text', placeholder: 'e.g. Math, Physics' }
  ] },
  { id: 'KNOWLEDGE_GAP', title: 'Knowledge Gap Finder', desc: 'Compare your notes against the industry-standard topic map.', icon: Search, inputs: [
    { id: 'topic', label: 'Topic to analyze', type: 'text', placeholder: 'e.g. Retrieval-Augmented Generation', required: true }
  ] },
  { id: 'CROSS_DOC_DEBATE', title: 'Cross-Document Debate', desc: 'Find agreements and contradictions between documents.', icon: Scale, inputs: [] },
  { id: 'RESEARCH_ASSISTANT', title: 'Auto Research Assistant', desc: 'Generate a learning roadmap and sequential quizzes.', icon: GraduationCap, inputs: [
    { id: 'subject', label: 'Subject to learn', type: 'text', placeholder: 'e.g. System Design', required: true },
    { id: 'difficulty', label: 'Difficulty Level', type: 'select', options: [{label: 'Beginner', value: 'beginner'}, {label: 'Intermediate', value: 'intermediate'}, {label: 'Expert', value: 'expert'}], required: true }
  ] },
  { id: 'SOURCE_VERIFICATION', title: 'Source Verification Agent', desc: 'Search documents for evidence verifying a specific claim.', icon: CheckCircle, inputs: [
    { id: 'statement', label: 'Statement to verify', type: 'textarea', placeholder: 'e.g. RAG reduces hallucinations by 80%', required: true }
  ] },
  { id: 'MEETING_MINUTES', title: 'Meeting Minutes Generator', desc: 'Extract participants, decisions, and action items.', icon: Briefcase, inputs: [
    { id: 'meeting_date', label: 'Meeting Date (optional)', type: 'text', placeholder: 'e.g. 2024-10-15' }
  ] },
  { id: 'TIMELINE_GEN', title: 'Timeline Generator', desc: 'Extract dates and chronologically order events.', icon: Clock, inputs: [] },
  { id: 'PRESENTATION_GEN', title: 'Presentation Generator', desc: 'Generate slide-by-slide content with speaker notes.', icon: BarChart, inputs: [
    { id: 'slide_count', label: 'Approximate Slide Count', type: 'select', options: [{label: 'Short (5-10)', value: 'short'}, {label: 'Medium (10-20)', value: 'medium'}, {label: 'Long (20+)', value: 'long'}], required: true },
    { id: 'audience', label: 'Target Audience', type: 'text', placeholder: 'e.g. Executives, Engineers' }
  ] },
  { id: 'CONTENT_PIPELINE', title: 'Research-to-Content', desc: 'Turn insights into LinkedIn posts, Tweets, and Blogs.', icon: PenTool, inputs: [
    { id: 'platform', label: 'Target Platform', type: 'select', options: [{label: 'LinkedIn', value: 'linkedin'}, {label: 'Twitter / X', value: 'twitter'}, {label: 'Blog Post', value: 'blog'}], required: true },
    { id: 'tone', label: 'Tone', type: 'select', options: [{label: 'Professional', value: 'professional'}, {label: 'Casual', value: 'casual'}, {label: 'Humorous', value: 'humorous'}, {label: 'Academic', value: 'academic'}], required: true }
  ] }
];

const PIPELINE_STEPS = [
  "Initializing Agent Workflow...",
  "Reading and indexing source documents...",
  "Extracting semantic entities...",
  "Synthesizing arguments using Map-Reduce...",
  "Drafting final artifact...",
  "Finalizing formatting..."
];

export default function AgentStudioModal({ noteId }: { noteId?: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const { agentStudioModal, docIds } = useSelector((state: RootState) => state.rightPanel);
  const isOpen = agentStudioModal?.modal;

  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [pipelineMessage, setPipelineMessage] = useState('Initializing agent...');

  useEffect(() => {
    if (!isOpen) {
      setSelectedAgent(null);
      setInputValues({});
      setIsGenerating(false);
      setPipelineStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!selectedAgent) return;
    if (!noteId) return showError("No active notebook.");
    if (docIds.length === 0) return showError("Please select at least one document source.");

    // Validate required inputs
    if (selectedAgent.inputs) {
      for (const input of selectedAgent.inputs) {
        if (input.required && !inputValues[input.id]?.trim()) {
          return showError(`Please fill in required field: ${input.label}`);
        }
      }
    }

    try {
      setIsGenerating(true);
      setPipelineStep(0);
      setPipelineMessage('Initializing agent...');

      await streamAgentReport(
        noteId, 
        docIds, 
        selectedAgent.id, 
        selectedAgent.title,
        JSON.stringify(inputValues),
        (event: AgentStreamEvent) => {
          if (event.stepIndex !== undefined) setPipelineStep(event.stepIndex);
          if (event.message) setPipelineMessage(event.message);
          
          if (event.status === 'success') {
            showSuccess(`${selectedAgent.title} completed successfully!`);
            dispatch(fetchNoteSourceResult(noteId));
            dispatch(closeAgentStudioModal());
            setIsGenerating(false);
          } else if (event.status === 'error') {
            showError(event.message || "Failed to run agent workflow.");
            setIsGenerating(false);
          }
        }
      );
    } catch (error) {
      showError("Network error: Failed to connect to agent stream.");
      console.error(error);
      setIsGenerating(false);
    }
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)'
    }} onClick={() => !isGenerating && dispatch(closeAgentStudioModal())}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bg-elevated)', borderRadius: 24, border: '1px solid var(--border-default)',
        width: '90%', maxWidth: 850, height: '80vh', maxHeight: 700, display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)', animation: 'fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)', overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} style={{ color: 'var(--primary-brand)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)' }}>Agent Studio</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>Run powerful AI workflows across your notebook sources</p>
            </div>
          </div>
          <button disabled={isGenerating} onClick={() => dispatch(closeAgentStudioModal())} style={{ background: 'transparent', border: 'none', color: isGenerating ? 'var(--border-strong)' : 'var(--text-3)', cursor: isGenerating ? 'not-allowed' : 'pointer', padding: 8 }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Agent Selection List */}
          <div className="studio-scroll" style={{ width: selectedAgent ? '45%' : '100%', borderRight: '1px solid var(--border-default)', overflowY: 'auto', padding: "32px 40px", transition: 'width 0.3s ease', background: 'var(--bg-base)', opacity: isGenerating ? 0.5 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}>
            {!selectedAgent && (
              <div className="fade-up" style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>Select an Agent</h3>
                <p style={{ fontSize: 15, color: 'var(--text-3)' }}>Choose a specialized AI agent to process your sources.</p>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
              {AGENTS.map((agent, i) => (
                <div 
                  key={agent.id}
                  className={`fade-up delay-${Math.min(i * 100, 300)}`}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    padding: 20, borderRadius: 16, border: selectedAgent?.id === agent.id ? '2px solid var(--primary-brand)' : '1px solid var(--border-default)',
                    background: selectedAgent?.id === agent.id ? 'var(--primary-glow)' : 'var(--bg-card)',
                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 12
                  }}
                  onMouseEnter={e => { if (selectedAgent?.id !== agent.id) { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                  onMouseLeave={e => { if (selectedAgent?.id !== agent.id) { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; } }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: selectedAgent?.id === agent.id ? 'var(--primary-brand)' : 'var(--bg-surface)' }}>
                      <agent.icon size={24} style={{ color: selectedAgent?.id === agent.id ? 'var(--text-on-primary)' : 'var(--text-2)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>{agent.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.4 }}>{agent.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Panel */}
          {selectedAgent && (
            <div className="studio-scroll" style={{ flex: 1, padding: "40px 48px", background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease', overflowY: 'auto' }}>
              {!isGenerating && (
                <button 
                  onClick={() => setSelectedAgent(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 32, alignSelf: 'flex-start', padding: "6px 12px", borderRadius: 8, marginLeft: -12, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)'; }}
                >
                  <ArrowLeft size={16} /> Back to Agents
                </button>
              )}
              
              <div style={{ marginBottom: 24, width: 64, height: 64, borderRadius: 16, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <selectedAgent.icon size={32} style={{ color: 'var(--primary-brand)' }} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>{selectedAgent.title}</h2>
              <p style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 32, lineHeight: 1.5 }}>{selectedAgent.desc}</p>

              {!isGenerating ? (
                <>
                  {selectedAgent.inputs && selectedAgent.inputs.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                      {selectedAgent.inputs.map((input: AgentInput) => (
                        <div key={input.id}>
                          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 10 }}>
                            {input.label} {input.required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                          </label>
                          {input.type === 'select' ? (
                            <select
                              value={inputValues[input.id] || ''}
                              onChange={(e) => setInputValues(prev => ({...prev, [input.id]: e.target.value}))}
                              style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 15, outline: 'none'
                              }}
                            >
                              <option value="" disabled>Select an option...</option>
                              {input.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                          ) : input.type === 'textarea' ? (
                            <textarea
                              value={inputValues[input.id] || ''}
                              onChange={(e) => setInputValues(prev => ({...prev, [input.id]: e.target.value}))}
                              placeholder={input.placeholder}
                              rows={3}
                              style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 15, outline: 'none', resize: 'vertical'
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-brand)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                            />
                          ) : (
                            <input 
                              type="text"
                              value={inputValues[input.id] || ''}
                              onChange={(e) => setInputValues(prev => ({...prev, [input.id]: e.target.value}))}
                              placeholder={input.placeholder}
                              style={{
                                width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-strong)',
                                background: 'var(--bg-card)', color: 'var(--text-1)', fontSize: 15, outline: 'none'
                              }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-brand)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', background: 'var(--primary-glow)', border: '1px solid var(--primary-border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-brand)', marginBottom: 8 }}>Agent Process</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-2)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: 'var(--primary-brand)' }}/> Reads {docIds.length || 'all'} selected sources</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: 'var(--primary-brand)' }}/> Executes map-reduce inference</li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={14} style={{ color: 'var(--primary-brand)' }}/> Generates formal artifact</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    style={{
                      width: '100%', padding: '16px', borderRadius: 14, border: 'none',
                      background: 'var(--primary-brand)',
                      color: 'var(--text-on-primary)',
                      fontSize: 16, fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                  >
                    <Play size={20} /> Launch Agent
                  </button>
                </>
              ) : (
                <div className="fade-up" style={{ padding: 24, background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-default)", display: "flex", flexDirection: "column", gap: 16, marginTop: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
                    <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary-brand)" }} />
                    Pipeline Execution
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {PIPELINE_STEPS.map((step, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: i <= pipelineStep ? 1 : 0.3, transition: "all 0.3s ease" }}>
                        {i < pipelineStep ? (
                          <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
                        ) : i === pipelineStep ? (
                          <div className="animate-spin" style={{ display: "flex" }}><RefreshCw size={16} style={{ color: "var(--primary-brand)" }} /></div>
                        ) : (
                          <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--border-strong)" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: 14, color: i === pipelineStep ? "var(--text-1)" : "var(--text-2)", fontWeight: i === pipelineStep ? 600 : 500 }}>{step}</span>
                          {i === pipelineStep && <span className="fade-in-up" style={{ fontSize: 12, color: "var(--primary-brand)", marginTop: 2, fontWeight: 500 }}>{pipelineMessage}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
