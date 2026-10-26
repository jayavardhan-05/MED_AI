import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Send,
  Bot,
  User,
  Paperclip,
  Loader2,
  Sparkles,
  FileText,
  AlertTriangle,
  RotateCcw,
  Download,
  Printer,
  Mic,
  MicOff,
  ShieldCheck,
} from 'lucide-react';
import { ApiService, MedicalIntent, EmergencyRedFlag, ChatHistoryMessage } from '@/lib/api';
import { toast } from 'sonner';
import { MarkdownRenderer } from './MarkdownRenderer';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  intent?: MedicalIntent;
  red_flag?: EmergencyRedFlag | null;
}

interface Source {
  content: string;
  metadata?: Record<string, any>;
}

interface ChatInterfaceProps {
  onSourcesUpdate: (sources: Source[]) => void;
  onDocumentUploaded?: () => void;
}

export function ChatInterface({ onSourcesUpdate, onDocumentUploaded }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Phase 4: Multi-Turn Conversation Memory
  const askMedicalQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: questionText,
      timestamp: new Date(),
    };

    // Prepare multi-turn context
    const conversationHistory: ChatHistoryMessage[] = messages
      .filter((m) => m.type === 'user' || m.type === 'ai')
      .map((m) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);

    try {
      const data = await ApiService.sendChatMessage({
        question: userMessage.content,
        conversation_history: conversationHistory,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.answer || data.response || `Response to: "${userMessage.content}"`,
        timestamp: new Date(),
        intent: data.intent,
        red_flag: data.red_flag,
      };

      const sources: Source[] = data.sources || data.citations || [];

      setMessages((prev) => [...prev, aiMessage]);
      onSourcesUpdate(sources);
    } catch (error) {
      console.error('Error fetching answer:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content:
          error instanceof Error && error.message.includes('404')
            ? 'Backend endpoint returned 404 Not Found. Please check the API configuration.'
            : 'Could not connect to the backend server. Please verify the backend is running at http://127.0.0.1:8000.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    await askMedicalQuestion(currentQuestion);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading(`Indexing "${file.name}"...`);

    try {
      const res = await ApiService.uploadDocument(file);
      toast.success(res.message, { id: toastId });

      const systemMsg: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `📄 **Document Added to Knowledge Base:** "${file.name}" has been processed and indexed into active memory (${res.chunks} text chunks). You can now ask clinical and diagnostic questions about this document!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMsg]);

      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Phase 4: Reset / New Case
  const handleResetConversation = () => {
    if (messages.length === 0) return;
    setMessages([]);
    onSourcesUpdate([]);
    toast.info('New clinical consultation started. Conversation history reset.');
  };

  // Phase 6: Voice Dictation using Web Speech API
  const toggleVoiceRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        'Voice dictation is not supported in this browser. Please use Chrome, Edge, or Safari.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.info('🎙️ Listening... Speak your medical question.');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setCurrentQuestion(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission was denied. Please allow microphone access.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition failed to initialize:', err);
      setIsListening(false);
      toast.error('Failed to access microphone.');
    }
  };

  // Phase 6: Markdown Export
  const exportMarkdownSummary = () => {
    if (messages.length === 0) {
      toast.error('No consultation dialogue to export.');
      return;
    }

    let md = `# MED AI - Clinical Consultation & Evidence Summary\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Dialogue Turns:** ${messages.filter((m) => m.type !== 'system').length}\n\n`;
    md += `---\n\n`;

    messages.forEach((m, idx) => {
      if (m.type === 'user') {
        md += `### 👤 Clinical Inquiry\n${m.content}\n\n`;
      } else if (m.type === 'ai') {
        if (m.intent) {
          md += `**Specialized Domain:** ${m.intent.icon} ${m.intent.category}\n\n`;
        }
        if (m.red_flag) {
          md += `> 🚨 **CRITICAL TRIAGE ALERT:** ${m.red_flag.title}\n> ${m.red_flag.guidance}\n\n`;
        }
        md += `### 🩺 MED AI Clinical Synthesis\n${m.content}\n\n`;
        md += `---\n\n`;
      }
    });

    md += `\n*Generated by MED AI Universal Clinical Assistant*\n`;
    md += `*Disclaimer: For medical education and clinical decision support. Always verify with institutional protocols.*`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MED_AI_Clinical_Summary_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Clinical case summary exported as Markdown!');
  };

  // Phase 6: Print / Save as PDF
  const exportPdfSummary = () => {
    if (messages.length === 0) {
      toast.error('No consultation dialogue to export.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to generate the clinical print summary.');
      return;
    }

    const contentHtml = messages
      .filter((m) => m.type !== 'system')
      .map(
        (m) => `
        <div style="margin-bottom: 20px; padding: 14px; border-radius: 8px; background: ${
          m.type === 'user' ? '#f8fafc' : '#ffffff'
        }; border: 1px solid #e2e8f0;">
          <div style="font-weight: 700; font-size: 13px; color: ${
            m.type === 'user' ? '#1e40af' : '#047857'
          }; margin-bottom: 6px;">
            ${
              m.type === 'user'
                ? '👤 Patient Inquiry / Clinical Query'
                : '🩺 MED AI Synthesis' + (m.intent ? ' • ' + m.intent.category : '')
            }
          </div>
          ${
            m.red_flag
              ? `
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin-bottom: 12px; font-size: 12px; color: #991b1b; border-radius: 4px;">
              <strong>🚨 CRITICAL EMERGENCY ALERT:</strong> ${m.red_flag.title}<br/>${m.red_flag.guidance}
            </div>`
              : ''
          }
          <div style="font-size: 13px; line-height: 1.6; white-space: pre-wrap; font-family: sans-serif; color: #334155;">${
            m.content
          }</div>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MED AI - Clinical Consultation Summary</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 820px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px; }
            .title { font-size: 22px; font-weight: bold; color: #0d9488; }
            .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
            .footer { margin-top: 40px; border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 11px; color: #64748b; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">🏥 MED AI - Clinical Case Summary & Synthesis Report</div>
            <div class="meta">Generated: ${new Date().toLocaleString()} | Evidence: Robbins Pathology & Clinical Pharmacology</div>
          </div>
          ${contentHtml}
          <div class="footer">
            ⚕️ <strong>Notice:</strong> This clinical report is produced by MED AI for medical decision support and educational reference. Clinical correlation and physician judgment required.
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Action & Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50 text-xs">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Clinical Assistant</span>
          {messages.length > 0 && (
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium text-[11px]">
              Multi-Turn Memory Active ({messages.filter((m) => m.type !== 'system').length} turns)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          {messages.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetConversation}
                title="Start a new consultation (resets history)"
                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                New Case
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportMarkdownSummary}
                title="Download case report as Markdown"
                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Markdown
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={exportPdfSummary}
                title="Print or Save as PDF"
                className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print / PDF
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              MED AI Universal Clinical Assistant
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Ask any medical question across pharmacology, disease pathology, surgery, or clinical
              diagnostics. The assistant features multi-turn memory, emergency triage detection, and
              instant clinical summaries.
            </p>

            <div className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-3">
              Explore Clinical Domains (Click to Ask)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {[
                {
                  icon: '💊',
                  domain: 'Pharmacology',
                  query:
                    'What is the mechanism of action, dosage, and adverse effects of Lisinopril?',
                },
                {
                  icon: '🩺',
                  domain: 'Differential Diagnosis',
                  query:
                    'What is the differential diagnosis and emergency workup for acute pleuritic chest pain?',
                },
                {
                  icon: '🔬',
                  domain: 'Pathology & Mechanisms',
                  query:
                    'Explain the cellular mechanisms and morphologic stages of myocardial infarction.',
                },
                {
                  icon: '🩹',
                  domain: 'Clinical Management',
                  query:
                    'What are the first-line management guidelines and medications for acute asthma exacerbation?',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => askMedicalQuestion(item.query)}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-border bg-card/60 hover:bg-accent/70 hover:border-primary/40 text-left transition-all group cursor-pointer shadow-sm"
                >
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                      {item.domain}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1">
                      {item.query}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === 'user'
                ? 'justify-end'
                : message.type === 'system'
                ? 'justify-center'
                : 'justify-start'
            }`}
          >
            {message.type === 'system' ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 max-w-xl text-xs text-foreground flex items-center space-x-3 my-2 shadow-sm">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 whitespace-pre-wrap">{message.content}</div>
              </div>
            ) : (
              <div
                className={`message-bubble ${
                  message.type === 'user' ? 'user-message' : 'ai-message'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'ai' && (
                    <Bot className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                  )}
                  <div className="flex-1">
                    {/* Emergency Red-Flag Banner (Phase 5) */}
                    {message.type === 'ai' && message.red_flag && (
                      <div className="mb-3 p-3.5 rounded-xl bg-destructive/10 border-2 border-destructive/30 text-destructive shadow-sm">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5 animate-bounce" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                              🚨 Critical Medical Triage: {message.red_flag.title}
                            </h4>
                            <p className="text-xs text-foreground mt-1 leading-snug">
                              {message.red_flag.guidance}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center text-[11px] font-bold bg-destructive text-destructive-foreground px-2.5 py-0.5 rounded-md shadow-sm">
                                Call Emergency (911 / 112 / 999)
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                Do not rely solely on digital tools during critical emergencies.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Specialized Intent Badge (Phase 3) */}
                    {message.type === 'ai' && message.intent && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
                        <span>{message.intent.icon}</span>
                        <span>{message.intent.category}</span>
                      </div>
                    )}

                    {message.type === 'ai' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {message.content}
                      </div>
                    )}

                    {message.type === 'ai' && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground flex items-center justify-between">
                        <span>⚕️ Grounded Medical Decision Support</span>
                        <span>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {message.type === 'user' && (
                      <p className="text-xs opacity-70 mt-1.5">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  {message.type === 'user' && <User className="w-5 h-5 mt-0.5 shrink-0" />}
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="ai-message message-bubble">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Synthesizing clinical evidence across conversation history...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Question Input, Voice Mic, and File Upload */}
      <Card className="m-4 p-3 shadow-sm border-border bg-card">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.txt,.md"
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
            title="Attach medical document (PDF, TXT)"
            className="text-muted-foreground hover:text-primary shrink-0"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>

          {/* Voice Dictation Button (Phase 6) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVoiceRecognition}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Speak medical question (Voice Dictation)'}
            className={`shrink-0 transition-all ${
              isListening
                ? 'text-destructive bg-destructive/10 animate-pulse ring-2 ring-destructive/40'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>

          <Input
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            placeholder={
              isListening
                ? '🎙️ Listening... Speak your medical question now.'
                : 'Ask any medical, pharmacological, or pathology question (multi-turn enabled)...'
            }
            disabled={isLoading}
            className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm placeholder:text-muted-foreground"
          />

          <Button
            type="submit"
            disabled={!currentQuestion.trim() || isLoading}
            size="icon"
            className="shrink-0 rounded-lg h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}