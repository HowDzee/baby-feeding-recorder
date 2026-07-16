package queries

import (
	"database/sql"

	"baby-recorder/internal/models"
)

func GetFeedingsByRange(sqlDB *sql.DB, start, end int64) ([]models.Feeding, error) {
	rows, err := sqlDB.Query(
		`SELECT id, type, amount, durationSec, startedAt, endedAt, note, createdAt, updatedAt
		 FROM feeding WHERE startedAt >= ? AND startedAt <= ? ORDER BY startedAt DESC`, start, end)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return models.ScanFeedings(rows)
}

func GetAllFeedings(sqlDB *sql.DB) ([]models.Feeding, error) {
	rows, err := sqlDB.Query(
		`SELECT id, type, amount, durationSec, startedAt, endedAt, note, createdAt, updatedAt
		 FROM feeding ORDER BY startedAt DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return models.ScanFeedings(rows)
}

func InsertFeeding(sqlDB *sql.DB, f *models.Feeding) error {
	_, err := sqlDB.Exec(
		`INSERT INTO feeding (id, type, amount, durationSec, startedAt, endedAt, note, createdAt, updatedAt)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
			type=excluded.type, amount=excluded.amount, durationSec=excluded.durationSec,
			startedAt=excluded.startedAt, endedAt=excluded.endedAt, note=excluded.note,
			updatedAt=excluded.updatedAt`,
		f.ID, f.Type, f.Amount, f.DurationSec,
		f.StartedAt, f.EndedAt, f.Note, f.CreatedAt, f.UpdatedAt,
	)
	return err
}

func DeleteFeeding(sqlDB *sql.DB, id string) error {
	_, err := sqlDB.Exec("DELETE FROM feeding WHERE id = ?", id)
	return err
}
