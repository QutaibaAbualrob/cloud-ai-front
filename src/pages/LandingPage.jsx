import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Header/Nav */}
      <nav className="landing-nav">
        <div className="brand">
          <div className="brand-logo">AM</div>
          <div className="brand-name">AdaptMail</div>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1>Master Your Inbox with AI</h1>
            <p className="hero-subtitle">
              Personal, work, university—manage all your emails in one smart unified hub.
              Let AI categorize, summarize, and prioritize your messages based on your unique habits.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn-primary btn-large">Try AdaptMail Free</Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="visual-container">
              <div className="visual-header">Live AI Categorization</div>
              <div className="email-stream">
                <div className="email-card before-ai">
                  <div className="email-meta">
                    <span className="sender">boss@company.com</span>
                    <span className="time">10:42 AM</span>
                  </div>
                  <div className="email-subject">Project Alpha Q3 Roadmap</div>
                  <p className="email-snippet">Please review the attached timeline before our 2 PM sync...</p>
                </div>

                <div className="ai-scanner">
                  <div className="scanner-beam"></div>
                  <span>AI Agent Scanning...</span>
                </div>

                <div className="email-card after-ai">
                  <div className="email-meta">
                    <span className="sender">boss@company.com</span>
                    <span className="time">10:42 AM</span>
                  </div>
                  <div className="email-subject">Project Alpha Q3 Roadmap</div>
                  <div className="ai-tags">
                    <span className="badge badge-priority-high">Urgent</span>
                    <span className="badge badge-category">💼 Work</span>
                    <span className="badge badge-action">Needs Review</span>
                  </div>
                  <div className="ai-summary">
                    <span className="icon">✨</span> <strong>AI Summary:</strong> Review the Q3 timeline document before the 2 PM meeting.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Features Designed for You</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✉️</div>
            <h3>Unified Inbox</h3>
            <p>Connect all your accounts and ditch the multiple logins. Filter easily across providers like Gmail, Outlook, and more.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🧠</div>
            <h3>Smart Categorization</h3>
            <p>Beyond standard labels. Our AI learns what's important *to you* and sorts emails by custom topics and user-specific importance.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Urgency Detection</h3>
            <p>Never miss a critical message. The AI detects which emails demand an urgent response and highlights them instantly.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>On-Demand Summaries</h3>
            <p>Too long, didn't read? Generate concise AI summaries of lengthy threads and newsletters right inside your inbox.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Personalized Spam Filtering</h3>
            <p>What's spam to someone else might be vital to you—and vice versa. Train the agent to banish your specific unwanted mail.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Insightful Analytics</h3>
            <p>Visualize your inbox habits. See exactly how the agent processes your mail and correct its behavior for ultimate control.</p>
          </div>
        </div>
      </section>

      {/* How It Works / Learning Look */}
      <section className="learning-section">
        <div className="learning-header">
          <h2>An Assistant That Learns From You</h2>
          <p>
            Unlike traditional spam filters or rigid inbox rules, our AI agent observes your behavior. 
            When you correct a categorization, the agent updates its understanding in real-time.
          </p>
        </div>

        <div className="learning-dashboard">
          {/* Interaction Example: Correcting the AI / Standard provider */}
          <div className="learning-panel">
            <div className="panel-title">Real-Time Habit Learning</div>
            <div className="scenario-container">
              <div className="email-scenario standard-view">
                <div className="scenario-label">Standard Provider View</div>
                <div className="scenario-row">
                  <div className="scenario-sender">Marketing @ BigCorp</div>
                  <div className="false-important">⭐ Important</div>
                </div>
                <div className="scenario-subj">Don't miss our Q3 Webinar!</div>
              </div>

              <div className="correction-path">
                <div className="action-dot"></div>
                <div className="action-text">User corrects to <span>"promotions"</span></div>
                <div className="correction-arrow">⬇</div>
              </div>

              <div className="email-scenario ai-view">
                <div className="scenario-label">AdaptMail AI View (Now & Future)</div>
                <div className="scenario-row">
                  <div className="scenario-sender">Marketing @ BigCorp</div>
                  <div className="ai-tags">
                    <span className="badge badge-priority-low">Muted</span>
                    <span className="badge badge-custom-cat">🛍️ Promotions</span>
                  </div>
                </div>
                <div className="scenario-subj subdued">Don't miss our Q3 Webinar!</div>
                <div className="ai-learned-toast">✅ AI preference securely updated!</div>
              </div>
            </div>
          </div>

          <div className="learning-side-panels">
            {/* Stats Dashboard */}
            <div className="learning-panel stats-panel">
              <div className="panel-title">AI Accuracy (This Month)</div>
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-number">1,432</div>
                  <div className="stat-label">Auto-Categorized</div>
                </div>
                <div className="stat-box">
                  <div className="stat-number correction">12</div>
                  <div className="stat-label">Your Corrections</div>
                </div>
              </div>
              <div className="accuracy-bar-container">
                <div className="accuracy-bar" style={{ width: '99%' }}>99%</div>
              </div>
              <div className="accuracy-text">The agent is adapting perfectly!</div>
            </div>

            {/* Custom Categories Detected */}
            <div className="learning-panel">
              <div className="panel-title">Detected Custom Categories</div>
              <p className="scenario-subtext">AI generated these based on your habits:</p>
              <div className="floating-categories">
                <span className="badge bounce-1">🏫 CS-101 Assignments</span>
                <span className="badge bounce-2">💳 Monthly Subscriptions</span>
                <span className="badge bounce-3">🎮 Gaming News</span>
                <span className="badge bounce-1">🏢 Freelance Invoices</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="brand-logo">AM</div>
          <div className="brand-name">AdaptMail</div>
        </div>
        <p>&copy; {new Date().getFullYear()} AI Cloud Project. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
