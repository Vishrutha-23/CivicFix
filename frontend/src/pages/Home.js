import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getAllIssues } from '../api';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getMarkerIcon = (status) => {
  const colors = {
    open: 'red',
    in_progress: 'orange',
    resolved: 'green'
  };
  const color = colors[status] || 'red';
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

const Home = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newIssueAlert, setNewIssueAlert] = useState(null);

  useEffect(() => {
    fetchIssues();

    // Connect to Socket.io
    const socket = io('https://bugmap-backend.onrender.com');

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
    });

    // Listen for new issues
    socket.on('newIssue', (issue) => {
      console.log('New issue received:', issue);
      setIssues(prev => [issue, ...prev]);
      setNewIssueAlert(`New issue reported: ${issue.title}`);
      setTimeout(() => setNewIssueAlert(null), 5000);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await getAllIssues();
      setIssues(res.data.issues);
    } catch (err) {
      console.error('Failed to fetch issues', err);
    }
    setLoading(false);
  };

  const filteredIssues = filter === 'all'
    ? issues
    : issues.filter(i => i.status === filter);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Real-time Alert */}
      {newIssueAlert && (
        <div style={styles.alert}>
          🔴 {newIssueAlert}
        </div>
      )}

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>Filter by status:</span>
        {['all', 'open', 'in_progress', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.filterBtn,
              backgroundColor: filter === f ? '#2d6a4f' : '#e9ecef',
              color: filter === f ? 'white' : '#333'
            }}
          >
            {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={styles.count}>
          {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Map */}
      {loading ? (
        <div style={styles.loading}>Loading map...</div>
      ) : (
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={12}
          style={{ flex: 1 }}
          worldCopyJump={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIssues.map(issue => (
            <Marker
              key={issue.issue_id}
              position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
              icon={getMarkerIcon(issue.status)}
            >
              <Popup>
                <div style={styles.popup}>
                  <h4 style={styles.popupTitle}>{issue.title}</h4>
                  <p><b>Category:</b> {issue.category}</p>
                  <p><b>Severity:</b> {issue.severity}</p>
                  <p><b>Status:</b> {issue.status}</p>
                  <p><b>Upvotes:</b> ⬆️ {issue.upvote_count}</p>
                  <p><b>Reported by:</b> {issue.reporter_name}</p>
                  {issue.image_url && (
                    <img src={issue.image_url} alt="issue" style={styles.popupImage} />
                  )}
                  <a href={`/issue/${issue.issue_id}`} style={styles.detailLink}>
                    View Details →
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

const styles = {
  alert: {
    backgroundColor: '#dc3545',
    color: 'white',
    padding: '10px 20px',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '14px',
    animation: 'fadeIn 0.3s ease'
  },
  filterBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 20px', backgroundColor: 'white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },
  filterLabel: { fontSize: '14px', color: '#555', marginRight: '5px' },
  filterBtn: {
    padding: '6px 14px', border: 'none',
    borderRadius: '20px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '500'
  },
  count: { marginLeft: 'auto', fontSize: '13px', color: '#666' },
  loading: {
    flex: 1, display: 'flex',
    justifyContent: 'center', alignItems: 'center',
    fontSize: '18px', color: '#555'
  },
  popup: { minWidth: '200px' },
  popupTitle: { margin: '0 0 8px 0', color: '#2d6a4f' },
  popupImage: { width: '100%', borderRadius: '6px', marginTop: '8px' },
  detailLink: {
    display: 'block', marginTop: '10px',
    color: '#2d6a4f', fontWeight: 'bold'
  }
};

export default Home;