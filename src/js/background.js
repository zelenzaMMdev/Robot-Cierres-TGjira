(() => {

	chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
		if (changeInfo.status === 'complete' && /^http/.test(tab.url)) {

			let queryOptions = { active: true, lastFocusedWindow: true };
			// `tab` will either be a `tabs.Tab` instance or`undefined`.
			let [_tab] = await chrome.tabs.query(queryOptions);

			console.log(_tab);

			//if (tab.url.includes('https://tgjira.masmovil.com/browse/')) {

			//   chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['./src/js/issue/principal.js'] });

			/*===== Array con las rutas a cargar =====*/
			if (tab.url.includes('https://tgjira.masmovil.com/issues/?filter=25928')) {
				const scripts = [
					"./src/js/jquery-3.5.1.js",
					"./src/js/sweetalert.min.js",
					"./node_modules/axios-master/dist/axios.js",
					"./src/js/funciones.js",
					"./src/js/cierres.js"
				];
				scripts.forEach(function (script) {
					chrome.scripting.executeScript({ target: { tabId: tabId }, files: [script] })
				});
			}
		}
	});
})();


