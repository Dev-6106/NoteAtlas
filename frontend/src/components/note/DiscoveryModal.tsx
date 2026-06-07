import React, { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { BaseModal } from "../base/BaseModal";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { getUserData } from "@/helper/getUserData";
import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchWeb, sendTextData } from "@/api/notes";
import { showError } from "@/util/toast-notification";
import { fetchSingleNote } from "@/store/chatSlice";



const FormSchema = z.object({
  query: z
    .string()
    .min(3, "Text must be at least 3 characters")
    .max(100, "Text is too long"),
});

type FormType = z.infer<typeof FormSchema>;

export const DiscoveryModal = ({ noteId }: { noteId?: string }) => {

  const [searchResult, setSearchResult] = useState<Array<{ title: string, link: string, text: string }>>([]);
  const [sendWebResultLoading, setSendWebResultLoading] = useState(false);


  const dispatch = useDispatch<AppDispatch>();
  const { modal } = useSelector((state: RootState) => state.discoveryModal);
  const userData = getUserData();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormType>({
    resolver: zodResolver(FormSchema),
  });

  const onSubmit = async (data: FormType) => {

    const serverData = await searchWeb(data?.query, userData?._id);

    if (serverData) {
      setSearchResult(serverData?.data);
      console.log("✅ search data", serverData);
      console.log('re :  ', searchResult);
    }
  };

  async function sendWebResult() {
    try {
      if (searchResult.length > 0) {
        setSendWebResultLoading(true);
        for (const webResult of searchResult) {
          await sendTextData(webResult?.text, noteId);
        }
        setSendWebResultLoading(false);
        dispatch(toggleDiscoveryModal());
        dispatch(fetchSingleNote(noteId as string));
      } else {
        showError('No source provided');
      }
    } catch (error) {
      setSendWebResultLoading(false);
    }
  }

  return (
    <div>
      <BaseModal
        open={modal}
        onOpenChange={() => dispatch(toggleDiscoveryModal())}
        title="Discover Sources"
        description=""
        width={750}
        height={600}
        footer={
          <>
            <button
              onClick={() => dispatch(toggleDiscoveryModal())}
              style={{
                padding: "9px 18px", borderRadius: 10,
                background: "var(--border-default)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-3)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                marginRight: 8,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--border-strong)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--border-default)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
              }}
            >
              Cancel
            </button>
            <button
              onClick={sendWebResult}
              disabled={sendWebResultLoading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "9px 18px", borderRadius: 10,
                background: sendWebResultLoading
                  ? "var(--primary-glow)"
                  : "linear-gradient(135deg, var(--primary-brand), var(--primary-light))",
                color: "var(--text-on-primary)", fontSize: 13, fontWeight: 700,
                border: "none",
                cursor: sendWebResultLoading ? "not-allowed" : "pointer",
                boxShadow: sendWebResultLoading ? "none" : "var(--shadow-primary)",
                transition: "all 0.2s",
              }}
            >
              {sendWebResultLoading ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </>
        }
      >
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Icon & question */}
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              paddingTop: 8,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "var(--primary-glow)",
                border: "1px solid var(--primary-border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 12,
              }}>
                <Search size={20} style={{ color: "var(--primary-brand)" }} />
              </div>
              <p style={{
                fontSize: 15, fontWeight: 600, color: "var(--text-1)",
                marginBottom: 8,
              }}>
                What are you interested in?
              </p>
            </div>

            {/* Textarea */}
            <div style={{ padding: "0 8px" }}>
              <textarea
                {...register('query')}
                placeholder="Describe something you would like to learn about or search about"
                style={{
                  width: "100%",
                  minHeight: 50,
                  resize: "vertical",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-strong)",
                  color: "var(--text-2)",
                  fontSize: 14,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  outline: "none",
                  transition: "all 0.2s",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)";
                  e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                  e.currentTarget.style.boxShadow = "0 0 16px rgba(99,102,241,0.1)";
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.background = "var(--bg-surface)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              {errors.query && (
                <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                  {errors.query.message}
                </p>
              )}
            </div>

            {/* Search button */}
            <div style={{
              display: "flex", justifyContent: "flex-end",
              padding: "0 8px",
            }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "9px 20px", borderRadius: 10,
                  background: isSubmitting
                    ? "var(--primary-glow)"
                    : "linear-gradient(135deg, var(--primary-brand), var(--primary-light))",
                  color: "var(--text-on-primary)", fontSize: 13, fontWeight: 700,
                  border: "none",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  boxShadow: isSubmitting ? "none" : "var(--shadow-primary)",
                  transition: "all 0.2s",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={14} /> Search
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            <div style={{
              marginTop: 16, paddingTop: 8,
              borderTop: "1px solid var(--border-default)",
            }}>
              <h3 style={{
                fontSize: 13, fontWeight: 600, color: "var(--text-3)",
                marginBottom: 10,
              }}>
                Select all sources ({searchResult.length})
              </h3>

              <div style={{
                display: "flex", flexDirection: "column", gap: 8,
                maxHeight: 160, overflowY: "auto", paddingRight: 8,
              }}>
                {searchResult.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: 12, borderRadius: 12,
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-default)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.06)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.2)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                      (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 13, fontWeight: 600, color: "var(--primary-brand)",
                          textDecoration: "none", transition: "color 0.2s",
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
                        }}
                      >
                        {s.title}
                      </a>
                      <p style={{
                        fontSize: 12, color: "var(--text-4)", marginTop: 2,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {s.link}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default DiscoveryModal;