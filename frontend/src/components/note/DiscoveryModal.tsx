import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search, Globe, ChevronRight } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { fetchSingleNote } from "@/store/chatSlice";
import { searchWeb, sendTextData } from "@/api/notes";
import { getUserData } from "@/helper/getUserData";
import { showError, showSuccess } from "@/util/toast-notification";

import { BaseModal } from "../base/BaseModal";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const FormSchema = z.object({
  query: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(100, "Search query is too long"),
});

type FormType = z.infer<typeof FormSchema>;

export const DiscoveryModal = ({ noteId }: { noteId?: string }) => {
  const [searchResult, setSearchResult] = useState<
    Array<{ title: string; link: string; text: string }>
  >([]);
  const [sendWebResultLoading, setSendWebResultLoading] = useState(false);

  const dispatch = useAppDispatch();
  const { modal } = useAppSelector((state) => state.discoveryModal);
  const userData = getUserData();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormType) => {
    try {
      const serverData = await searchWeb(data.query, userData?._id);
      if (serverData && serverData.data) {
        setSearchResult(serverData.data);
      } else {
        setSearchResult([]);
        showError("No results found. Please try a different query.");
      }
    } catch (err) {
      showError("Search failed. Please try again later.");
    }
  };

  const sendWebResult = async () => {
    if (searchResult.length === 0) {
      showError("No sources to submit. Please search first.");
      return;
    }
    if (!noteId) {
      showError("Notebook ID is missing.");
      return;
    }

    setSendWebResultLoading(true);
    try {
      // Note: Ideally, this should be done in a Promise.all or a single batch request
      // but keeping it sequential as per original implementation for stability.
      for (const webResult of searchResult) {
        if (webResult?.text) {
          await sendTextData(webResult.text, noteId);
        }
      }
      showSuccess("Sources successfully added to notebook.");
      dispatch(toggleDiscoveryModal());
      dispatch(fetchSingleNote(noteId));
    } catch (error) {
      showError("Failed to add sources to notebook.");
    } finally {
      setSendWebResultLoading(false);
    }
  };

  const hasResults = searchResult.length > 0;

  return (
    <BaseModal
      open={modal}
      onOpenChange={(isOpen) => !isOpen && dispatch(toggleDiscoveryModal())}
      title="Discover Web Sources"
      description="Search the web and automatically extract content into your notebook."
      width={750}
      height={650}
      footer={
        <div className="flex w-full justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => dispatch(toggleDiscoveryModal())}
            disabled={sendWebResultLoading || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={sendWebResult}
            disabled={!hasResults || sendWebResultLoading || isSubmitting}
            className="min-w-[120px]"
          >
            {sendWebResultLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {sendWebResultLoading ? "Importing..." : "Import Sources"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 px-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              What do you want to learn about?
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Enter a topic and AI will search the web to find relevant articles
              and documentation to add to your notebook.
            </p>
          </div>

          <div className="space-y-2">
            <Textarea
              {...register("query")}
              className="resize-none min-h-[80px] bg-background border-border/60 focus:border-primary/50 text-base"
              placeholder="e.g. History of the Apollo missions, React Hooks best practices..."
            />
            {errors.query && (
              <p className="text-destructive text-xs">{errors.query.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || sendWebResultLoading}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Searching..." : "Search Web"}
            </Button>
          </div>
        </form>

        {/* Results Section */}
        {hasResults && (
          <div className="pt-6 border-t border-border/40 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Found {searchResult.length} Relevant Sources
              </h3>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar pr-2">
              {searchResult.map((s, i) => (
                <a
                  key={i}
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 surface surface-hover rounded-xl group no-underline transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                    <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {s.title}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {s.link}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center justify-center h-8">
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default DiscoveryModal;