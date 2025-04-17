import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import EventCard from '../components/EventCard';
import Spinner from '../components/Spinner';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    active: true,
    organizer: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const queryParams = new URLSearchParams();
      if (filters.active !== null) {
        queryParams.append('active', filters.active);
      }
      if (filters.organizer) {
        queryParams.append('organizer', filters.organizer);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const response = await api.get(`/admin/events?${queryParams}`);

      if (response.data.success) {
        setEvents(response.data.events);
      } else {
        setError('Failed to fetch events');
      }
    } catch (error) {
      setError('An error occurred while fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters({
      ...filters,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const resetFilters = () => {
    setFilters({
      active: true,
      organizer: '',
      startDate: '',
      endDate: ''
    });

    // Fetch with reset filters
    fetchEvents();
  };

  return (
    <div className="event-list-page">
      <div className="page-header">
        <h1>Events</h1>
        <Link to="/events/new" className="btn btn-primary">
          Create New Event
        </Link>
      </div>

      <div className="filter-section">
        <form onSubmit={applyFilters}>
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="active"
                  checked={filters.active}
                  onChange={handleFilterChange}
                />
                Active Events Only
              </label>
            </div>

            <div className="form-group">
              <label>Organizer</label>
              <input
                type="text"
                name="organizer"
                value={filters.organizer}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Filter by organizer"
              />
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-secondary">
                Apply Filters
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={resetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No events found. Create your first event to get started.</p>
          <Link to="/events/new" className="btn btn-primary">
            Create New Event
          </Link>
        </div>
      ) : (
        <div className="event-grid">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

export default EventList;