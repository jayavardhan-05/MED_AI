import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content text-sm text-foreground/90 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Render tables as beautifully styled boxes with rounded borders and responsive scroll
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full text-left text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted/80 text-foreground font-semibold border-b border-border" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-3.5 py-2.5 font-semibold text-foreground/90 text-xs border-r border-border/50 last:border-r-0" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-border/40" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="hover:bg-primary/5 transition-colors even:bg-muted/20" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3.5 py-2.5 text-xs text-foreground/80 align-top border-r border-border/40 last:border-r-0" {...props} />
          ),
          // Clean header styling
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-bold text-foreground mt-3 mb-1.5 flex items-center gap-1.5" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-bold text-foreground mt-3 mb-1.5 flex items-center gap-1.5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xs font-bold text-foreground/90 uppercase tracking-wide mt-2.5 mb-1" {...props} />
          ),
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-4 my-1.5 space-y-1 text-xs" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-4 my-1.5 space-y-1 text-xs" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1" {...props} />
          ),
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="my-1.5 text-xs sm:text-sm leading-relaxed" {...props} />
          ),
          // Strong / Bold
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-2 border-l-3 border-primary/50 pl-3 py-1 italic bg-muted/30 rounded-r-lg text-xs" {...props} />
          ),
          // Horizontal divider
          hr: ({ node, ...props }) => (
            <hr className="my-2.5 border-border/60" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
