import React, { useState, useEffect } from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { api } from '../utils/api';
import Spinner from '../components/Spinner';

function EventForm() {
  const { id } = useParams();
  const history = useHistory();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    lumaEventId: '',
    description: '',
    organizer: '',
    imageUrl: '',
    active: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/events/${id}`);

      if (response.data.success) {
        // Format date for input field (YYYY-MM-DD)
        const event = response.data.event;
        const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';

        setFormData({
          ...event,
          date: formattedDate
        });
      } else {
        setError('Failed to fetch event details');
      }
    } catch (error) {
      setError('An error occurred while fetching event data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);

      // Validate form data
      if (!formData.name || !formData.date || !formData.location || !formData.lumaEventId) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      let response;

      if (isEditMode) {
        response = await api.put(`/admin/events/${id}`, formData);
      } else {
        response = await api.post('/admin/events', formData);
      }

      if (response.data.success) {
        const eventId = isEditMode ? id : response.data.event.id;
        history.push(`/events/${eventId}`);
      } else {
        setError(response.data.message || 'Failed to save event');
      }
    } catch (error) {
      setError('An error occurred while saving the event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="event-form-page">
      <div className="page-header">
        <h1>{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="name">Event Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Event Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lumaEventId">Luma Event ID *</label>
          <input
            type="text"
            id="lumaEventId"
            name="lumaEventId"
            value={formData.lumaEventId}
            onChange={handleChange}
            className="form-control"
            required
            disabled={isEditMode} // Cannot change Luma ID in edit mode
          />
          {isEditMode && (
            <small className="form-text">Luma Event ID cannot be changed after creation</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="organizer">Organizer *</label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Event'}
          </button>

          <Link
            to={isEditMode ? `/events/${id}` : '/events'}
            className="btn btn-outline"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EventForm;