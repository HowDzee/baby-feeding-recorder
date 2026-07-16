package web

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed dist/*
var distEmbed embed.FS

func MustFS() http.FileSystem {
	return http.FS(mustSub())
}

func mustSub() fs.FS {
	f, err := fs.Sub(distEmbed, "dist")
	if err != nil {
		panic(err)
	}
	return f
}
