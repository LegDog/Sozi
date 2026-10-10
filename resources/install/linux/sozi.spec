%global debug_package %{nil}
%global __os_install_post %{nil}
%global _build_id_links none

Name:           sozi
Version:        %{sozi_version}
Release:        1%{?dist}
Summary:        A zooming presentation editor
License:        MPL-2.0
URL:            https://sozi.baierouge.fr
Source0:        sozi-electron.tar.gz
Source1:        sozi.desktop
Source2:        sozi.png
Source3:        LICENSE
Requires:       gtk3
Requires:       libnotify
Requires:       nss
Requires:       libXScrnSaver
Requires:       libXtst
Requires:       xdg-utils
Requires:       at-spi2-core
Requires:       libuuid
Requires:       alsa-lib
Requires:       mesa-libgbm
Recommends:     ffmpeg
Suggests:       inkscape

%description
Sozi is an SVG presentation editor with zooming and animated transitions.
This package includes the Electron runtime.

%prep
%setup -q -c -T
tar -xzf %{SOURCE0}
cp %{SOURCE3} LICENSE

%build
# Electron application and runtime are prepared by make rpm.

%install
mkdir -p %{buildroot}/opt/Sozi %{buildroot}%{_bindir}
cp -a linux-unpacked/. %{buildroot}/opt/Sozi/
chmod 4755 %{buildroot}/opt/Sozi/chrome-sandbox
ln -s /opt/Sozi/sozi %{buildroot}%{_bindir}/sozi
install -Dm644 %{SOURCE1} %{buildroot}%{_datadir}/applications/sozi.desktop
install -Dm644 %{SOURCE2} %{buildroot}%{_datadir}/icons/hicolor/256x256/apps/sozi.png

%files
%defattr(-,root,root)
%license LICENSE
/opt/Sozi/
%{_bindir}/sozi
%{_datadir}/applications/sozi.desktop
%{_datadir}/icons/hicolor/256x256/apps/sozi.png
