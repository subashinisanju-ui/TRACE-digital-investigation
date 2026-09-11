import { useEffect, useState } from 'react'
import './App.css'

function App() {

  // Controls whether the investigation has started
  const [gameStarted, setGameStarted] = useState(false);

  // Controls which investigation screen is currently open
  const [currentPage, setCurrentPage] = useState('case');

  // Controls whether the encrypted file has been opened
  const [packetOpened, setPacketOpened] = useState(false);

  // Stores the answer typed by the user
  const [cipherAnswer, setCipherAnswer] = useState('');

  // Controls whether the cipher has been solved
  const [cipherSolved, setCipherSolved] = useState(false);

  // Controls whether Clue #002 has been opened
  const [nextClueOpened, setNextClueOpened] = useState(false);

  // Controls whether Evidence #01 has been unlocked
  const [evidenceUnlocked, setEvidenceUnlocked] = useState(false);

  // Stores the suspect selected by the player
  const [selectedSuspect, setSelectedSuspect] = useState(null);

  // Controls the interrogation panel inside a suspect dossier
  const [interrogationStep, setInterrogationStep] = useState(0);

  // Progressive investigation state
  const [timelineSolved, setTimelineSolved] = useState(false);
  const [timelineAnswer, setTimelineAnswer] = useState('');
  const [networkSolved, setNetworkSolved] = useState(false);
  const [interrogationsCompleted, setInterrogationsCompleted] = useState([]);
  const [finalAccusation, setFinalAccusation] = useState('');
  const [caseClosed, setCaseClosed] = useState(false);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportFiled, setReportFiled] = useState(false);

  // Case timer + lightweight system audio
  const [timeLeft, setTimeLeft] = useState(12 * 60);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const playTone = (frequency = 520, duration = 0.08, type = 'square') => {
    if (!audioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
      oscillator.onended = () => ctx.close();
    } catch {
      // Audio is an optional enhancement; the investigation still works without it.
    }
  };

  useEffect(() => {
    if (!gameStarted || caseClosed || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, caseClosed, timeLeft]);

  useEffect(() => {
    if (timeLeft === 60 || timeLeft === 30 || timeLeft === 10) {
      playTone(880, 0.18);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const evidenceCount =
    Number(evidenceUnlocked) +
    Number(timelineSolved) +
    Number(networkSolved);

  const fileInvestigationReport = () => {
    if (!caseClosed || reportGenerating || reportFiled) return;
    setReportGenerating(true);
    playTone(760, 0.08);
    window.setTimeout(() => {
      setReportGenerating(false);
      setReportFiled(true);
      playTone(1040, 0.22);
    }, 1400);
  };

  const downloadReport = () => {
    const report = `TRACE // INVESTIGATION REPORT\n\nCASE #001 — THE GHOST LOGIN\nSTATUS: CASE CLOSED\nREFERENCE: TRACE-001\n\nINCIDENT\nA restricted system was accessed at 10:47 PM using Jordan Lee's credentials.\n\nEVIDENCE RECOVERED\n✓ Evidence #01 — Terminal Log\n✓ Evidence #02 — Access Sequence\n✓ Evidence #03 — Network Trace\n\nPERSON OF INTEREST\nSam Taylor — Network Engineer\n\nCONCLUSION\nTerminal 04 was linked to Port 23, while Sam Taylor was confirmed on-site during the access window. Jordan Lee's credentials were used to disguise the source of the login.\n\nTRACE // INVESTIGATION COMPLETE`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TRACE_CASE_001_INVESTIGATION_REPORT.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const completeInterrogation = () => {
    if (selectedSuspect && !interrogationsCompleted.includes(selectedSuspect)) {
      setInterrogationsCompleted((current) => [...current, selectedSuspect]);
    }
    setInterrogationStep(0);
    playTone(720, 0.12);
  };


  return (

    <main>

    <style>{`
      .suspects-page {
        width: 100%;
        max-width: 1100px;
        margin: 0 auto;
        box-sizing: border-box;
      }

      .suspects-page .suspects-topbar {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-end !important;
        gap: 30px !important;
        margin-bottom: 30px !important;
      }

      .suspects-page .database-indicator {
        flex-shrink: 0 !important;
        text-align: right !important;
        font-family: monospace !important;
        font-size: 12px !important;
        line-height: 1.7 !important;
      }

      .suspects-page .status-dot {
        color: #54f6a5 !important;
        margin-right: 6px !important;
      }

      .suspects-page .database-indicator small {
        opacity: .55 !important;
      }

      .suspects-page .suspect-grid {
        display: grid !important;
        grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        gap: 18px !important;
        width: 100% !important;
        margin: 25px 0 30px !important;
      }

      .suspects-page .suspect-card-enhanced {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        padding: 22px !important;
        text-align: left !important;
      }

      .suspects-page .suspect-card-top {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 10px !important;
        margin-bottom: 22px !important;
      }

      .suspects-page .subject-id,
      .suspects-page .suspicion-tag {
        font-family: monospace !important;
        font-size: 10px !important;
        letter-spacing: 1px !important;
      }

      .suspects-page .suspicion-tag {
        padding: 5px 8px !important;
        border: 1px solid rgba(255,255,255,.2) !important;
        white-space: nowrap !important;
      }

      .suspects-page .suspicion-tag.low { opacity: .65 !important; }
      .suspects-page .suspicion-tag.medium { opacity: .85 !important; }
      .suspects-page .suspicion-tag.high { border-color: rgba(255,90,90,.55) !important; }

      .suspects-page .suspect-avatar {
        width: 58px !important;
        height: 58px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-bottom: 18px !important;
        border: 1px solid rgba(84,246,165,.45) !important;
        font-family: monospace !important;
        font-size: 18px !important;
        letter-spacing: 2px !important;
      }

      .suspects-page .suspect-card h3 {
        margin: 0 0 5px !important;
      }

      .suspects-page .suspect-role {
        margin: 0 !important;
        opacity: .65 !important;
      }

      .suspects-page .suspect-divider {
        width: 100% !important;
        height: 1px !important;
        margin: 18px 0 !important;
        background: rgba(255,255,255,.12) !important;
      }

      .suspects-page .suspect-stat {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 15px !important;
        margin: 9px 0 !important;
        font-family: monospace !important;
        font-size: 10px !important;
        line-height: 1.5 !important;
      }

      .suspects-page .suspect-stat span:first-child { opacity: .5 !important; }
      .suspects-page .suspect-stat span:last-child { text-align: right !important; }

      .suspects-page .suspect-card button {
        margin-top: 18px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .suspects-page .dossier-panel {
        width: 100% !important;
        box-sizing: border-box !important;
        margin: 30px 0 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        text-align: left !important;
      }

      .suspects-page .dossier-heading {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 20px !important;
        padding: 22px 25px !important;
        border-bottom: 1px solid rgba(255,255,255,.14) !important;
      }

      .suspects-page .dossier-heading h2 {
        margin: 5px 0 0 !important;
      }

      .suspects-page .dossier-close {
        flex-shrink: 0 !important;
        width: auto !important;
        margin: 0 !important;
      }

      .suspects-page .dossier-body {
        padding: 25px !important;
        box-sizing: border-box !important;
      }

      .suspects-page .dossier-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 0 !important;
        border: 1px solid rgba(255,255,255,.10) !important;
      }

      .suspects-page .dossier-grid > div {
        display: grid !important;
        grid-template-columns: 145px minmax(0, 1fr) !important;
        align-items: center !important;
        column-gap: 18px !important;
        min-width: 0 !important;
        min-height: 72px !important;
        padding: 14px 18px !important;
        box-sizing: border-box !important;
        border-bottom: 1px solid rgba(255,255,255,.08) !important;
        border-right: 1px solid rgba(255,255,255,.08) !important;
      }

      .suspects-page .dossier-grid > div:nth-child(even) {
        border-right: 0 !important;
      }

      .suspects-page .dossier-grid > div:nth-last-child(-n+2) {
        border-bottom: 0 !important;
      }

      .suspects-page .dossier-grid span,
      .suspects-page .dossier-grid strong {
        display: block !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: 1.4 !important;
      }

      .suspects-page .dossier-grid span {
        font-family: monospace !important;
        font-size: 10px !important;
        letter-spacing: 1px !important;
        opacity: .5 !important;
        text-align: right !important;
        white-space: nowrap !important;
      }

      .suspects-page .dossier-grid strong {
        font-size: 13px !important;
        font-weight: 600 !important;
        text-align: left !important;
        min-width: 0 !important;
      }

      .suspects-page .dossier-section {
        margin-top: 22px !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        border: 1px solid rgba(255,255,255,.10) !important;
      }

      .suspects-page .dossier-section p {
        margin: 8px 0 0 !important;
        line-height: 1.7 !important;
      }

      .suspects-page .dossier-section .system-text {
        margin: 0 !important;
      }

      .suspects-page .dossier-note {
        border-left: 3px solid rgba(84,246,165,.7) !important;
      }

      .suspects-page .dossier-warning {
        border-left: 3px solid rgba(255,90,90,.7) !important;
      }

      .suspects-page .interrogation-panel {
        width: 100% !important;
        box-sizing: border-box !important;
        margin-top: 22px !important;
        padding: 22px !important;
        border: 1px solid rgba(84,246,165,.28) !important;
        text-align: left !important;
      }

      .suspects-page .interrogation-header {
        display: flex !important;
        justify-content: space-between !important;
        gap: 15px !important;
        padding-bottom: 14px !important;
        margin-bottom: 15px !important;
        border-bottom: 1px solid rgba(255,255,255,.10) !important;
        font-family: monospace !important;
        font-size: 10px !important;
        letter-spacing: 1px !important;
      }

      .suspects-page .interrogation-panel p {
        line-height: 1.7 !important;
      }

      .suspects-page .interrogation-response {
        padding: 16px !important;
        border-left: 2px solid rgba(84,246,165,.6) !important;
        background: rgba(84,246,165,.035) !important;
      }

      .report-action, .investigation-report {
        width: 100% !important;
        box-sizing: border-box !important;
        margin-top: 22px !important;
        padding: 24px !important;
        border: 1px solid rgba(84,246,165,.25) !important;
        text-align: left !important;
      }

      .report-action h3, .investigation-report h3 {
        margin: 7px 0 10px !important;
      }

      .report-generating {
        border-color: rgba(84,246,165,.45) !important;
      }

      .report-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 20px !important;
        padding-bottom: 18px !important;
        margin-bottom: 18px !important;
        border-bottom: 1px solid rgba(255,255,255,.12) !important;
      }

      .report-status {
        font-family: monospace !important;
        font-size: 11px !important;
        letter-spacing: 1px !important;
        padding: 6px 9px !important;
        border: 1px solid rgba(84,246,165,.45) !important;
      }

      .report-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        border: 1px solid rgba(255,255,255,.1) !important;
      }

      .report-grid > div {
        display: grid !important;
        grid-template-columns: 125px minmax(0, 1fr) !important;
        gap: 14px !important;
        align-items: center !important;
        min-height: 58px !important;
        padding: 12px 15px !important;
        border-right: 1px solid rgba(255,255,255,.08) !important;
        border-bottom: 1px solid rgba(255,255,255,.08) !important;
      }

      .report-grid > div:nth-child(even) { border-right: 0 !important; }
      .report-grid > div:nth-last-child(-n+2) { border-bottom: 0 !important; }
      .report-grid span { opacity: .5 !important; font-family: monospace !important; font-size: 9px !important; letter-spacing: 1px !important; }
      .report-grid strong { font-size: 12px !important; }

      .report-section {
        margin-top: 18px !important;
        padding: 16px !important;
        border: 1px solid rgba(255,255,255,.09) !important;
      }

      .report-section p { margin: 7px 0 !important; line-height: 1.6 !important; }
      .report-footer { margin: 20px 0 0 !important; font-family: monospace !important; font-size: 10px !important; opacity: .55 !important; letter-spacing: 1px !important; }

      .system-controls {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        font-family: monospace !important;
      }

      .case-timer {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-end !important;
        line-height: 1.1 !important;
      }

      .case-timer span {
        font-size: 9px !important;
        letter-spacing: 1px !important;
        opacity: .5 !important;
      }

      .case-timer strong {
        font-size: 16px !important;
        letter-spacing: 2px !important;
      }

      .timer-warning strong {
        animation: trace-pulse 1s infinite !important;
      }

      .audio-toggle,
      .system-controls .audio-toggle {
        width: auto !important;
        margin: 0 !important;
        padding: 8px 10px !important;
        font-family: monospace !important;
        font-size: 9px !important;
      }

      .investigation-nav button.active {
        border-color: rgba(84,246,165,.65) !important;
        box-shadow: 0 0 12px rgba(84,246,165,.08) !important;
      }

      .nav-count {
        opacity: .6 !important;
        font-family: monospace !important;
        font-size: 9px !important;
      }

      .evidence-puzzle {
        margin-top: 18px !important;
        border-color: rgba(84,246,165,.2) !important;
      }

      .timeline-clues {
        display: grid !important;
        gap: 7px !important;
        margin: 15px 0 !important;
        font-family: monospace !important;
        font-size: 10px !important;
      }

      .timeline-clues div {
        padding: 10px 12px !important;
        border-left: 2px solid rgba(255,255,255,.16) !important;
        background: rgba(255,255,255,.025) !important;
      }

      .network-options,
      .accusation-options {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 9px !important;
        margin: 15px 0 !important;
      }

      .network-options button,
      .accusation-options button {
        margin: 0 !important;
      }

      .board-header-stats {
        display: flex !important;
        justify-content: space-between !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
        margin: 15px 0 !important;
        font-family: monospace !important;
        font-size: 9px !important;
        opacity: .65 !important;
      }

      .board-clue.linked {
        border-color: rgba(84,246,165,.55) !important;
      }

      .board-clue.locked {
        opacity: .4 !important;
      }

      .final-accusation,
      .case-closed {
        margin-top: 25px !important;
        padding: 24px !important;
        border: 1px solid rgba(84,246,165,.3) !important;
        text-align: left !important;
      }

      .final-accusation h3,
      .case-closed h3 {
        margin: 8px 0 12px !important;
      }

      .accusation-options button.selected {
        border-color: rgba(84,246,165,.8) !important;
        background: rgba(84,246,165,.08) !important;
      }

      .final-submit {
        width: 100% !important;
        margin-top: 8px !important;
      }

      .timer-expired {
        border-color: rgba(255,90,90,.45) !important;
      }

      @keyframes trace-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .45; }
      }

      @media (max-width: 850px) {
        .suspects-page .suspect-grid {
          grid-template-columns: 1fr !important;
        }
        .suspects-page .suspects-topbar {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .suspects-page .database-indicator {
          text-align: left !important;
        }
      }

      @media (max-width: 600px) {
        .suspects-page .dossier-grid {
          grid-template-columns: 1fr !important;
        }
        .suspects-page .dossier-grid > div,
        .suspects-page .dossier-grid > div:nth-child(even),
        .suspects-page .dossier-grid > div:nth-last-child(-n+2) {
          grid-template-columns: 130px minmax(0, 1fr) !important;
          border-right: 0 !important;
          border-bottom: 1px solid rgba(255,255,255,.08) !important;
        }
        .suspects-page .dossier-grid > div:last-child {
          border-bottom: 0 !important;
        }
        .suspects-page .dossier-heading {
          align-items: flex-start !important;
        }

        .report-header {
          align-items: flex-start !important;
        }

        .report-grid {
          grid-template-columns: 1fr !important;
        }

        .report-grid > div,
        .report-grid > div:nth-child(even),
        .report-grid > div:nth-last-child(-n+2) {
          grid-template-columns: 120px minmax(0, 1fr) !important;
          border-right: 0 !important;
          border-bottom: 1px solid rgba(255,255,255,.08) !important;
        }

        .report-grid > div:last-child {
          border-bottom: 0 !important;
        }
      }
    `}</style>


      {/* ================= BINARY BACKGROUND ================= */}

      <div className="binary-background">

        {Array.from({ length: 70 }).map((_, index) => (

          <span
            key={index}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 3}s`
            }}
            className="binary-digit"
          >
            {Math.random() < 0.5 ? '0' : '1'}
          </span>

        ))}

      </div>


      {/* ================= HEADER ================= */}

      <header>

        <h1 className="logo">
          TRACE
        </h1>

        {gameStarted && (
          <div className="system-controls">
            <div className={`case-timer ${timeLeft <= 60 ? 'timer-warning' : ''}`}>
              <span>CASE CLOCK</span>
              <strong>{formatTime(timeLeft)}</strong>
            </div>
            <button
              className="audio-toggle"
              onClick={() => {
                setAudioEnabled((current) => !current);
                playTone(660, 0.1);
              }}
            >
              {audioEnabled ? '◉ AUDIO ON' : '○ AUDIO OFF'}
            </button>
          </div>
        )}

      </header>


      {/* ================= START SCREEN ================= */}

      {!gameStarted && (

        <section className="hero">

          <h2 className="case-number">
            CASE #001
          </h2>

          <p className="system-text">
            Digital Investigation System
          </p>

          <h3>
            The Ghost Login
          </h3>

          <p className="description">
            A confidential system was accessed at 10:47 PM.
            The credentials belong to someone who claims they were never there.
          </p>

          <button
            onClick={() => { setGameStarted(true); playTone(660, 0.15); }}
          >
            BEGIN INVESTIGATION
          </button>

        </section>

      )}


      {/* ================= INVESTIGATION SYSTEM ================= */}

      {gameStarted && (

        <section className="investigation-system">


          {/* ================= NAVIGATION ================= */}

          <nav className="investigation-nav">

            <button
              className={currentPage === 'case' ? 'active' : ''}
              onClick={() => { setCurrentPage('case'); playTone(); }}
            >
              CASE FILE
            </button>

            <button
              className={currentPage === 'evidence' ? 'active' : ''}
              onClick={() => { setCurrentPage('evidence'); playTone(); }}
            >
              EVIDENCE <span className="nav-count">{evidenceCount}/3</span>
            </button>

            <button
              className={currentPage === 'suspects' ? 'active' : ''}
              onClick={() => { setCurrentPage('suspects'); playTone(); }}
            >
              SUSPECTS
            </button>

            <button
              className={currentPage === 'board' ? 'active' : ''}
              onClick={() => { setCurrentPage('board'); playTone(); }}
            >
              INVESTIGATION BOARD
            </button>

          </nav>


          {/* ================================================= */}
          {/* ================= CASE FILE ==================== */}
          {/* ================================================= */}

          {currentPage === 'case' && (

            <section className="game-page case-file">

              <h2>
                CASE #001 — THE GHOST LOGIN
              </h2>

              <p className="system-text">
                INVESTIGATION STATUS: ACTIVE
              </p>


              <div className="case-description">

                <p>
                  At 10:47 PM, a restricted system was accessed
                  using the credentials of Jordan Lee.
                </p>

                <p>
                  Jordan claims they were working remotely and
                  never entered the building.
                </p>

                <p>
                  Your task is to determine what actually happened.
                </p>

              </div>


              {/* ================= INCOMING PACKET ================= */}

              {!packetOpened && (

                <div className="data-packet">

                  <p className="packet-title">
                    ⚠ INCOMING DATA PACKET
                  </p>

                  <p>
                    FILE: TRANSMISSION_01.enc
                  </p>

                  <p>
                    STATUS: 🔒 ENCRYPTED
                  </p>

                  <button
                    onClick={() => setPacketOpened(true)}
                  >
                    DECRYPT FILE
                  </button>

                </div>

              )}


              {/* ================= PACKET OPENED ================= */}

              {packetOpened && (

                <div className="decryption-screen">


                  {/* ================= CIPHER PUZZLE ================= */}

                  {!cipherSolved && (

                    <>

                      <p className="packet-title">
                        DECRYPTION INTERFACE
                      </p>

                      <p>
                        ENCRYPTED MESSAGE:
                      </p>

                      <h3 className="encrypted-message">
                        VKH GRYLFH LV QRW ZKHUH LW VHHPV
                      </h3>

                      <p className="clue-hint">
                        HINT: Nothing moves forward without first looking back.
                      </p>

                      <p className="system-text">
                        Decode the message to continue the investigation.
                      </p>


                      <input
                        type="text"
                        placeholder="Enter decoded message"
                        value={cipherAnswer}
                        onChange={(e) => setCipherAnswer(e.target.value)}
                      />


                      <button
                        onClick={() => {

                          if (
                            cipherAnswer.trim().toLowerCase() ===
                            'the device is not where it seems'
                          ) {

                            setCipherSolved(true);

                          } else {

                            alert('INCORRECT ANSWER. Please try again.');

                          }

                        }}
                      >
                        SUBMIT ANSWER
                      </button>

                    </>

                  )}


                  {/* ================= SUCCESS SCREEN ================= */}

                  {cipherSolved && (

                    <div className="success-screen">

                      <p className="packet-title">
                        ✓ DECRYPTION SUCCESSFUL
                      </p>

                      <h3>
                        MESSAGE VERIFIED
                      </h3>

                      <p>
                        The device is not where it seems.
                      </p>

                      {!nextClueOpened && (

                        <button
                          onClick={() => setNextClueOpened(true)}
                        >
                          OPEN NEXT CLUE
                        </button>

                      )}

                    </div>

                  )}


                  {/* ================= CLUE #002 ================= */}

                  {nextClueOpened && (

                    <div className="next-clue">

                      <p className="packet-title">
                        CLUE #002
                      </p>

                      <h3>
                        DEVICE LOCATION
                      </h3>

                      <p>
                        The decrypted message points to a different workstation.
                      </p>

                      <p className="system-text">
                        TERMINAL: 04
                      </p>

                      <p className="system-text">
                        LOCATION: SECURITY OFFICE
                      </p>

                      <p className="system-text">
                        LAST ACCESS: 10:47 PM
                      </p>

                      <p>
                        Someone used Terminal 04 to access the restricted system.
                      </p>


                      {/* ADD TO EVIDENCE */}

                      {!evidenceUnlocked && (

                        <button
                          onClick={() => setEvidenceUnlocked(true)}
                        >
                          ADD TO EVIDENCE
                        </button>

                      )}

                      {evidenceUnlocked && (

                        <p className="system-text">
                          ✓ EVIDENCE ADDED TO DATABASE
                        </p>

                      )}

                    </div>

                  )}

                </div>

              )}

            </section>

          )}


          {/* ================================================= */}
          {/* ================= EVIDENCE ===================== */}
          {/* ================================================= */}

          {currentPage === 'evidence' && (

            <section className="game-page">

              <h2>
                EVIDENCE DATABASE
              </h2>

              <p className="system-text">
                AVAILABLE FILES
              </p>


              {!evidenceUnlocked && (

                <div className="locked-message">

                  <p>
                    🔒 Evidence files will unlock as the investigation progresses.
                  </p>

                </div>

              )}


              {evidenceUnlocked && (
                <>

                <div className="evidence-card">

                  <p className="packet-title">
                    EVIDENCE #01
                  </p>

                  <h3>
                    TERMINAL LOG
                  </h3>

                  <p>
                    Terminal 04 was used to access the restricted system.
                  </p>

                  <p className="system-text">
                    LOCATION: SECURITY OFFICE
                  </p>

                  <p className="system-text">
                    LAST ACCESS: 10:47 PM
                  </p>

                  <p>
                    STATUS: VERIFIED
                  </p>

                </div>

                {/* ================= EVIDENCE #02 / TIMELINE PUZZLE ================= */}

                <div className="evidence-card evidence-puzzle">
                  <p className="packet-title">EVIDENCE #02 // LOCKED</p>
                  <h3>ACCESS SEQUENCE</h3>

                  {!timelineSolved ? (
                    <>
                      <p>
                        Four system events were recovered from the building logs.
                        Put them in chronological order using their timestamps.
                      </p>

                      <div className="timeline-clues">
                        <div>10:47 PM — RESTRICTED LOGIN</div>
                        <div>10:44 PM — TERMINAL 04 UNLOCKED</div>
                        <div>10:49 PM — NETWORK ANOMALY</div>
                        <div>10:41 PM — SECURITY DOOR OPENED</div>
                      </div>

                      <input
                        type="text"
                        placeholder="Example: 1041-1044-1047-1049"
                        value={timelineAnswer || ''}
                        onChange={(e) => setTimelineAnswer(e.target.value)}
                      />

                      <button
                        onClick={() => {
                          if (timelineAnswer.replace(/\s/g, '') === '1041-1044-1047-1049') {
                            setTimelineSolved(true);
                            playTone(780, 0.15);
                          } else {
                            playTone(220, 0.12);
                            alert('SEQUENCE REJECTED. Re-check the timestamps.');
                          }
                        }}
                      >
                        VERIFY SEQUENCE
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="system-text">✓ TIMELINE VERIFIED</p>
                      <p>
                        The security door opened six minutes before the restricted
                        login. Terminal 04 was unlocked immediately before the access event.
                      </p>
                    </>
                  )}
                </div>

                {/* ================= EVIDENCE #03 / NETWORK PUZZLE ================= */}

                <div className={`evidence-card evidence-puzzle ${!timelineSolved ? 'locked-evidence' : ''}`}>
                  <p className="packet-title">EVIDENCE #03 // {networkSolved ? 'VERIFIED' : timelineSolved ? 'UNLOCKED' : 'LOCKED'}</p>
                  <h3>NETWORK TRACE</h3>

                  {!timelineSolved ? (
                    <div className="locked-message">
                      <p>
                        🔒 Evidence #03 is locked. Solve <strong>Evidence #02 — Access Sequence</strong> first.
                      </p>
                      <p className="system-text">REQUIRED: TIMELINE VERIFICATION</p>
                    </div>
                  ) : !networkSolved ? (
                    <>
                      <p>
                        The terminal did not connect directly to the restricted server.
                        It passed through an internal network port. Which port matches the trace?
                      </p>

                      <div className="network-options">
                        <button onClick={() => { playTone(220); alert('TRACE MISMATCH. Port rejected.'); }}>
                          PORT 08
                        </button>
                        <button onClick={() => { playTone(220); alert('TRACE MISMATCH. Port rejected.'); }}>
                          PORT 17
                        </button>
                        <button onClick={() => { setNetworkSolved(true); playTone(920, 0.18); }}>
                          PORT 23
                        </button>
                        <button onClick={() => { playTone(220); alert('TRACE MISMATCH. Port rejected.'); }}>
                          PORT 31
                        </button>
                      </div>

                      <p className="system-text">TRACE NOTE: SEC-OFFICE / SWITCH-02 / PORT-23</p>
                    </>
                  ) : (
                    <>
                      <p className="system-text">✓ NETWORK TRACE VERIFIED</p>
                      <p>
                        Terminal 04 routed through Switch-02, Port 23 — a port assigned
                        to the network engineering workstation.
                      </p>
                    </>
                  )}
                </div>

                </>
              )}

            </section>

          )}


          {/* ================================================= */}
          {/* ================= SUSPECTS ===================== */}
          {/* ================================================= */}

          {currentPage === 'suspects' && (

            <section className="game-page suspects-page">

              <div className="suspects-topbar">

                <div>
                  <p className="system-text">
                    PERSONS OF INTEREST // DATABASE 001
                  </p>

                  <h2>
                    SUSPECT DATABASE
                  </h2>

                  <p className="suspect-subtitle">
                    Three individuals. One restricted system. Find the contradiction.
                  </p>
                </div>

                <div className="database-indicator">
                  <span className="status-dot">●</span>
                  DATABASE ONLINE
                  <br />
                  <small>3 RECORDS FOUND</small>
                </div>

              </div>


              {/* ================= SUSPECT CARDS ================= */}

              <div className="suspect-grid">

                {/* ================= ALEX ================= */}

                <div className="suspect-card suspect-card-enhanced">

                  <div className="suspect-card-top">
                    <span className="subject-id">SUBJECT #01</span>
                    <span className="suspicion-tag low">LOW RISK</span>
                  </div>

                  <div className="suspect-avatar">AM</div>

                  <h3>
                    ALEX MORGAN
                  </h3>

                  <p className="suspect-role">
                    SECURITY ANALYST
                  </p>

                  <div className="suspect-divider" />

                  <div className="suspect-stat">
                    <span>ACCESS</span>
                    <span>SECURITY SYSTEMS</span>
                  </div>

                  <div className="suspect-stat">
                    <span>LAST CONFIRMED:</span>
                    <span>9:00 PM</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSuspect('alex');
                      setInterrogationStep(0);
                    }}
                  >
                    OPEN DOSSIER →
                  </button>

                </div>


                {/* ================= JORDAN ================= */}

                <div className="suspect-card suspect-card-enhanced">

                  <div className="suspect-card-top">
                    <span className="subject-id">SUBJECT #02</span>
                    <span className="suspicion-tag medium">PERSON OF INTEREST</span>
                  </div>

                  <div className="suspect-avatar">JL</div>

                  <h3>
                    JORDAN LEE
                  </h3>

                  <p className="suspect-role">
                    SYSTEMS ADMINISTRATOR
                  </p>

                  <div className="suspect-divider" />

                  <div className="suspect-stat">
                    <span>ACCESS</span>
                    <span>RESTRICTED SYSTEMS</span>
                  </div>

                  <div className="suspect-stat">
                    <span>LAST CONFIRMED:</span>
                    <span>REMOTE</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSuspect('jordan');
                      setInterrogationStep(0);
                    }}
                  >
                    OPEN DOSSIER →
                  </button>

                </div>


                {/* ================= SAM ================= */}

                <div className="suspect-card suspect-card-enhanced suspect-sam">

                  <div className="suspect-card-top">
                    <span className="subject-id">SUBJECT #03</span>
                    <span className="suspicion-tag high">HIGH SUSPICION</span>
                  </div>

                  <div className="suspect-avatar">ST</div>

                  <h3>
                    SAM TAYLOR
                  </h3>

                  <p className="suspect-role">
                    NETWORK ENGINEER
                  </p>

                  <div className="suspect-divider" />

                  <div className="suspect-stat">
                    <span>ACCESS</span>
                    <span>NETWORK INFRASTRUCTURE</span>
                  </div>

                  <div className="suspect-stat">
                    <span>LAST CONFIRMED:</span>
                    <span>11:00 PM</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedSuspect('sam');
                      setInterrogationStep(0);
                    }}
                  >
                    OPEN DOSSIER →
                  </button>

                </div>

              </div>


              {/* ================================================= */}
              {/* ================= CLASSIFIED DOSSIER =========== */}
              {/* ================================================= */}

              {selectedSuspect && (

                <div className="suspect-profile dossier-panel">

                  <div className="dossier-heading">

                    <div>
                      <p className="packet-title">
                        CLASSIFIED // PERSON OF INTEREST
                      </p>

                      <h2>
                        {selectedSuspect === 'alex' && 'ALEX MORGAN'}
                        {selectedSuspect === 'jordan' && 'JORDAN LEE'}
                        {selectedSuspect === 'sam' && 'SAM TAYLOR'}
                      </h2>
                    </div>

                    <button
                      className="dossier-close"
                      onClick={() => {
                        setSelectedSuspect(null);
                        setInterrogationStep(0);
                      }}
                    >
                      CLOSE ×
                    </button>

                  </div>


                  {/* ================= DOSSIER: ALEX ================= */}

                  {selectedSuspect === 'alex' && (

                    <div className="dossier-body">

                      <div className="dossier-grid">

                        <div>
                          <span>ROLE:</span>
                          <strong>SECURITY ANALYST</strong>
                        </div>

                        <div>
                          <span>ACCESS LEVEL:</span>
                          <strong>SECURITY SYSTEMS</strong>
                        </div>

                        <div>
                          <span>LAST CONFIRMED:</span>
                          <strong>9:00 PM</strong>
                        </div>

                        <div>
                          <span>STATUS:</span>
                          <strong>LOW SUSPICION</strong>
                        </div>

                      </div>

                      <div className="dossier-section">
                        <p className="system-text">RECORDED STATEMENT</p>
                        <p>
                          "I left the office around 9 PM. I had no reason to come back."
                        </p>
                      </div>

                      <div className="dossier-section dossier-note">
                        <p className="system-text">INVESTIGATOR NOTE</p>
                        <p>
                          Alex was investigating unusual login attempts earlier that evening.
                          Their security knowledge makes them relevant, but there is currently
                          no evidence placing them inside the building at 10:47 PM.
                        </p>
                      </div>

                    </div>

                  )}


                  {/* ================= DOSSIER: JORDAN ================= */}

                  {selectedSuspect === 'jordan' && (

                    <div className="dossier-body">

                      <div className="dossier-grid">

                        <div>
                          <span>ROLE:</span>
                          <strong>SYSTEMS ADMINISTRATOR</strong>
                        </div>

                        <div>
                          <span>ACCESS LEVEL:</span>
                          <strong>RESTRICTED SYSTEMS</strong>
                        </div>

                        <div>
                          <span>LAST CONFIRMED:</span>
                          <strong>REMOTE</strong>
                        </div>

                        <div>
                          <span>STATUS:</span>
                          <strong>PERSON OF INTEREST</strong>
                        </div>

                      </div>

                      <div className="dossier-section">
                        <p className="system-text">RECORDED STATEMENT</p>
                        <p>
                          "I was working remotely all evening. I never entered the building."
                        </p>
                      </div>

                      <div className="dossier-section dossier-note">
                        <p className="system-text">INVESTIGATOR NOTE</p>
                        <p>
                          Jordan's credentials were used at 10:47 PM. Jordan also reported
                          losing sight of their access credentials earlier in the week.
                        </p>
                      </div>

                    </div>

                  )}


                  {/* ================= DOSSIER: SAM ================= */}

                  {selectedSuspect === 'sam' && (

                    <div className="dossier-body">

                      <div className="dossier-grid">

                        <div>
                          <span>ROLE:</span>
                          <strong>NETWORK ENGINEER</strong>
                        </div>

                        <div>
                          <span>ACCESS LEVEL:</span>
                          <strong>NETWORK INFRASTRUCTURE</strong>
                        </div>

                        <div>
                          <span>LAST CONFIRMED:</span>
                          <strong>11:00 PM</strong>
                        </div>

                        <div>
                          <span>STATUS:</span>
                          <strong>HIGH SUSPICION</strong>
                        </div>

                      </div>

                      <div className="dossier-section">
                        <p className="system-text">RECORDED STATEMENT</p>
                        <p>
                          "I was working on-site until 11 PM, but I never accessed Terminal 04."
                        </p>
                      </div>

                      <div className="dossier-section dossier-warning">
                        <p className="system-text">INVESTIGATOR NOTE // FLAGGED</p>
                        <p>
                          Sam possesses technical knowledge of the internal network and was
                          physically present in the building when the login occurred.
                        </p>
                      </div>

                    </div>

                  )}


                  {/* ================================================= */}
                  {/* ================= INTERROGATION ================= */}
                  {/* ================================================= */}

                  <div className="interrogation-panel">

                    <div className="interrogation-header">
                      <span>INTERROGATION CHANNEL</span>
                      <span>SECURE CONNECTION</span>
                    </div>

                    {interrogationStep === 0 && (

                      <div>
                        <p>
                          The subject is ready for questioning. Ask carefully — inconsistencies
                          may become useful evidence later.
                        </p>

                        <button
                          onClick={() => setInterrogationStep(1)}
                        >
                          BEGIN INTERROGATION
                        </button>
                      </div>

                    )}

                    {interrogationStep === 1 && (

                      <div>

                        <p className="system-text">
                          QUESTION 01
                        </p>

                        <p>
                          Where were you when the restricted system was accessed at 10:47 PM?
                        </p>

                        <p className="interrogation-response">
                          {selectedSuspect === 'alex' &&
                            '"I had already left the office. I was gone by around 9 PM."'}
                          {selectedSuspect === 'jordan' &&
                            '"I was working remotely. I never entered the building."'}
                          {selectedSuspect === 'sam' &&
                            '"I was still working on-site, but I was nowhere near Terminal 04."'}
                        </p>

                        <button
                          onClick={() => setInterrogationStep(2)}
                        >
                          PRESS FURTHER →
                        </button>

                      </div>

                    )}

                    {interrogationStep === 2 && (

                      <div>

                        <p className="system-text">
                          QUESTION 02
                        </p>

                        <p>
                          Do you have any connection to Terminal 04?
                        </p>

                        <p className="interrogation-response">
                          {selectedSuspect === 'alex' &&
                            '"I know the security systems, but I did not use Terminal 04 tonight."'}
                          {selectedSuspect === 'jordan' &&
                            '"Terminal 04? No. My credentials may have been compromised."'}
                          {selectedSuspect === 'sam' &&
                            '"I know the network, yes. That does not mean I accessed the terminal."'}
                        </p>

                        <button
                          onClick={() => setInterrogationStep(3)}
                        >
                          PRESS FURTHER →
                        </button>

                      </div>

                    )}

                    {interrogationStep === 3 && (

                      <div>

                        <p className="system-text">
                          INTERROGATION COMPLETE
                        </p>

                        <p>
                          Statement recorded and added to the investigator's notes.
                        </p>

                        <button
                          onClick={completeInterrogation}
                        >
                          FILE INTERROGATION REPORT →
                        </button>

                      </div>

                    )}

                  </div>

                </div>

              )}

            </section>

          )}


          {/* ================================================= */}
          {/* ============== INVESTIGATION BOARD ============= */}
          {/* ================================================= */}

          {currentPage === 'board' && (

            <section className="game-page">

              <h2>
                INVESTIGATION BOARD
              </h2>

              <p className="system-text">
                CONNECT THE EVIDENCE
              </p>


              <div className="board-header-stats">
                <span>EVIDENCE LINKED: {evidenceCount}/3</span>
                <span>INTERROGATIONS: {interrogationsCompleted.length}/3</span>
                <span>STATUS: {caseClosed ? 'CLOSED' : 'ACTIVE'}</span>
              </div>

              <div className="investigation-board">

                <div className="board-clue">
                  CASE:
                  <br />
                  THE GHOST LOGIN
                </div>

                <div className="board-clue">
                  USER:
                  <br />
                  J.LEE
                </div>

                <div className="board-clue">
                  TIME:
                  <br />
                  10:47 PM
                </div>

                <div className="board-clue">
                  TERMINAL:
                  <br />
                  04 // SECURITY OFFICE
                </div>

                <div className={`board-clue ${timelineSolved ? 'linked' : 'locked'}`}>
                  TIMELINE:
                  <br />
                  {timelineSolved ? 'VERIFIED ✓' : 'LOCKED'}
                </div>

                <div className={`board-clue ${networkSolved ? 'linked' : 'locked'}`}>
                  NETWORK:
                  <br />
                  {networkSolved ? 'PORT 23 ✓' : 'LOCKED'}
                </div>

              </div>

              {evidenceCount === 3 && interrogationsCompleted.length >= 2 && !caseClosed && (
                <div className="final-accusation">
                  <p className="packet-title">FINAL DEDUCTION UNLOCKED</p>
                  <h3>WHO USED JORDAN LEE'S CREDENTIALS?</h3>
                  <p>
                    The evidence places the intruder near Terminal 04, connects the
                    terminal to Port 23, and shows that the network engineer was on-site.
                    Make your accusation.
                  </p>

                  <div className="accusation-options">
                    {['alex', 'jordan', 'sam'].map((suspect) => (
                      <button
                        key={suspect}
                        className={finalAccusation === suspect ? 'selected' : ''}
                        onClick={() => setFinalAccusation(suspect)}
                      >
                        {suspect === 'alex' && 'ALEX MORGAN'}
                        {suspect === 'jordan' && 'JORDAN LEE'}
                        {suspect === 'sam' && 'SAM TAYLOR'}
                      </button>
                    ))}
                  </div>

                  {finalAccusation && (
                    <button
                      className="final-submit"
                      onClick={() => {
                        if (finalAccusation === 'sam') {
                          setCaseClosed(true);
                          playTone(1040, 0.25);
                        } else {
                          playTone(180, 0.2);
                          alert('ACCUSATION INSUFFICIENT. Review the linked evidence.');
                        }
                      }}
                    >
                      SUBMIT FINAL ACCUSATION →
                    </button>
                  )}
                </div>
              )}

              {caseClosed && (
                <>
                  <div className="case-closed">
                    <p className="packet-title">✓ CASE CLOSED</p>
                    <h3>INTRUSION ATTRIBUTED TO SAM TAYLOR</h3>
                    <p>
                      The investigation linked Terminal 04 to Port 23 and placed Sam
                      Taylor inside the building during the access window. Jordan's
                      credentials were used to disguise the source of the login.
                    </p>
                    <p className="system-text">TRACE // INVESTIGATION COMPLETE</p>
                  </div>

                  {!reportFiled && !reportGenerating && (
                    <div className="report-action">
                      <p className="packet-title">FINALIZE INVESTIGATION</p>
                      <h3>FILE INVESTIGATION REPORT</h3>
                      <p>
                        Compile the recovered evidence, suspect findings, and final deduction
                        into the official case record.
                      </p>
                      <button onClick={fileInvestigationReport}>
                        FILE INVESTIGATION REPORT →
                      </button>
                    </div>
                  )}

                  {reportGenerating && (
                    <div className="report-action report-generating">
                      <p className="packet-title">GENERATING REPORT...</p>
                      <h3>COMPILING CASE RECORD</h3>
                      <p className="system-text">
                        EVIDENCE VERIFIED // STATEMENTS ATTACHED // CONCLUSION RECORDED
                      </p>
                    </div>
                  )}

                  {reportFiled && (
                    <div className="investigation-report">
                      <div className="report-header">
                        <div>
                          <p className="packet-title">OFFICIAL CASE RECORD</p>
                          <h3>INVESTIGATION REPORT</h3>
                        </div>
                        <span className="report-status">FILED ✓</span>
                      </div>

                      <div className="report-grid">
                        <div><span>CASE</span><strong>#001 — THE GHOST LOGIN</strong></div>
                        <div><span>REFERENCE</span><strong>TRACE-001</strong></div>
                        <div><span>STATUS</span><strong>CASE CLOSED</strong></div>
                        <div><span>PRIMARY SUBJECT</span><strong>SAM TAYLOR</strong></div>
                      </div>

                      <div className="report-section">
                        <p className="system-text">EVIDENCE RECOVERED</p>
                        <p>✓ Evidence #01 — Terminal Log</p>
                        <p>✓ Evidence #02 — Access Sequence</p>
                        <p>✓ Evidence #03 — Network Trace</p>
                      </div>

                      <div className="report-section">
                        <p className="system-text">FINAL CONCLUSION</p>
                        <p>
                          Terminal 04 was linked to Port 23, while Sam Taylor was confirmed
                          on-site during the access window. Jordan Lee's credentials were
                          used to disguise the source of the login.
                        </p>
                      </div>

                      <p className="report-footer">TRACE // REPORT FILED // INVESTIGATION COMPLETE</p>

                      <button onClick={downloadReport}>
                        DOWNLOAD CASE REPORT ↓
                      </button>
                    </div>
                  )}
                </>
              )}

              {timeLeft === 0 && !caseClosed && (
                <div className="case-closed timer-expired">
                  <p className="packet-title">⚠ CASE CLOCK EXPIRED</p>
                  <h3>INVESTIGATION PAUSED</h3>
                  <p>The evidence is still intact. Restart the case to continue.</p>
                  <button
                    onClick={() => {
                      setTimeLeft(12 * 60);
                      setGameStarted(false);
                    }}
                  >
                    RESTART CASE
                  </button>
                </div>
              )}

            </section>

          )}

        </section>

      )}

    </main>

  )

}

export default App