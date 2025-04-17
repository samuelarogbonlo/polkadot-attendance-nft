
// admin-ui/src/components/EventCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

function EventCard({ event }) {
  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-title">{event.name}</h3>
        <span className={`status-badge ${event.active ? 'active' : 'inactive'}`}>
          {event.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="event-details">
        <div className="event-detail">
          <span className="detail-label">Date:</span>
          <span className="detail-value">{formatDate(event.date)}</span>
        </div>
        <div className="event-detail">
          <span className="detail-label">Location:</span>
          <span className="detail-value">{event.location}</span>
        </div>
        <div className="event-detail">
          <span className="detail-label">Organizer:</span>
          <span className="detail-value">{event.organizer}</span>
        </div>
      </div>

      <div className="event-card-footer">
        <Link to={`/events/${event.id}`} className="btn btn-primary">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default EventCard;
