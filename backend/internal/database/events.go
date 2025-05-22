package database

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/samuelarogbonlo/polkadot-attendance-nft/backend/internal/models"
)

// EventRepository handles database operations for events
type EventRepository struct {
	db *DB
}

// NewEventRepository creates a new event repository
func NewEventRepository(db *DB) *EventRepository {
	return &EventRepository{db: db}
}

// Create creates a new event
func (r *EventRepository) Create(event *models.Event) error {
	// Parse date string to a proper date
	date, err := time.Parse("2006-01-02", event.Date)
	if err != nil {
		return fmt.Errorf("invalid date format: %w", err)
	}

	// Insert event into database
	query := `
		INSERT INTO events (name, date, location, organizer) 
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`
	err = r.db.QueryRow(
		query,
		event.Name,
		date,
		event.Location,
		event.Organizer,
	).Scan(&event.ID)

	if err != nil {
		return fmt.Errorf("failed to create event: %w", err)
	}

	return nil
}

// GetByID gets an event by ID
func (r *EventRepository) GetByID(id uint64) (*models.Event, error) {
	query := `
		SELECT id, name, to_char(date, 'YYYY-MM-DD'), location, organizer
		FROM events
		WHERE id = $1
	`

	var event models.Event
	err := r.db.QueryRow(query, id).Scan(
		&event.ID,
		&event.Name,
		&event.Date,
		&event.Location,
		&event.Organizer,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get event: %w", err)
	}

	return &event, nil
}

// GetAll gets all events
func (r *EventRepository) GetAll() ([]models.Event, error) {
	query := `
		SELECT id, name, to_char(date, 'YYYY-MM-DD'), location, organizer
		FROM events
		ORDER BY date DESC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query events: %w", err)
	}
	defer rows.Close()

	var events []models.Event
	for rows.Next() {
		var event models.Event
		err := rows.Scan(
			&event.ID,
			&event.Name,
			&event.Date,
			&event.Location,
			&event.Organizer,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan event: %w", err)
		}
		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating events: %w", err)
	}

	return events, nil
}

// Update updates an event
func (r *EventRepository) Update(event *models.Event) error {
	// Parse date string to a proper date
	date, err := time.Parse("2006-01-02", event.Date)
	if err != nil {
		return fmt.Errorf("invalid date format: %w", err)
	}

	query := `
		UPDATE events
		SET name = $1, date = $2, location = $3
		WHERE id = $4
	`

	result, err := r.db.Exec(query, event.Name, date, event.Location, event.ID)
	if err != nil {
		return fmt.Errorf("failed to update event: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("event not found")
	}

	return nil
}

// Delete deletes an event
func (r *EventRepository) Delete(id uint64) error {
	query := `DELETE FROM events WHERE id = $1`

	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete event: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("event not found")
	}

	return nil
} 