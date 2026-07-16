package models

import (
	"database/sql"
)

type Diaper struct {
	ID          string  `json:"id"`
	Type        string  `json:"type"`
	Color       *string `json:"color"`
	Consistency *string `json:"consistency"`
	HadRash     int     `json:"hadRash"`
	RecordedAt  int64   `json:"recordedAt"`
	Note        string  `json:"note"`
	CreatedAt   int64   `json:"createdAt"`
	UpdatedAt   int64   `json:"updatedAt"`
}

// DiaperParams holds values for inserting/updating a diaper record.
type DiaperParams struct {
	ID          string
	Type        string
	Color       *string
	Consistency *string
	HadRash     int
	RecordedAt  int64
	Note        string
	CreatedAt   int64
	UpdatedAt   int64
}

func ScanDiaper(row Scannable) (*Diaper, error) {
	var d Diaper
	var color, consistency sql.NullString
	if err := row.Scan(
		&d.ID, &d.Type, &color, &d.Consistency,
		&d.HadRash, &d.RecordedAt, &d.Note, &d.CreatedAt, &d.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if color.Valid {
		v := color.String
		d.Color = &v
	}
	if consistency.Valid {
		v := consistency.String
		d.Consistency = &v
	}
	return &d, nil
}

func ScanDiapers(rows *sql.Rows) ([]Diaper, error) {
	result := make([]Diaper, 0)
	for rows.Next() {
		d, err := ScanDiaper(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *d)
	}
	return result, rows.Err()
}

// Scannable is implemented by *sql.Row and *sql.Rows.
type Scannable interface {
	Scan(dest ...interface{}) error
}
