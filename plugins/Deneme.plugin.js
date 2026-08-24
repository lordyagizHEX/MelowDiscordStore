/**
 * @name MelowTest
 * @description MelowDiscord test plugin
 * @version 1.0.0
 * @author lordyagizHEX
 */

module.exports = class MelowTest {
	start() {
		BdApi.UI.showToast("MelowDiscord plugin aktif!", {type: "success"});

		this.button = document.createElement("button");
		this.button.textContent = "Melow test";
		this.button.style.cssText = [
			"position: fixed",
			"top: 12px",
			"right: 12px",
			"z-index: 9999",
			"padding: 8px 12px",
			"border: 0",
			"border-radius: 6px",
			"background: #3e82e5",
			"color: white",
			"font-weight: 600",
			"cursor: pointer"
		].join(";");
		this.button.addEventListener("click", this.handleClick);
		document.body.appendChild(this.button);
	}

	handleClick = () => {
		BdApi.UI.showToast("MelowTest çalışıyor!", {type: "info"});
	};

	stop() {
		this.button?.removeEventListener("click", this.handleClick);
		this.button?.remove();
		this.button = null;
	}
};
