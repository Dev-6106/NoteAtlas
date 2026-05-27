import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BaseModal } from "@/components/base/BaseModal";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { closeSourceModal } from "@/store/rightPanelSlice";

export function SourceModal() {
  const dispatch = useAppDispatch();
  const { sourceModal } = useAppSelector((state) => state.rightPanel);

  if (!sourceModal?.modal) return null;

  return (
    <BaseModal
      open={sourceModal.modal}
      onOpenChange={(isOpen) => !isOpen && dispatch(closeSourceModal())}
      title={sourceModal.source_type?.replace(/_/g, " ").toUpperCase() || "Document"}
      description=""
      width={800}
      height={700}
      footer={
        <div className="flex justify-end w-full">
          <Button 
            variant="outline" 
            onClick={() => dispatch(closeSourceModal())}
            className="border-border text-foreground hover:bg-secondary transition-colors"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="prose-invert max-w-none px-2 py-4">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          components={{
            a: ({ node, ...props }) => (
              <a className="text-primary hover:text-primary/80 underline underline-offset-4" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-6 mb-4 space-y-1" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-6 mb-4 space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => <li className="text-foreground" {...props} />,
            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-foreground mb-4 pb-2 border-b border-border/50" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-foreground mt-6 mb-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-foreground mt-4 mb-2" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold text-foreground" {...props} />,
            p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-4" {...props} />,
          }}
        >
          {`# ${sourceModal.title}\n\n${sourceModal.content}`}
        </ReactMarkdown>
      </div>
    </BaseModal>
  );
}
