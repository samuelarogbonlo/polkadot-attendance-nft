import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { api } from '../utils/api';
import Spinner from '../components/Spinner';
import NFTMintList from '../components/NFTMintList';
import { formatDate } from '../utils/formatters';

function EventDetail() {
  const { id } = useParams();
  const history = useHistory();
  const [event, setEvent] = useState(null);
  const [mints, setMints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch event details, stats and NFT mints in parallel
      const [eventResponse, statsResponse, mintsResponse] = await Promise.all([
        api.get(`/admin/events/${id}`),
        api.get(`/admin/events/${id}/stats`),
        api.get(`/admin/events/${id}/nfts`)
      ]);

      if (eventResponse.data.success) {
        setEvent(eventResponse.data.event);
      } else {
        setError('Failed to fetch event details');
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (mintsResponse.data.success) {
        setMints(mintsResponse.data.mints);
      }
    } catch (error) {
      setError('An error occurred while fetching event data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await api.delete(`/admin/events/${id}`);

      if (response.data.success) {
        history.push('/events');
      } else {
        setError('Failed to delete event');
      }
    } catch (error) {
      setError('An error occurred while deleting the event');
    }
  };

  const handleToggleActive = async () => {
    try {
      const response = await api.put(`/admin/events/${id}`, {
        active: !event.active
      });

      if (response.data.success) {
        setEvent(response.data.event);
      } else {
        setError('Failed to update event status');
      }
    } catch (error) {
      setError('An error occurred while updating the event');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error || !event) {
    return (
      <div className="error-state">
        <h2>Error</h2>
        <p>{error || 'Event not found'}</p>
        <Link to="/events" className="btn btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="page-header">
        <div className="title-section">
          <h1>{event.name}</h1>
          <span className={`status-badge ${event.active ? 'active' : 'inactive'}`}>
            {event.active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="action-buttons">
          <Link to={`/events/${id}/edit`} className="btn btn-secondary">
            Edit Event
          </Link>
          <button
            onClick={handleToggleActive}
            className="btn btn-outline"
          >
            {event.active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="event-details">
        <div className="event-info-card">
          <div className="card-section">
            <h3>Event Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Date</span>
                <span className="value">{formatDate(event.date)}</span>
              </div>
              <div className="info-item">
                <span className="label">Location</span>
                <span className="value">{event.location}</span>
              </div>
              <div className="info-item">
                <span className="label">Organizer</span>
                <span className="value">{event.organizer}</span>
              </div>
              <div className="info-item">
                <span className="label">Luma Event ID</span>
                <span className="value">{event.lumaEventId}</span>
              </div>
            </div>
          </div>

          {event.description && (
            <div className="card-section">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>
          )}
        </div>

        <div className="event-stats-card">
          <h3>Statistics</h3>
          {stats ? (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{stats.totalMints}</span>
                <span className="stat-label">Total NFTs Minted</span>
              </div>
              {/* Add more stats as needed */}
            </div>
          ) : (
            <p>No statistics available</p>
          )}
        </div>
      </div>

      <div className="nft-section">
        <h2>Minted NFTs</h2>
        {mints.length > 0 ? (
          <NFTMintList mints={mints} />
        ) : (
          <div className="empty-state">
            <p>No NFTs have been minted for this event yet.</p>
            <p>When attendees check in via Luma, NFTs will appear here.</p>
          </div>
        )}
      </div>

      <div className="manual-actions">
        <h3>Manual Actions</h3>
        <div className="action-buttons">
          <button className="btn btn-secondary">
            Trigger Test Mint
          </button>
          <a
            href={`https://luma.events/events/${event.lumaEventId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            View on Luma
          </a>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
