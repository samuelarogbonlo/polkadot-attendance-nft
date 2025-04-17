// admin-ui/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import Spinner from '../components/Spinner';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentMints, setRecentMints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real app, you would have a dashboard API endpoint
      // For now, we'll get events and simulate stats

      const eventsResponse = await api.get('/admin/events?active=true');

      if (eventsResponse.data.success) {
        const events = eventsResponse.data.events;
        setRecentEvents(events.slice(0, 5)); // Get 5 most recent events

        // Simulate system stats - in a real app, you would get this from an API
        setStats({
          totalEvents: events.length,
          totalNfts: 156, // Example value
          activeEvents: events.filter(e => e.active).length,
          thisWeekMints: 23 // Example value
        });

        // For recent mints, you would have an API endpoint
        // For now, we'll simulate some data
        setRecentMints([
          {
            id: '1',
            tokenId: 42,
            eventId: events[0]?.id,
            eventName: events[0]?.name,
            attendeeEmail: 'user1@example.com',
            mintedAt: new Date().toISOString()
          },
          {
            id: '2',
            tokenId: 43,
            eventId: events[0]?.id,
            eventName: events[0]?.name,
            attendeeEmail: 'user2@example.com',
            mintedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: '3',
            tokenId: 44,
            eventId: events[1]?.id,
            eventName: events[1]?.name,
            attendeeEmail: 'user3@example.com',
            mintedAt: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
          }
        ]);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      setError('An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-label">Total Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeEvents}</div>
            <div className="stat-label">Active Events</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalNfts}</div>
            <div className="stat-label">Total NFTs Minted</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.thisWeekMints}</div>
            <div className="stat-label">Mints This Week</div>
          </div>
        </div>
      )}

      <div className="dashboard-row">
        <div className="dashboard-column">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Events</h2>
              <Link to="/events" className="btn btn-text">View All</Link>
            </div>

            {recentEvents.length > 0 ? (
              <ul className="event-list">
                {recentEvents.map(event => (
                  <li key={event.id} className="event-list-item">
                    <Link to={`/events/${event.id}`}>
                      <span className="event-name">{event.name}</span>
                      <span className="event-date">{new Date(event.date).toLocaleDateString()}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No events created yet.</p>
                <Link to="/events/new" className="btn btn-primary">Create Event</Link>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-column">
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent NFT Mints</h2>
            </div>

            {recentMints.length > 0 ? (
              <ul className="mint-list">
                {recentMints.map(mint => (
                  <li key={mint.id} className="mint-list-item">
                    <div className="mint-info">
                      <div className="mint-primary">
                        <span className="token-id">Token #{mint.tokenId}</span>
                        <span className="mint-time">{new Date(mint.mintedAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="mint-secondary">
                        <span className="attendee">{mint.attendeeEmail}</span>
                        <span className="event-name">at {mint.eventName}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No NFTs minted yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;