import { Link } from "react-router";
import { MoveLeft } from "lucide-react";
import { T } from "@/components/ThemeTokens";

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text1, fontFamily: T.fontSans }}>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
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
        
        <h1 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16, color: T.text1 }}>Privacy Policy</h1>
        <p style={{ fontSize: 16, color: T.text3, marginBottom: 48 }}>Last updated: June 8, 2026</p>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>1. What Data We Collect</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            When you use NoteAtlas, we collect:
          </p>
          <ul style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, paddingLeft: 20, marginBottom: 16 }}>
            <li><strong>Account Information:</strong> Your name, email address, and profile picture (via Google OAuth).</li>
            <li><strong>User Content:</strong> The documents, PDFs, and notes you explicitly upload to the platform.</li>
            <li><strong>Usage Data:</strong> Basic analytics regarding feature usage to help improve the service.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>2. Why We Collect It</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            We collect this data solely to provide and improve the NoteAtlas services:
          </p>
          <ul style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, paddingLeft: 20, marginBottom: 16 }}>
            <li>To authenticate your account via Google.</li>
            <li>To process your uploaded documents using AI for summarization, mindmaps, and chat.</li>
            <li>To manage your credits and platform usage.</li>
            <li>To provide customer support and administrative notices.</li>
          </ul>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>3. How We Store Your Data</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            Your data is stored securely using industry-standard cloud infrastructure (MongoDB Atlas). 
            We use encryption in transit and at rest to protect your personal information and documents. 
            We do <strong>not</strong> sell your data, and we do <strong>not</strong> use your private documents to train our AI models.
          </p>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>4. Contact Information</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text2, marginBottom: 16 }}>
            If you have questions about this privacy policy, how your data is handled, or wish to request data deletion, please contact the developer at:
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.text1, fontWeight: 600 }}>
            Email: vasudevahir2006@gmail.com
          </p>
        </section>
      </main>
    </div>
  );
}
