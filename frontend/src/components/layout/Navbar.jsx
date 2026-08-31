import ThemeToggle from "./ThemeToggle";
import * as s from "../../styles/layout.styles";

export default function Navbar({ documentCount }) {
  return (
    <nav className={s.navbar}>
      <div className={s.navbarInner}>
        <div className={s.brandGroup}>
          <div className={s.logoBadge}>
            <span className={s.logoLetter}>R</span>
          </div>
          <div>
            <h1 className={s.title}>RAG Transcriber</h1>
            <p className={s.subtitle}>Upload · Transcribe · Chat</p>
          </div>
        </div>
        <div className={s.rightSection}>
          <span className={s.docCountBadge}>
            {documentCount} document{documentCount === 1 ? "" : "s"}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

