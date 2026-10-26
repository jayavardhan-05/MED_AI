import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Quote, BookOpen, Layers } from 'lucide-react';
import { ApiService } from '@/lib/api';

interface Source {
  content: string;
  metadata?: Record<string, any>;
}

interface KnowledgeBaseDoc {
  id: string;
  title: string;
  category?: string;
  type: string;
  chunks?: number;
  description?: string;
}

interface SourceDisplayProps {
  sources: Source[];
  refreshTrigger?: number;
}

export function SourceDisplay({ sources, refreshTrigger }: SourceDisplayProps) {
  const [activeTab, setActiveTab] = useState<'sources' | 'libraries'>('sources');
  const [documents, setDocuments] = useState<KnowledgeBaseDoc[]>([]);

  useEffect(() => {
    ApiService.getDocuments()
      .then((res) => {
        if (res && res.documents) {
          setDocuments(res.documents);
        }
      })
      .catch((err) => console.log('Could not fetch active documents:', err));
  }, [refreshTrigger]);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Tab Switcher */}
      <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg border border-border text-xs">
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'sources'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Quote className="w-3.5 h-3.5 text-primary" />
          <span>Cited Sources ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('libraries')}
          className={`flex-1 py-1.5 px-3 rounded-md font-medium transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'libraries'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>Active Libraries ({documents.length})</span>
        </button>
      </div>

      {/* Tab 1: Cited Sources */}
      {activeTab === 'sources' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sources.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-64">
              <FileText className="w-12 h-12 mb-3 text-primary/20" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No Sources Cited Yet</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Ask a clinical, pharmacological, or pathology question to view grounded literature citations.
              </p>
            </div>
          ) : (
            sources.map((source, index) => (
              <Card key={index} className="p-3.5 shadow-sm border-border bg-card">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-xs text-foreground">
                      {source.metadata?.source || 'Medical Reference'}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-muted/40 font-normal">
                    {source.metadata?.source?.includes('Pharmacology')
                      ? 'Pharmacology'
                      : source.metadata?.source?.includes('Robbins')
                      ? 'Pathology'
                      : 'Clinical Doc'}
                  </Badge>
                </div>

                <div className="text-xs leading-relaxed text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40">
                  <p>{source.content}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Active Libraries */}
      {activeTab === 'libraries' && (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="text-xs text-muted-foreground mb-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Indexed Vector Datasets</span>
          </div>

          {documents.map((doc) => (
            <Card key={doc.id} className="p-3.5 shadow-sm border-border bg-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-xs text-foreground leading-snug">{doc.title}</h4>
                <Badge
                  variant={doc.type === 'core' ? 'secondary' : 'default'}
                  className="text-[10px] shrink-0"
                >
                  {doc.type === 'core' ? 'Core Library' : 'Uploaded'}
                </Badge>
              </div>

              {doc.category && (
                <div className="text-[11px] text-primary font-medium">{doc.category}</div>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {doc.description || (doc.chunks ? `Indexed with ${doc.chunks} semantic text chunks.` : '')}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}