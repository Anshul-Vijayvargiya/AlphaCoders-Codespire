import React, { useState } from "react";
import { 
  ShieldCheck, Search, AlertTriangle, Download, 
  Code2, Award, Zap, Github, Star, GitFork, User, ShieldAlert, 
  Box, ExternalLink, Calendar, Database, LayoutGrid, Cpu, Terminal
} from "lucide-react";
import "./Profiler.css"; // We will create this file next

export default function ProfessionalProfiler() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const analyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    try {
      const ghToken = import.meta.env.VITE_GITHUB_TOKEN || "";
      const headers = ghToken ? { Authorization: `Bearer ${ghToken}` } : {};

      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers }),
        fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers })
      ]);

      if (!uRes.ok) throw new Error("IDENTITY_NOT_FOUND: User does not exist.");
      
      const user = await uRes.json();
      const repos = await rRes.json();

      const featured = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 4);

      const forkCount = repos.filter(r => r.fork).length;
      const authScore = repos.length > 0 
        ? Math.max(Math.round(100 - (forkCount / repos.length * 70)), 5) 
        : 0;

      setData({ user, featured, authScore, totalStars: repos.reduce((a, b) => a + b.stargazers_count, 0) });
    } catch (err) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="profiler-container">
      <div className="profiler-wrapper">
        
        {/* HEADER */}
        <header className="main-header">
          <div className="brand">
            <div className="icon-box pulse">
              <Cpu size={32} color="#00f2ff" />
            </div>
            <h1 className="glitch-text">NEURAL_SCAN <span>v5.0</span></h1>
          </div>
          <div className="status-indicator">
            <span className="dot"></span> SYSTEM_ENCRYPTED
          </div>
        </header>

        {/* SEARCH SECTION */}
        <section className="search-section">
          <form onSubmit={analyze} className="search-form">
            <div className="input-group">
              <Terminal size={20} color="#666" />
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="TARGET_USER_ID..." 
                required 
              />
            </div>
            <button disabled={loading} className="scan-btn">
              {loading ? <Zap className="spin" /> : <Search />}
              {loading ? "SCANNING..." : "INITIATE"}
            </button>
          </form>
        </section>

        {error && (
          <div className="error-alert">
            <ShieldAlert size={20} /> ERROR: {error}
          </div>
        )}

        {/* RESULTS PANEL */}
        {data && (
          <main className="dashboard-grid">
            
            {/* SIDEBAR */}
            <aside className="sidebar">
              <div className="profile-card glass">
                <div className="avatar-wrapper">
                  <img src={data.user.avatar_url} alt="Profile" />
                  <div className={`trust-badge ${data.authScore > 60 ? 'good' : 'bad'}`}></div>
                </div>
                <h2>{data.user.name || data.user.login}</h2>
                <p className="handle">@{data.user.login}</p>
                <div className="mini-stats">
                  <div className="stat"><span>{data.user.followers}</span><label>Followers</label></div>
                  <div className="stat"><span>{data.totalStars}</span><label>Stars</label></div>
                </div>
              </div>

              <div className="activity-box glass">
                <label className="section-label"><Calendar size={14} /> ACTIVITY_GRID</label>
                <div className="grid-squares">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className={`square v-${Math.floor(Math.random() * 4)}`}></div>
                  ))}
                </div>
              </div>

              <div className="leetcode-box glass disabled">
                <label className="section-label"><Database size={14} /> LEETCODE_DNA</label>
                <div className="progress-bar"><div className="fill" style={{width: '40%'}}></div></div>
                <p className="hint">Awaiting API Integration...</p>
              </div>
            </aside>

            {/* CONTENT */}
            <div className="main-content">
              <div className="intelligence-report glass border-left">
                <div className="donut-stat">
                  <span className="score">{data.authScore}%</span>
                </div>
                <div className="report-text">
                  <label className="section-label"><Award size={14} /> EXECUTIVE_SUMMARY</label>
                  <p>
                    Developer authenticity rated at <strong>{data.authScore}%</strong>. 
                    Pattern analysis suggests proficiency in <strong>{data.featured[0]?.language || 'Logic'}</strong>. 
                    Candidate is {data.authScore > 70 ? "Highly Recommended" : "Requires Technical Vetting"}.
                  </p>
                </div>
              </div>

              <div className="projects-grid">
                {data.featured.map(repo => (
                  <div key={repo.id} className="project-card glass hover-effect">
                    <div className="card-top">
                      <Box size={18} color="#00f2ff" />
                      <div className="stars"><Star size={12} /> {repo.stargazers_count}</div>
                    </div>
                    <h4>{repo.name}</h4>
                    <p>{repo.description || "NO_METADATA_AVAILABLE"}</p>
                    <div className="card-bottom">
                      <span className="lang-tag">{repo.language || "CORE"}</span>
                      <a href={repo.html_url} target="_blank" rel="noreferrer"><ExternalLink size={16} /></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}