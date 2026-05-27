import { Link } from "react-router";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center fade-in">
        <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-secondary flex items-center justify-center border border-border shadow-sm transform -rotate-6">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Page not found
        </h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
