import { Activity, BookOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import { ApiService } from '@/lib/api';
import { toast } from 'sonner';

interface HeaderProps {
  onDocumentUploaded?: () => void;
  documentCount?: number;
}

export function Header({ onDocumentUploaded, documentCount = 2 }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const toastId = toast.loading(`Indexing "${file.name}" into medical knowledge base...`);
    try {
      const res = await ApiService.uploadDocument(file);
      toast.success(res.message, { id: toastId });
      if (onDocumentUploaded) {
        onDocumentUploaded();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document.', { id: toastId });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/med-ai-logo.svg"
                alt="MED AI"
                className="w-10 h-10 rounded-xl shadow-xs"
              />
              <Activity className="w-3.5 h-3.5 text-emerald-500 absolute -bottom-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">MED AI</h1>
              <p className="text-xs text-muted-foreground">
                Universal Medical Intelligence & Grounded Pathology/Pharmacology Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{documentCount} Active Libraries</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleUpload}
              accept=".pdf,.txt,.md"
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center space-x-1.5 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Medical Doc (PDF/TXT)</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}