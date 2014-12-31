SRC = $(wildcard src/*)

site: $(SRC)
	sudo cp -r src/* /var/www/html/
	xdg-open http://localhost/main.php >/dev/null 2>&1 &

tags: $(SRC)
	ctags -R --exclude=jquery src/

edit:
	vim -p src/css/scorecard.css src/css/scorecard.css src/main.php \
		src/js/scorecard.js src/css/scorecard.css \
		-c "vs src/js/scorecard.js|vs src/main.php|tabn" \
		-c "sp src/js/scorecard.js|sp src/main.php|tabp"
