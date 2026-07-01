import React from 'react';
import './RAGDiagram.css';

const RAGDiagram = () => {
  return (
    <div className="rag-scene">

      {/* ══════════════════════════════════════════════
          TOP ROW: Thought bubbles + Characters
      ══════════════════════════════════════════════ */}
      <div className="top-row">

        {/* ADMIN thought */}
        <div className="persona admin-persona">
          <div className="thought-cloud">
            <span className="cloud-emoji">📋</span>
            <p className="cloud-title">Admin thinks:</p>
            <p className="cloud-body">"Hey! Let me upload all our company policies &amp; HR docs into the system."</p>
            <div className="cloud-bubbles left-bubbles">
              <span className="cbubble cb3" />
              <span className="cbubble cb2" />
              <span className="cbubble cb1" />
            </div>
          </div>

          {/* Stick figure */}
          <div className="figure admin-fig">
            <div className="fig-head" />
            <div className="fig-body" />
            <div className="fig-arm fig-arm-l" />
            <div className="fig-arm fig-arm-r fig-arm-push" />
            <div className="fig-legs">
              <div className="fig-leg fig-leg-l" />
              <div className="fig-leg fig-leg-r" />
            </div>
          </div>
          <p className="persona-role">👩‍💼 HR Admin</p>
        </div>

        {/* CENTER spacer with title */}
        <div className="center-label-area">
          <div className="system-badge">
            <span className="badge-dot" />
            <span className="badge-dot" />
            <span className="badge-dot" />
            SYSTEM LIVE
          </div>
        </div>

        {/* USER thought */}
        <div className="persona user-persona">
          <div className="thought-cloud user-cloud">
            <span className="cloud-emoji">❓</span>
            <p className="cloud-title">Employee thinks:</p>
            <p className="cloud-body">"What are the terms and conditions about leave policy?"</p>
            <div className="cloud-bubbles right-bubbles">
              <span className="cbubble cb3" />
              <span className="cbubble cb2" />
              <span className="cbubble cb1" />
            </div>
          </div>

          {/* Stick figure */}
          <div className="figure user-fig">
            <div className="fig-head user-fig-head" />
            <div className="fig-body" />
            <div className="fig-arm fig-arm-l fig-arm-ask" />
            <div className="fig-arm fig-arm-r" />
            <div className="fig-legs">
              <div className="fig-leg fig-leg-l" />
              <div className="fig-leg fig-leg-r" />
            </div>
          </div>
          <p className="persona-role">👨‍💼 Employee</p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MAIN FLOW ROW
      ══════════════════════════════════════════════ */}
      <div className="flow-row">

        {/* ── STEP 1: Admin Uploads ── */}
        <div className="flow-box upload-box">
          <div className="step-badge">STEP 1</div>
          <span className="fb-icon">⬆️</span>
          <p className="fb-title">Admin Uploads</p>
          <p className="fb-sub">All company docs, HR policies, handbooks</p>
          {/* Flying docs toward VectorDB */}
          <div className="flying-docs">
            <span className="fdoc fd1">📄</span>
            <span className="fdoc fd2">📁</span>
            <span className="fdoc fd3">📋</span>
          </div>
        </div>

        {/* ── UPLOAD CONNECTOR (left → center) ── */}
        <div className="h-connector upload-conn">
          <p className="conn-tag upload-tag">uploads ↓</p>
          <div className="h-line">
            <span className="hcp hcp-upload hcp1" />
            <span className="hcp hcp-upload hcp2" />
            <span className="hcp hcp-upload hcp3" />
          </div>
          <span className="h-arrow">▶</span>
        </div>

        {/* ── STEP 2: Vector Database (CENTER HERO) ── */}
        <div className="flow-box vector-box">
          <div className="step-badge vdb-badge">STEP 2</div>
          <div className="vdb-graph">
            <svg className="vdb-svg" viewBox="0 0 200 100">
              <line x1="20"  y1="75" x2="60"  y2="30" className="vline" />
              <line x1="60"  y1="30" x2="100" y2="58" className="vline" />
              <line x1="100" y1="58" x2="140" y2="22" className="vline" />
              <line x1="140" y1="22" x2="178" y2="48" className="vline" />
              <line x1="60"  y1="30" x2="140" y2="22" className="vline vline-x" />
            </svg>
            <span className="vnode vn1" />
            <span className="vnode vn2" />
            <span className="vnode vn3" />
            <span className="vnode vn4" />
            <span className="vnode vn5" />
          </div>
          <p className="fb-title vdb-title">Vector Database</p>
          <p className="fb-sub">Embeddings &amp; Indexing</p>
          <div className="vdb-pulse pr1" />
          <div className="vdb-pulse pr2" />
          <div className="vdb-pulse pr3" />
        </div>

        {/* ── ANSWER CONNECTOR (center → right, BIDIRECTIONAL) ── */}
        <div className="h-connector answer-conn">
          {/* Query going LEFT from user → VectorDB */}
          <p className="conn-tag query-tag">← query</p>
          <div className="h-line query-line">
            <span className="hcp hcp-query hcq1" />
            <span className="hcp hcp-query hcq2" />
            <span className="hcp hcp-query hcq3" />
          </div>
          {/* Answer going RIGHT from VectorDB → user */}
          <p className="conn-tag answer-tag">answer →</p>
          <div className="h-line answer-line">
            <span className="hcp hcp-answer hca1" />
            <span className="hcp hcp-answer hca2" />
            <span className="hcp hcp-answer hca3" />
          </div>
        </div>

        {/* ── STEP 3: Instant Response ── */}
        <div className="flow-box response-box">
          <div className="step-badge resp-badge">STEP 3</div>
          <span className="fb-icon resp-check">✅</span>
          <p className="fb-title resp-title">Instant Response</p>
          <p className="resp-quote">"Employees get 20 days of paid leave per year"</p>
          <p className="resp-source">📎 Source: HR Policy 2024</p>
          {/* Glow effect on response box */}
          <div className="resp-glow" />
        </div>

      </div>{/* end flow-row */}

      {/* ══════════════════════════════════════════════
          BOTTOM: HOW IT WORKS STEPS
      ══════════════════════════════════════════════ */}
      <div className="how-row">
        <div className="how-step">
          <span className="how-num">①</span>
          <p className="how-text">Admin saves all company documents once</p>
        </div>
        <div className="how-divider">→</div>
        <div className="how-step">
          <span className="how-num">②</span>
          <p className="how-text">AI indexes &amp; understands every document</p>
        </div>
        <div className="how-divider">→</div>
        <div className="how-step">
          <span className="how-num">③</span>
          <p className="how-text">Employee types any question in plain language</p>
        </div>
        <div className="how-divider">→</div>
        <div className="how-step">
          <span className="how-num">④</span>
          <p className="how-text">Gets the exact answer in seconds — no manual search</p>
        </div>
      </div>

      <p className="rag-footer">
        🚀 <strong>No more digging through 100-page PDFs.</strong> Employees get the right answer, instantly.
      </p>

    </div>
  );
};

export default RAGDiagram;
