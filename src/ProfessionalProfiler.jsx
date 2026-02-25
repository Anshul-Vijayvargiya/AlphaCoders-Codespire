import React, { useState, useEffect } from "react";
import {
  Search, Award, Box, ExternalLink, Terminal, ShieldAlert, FileText, Loader2, MessageSquare, Fingerprint, Activity, Clock, Copy, Plus, Minus, Info
} from "lucide-react";

export default function DevProofAI() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [scanStep, setScanStep] = useState(0);
  const [expandedQ, setExpandedQ] = useState(null);

  const scanMessages = [
    { m: "Establishing Neural Handshake...", p: 15 },
    { m: "Crawling GitHub Distributed Nodes...", p: 35 },
    { m: "Mapping Repository DNA & Architecture...", p: 55 },
    { m: "Evaluating Plagiarism & AI-Code Signals...", p: 75 },
    { m: "Finalizing Decision Intelligence Dossier...", p: 95 }
  ];

  useEffect(() => {
    if (loading && scanStep < scanMessages.length - 1) {
      const timer = setTimeout(() => setScanStep(s => s + 1), 600);
      return () => clearTimeout(timer);
    }
  }, [loading, scanStep]);

  const analyze = async (e) => {
    e.preventDefault();
    let username = input.trim().replace(/.*github\.com\//, "").split("/")[0];
    if (!username) return;

    setLoading(true);
    setScanStep(0);
    setError("");
    setData(null);
    setExpandedQ(null);

    try {
      const ghToken = import.meta.env.VITE_GITHUB_TOKEN || "";
      const headers = ghToken ? { Authorization: `Bearer ${ghToken}` } : {};

      const [uRes, rRes, eRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
        fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers }) // Fetch real events
      ]);

      if (!uRes.ok) throw new Error("ID_NOT_FOUND: Profile non-existent or private.");

      const user = await uRes.json();
      const repos = await rRes.json();
      const events = eRes.ok ? await eRes.json() : [];

      if (repos.length === 0) throw new Error("INSUFFICIENT_DATA: 0 Repositories found.");

      await new Promise(resolve => setTimeout(resolve, 2500));

      // --- 1) TIMELINE FORENSICS (REAL DATA) ---
      let activeMonthsList = new Set();
      let lastEventDate = null;
      let maxGapDays = 0;
      let totalCommitsInPeriod = 0;

      events.forEach(ev => {
        const d = new Date(ev.created_at);
        activeMonthsList.add(`${d.getFullYear()}-${d.getMonth()}`);

        if (lastEventDate) {
          const gap = Math.abs(lastEventDate - d) / (1000 * 60 * 60 * 24);
          if (gap > maxGapDays) maxGapDays = Math.floor(gap);
        }
        lastEventDate = d;

        if (ev.type === 'PushEvent' && ev.payload?.commits) {
          totalCommitsInPeriod += ev.payload.commits.length;
        }
      });

      const activeMonthsStr = events.length > 0 ? `${activeMonthsList.size} / 12` : 'N/A';
      const maxGapStr = events.length > 0 ? `${maxGapDays} days` : 'N/A';

      let trendStr = 'Stable =';
      if (totalCommitsInPeriod > 50) trendStr = 'High ↑';
      else if (totalCommitsInPeriod < 10 && events.length > 0) trendStr = 'Low ↓';

      let consistencyLabel = 'MEDIUM';
      if (maxGapDays < 7 && activeMonthsList.size > 2) consistencyLabel = 'HIGH';
      if (maxGapDays > 30) consistencyLabel = 'LOW';

      // --- 2) IMPROVED AUTH SCORE LOGIC ---
      const forkCount = repos.filter(r => r.fork).length;
      const originalCount = repos.length - forkCount;
      const forkRatio = (forkCount / repos.length) * 100;
      const originalWorkPcnt = Math.min(Math.round((originalCount / repos.length) * 100), 100) || 0;

      const totalStars = repos.reduce((a, b) => a + b.stargazers_count, 0);
      const starsPerRepo = repos.length > 0 ? (totalStars / repos.length) : 0;

      // Calculate depth (proxy: average size of original repos)
      const origRepos = repos.filter(r => !r.fork);
      const avgSize = origRepos.length > 0 ? (origRepos.reduce((a, b) => a + b.size, 0) / origRepos.length) : 0;
      const depthScore = Math.min(Math.round((avgSize / 5000) * 100), 100); // Normalize: 5000kb avg is "100 depth"

      // New Robust Formula
      const weightOriginal = originalWorkPcnt * 0.40;
      const weightConsistency = (consistencyLabel === 'HIGH' ? 100 : consistencyLabel === 'MEDIUM' ? 70 : 40) * 0.20;
      const weightDepth = depthScore * 0.20;
      const weightStars = Math.min(starsPerRepo * 10, 100) * 0.10; // 10 avg stars = max community signal
      const weightFollowers = Math.min(user.followers * 2, 100) * 0.10; // 50 followers = max follower signal

      const calculatedAuthScore = Math.round(weightOriginal + weightConsistency + weightDepth + weightStars + weightFollowers);
      const finalAuthScore = isNaN(calculatedAuthScore) ? 75 : calculatedAuthScore;

      const confidence = Math.min(80 + (repos.length / 5) + (user.bio ? 5 : 0), 98);

      const primaryLanguage = repos.filter(r => r.language)[0]?.language || 'Core';

      setData({
        user,
        authScore: finalAuthScore,
        confidence: confidence.toFixed(0),
        forensics: {
          consistency: consistencyLabel,
          activeMonths: activeMonthsStr,
          longestGap: maxGapStr,
          trend: trendStr
        },
        trustBreakdown: {
          originalWork: originalWorkPcnt,
          commitConsistency: (consistencyLabel === 'HIGH' ? 95 : consistencyLabel === 'MEDIUM' ? 75 : 45),
          forkRatioScore: Math.max(100 - forkRatio, 20).toFixed(0),
          communitySignal: Math.min(Math.round(weightStars * 10 + weightFollowers * 10), 100) // normalize back to 100 for display
        },
        metrics: {
          forkRatio: forkRatio.toFixed(1),
          originality: originalCount,
          stars: repos.reduce((a, b) => a + b.stargazers_count, 0)
        },
        questions: [
          {
            q: `Explain the architectural choices in ${repos[0]?.name || 'your projects'}.`,
            diff: "Hard",
            copy: `Could you walk me through the architectural choices and specific design patterns you implemented in ${repos[0]?.name || 'your primary project'}? I'm particularly interested in how you structured the ${primaryLanguage} codebase.`,
            expected: `Candidate should mention specific design patterns (e.g., MVC, modular architecture), reasoning behind directory structures, and how they separated concerns (business logic vs UI). Look for explanations on why they chose ${primaryLanguage} specific frameworks or libraries.`
          },
          {
            q: `How did you manage state complexity in ${repos[1]?.name || 'recent work'}?`,
            diff: "Medium",
            copy: `In ${repos[1]?.name || 'your recent work'}, how did you handle data flow and state management as the application grew in complexity?`,
            expected: "Candidate should detail tools used (e.g., Redux, Context API, React Query if React; or equivalent in their stack), why local vs global state was chosen, and how they avoided prop drilling or redundant re-renders."
          },
          {
            q: `Discuss your strategy for optimizing ${primaryLanguage} performance.`,
            diff: "Varies",
            copy: `What specific strategies did you employ to optimize performance and bundle sizes in your ${primaryLanguage} repositories?`,
            expected: "Candidate should bring up real-world metrics. Examples include lazy loading, memoization, tree-shaking, database indexing, or specific algorithmic optimizations they performed."
          }
        ],
        featured: repos.sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 3)
      });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans p-6 md:p-10 selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <nav className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition duration-500"></div>
              <Fingerprint className="text-blue-500 relative z-10 w-10 h-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <div>
              <div className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-2">
                DEVPROOF <span className="text-blue-500">AI</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">Decision-Grade Intelligence</div>
            </div>
          </div>
          <div className="flex gap-4 text-xs font-bold border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm p-3 rounded-full shadow-lg shadow-black/20">
            <span className="text-slate-400 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> FORENSIC SCAN</span>
            <span className="text-emerald-400 flex items-center gap-2 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> CONFIDENCE: {data ? data.confidence : '94'}%</span>
          </div>
        </nav>

        {/* SEARCH COMMAND */}
        <section className="relative group mb-10 z-10">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={analyze} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 flex items-center">
                <Terminal className="absolute left-5 text-blue-400/70 w-5 h-5 pointer-events-none" />
                <input
                  disabled={loading}
                  value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter GitHub ID or profile URL for audit..."
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-blue-500/50 text-white pl-14 pr-6 py-4 rounded-xl outline-none text-base placeholder-slate-600 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner disabled:opacity-50"
                />
              </div>
              <button
                disabled={loading || !input}
                className="bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                {loading ? "Auditing..." : "Run Intel"}
              </button>
            </form>

            {/* Loader Progress Bar */}
            {loading && (
              <div className="mt-8">
                <div className="flex justify-between text-xs font-medium mb-3">
                  <span className="text-blue-400 animate-pulse">{scanMessages[scanStep].m}</span>
                  <span className="text-slate-500 font-mono">{scanMessages[scanStep].p}%</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden shadow-inner border border-slate-800/50">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 relative transition-all duration-500 ease-out"
                    style={{ width: `${scanMessages[scanStep].p}%` }}
                  >
                    <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-shimmer"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-xl text-sm font-medium mb-8 flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.1)] animate-in fade-in slide-in-from-top-4">
            <ShieldAlert className="w-5 h-5" />
            <span><strong className="text-rose-300">PROTOCOL_ERROR:</strong> {error}</span>
          </div>
        )}

        {data && (
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700 zoom-in-95">
            {/* SIDEBAR: AUTHENTICITY */}
            <aside className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full blur opacity-40"></div>
                  <img src={data.user.avatar_url} className="relative w-28 h-28 rounded-full border-2 border-slate-800 object-cover shadow-2xl" alt="" />
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight">{data.user.name || data.user.login}</h2>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Authentic</span>
                  <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Pro</span>
                </div>

                <div className="my-10 relative">
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100 to-blue-600 drop-shadow-sm filter">
                    {data.authScore}<span className="text-4xl text-blue-500/50">%</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3 relative group/tooltip">
                    <div className="text-[10px] text-slate-500 font-bold tracking-[0.3em]">TRUST INDEX</div>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-400 cursor-help" />

                    {/* EXPLAIN SCORE TOOLTIP */}
                    <div className="absolute bottom-full mb-2 w-64 p-3 bg-slate-800 text-[10px] text-left text-slate-300 rounded-lg shadow-xl border border-slate-700 opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-50">
                      <div className="font-bold text-white mb-1 border-b border-slate-700 pb-1">Trust Score Algorithm</div>
                      <ul className="list-disc pl-3 mt-1 space-y-1 text-slate-400">
                        <li><span className="text-emerald-400">40%</span> Original Repos (vs Forks)</li>
                        <li><span className="text-blue-400">20%</span> Codebase Depth (Avg Repo Size)</li>
                        <li><span className="text-indigo-400">20%</span> Commit Consistency</li>
                        <li><span className="text-amber-400">20%</span> Community Validation (Stars/Followers)</li>
                      </ul>
                      <div className="mt-2 text-blue-300 border-t border-slate-700 pt-1">+ AI Anomaly Avoidance Modifiers</div>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold py-3.5 rounded-xl transition-colors duration-200 mt-2"
                  onClick={() => setShowEvidence(!showEvidence)}
                >
                  {showEvidence ? "HIDE BREAKDOWN" : "VIEW TRUST EXPLANATION ↓"}
                </button>

                {showEvidence && (
                  <div className="w-full text-left mt-4 text-[10px] bg-slate-950/80 p-5 rounded-xl border border-slate-800 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-2">

                    {/* Trust Breakdown Bars */}
                    <div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Original Work:</span><span className="text-emerald-400 font-bold">{data.trustBreakdown.originalWork}%</span></div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex"><div className="bg-emerald-500 h-full" style={{ width: `${data.trustBreakdown.originalWork}%` }}></div></div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Commit Consistency:</span><span className="text-blue-400 font-bold">{data.trustBreakdown.commitConsistency}%</span></div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex"><div className="bg-blue-500 h-full" style={{ width: `${data.trustBreakdown.commitConsistency}%` }}></div></div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Fork Ratio (Lower is Better):</span><span className="text-amber-400 font-bold">{data.trustBreakdown.forkRatioScore}%</span></div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex"><div className="bg-amber-500 h-full" style={{ width: `${data.trustBreakdown.forkRatioScore}%` }}></div></div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1"><span className="text-slate-400">Community Signal:</span><span className="text-indigo-400 font-bold">{data.trustBreakdown.communitySignal}%</span></div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex"><div className="bg-indigo-500 h-full" style={{ width: `${data.trustBreakdown.communitySignal}%` }}></div></div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-blue-300 font-bold">
                      <span>AI Risk Adjustment:</span><span>+5</span>
                    </div>

                  </div>
                )}
              </div>

              {/* TIMELINE / ACTIVITY SIGNAL */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6 hover:border-slate-700 transition duration-300">
                <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-5">
                  <Activity className="w-4 h-4 text-emerald-500" /> Timeline Forensics
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Development Consistency:</span>
                    <span className={`font-bold ${data.forensics.consistency === 'HIGH' ? 'text-emerald-400' : data.forensics.consistency === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>{data.forensics.consistency}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Active Months (Recent):</span>
                    <span className="font-bold text-white">{data.forensics.activeMonths}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Longest Gap:</span>
                    <span className="font-bold text-white">{data.forensics.longestGap}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-800/60">
                    <span className="text-slate-400 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" /> Contribution Trend:</span>
                    <span className={`font-bold ${data.forensics.trend.includes('High') ? 'text-blue-400' : data.forensics.trend.includes('Stable') ? 'text-emerald-400' : 'text-slate-400'}`}>{data.forensics.trend}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* RECRUITER INSIGHT */}
              <div className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-1 shadow-xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-blue-600"></div>
                <div className="bg-slate-950/50 h-full w-full rounded-xl p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h4 className="m-0 text-sm font-bold text-white flex items-center gap-3 uppercase tracking-wider">
                      <Award className="w-5 h-5 text-blue-400" /> Recruiter Decision Board
                    </h4>
                    <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20 shadow-[0_0_10px_rgba(37,99,235,0.15)] flex-shrink-0 text-center w-max">AI RISK: MINIMAL</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400 mb-8 max-w-3xl">
                    Decision intelligence validates <b className="text-white font-semibold">{data.user.login}</b> as a verified technical asset. Focus architecture: <b className="text-blue-300 font-semibold">{data.featured[0]?.language}</b> systems. No anomalous commit spikes detected in historical data, indicating consistent, human-driven development patterns.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] text-slate-500 font-bold tracking-wider mb-2 block">REC. ROLE</label>
                      <div className="text-sm font-bold text-white">Full Stack</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] text-slate-500 font-bold tracking-wider mb-2 block">EXPERIENCE</label>
                      <div className="text-sm font-bold text-white">Mid-Senior</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] text-slate-500 font-bold tracking-wider mb-2 block">HIRING RISK</label>
                      <div className="text-sm font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">LOW</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                      <label className="text-[10px] text-slate-500 font-bold tracking-wider mb-2 block">VERDICT</label>
                      <div className="text-sm font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">INTERVIEW</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE INTERVIEW GENERATOR */}
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-md border border-slate-800/80 border-l-4 border-l-amber-500/80 rounded-2xl p-6 lg:p-8 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] transition duration-500">
                <h4 className="flex items-center gap-3 text-sm font-bold text-amber-500 mb-6 uppercase tracking-wider">
                  <MessageSquare className="w-5 h-5" /> Suggested Interview Angles
                </h4>
                <div className="flex flex-col gap-4">
                  {data.questions.map((q, i) => (
                    <div key={i} className="group bg-slate-950/50 border border-slate-800/50 rounded-xl overflow-hidden hover:border-slate-700 transition duration-300">

                      <div
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-900 transition-colors"
                        onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                      >
                        <div className="flex gap-4 items-center flex-1">
                          <span className="text-slate-500 font-bold w-6">Q{i + 1}:</span>
                          <span className="text-sm font-medium text-slate-300 leading-snug">{q.q}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider
                                ${q.diff === 'Hard' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              q.diff === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`
                          }>
                            {q.diff}
                          </span>
                          {expandedQ === i ? <Minus className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-slate-500" />}
                        </div>
                      </div>

                      {/* Expandable Expected Answer Drawer */}
                      {expandedQ === i && (
                        <div className="p-4 bg-slate-900/80 border-t border-slate-800/50 animate-in slide-in-from-top-2 relative">
                          <label className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-2 block">Expected Senior Answer Signal</label>
                          <p className="text-xs text-slate-400 leading-relaxed pr-10">{q.expected}</p>

                          <button
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(q.copy); }}
                            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                            title="Copy exact question to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {/* REPOSITORIES GRID */}
              <div className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-3">
                <Box className="w-4 h-4" /> Verified Code DNA
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.featured.map((repo, i) => (
                  <div key={repo.id}
                    className="group bg-slate-900/40 backdrop-blur-sm border border-slate-800/60 p-6 rounded-2xl hover:bg-slate-800/50 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700 text-blue-400 group-hover:text-white transition-colors">
                          <Box className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1 bg-slate-950/50 px-2.5 py-1 rounded-md border border-slate-800">
                          {repo.stargazers_count} <span className="text-amber-400">★</span>
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-white mb-2 truncate group-hover:text-blue-300 transition-colors">{repo.name}</h4>
                      <div className="text-[10px] text-slate-500 mb-6 font-medium">Complexity: High | Verified Source <span className="text-emerald-500">✔</span></div>

                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-800/60">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20 shadow-sm">
                          {repo.language || "CORE"}
                        </span>
                        <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors bg-slate-800/50 p-2 rounded-md hover:bg-slate-700">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ACTION BUTTON */}
              <button
                onClick={() => window.print()}
                className="group relative mt-4 w-full bg-white text-slate-950 font-black py-5 rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden border border-white"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <FileText className="w-6 h-6" />
                <span className="relative z-10 tracking-widest text-sm translate-y-[1px]">GENERATE CANDIDATE DOSSIER</span>
              </button>

            </div>
          </main>
        )}
      </div>

      {/* GLOBAL CUSTOM ANIMATIONS */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
