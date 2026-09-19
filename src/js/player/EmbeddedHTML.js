/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** Manage full-frame HTML documents embedded in a presentation.
 *
 * @module
 */

const ALLOWED_PROTOCOLS = ["file:", "http:", "https:"];

/** Full-frame iframe manager. */
export class EmbeddedHTML {
    /**
     * @param {module:player/Player.Player} player - The current player.
     * @param {module:player/PlayerController.PlayerController} playerController - The player input controller.
     */
    constructor(player, playerController) {
        this.player = player;
        this.playerController = playerController;
        this.entries = new Map();
        this.activeEntry = null;

        this.container = document.createElement("div");
        this.container.className = "sozi-html-frame-container";
        document.body.appendChild(this.container);

        this.navigation = document.createElement("div");
        this.navigation.className = "sozi-html-frame-navigation";
        this.navigation.appendChild(this.makeNavigationButton("previous", "Previous frame", () => playerController.moveToPrevious()));
        this.navigation.appendChild(this.makeNavigationButton("next", "Next frame", () => playerController.moveToNext()));
        document.body.appendChild(this.navigation);

        player.on("frameTransitionStart", () => this.hideCurrentFrame());
        player.on("frameChange", () => this.showCurrentFrame());
    }

    /** Create one of the navigation buttons displayed over an iframe.
     *
     * @param {string} direction - The navigation direction.
     * @param {string} title - Accessible button label.
     * @param {Function} onclick - Button action.
     * @returns {HTMLButtonElement} - The new button.
     */
    makeNavigationButton(direction, title, onclick) {
        const button = document.createElement("button");
        button.className = `sozi-html-frame-${direction}`;
        button.title = title;
        button.setAttribute("aria-label", title);
        button.textContent = direction === "previous" ? "\u2039" : "\u203a";
        button.addEventListener("click", onclick);
        return button;
    }

    /** Validate and resolve an iframe source.
     *
     * @param {string} source - The configured frame source.
     * @returns {?string} - A safe absolute URL, or `null`.
     */
    resolveSource(source) {
        try {
            const url = new URL(source, document.baseURI);
            return ALLOWED_PROTOCOLS.indexOf(url.protocol) >= 0 ? url.href : null;
        }
        catch (err) { // eslint-disable-line no-unused-vars
            return null;
        }
    }

    /** Create the DOM entry for a frame.
     *
     * @param {module:model/Presentation.Frame} frame - The frame to render.
     * @returns {object} - The created entry.
     */
    createEntry(frame) {
        const element = document.createElement("div");
        element.className = "sozi-html-frame";

        const status = document.createElement("div");
        status.className = "sozi-html-frame-status";
        status.textContent = "Loading embedded page…";
        element.appendChild(status);

        const source = this.resolveSource((frame.htmlSource || "").trim());
        let resolveReady;
        const ready = new Promise(resolve => { resolveReady = resolve; });
        const entry = {element, frame, iframe: null, ready, resolveReady, loaded: false};

        if (source) {
            const iframe = document.createElement("iframe");
            iframe.className = "sozi-html-frame-content";
            iframe.setAttribute("allowfullscreen", "allowfullscreen");
            iframe.addEventListener("load", () => {
                entry.loaded = true;
                status.style.display = "none";
                resolveReady(true);
            }, {once: true});
            iframe.addEventListener("error", () => {
                status.textContent = "Unable to load the embedded page.";
                resolveReady(false);
            }, {once: true});
            iframe.src = source;
            entry.iframe = iframe;
            element.appendChild(iframe);
        }
        else {
            status.textContent = "Unsupported or invalid embedded page URL.";
            resolveReady(false);
        }

        this.container.appendChild(element);
        this.entries.set(frame.frameId, entry);
        return entry;
    }

    /** Hide the current iframe before leaving its frame. */
    hideCurrentFrame() {
        if (!this.activeEntry) {
            return;
        }

        const entry = this.activeEntry;
        entry.element.classList.remove("active");
        this.navigation.classList.remove("active");
        this.activeEntry = null;

        if (entry.frame.htmlReloadOnEnter) {
            entry.element.parentNode.removeChild(entry.element);
            this.entries.delete(entry.frame.frameId);
        }
    }

    /** Show the iframe configured for the current frame. */
    showCurrentFrame() {
        this.hideCurrentFrame();
        const frame = this.player.currentFrame;
        if (!frame || !(frame.htmlSource || "").trim()) {
            return;
        }

        const entry = this.entries.get(frame.frameId) || this.createEntry(frame);
        entry.element.classList.add("active");
        this.navigation.classList.add("active");
        this.activeEntry = entry;
    }

    /** Wait until the current embedded page has loaded or a timeout expires.
     *
     * @param {number} timeoutMs - Maximum wait time.
     * @returns {Promise<boolean>} - Whether the iframe reported loading.
     */
    whenCurrentFrameReady(timeoutMs=5000) {
        if (!this.activeEntry || this.activeEntry.loaded) {
            return Promise.resolve(true);
        }

        const entry = this.activeEntry;
        return new Promise(resolve => {
            const timeout = window.setTimeout(() => {
                const status = entry.element.querySelector(".sozi-html-frame-status");
                status.style.display = "block";
                status.textContent = "The embedded page did not finish loading.";
                resolve(false);
            }, timeoutMs);

            entry.ready.then(loaded => {
                window.clearTimeout(timeout);
                resolve(loaded);
            });
        });
    }

    /** Show or hide iframe navigation controls.
     *
     * @param {boolean} enabled - Whether controls are enabled.
     */
    setNavigationEnabled(enabled) {
        this.navigation.classList.toggle("disabled", !enabled);
    }
}
