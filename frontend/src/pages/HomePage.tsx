import { Link } from "react-router";
import { ArrowRight, BookOpen, BrainCircuit, Sparkles, Github, Twitter } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-primary/20">
      {/* Sleek, minimal background gradient */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/80 via-background to-background pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="glass-subtle sticky top-0 z-50 w-full border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-bold text-lg tracking-tight">NotebookLM</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              to="/auth/login"
              className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/auth/login"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 flex flex-col items-center justify-center text-center py-20 md:py-32">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-secondary/80 text-secondary-foreground text-sm font-medium mb-8 border border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-foreground" />
          <span>Your intelligent research workspace</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 leading-[1.1] max-w-4xl">
          Think clearer.<br className="hidden md:block" />
          <span className="text-muted-foreground/60"> Work faster.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 leading-relaxed">
          Upload your documents, websites, and notes. NotebookLM acts as your personalized AI, giving you instant answers, summaries, and mind maps grounded entirely in your own sources.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-150 w-full sm:w-auto">
          <Link
            to="/auth/login"
            className="w-full sm:w-auto group flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Start your first notebook
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-xl text-base font-medium bg-secondary/50 text-foreground hover:bg-secondary transition-all border border-border/60 active:scale-[0.98]"
          >
            See how it works
          </a>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full animate-in fade-in duration-1000 delay-300 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent blur-3xl -z-10 rounded-full" />
          
          <div className="surface p-8 text-left surface-hover group border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 border border-border/50 group-hover:scale-110 transition-transform duration-500">
              <BookOpen className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-foreground">Grounded Answers</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Ask questions and get answers backed entirely by your own uploaded documents. Zero hallucinations, pure context.
            </p>
          </div>
          
          <div className="surface p-8 text-left surface-hover group border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 border border-border/50 group-hover:scale-110 transition-transform duration-500">
              <BrainCircuit className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-foreground">Instant Study Guides</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Automatically generate comprehensive study guides, FAQs, and briefing docs from complex materials in seconds.
            </p>
          </div>

          <div className="surface p-8 text-left surface-hover group border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 border border-border/50 group-hover:scale-110 transition-transform duration-500">
              <Sparkles className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-3 text-foreground">Visual Mind Maps</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Visualize connections between concepts with auto-generated mind maps directly extracted from your source material.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border/40 bg-secondary/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-border/60 flex items-center justify-center text-xs font-bold text-foreground bg-secondary">
              N
            </div>
            <span className="font-semibold text-sm text-foreground">NotebookLM Clone</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Help</a>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:text-foreground transition-colors" aria-label="Github">
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}