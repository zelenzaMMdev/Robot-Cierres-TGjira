if (window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=54338") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=55127") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=18678") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=575857") > -1) {

	const statusBar = document.createElement('div');
	statusBar.style.margin = '8px 2vw';
	statusBar.style.fontSize = '20px'
	statusBar.style.whiteSpace = 'pre-wrap';
	document.querySelector('.aui-header-primary ul').style.display = 'flex'
	const updateTextStatus = (text, accumulate) => {
		if (accumulate) {
			statusBar.textContent = statusBar.textContent + '\n' + text;
		} else {
			statusBar.textContent = text;
		}
	}
	document.querySelector('.aui-header-primary ul').insertAdjacentElement('beforeend', statusBar);
	const loginRad = loginRadius()
	//if (loginRad === "ok") { updateTextStatus(`Numero de Filtro Extraido`) } else { updateTextStatus(`fallo en login de raidus`) }
	//const extraFiltro = extraerNumeroDeFiltro();
	//if (extraFiltro === "extraido") { updateTextStatus(`Numero de Filtro Extraido`) } else { updateTextStatus(`Fallo al Extraer el Filtro`) }

	//JQL listado averias
	const jql = 'project = 10000 AND issuetype in ("Avería (FTTH)", "Avería (xDSL)") AND ProvisioningCode !~ "1/1/1/1" AND status not in (Resolved, CLOSE, Descartado, "In Progress", "Escalado FSM") AND ("Averías Masivas" is EMPTY OR "Averías Masivas" = "Empty") AND "Motivo de la Avería" in (INCOMUNICADO, "CORTES DE SERVICIO") AND "Cola de Peticiones" in ("SAT 2º Nivel Averías") AND (labels != "#PENDIENTE_CONTRATA_N1" OR labels is EMPTY) ORDER BY cf[10026] DESC'


	//JQL ASIGNADAS Rafael Lucas
	//const jql = 'project = MAS AND issuetype in ("Avería (FTTH)", "Avería (xDSL)") AND assignee in (membersOf("SAT 2º Nivel Averías")) AND assignee in membersOf("SAT 2º Nivel Averías") AND assignee = rafael.lucasdelvalle'

	const campos = 'id,key,customfield_10003,customfield_10902,customfield_15800,customfield_15800,customfield_10013,customfield_10026,customfield_10268,customfield_10373,customfield_11107,customfield_12408,subtasks,security,labels,status'

	updateTextStatus("Extrayendo Listado de Averías...")
	let start = 0
	let listado
	busquedaJiraFilterJql(jql, campos, start)
		.then(listado => listado.json())
		.then(listado => {

			if (listado.total > 500) {
				start = 501
				//LANZAMOS SEGUNDA CONSULTA RADIUS
				var req = new XMLHttpRequest();
				req.open('GET', `https://jira.masmovil.com/rest/api/2/search?jql=${jql}&maxResults=1000&fields=${campos}&startAt=${start}`, false);
				req.send(null);

				if (req.status === 200) {
					const listado_2 = JSON.parse(req.responseText);
					listadoFiltro = [].concat(listado.issues, listado_2.issues);
				}
			} else {
				listadoFiltro = listado.issues
			}

			updateTextStatus(`Listado Extraido, Comenzando Revision...`)

			const token = leerCookie("atlassian.xsrf.token")
			listadoAveriasJira = new Array

			//filtramos las que contienen las etiquetas
			for (let e = 0; e < listadoFiltro.length; e++) {
				const labels = listadoFiltro[e].fields['labels']
				const etiquetaBuscada = ["@CRUCE", "@cruce", "#REITERADA", "#REITERADAx1", "#REITERADAx2", "#REITERADAx3", "#REITERADAx4", "#REITERADAx5", "#REITERADAx6", "#REITERADAx7", "#REITERADAx8", "#REITERADAx9", "#REITERADAx10", "RETN2", "VIP", "PPCC3", "#OPS"]
				const etiquetaCruce = comprobarEtiqueta(labels, etiquetaBuscada)
				if (etiquetaCruce !== "existe") { listadoAveriasJira.push(listadoFiltro[e]) }
			}

			// axios.get('https://jsonplaceholder.typicode.com/users')
			//     .then(({ data }) => console.log(data))

			let contador = 0
			let countAverias = 0


			//revisamos el nuevo array
			for (let i = 0; i < listadoAveriasJira.length; i++) {

				const rel = listadoAveriasJira[i].id
				const averia = listadoAveriasJira[i].key
				const tecnologia = listadoAveriasJira[i].fields['customfield_10013'].value
				const tipologia = listadoAveriasJira[i].fields['customfield_10026'].value
				labels = listadoAveriasJira[i].fields['labels']
				let prov_code = listadoAveriasJira[i].fields['customfield_10902']
				let provCodeTesa = listadoAveriasJira[i].fields['customfield_15800']
				const tiempoEnRed = listadoAveriasJira[i].fields['customfield_11107']
				const tiempoEnSistemas = listadoAveriasJira[i].fields['customfield_12408']
				const subTarea = listadoAveriasJira[i].fields['subtasks']
				const status = listadoAveriasJira[i].fields['status']['name']
				let cerrando
				let logs

				if (status === "RESUELTA") {
					countAverias++
					updateTextStatus(`${averia} estado en radius ${logs} ${i}`)
					continue;
				}

				if (tecnologia !== "ADSL") { iua = listadoAveriasJira[i].fields['customfield_10268'] } else { iua = "" }

				etiquetaBuscada = "#AI"
				const etiquetaAI = comprobarEtiqueta(labels, etiquetaBuscada)

				if (prov_code === "null/null/null/null") {
					prov_code = provCodeTesa.replace("#", "%23");
				}

				consultaRadius(i, iua, prov_code)
					.then(data => data.json())
					.then(data => {
						const respuesta = data.data

						if (respuesta === undefined) {
							logs = "";
							countAverias++
						} else {
							logs = respuesta[0].AcctStatusType
						}

						switch (logs) {
							case 'Stop':
								countAverias++
								updateTextStatus(`${averia} estado en radius ${logs} ${i}`)
								if (countAverias === listadoAveriasJira.length) {
									if (contador === 0) {
										updateTextStatus(`Aveías para Cerrar : Total  ${contador}, Proceso Terminado`)
									} else {
										updateTextStatus(`Aveías para Cerrar : Total  ${contador}`)
									}
								}
								break;
							case 'Start':
							case 'Alive':
								let cierre = "si"
								const cortesTime = '05:58:00'
								const duration = respuesta[0].duration;
								if (tipologia === "CORTES DE SERVICIO" && duration < cortesTime) {
									cierre = "no"
								}
								if (cierre === "si") {
									contador++
									countAverias++
									console.log(`start ${averia} : ${i}`);
									// if (tecnologia === "FTTH") {

									// 	console.log("lanzando test ftth");
									// 	const pepa = pepe(iua)

									// 	console.log(pepa);
									const asignada = assigneIssue(rel, token, tecnologia, prov_code, status)
										.then(resAsing => {
											if (resAsing.ok) {
												const coment = addComentIssue(averia, respuesta, logs)
													.then(resComent => {
														if (resComent.ok) {
															console.log(`cerrando ${averia}`);
															updateTextStatus(`Procediendo al Cierre de ${contador} Averías`)
															switch (tecnologia) {
																case "FTTH":
																	cerrando = cierreFTTH(token, rel, subTarea, etiquetaAI, tiempoEnRed, tiempoEnSistemas)
																		.then(resCierre => {
																			updateTextStatus(`Averías por Cerrar: Total ${contador}`)
																			updateTextStatus(`${averia} Cerrada`, "0")
																			contador--
																		})
																	break;
																case "ADSL":
																	cerrando = cierreAdsl(token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas)
																		.then(resCierre => {
																			updateTextStatus(`Averías por Cerrar: Total ${contador}`)
																			updateTextStatus(`${averia} Cerrada`, "0")
																			contador--
																			if (contador <= 0) {
																				updateTextStatus(`Fin del proceso`)
																			}
																		})
																	break;
																default:
																	break;
															}
														}
													})
											}
										})
									// }
								}
								break
						}
					})
			}
		})
}