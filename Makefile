tags: $(wildcard src/*)
	ctags -R --exclude=jquery src/
