package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"baby-recorder/internal/db"
	"baby-recorder/internal/routes"
)

func main() {
	port := 3000
	if v := os.Getenv("PORT"); v != "" {
		p, err := strconv.Atoi(v)
		if err == nil {
			port = p
		}
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dataDir := filepath.Join(".", "data")
		_ = os.MkdirAll(dataDir, 0755)
		dbPath = filepath.Join(dataDir, "data.db")
	}

	sqlDB, err := db.Init(dbPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "init db: %v\n", err)
		os.Exit(1)
	}
	defer sqlDB.Close()

	mux := http.NewServeMux()
	routes.Register(mux, sqlDB)

	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("API server running on http://0.0.0.0:%d\n", port)
	fmt.Printf("Database: %s\n", dbPath)
	if err := http.ListenAndServe(addr, mux); err != nil {
		fmt.Fprintf(os.Stderr, "listen: %v\n", err)
		os.Exit(1)
	}
}
