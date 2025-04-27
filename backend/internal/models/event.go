package models

// Event represents an event in the system
type Event struct {
	ID        uint64 `json:"id"`
	Name      string `json:"name"`
	Date      string `json:"date"`
	Location  string `json:"location"`
	Organizer string `json:"organizer,omitempty"`
}