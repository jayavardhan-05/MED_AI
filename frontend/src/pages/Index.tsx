import { useState } from 'react';
import { Header } from '@/components/Header';
import { ChatInterface } from '@/components/ChatInterface';
import { SourceDisplay } from '@/components/SourceDisplay';

interface Source {
  content: string;
  metadata?: Record<string, any>;
}

const Index = () => {
  const [sources, setSources] = useState<Source[]>([]);
  const [docRefreshKey, setDocRefreshKey] = useState<number>(0);

  const handleDocumentUploaded = () => {
    setDocRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header onDocumentUploaded={handleDocumentUploaded} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Chat Interface - Main Column */}
        <div className="flex-1 lg:flex-[2] border-r border-border h-[calc(100vh-80px)] overflow-hidden">
          <ChatInterface
            onSourcesUpdate={setSources}
            onDocumentUploaded={handleDocumentUploaded}
          />
        </div>

        {/* Source Display - Right Knowledge Panel */}
        <div className="hidden lg:block lg:flex-1 bg-muted/10 h-[calc(100vh-80px)] overflow-hidden">
          <SourceDisplay sources={sources} refreshTrigger={docRefreshKey} />
        </div>
      </div>

      {/* Mobile Source Display */}
      <div className="lg:hidden border-t border-border bg-muted/10">
        <SourceDisplay sources={sources} refreshTrigger={docRefreshKey} />
      </div>
    </div>
  );
};

export default Index;
