BUNDLE_PATH = "penguin-ai-chatbot@coffeecionado.gitlab.io.shell-extension.zip"
EXTENSION_DIR = "."

all: build install

.PHONY: build install enable run clean

build:
	rm -f $(BUNDLE_PATH); \
	gnome-extensions pack --force \
	                      --extra-source=schemas/ \
	                      --extra-source=public/ \
	                      --extra-source=assets/ \
	                      --extra-source=md2pango.js \
	                      --extra-source=stylesheet.css \
	                      --extra-source=prefs.js 

install:
	gnome-extensions install $(BUNDLE_PATH) --force

enable:
	dbus-run-session -- gnome-extensions enable penguin-ai-chatbot@coffeecionado.gitlab.io

run:
	dbus-run-session -- gnome-shell --nested --wayland

clean:
	@rm -fv $(BUNDLE_PATH)
	@rm -fv schemas/gschemas.compiled 