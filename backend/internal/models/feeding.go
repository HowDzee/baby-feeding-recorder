package models

import (
	"database/sql"
)

type Feeding struct {
	ID          string  `json:"id"`
	Type        string  `json:"type"`
	Amount      *int    `json:"amount"`
	DurationSec *int    `json:"durationSec"`
	StartedAt   int64   `json:"startedAt"`
	EndedAt     *int64  `json:"endedAt"`
	Note        string  `json:"note"`
	CreatedAt   int64   `json:"createdAt"`
	UpdatedAt   int64   `json:"updatedAt"`
}

func ScanFeeding(row Scannable) (*Feeding, error) {
	var f Feeding
	var amount, durationSec sql.NullInt64
	var endedAt sql.NullInt64
	if err := row.Scan(
		&f.ID, &f.Type, &amount, &durationSec,
		&f.StartedAt, &endedAt, &f.Note, &f.CreatedAt, &f.UpdatedAt,
	); err != nil {
		return nil, err
	}
	if amount.Valid {
		v := int(amount.Int64)
		f.Amount = &v
	}
	if durationSec.Valid {
		v := int(durationSec.Int64)
		f.DurationSec = &v
	}
	if endedAt.Valid {
		v := endedAt.Int64
		f.EndedAt = &v
	}
	return &f, nil
}

func ScanFeedings(rows *sql.Rows) ([]Feeding, error) {
	result := make([]Feeding, 0)
	for rows.Next() {
		f, err := ScanFeeding(rows)
		if err != nil {
			return nil, err
		}
		result = append(result, *f)
	}
	return result, rows.Err()
}
