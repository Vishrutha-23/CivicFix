import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssue, upvoteIssue, generateLetter, updateStatus } from '../api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const IssueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [letter, setLetter] = useState('');
  const [authority, setAuthority] = useState('');
  const [loading, setLoading] = useState(true);
  const [letterLoading, setLetterLoading] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

 // eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  fetchIssue();
}, [id]);

  const fetchIssue = async () => {
    try {
      const res = await getIssue(id);
      setIssue(res.data.issue);
    } catch (err) {
      setError('Issue not found');
    }
    setLoading(false);
  };

  const handleUpvote = async () => {
    if (!user) { navigate('/login'); return; }
    setUpvoteLoading(true);
    try {
      await upvoteIssue(id);
      setIssue(prev => ({ ...prev, upvote_count: prev.upvote_count + 1 }));
      setMessage('Upvoted successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Already upvoted');
    }
    setUpvoteLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleGenerateLetter = async () => {
    setLetterLoading(true);
    setLetter('');
    setError('');
    try {
      const res = await generateLetter(id);
      setLetter(res.data.letter);
      setAuthority(res.data.authority);
    } catch (err) {
      setError('Failed to generate letter. Please try again.');
    }
    setLetterLoading(false);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(letter);
    setMessage('Letter copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#28a745',
      moderate: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[severity] || '#6c757d';
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#dc3545',
      in_progress: '#ffc107',
      resolved: '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return (
    <div>
      <Navbar />
      <div style={styles.loading}>Loading issue details...</div>
    </div>
  );

  if (error && !issue) return (
    <div>
      <Navbar />
      <div style={styles.loading}>{error}</div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh' }}>
      <Navbar />
      <div style={styles.container}>

        {/* Back button */}
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back to Map
        </button>

        {/* Issue Card */}
        <div style={styles.card}>
          <div style={styles.header}>
            <h2 style={styles.title}>{issue.title}</h2>
            <div style={styles.badges}>
              <span style={{
                ...styles.badge,
                backgroundColor: getSeverityColor(issue.severity)
              }}>
                {issue.severity.toUpperCase()}
              </span>
              <span style={{
                ...styles.badge,
                backgroundColor: getStatusColor(issue.status)
              }}>
                {issue.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div style={styles.grid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📁 Category</span>
              <span style={styles.infoValue}>{issue.category}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>👤 Reported by</span>
              <span style={styles.infoValue}>{issue.reporter_name}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📅 Date</span>
              <span style={styles.infoValue}>
                {new Date(issue.created_at).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📍 Location</span>
              <span style={styles.infoValue}>
                {parseFloat(issue.latitude).toFixed(4)}, {parseFloat(issue.longitude).toFixed(4)}
              </span>
            </div>
          </div>

          <div style={styles.description}>
            <h4 style={styles.descLabel}>Description</h4>
            <p style={styles.descText}>{issue.description}</p>
          </div>

          {issue.image_url && (
            <img
              src={issue.image_url}
              alt="Issue"
              style={styles.image}
            />
          )}
            {/* Status Update — only for the reporter */}
{user && issue.user_id === user.user_id && (
  <div style={styles.statusSection}>
    <h4 style={styles.descLabel}>Update Status</h4>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <select
        value={issue.status}
        onChange={async (e) => {
          try {
            await updateStatus(id, e.target.value);
            setIssue(prev => ({ ...prev, status: e.target.value }));
            setMessage(`Status updated to "${e.target.value.replace('_', ' ')}"`);
            setTimeout(() => setMessage(''), 3000);
          } catch (err) {
            setError('Failed to update status');
          }
        }}
        style={styles.statusDropdown}
      >
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
      <span style={{ fontSize: '13px', color: '#666' }}>
        Only you (the reporter) can update this
      </span>
    </div>
  </div>
)}
          {/* Upvote Section */}
          <div style={styles.upvoteSection}>
            <button
              onClick={handleUpvote}
              disabled={upvoteLoading}
              style={styles.upvoteBtn}
            >
              ⬆️ Upvote ({issue.upvote_count})
            </button>
            <span style={styles.upvoteHint}>
              Upvote to increase priority
            </span>
          </div>

          {message && <p style={styles.successMsg}>{message}</p>}
        </div>

        {/* AI Complaint Letter Section */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>🤖 AI Complaint Letter Generator</h3>
          <p style={styles.sectionDesc}>
            Generate a formal complaint letter addressed to the correct municipal authority. 
            You can then email it directly to escalate this issue.
          </p>

          <button
            onClick={handleGenerateLetter}
            disabled={letterLoading}
            style={styles.generateBtn}
          >
            {letterLoading ? '⏳ Generating letter...' : '✉️ Generate Complaint Letter'}
          </button>

          {error && <p style={styles.errorMsg}>{error}</p>}

          {letter && (
            <div style={styles.letterBox}>
              <div style={styles.letterHeader}>
                <h4 style={styles.letterTitle}>Generated Letter</h4>
                <div style={styles.letterActions}>
                  <span style={styles.authorityTag}>To: {authority}</span>
                  <button onClick={handleCopyLetter} style={styles.copyBtn}>
                    📋 Copy Letter
                  </button>
                </div>
              </div>
              <pre style={styles.letterContent}>{letter}</pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px 16px' },
  loading: {
    display: 'flex', justifyContent: 'center',
    alignItems: 'center', height: '50vh', fontSize: '18px'
  },
  backBtn: {
    background: 'none', border: 'none',
    color: '#2d6a4f', fontSize: '15px',
    cursor: 'pointer', marginBottom: '16px',
    fontWeight: '600', padding: '0'
  },
  card: {
    backgroundColor: 'white', borderRadius: '12px',
    padding: '24px', marginBottom: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '20px',
    flexWrap: 'wrap', gap: '10px'
  },
  title: { color: '#2d6a4f', margin: 0, fontSize: '22px' },
  badges: { display: 'flex', gap: '8px' },
  badge: {
    padding: '4px 12px', borderRadius: '20px',
    color: 'white', fontSize: '12px', fontWeight: '600'
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '16px', marginBottom: '20px'
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  infoLabel: { fontSize: '12px', color: '#888', fontWeight: '600' },
  infoValue: { fontSize: '14px', color: '#333' },
  description: { marginBottom: '20px' },
  descLabel: { color: '#555', marginBottom: '8px' },
  descText: { color: '#333', lineHeight: '1.6', margin: 0 },
  image: {
    width: '100%', maxHeight: '300px',
    objectFit: 'cover', borderRadius: '8px', marginBottom: '20px'
  },
  upvoteSection: {
    display: 'flex', alignItems: 'center',
    gap: '12px', paddingTop: '16px',
    borderTop: '1px solid #eee'
  },
  upvoteBtn: {
    padding: '10px 20px', backgroundColor: '#2d6a4f',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '15px', fontWeight: '600'
  },
  upvoteHint: { fontSize: '13px', color: '#888' },
  successMsg: { color: '#28a745', marginTop: '10px', fontWeight: '500' },
  sectionTitle: { color: '#2d6a4f', marginBottom: '8px' },
  sectionDesc: { color: '#666', fontSize: '14px', marginBottom: '16px' },
  generateBtn: {
    padding: '12px 24px', backgroundColor: '#1a6b3c',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontSize: '15px', fontWeight: '600',
    marginBottom: '16px'
  },
  errorMsg: { color: '#dc3545', marginTop: '10px' },
  letterBox: {
    border: '1px solid #dee2e6', borderRadius: '8px',
    overflow: 'hidden', marginTop: '16px'
  },
  letterHeader: {
    backgroundColor: '#f8f9fa', padding: '12px 16px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: '10px'
  },
  letterTitle: { margin: 0, color: '#333', fontSize: '15px' },
  letterActions: { display: 'flex', alignItems: 'center', gap: '10px' },
  authorityTag: {
    fontSize: '12px', color: '#666',
    backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '4px'
  },
  copyBtn: {
    padding: '6px 14px', backgroundColor: '#2d6a4f',
    color: 'white', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px'
  },
  letterContent: {
    padding: '16px', whiteSpace: 'pre-wrap',
    fontFamily: 'Georgia, serif', fontSize: '14px',
    lineHeight: '1.7', color: '#333', margin: 0,
    backgroundColor: 'white'
  },
  statusSection: {
  paddingBottom: '16px',
  marginBottom: '16px',
  borderBottom: '1px solid #eee'
},
statusDropdown: {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
  cursor: 'pointer',
  backgroundColor: 'white',
  color: '#333'
}
};

export default IssueDetail;