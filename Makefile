SRC = $(wildcard src/*)

site: $(SRC)
	sudo cp -r src/* /var/www/html/
	xdg-open http://localhost/testing.php >/dev/null 2>&1 &

tags: $(SRC)
	ctags -R --exclude=jquery src/
