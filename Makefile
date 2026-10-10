NPM ?= npm
RPMBUILD ?= rpmbuild
RPM_TOPDIR := $(CURDIR)/build/rpm
PACKAGED_DIR := $(shell node -p "'linux' + (process.arch === 'x64' ? '' : '-' + process.arch) + '-unpacked'")

.PHONY: help deps build lint rpm

help:
	@echo "make deps   Install Node dependencies"
	@echo "make build  Build the Electron application"
	@echo "make lint   Check JavaScript and CSS"
	@echo "make rpm    Build an installable RPM in build/dist/"

deps:
	$(NPM) ci

build:
	$(NPM) run build

lint:
	$(NPM) run eslint
	$(NPM) run csslint

rpm:
	@test "$$(uname -s)" = Linux || { echo "RPM packaging requires Linux." >&2; exit 1; }
	@command -v $(RPMBUILD) >/dev/null || { echo "Install rpm-build first (sudo dnf install rpm-build)." >&2; exit 1; }
	@test -x node_modules/.bin/gulp || { echo "Run make deps first." >&2; exit 1; }
	$(NPM) exec -- gulp linuxDirectory
	mkdir -p "$(RPM_TOPDIR)/SOURCES" "$(RPM_TOPDIR)/BUILD" "$(RPM_TOPDIR)/RPMS" "$(RPM_TOPDIR)/SRPMS" "$(RPM_TOPDIR)/SPECS" "$(RPM_TOPDIR)/BUILDROOT"
	tar -czf "$(RPM_TOPDIR)/SOURCES/sozi-electron.tar.gz" --transform='s,^$(PACKAGED_DIR),linux-unpacked,' -C build/dist "$(PACKAGED_DIR)"
	cp resources/install/linux/sozi.desktop resources/install/linux/sozi.png LICENSE "$(RPM_TOPDIR)/SOURCES/"
	$(RPMBUILD) -bb --define '_topdir $(RPM_TOPDIR)' --define '_sourcedir $(RPM_TOPDIR)/SOURCES' --define '_builddir $(RPM_TOPDIR)/BUILD' --define '_buildrootdir $(RPM_TOPDIR)/BUILDROOT' --define '_rpmdir $(CURDIR)/build/dist' --define 'sozi_version $(shell node -p "require('./package.json').version")' resources/install/linux/sozi.spec
	@echo "RPM packages are in build/dist/. Install with: sudo dnf install ./build/dist/*.rpm"
