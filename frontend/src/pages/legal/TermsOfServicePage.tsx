import { Link } from "react-router";
import { MoveLeft } from "lucide-react";
import { T } from "@/components/ThemeTokens";
import { DottedBg } from "@/components/base/DottedBg";

export default function TermsOfServicePage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text1, fontFamily: T.fontSans, position: "relative", overflow: "hidden" }}>
      <DottedBg />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div className="fade-up">
        <Link 
          to="/" 
          style={{ 
            display: "inline-flex", alignItems: "center", gap: 8, 
            color: T.text3, textDecoration: "none", marginBottom: 32,
            fontSize: 14, fontWeight: 500
          }}
        >
          <MoveLeft size={16} /> Back to Home
        </Link>
        
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: T.text1 }}>Terms of Service</h1>
        <p style={{ fontSize: 16, color: T.text3, marginBottom: 48 }}>Last updated: June 8, 2026</p>
        </div>

        <section className="fade-up delay-100" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>1. Rules for Using the Service</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            NoteAtlas provides an AI-powered research assistant platform. By using the platform, you agree to:
          </p>
          <ul style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, paddingLeft: 20, marginBottom: 16 }}>
            <li>Provide accurate account information during registration.</li>
            <li>Not use the service for any illegal, harmful, or unauthorized purpose.</li>
            <li>Not attempt to bypass our security measures, rate limits, or payment systems.</li>
            <li>Not upload malicious files, viruses, or destructive code to the platform.</li>
          </ul>
        </section>

        <section className="fade-up delay-200" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>2. User Responsibilities</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            You are entirely responsible for the content you upload to NoteAtlas. You must ensure that you have the necessary intellectual property rights, licenses, and permissions to upload, process, and analyze the documents you provide. You agree not to upload highly sensitive personal information (such as SSNs or unredacted health records) to the AI systems unless necessary and legally permitted.
          </p>
        </section>

        <section className="fade-up delay-300" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>3. Limitation of Liability</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            NoteAtlas is provided "as is" without any warranties, express or implied. The AI-generated insights, summaries, and chat responses are for informational purposes and may occasionally be inaccurate. 
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            In no event will NoteAtlas, its creators, or partners be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages (including lost profits or data loss) arising from your use of the platform.
          </p>
        </section>

        <section className="fade-up delay-400" style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>4. Contact Information</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            For legal inquiries, support requests, or questions regarding these terms, please reach out the developer at:
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text1, fontWeight: 600 }}>
            Email: vasudevahir2006@gmail.com
          </p>
        </section>
      </main>
    </div>
  );
}
