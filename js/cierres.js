// if (window.location.href === "https://jira.masmovil.com/index.html?selectPageId=13003") {
// 	window.location.href = "https://jira.masmovil.com/secure/Dashboard.jspa?selectPageId=13003";
// }

//si jira esta en mantenimiento navegamos a la url del filtro
if (window.location.href === "https://jira.masmovil.com/index.html?selectPageId=13003") {
	async function jiraMantenimiento() {
		let timerInterval
		Swal.fire({
			title: 'Jira en Mantenimiento',
			html: 'reiniciando cada <b>30</b> segundos.',
			imageUrl: 'https://unsplash.it/400/200',
			showConfirmButton: false,
			timer: 30000,
			timerProgressBar: true,
		})
		await sleep(30);
		window.location.href = "https://jira.masmovil.com/secure/Dashboard.jspa?selectPageId=13003";
	}
	jiraMantenimiento();
	//location.href = "https://jira.masmovil.com/issues/?filter=48313";
}

if (window.location.href == "https://jira.masmovil.com/secure/Dashboard.jspa?selectPageId=13003") {

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


	async function cierres() {

		const timeini = "08:00";
		const timefin = "00:00";
		let tiempo = new Date(Date.now());
		const h = tiempo.getHours();
		const m = tiempo.getMinutes();
		const time = `${h}:${m}`
		const horario = isbetween(timeini, timefin, time);

		if (!horario) {
			updateTextStatus("ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )");
			console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
			console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
			console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
			return;
		}

		let token = leerCookie("atlassian.xsrf.token")
		// let token = $("#atlassian-token").attr('content');
		// sessionStorage.setItem("tokenJira", token);

		if (token.indexOf("lout") !== -1) {

			const _loginJira = await loginJira();
			console.log(_loginJira);

			if (_loginJira.ok) {
				location.reload();
			}
		}

		const loginRad = loginRadius()
		//if (loginRad === "ok") { updateTextStatus(`Numero de Filtro Extraido`) } else { updateTextStatus(`fallo en login de raidus`) }
		//const extraFiltro = extraerNumeroDeFiltro();
		//if (extraFiltro === "extraido") { updateTextStatus(`Numero de Filtro Extraido`) } else { updateTextStatus(`Fallo al Extraer el Filtro`) }

		//JQL listado averias , "CORTES DE SERVICIO"
		const jql = 'project = 10000 AND issuetype in ("Avería (FTTH)", "Avería (xDSL)") AND ProvisioningCode !~ "1/1/1/1" AND status not in (Resolved, CLOSE, Descartado, "In Progress", "Escalado FSM") AND ("Averías Masivas" is EMPTY OR "Averías Masivas" = "Empty") AND "Motivo de la Avería" in (INCOMUNICADO) AND "Cola de Peticiones" in ("SAT 2º Nivel Averías") ORDER BY cf[10026] DESC'
		//and level not in (SWENO, MARBLANCA)

		//JQL ASIGNADAS Rafael Lucas
		//const jql = 'project = MAS AND issuetype in ("Avería (FTTH)", "Avería (xDSL)") AND assignee in (membersOf("SAT 2º Nivel Averías")) AND assignee in membersOf("SAT 2º Nivel Averías") AND assignee = bboo.zelenza'

		const campos = 'created,id,key,customfield_10003,customfield_10902,customfield_10004,customfield_15800,customfield_15800,customfield_10013,customfield_10026,customfield_10268,customfield_10373,customfield_11107,customfield_12408,customfield_12114,customfield_10314,subtasks,security,labels,status';

		updateTextStatus("Extrayendo Listado de Averías...");
		let start = 0;
		const user = 'rafael.lucasdelvalle';
		let listado, etiquetaAI, listadoFiltro;


		const busquedaJira = busquedaJiraFilterJql(jql, campos, start)
			.then(listado => listado.json())
			.then(listado => {

				if (listado.total > 500) {
					start = 501;
					//LANZAMOS peticion de datos a jira
					var req = new XMLHttpRequest();
					req.open('GET', `https://jira.masmovil.com/rest/api/2/search?jql=${jql}&maxResults=1000&fields=${campos}&startAt=${start}`, false);
					req.send(null);

					if (req.readyState === 4 && req.status === 200) {
						const listado_2 = JSON.parse(req.responseText);
						listadoFiltro = [].concat(listado.issues, listado_2.issues);
					}
				} else {
					listadoFiltro = listado.issues;
				}

				if (listado.total > 1000) {
					start = 1001
					//LANZAMOS peticion de datos a jira
					var req = new XMLHttpRequest();
					req.open('GET', `https://jira.masmovil.com/rest/api/2/search?jql=${jql}&maxResults=1000&fields=${campos}&startAt=${start}`, false);
					req.send(null);

					if (req.status === 200) {
						const listado_3 = JSON.parse(req.responseText);
						listadoFiltro = [].concat(listadoFiltro, listado_3.issues);
					}
				}

				updateTextStatus(`Listado Extraido, Comenzando Revision...`)

				console.log("Listado Extraido, Comenzando Revision...");

				listadoAveriasJira = new Array;

				//filtramos las que contienen las etiquetas
				for (let e = 0; e < listadoFiltro.length; e++) {
					const labels = listadoFiltro[e].fields['labels'];
					const etiquetaBuscada = ["@CRUCE", "@cruce", "#REITERADA", "#REITERADAx1", "#REITERADAx2", "#REITERADAx3", "#REITERADAx4", "#REITERADAx5", "#REITERADAx6", "#REITERADAx7", "#REITERADAx8", "#REITERADAx9", "#REITERADAx10", "#REITERADAx11", "#REITERADAx12", "#REITERADAx13", "#REITERADAx14", "#REITERADAx15", "RETN2", "VIP", "PPCC3", "#OPS", "#UCI_TEAM", "#InstalaCableOperador#"];
					const etiquetaCruce = comprobarEtiqueta(labels, etiquetaBuscada);
					if (!etiquetaCruce) { listadoAveriasJira.push(listadoFiltro[e]) }
				}

				// axios.get('https://jsonplaceholder.typicode.com/users')
				//     .then(({ data }) => console.log(data))

				let contador = 0;
				let countAveriasKO = 0;

				//revisamos el nuevo array
				for (let i = 0; i < listadoAveriasJira.length; i++) {

					let fechaCreacion = listadoAveriasJira[i].fields['created'];
					const newFecha = fechaFormatoMysql(fechaCreacion);

					const seguridad = listadoAveriasJira[i].fields['security']['name'];
					const movil = listadoAveriasJira[i].fields['customfield_10314'];
					const rel = listadoAveriasJira[i].id;
					const telfijo = listadoAveriasJira[i].fields['customfield_12114'];
					const averia = listadoAveriasJira[i].key;
					const ot = listadoAveriasJira[i].fields['customfield_10004'];
					let tecnologia = "";

					try {
						tecnologia = listadoAveriasJira[i].fields['customfield_10013'].value;
					} catch (error) {
						console.log(averia + " Sin tecnologia");
					}

					const tipologia = listadoAveriasJira[i].fields['customfield_10026'].value;
					const etiquetas = listadoAveriasJira[i].fields['labels'];
					let prov_code = listadoAveriasJira[i].fields['customfield_10902'];
					let provCodeTesa = listadoAveriasJira[i].fields['customfield_15800'];
					const tiempoEnRed = listadoAveriasJira[i].fields['customfield_11107'];
					const tiempoEnSistemas = listadoAveriasJira[i].fields['customfield_12408'];
					const subTarea = listadoAveriasJira[i].fields['subtasks'];
					const status = listadoAveriasJira[i].fields['status']['name'];
					let cerrando, logs, logsTest, fecha_test, iua;

					if (status === "RESUELTA") {
						countAveriasKO++
						updateTextStatus(`${averia} estado en radius ${logs} ${i}`);
						continue;
					}

					(tecnologia !== "ADSL") ? iua = listadoAveriasJira[i].fields['customfield_10268'] : iua = "";

					if (prov_code === "null/null/null/null") prov_code = provCodeTesa;
					//.replace("#", "%23");

					const reite = comprobarReitero(ot, newFecha)
						.then(resReite => {

							let reitero;
							(resReite.data.length === 0) ? reitero = "NO" : reitero = resReite.data[0].reitero;

							if (reitero === "SI") { return; }

							if (reitero === "NO") {

								consultaRadius(prov_code, iua)

									.then(data => {

										try {
											var respuesta = data.data.data
										} catch (error) {
											console.log(error);

										}


										if (respuesta === undefined) {
											logs = "";
											countAveriasKO++
										} else {
											logs = respuesta[0].AcctStatusType
										}

										switch (logs) {
											case 'Stop':
												countAveriasKO++
												updateTextStatus(`${averia} estado en radius ${logs} ${countAveriasKO}`)

												break;
											case 'Start':
											case 'Alive':

												let cierre = true;
												let estadoFijo;
												const cortesTime = '12:00:00'
												const duration = respuesta[0].duration;
												let fechaInicioRadius = respuesta[0].fecha;
												const pepito = respuesta[0].UserName;

												//comprobamos si ya viene con la sesion en radius levantada
												fechaInicioRadius = new Date(fechaInicioRadius);
												fechaInicioRadius = fechaInicioRadius.getTime();
												fechaCreacion = new Date(fechaCreacion);
												fechaCreacion = fechaCreacion.getTime();

												if (fechaInicioRadius < fechaCreacion) {
													countAveriasKO++
													updateTextStatus(`${averia} estado en radius ${logs} ${countAveriasKO}`)
													break;
												}
												if (seguridad !== "PEPEPHONE") {
													//comprobamos estado del fijo
													consultaFijoRadius(telfijo)
														.then(resFijo => {

															try {
																estadoFijo = resFijo.data.estado.CpeRegistered
															} catch (error) {
																console.log(error);
															}


															if (estadoFijo !== "REGISTERED") {

																console.log(`${averia} CPE Registrado : ${estadoFijo}`);
																countAveriasKO++
																updateTextStatus(`${averia} estado en radius ${logs} ${countAveriasKO}`)
																const asignada = assigneIssue(rel, token, tecnologia, status, pepito)
																	.then(resAsing => {
																		console.log("247");
																		asingUser(averia, rel, token, user);
																		cierre = false;
																	})
															}

															if (tipologia === "CORTES DE SERVICIO" && duration < cortesTime) {
																cierre = false;
															}
															if (cierre) {
																contador++
																console.log(`${averia} en estado ${logs}`);
																const asignada = assigneIssue(rel, token, tecnologia, status, pepito)
																	.then(resAsing => {

																		if (resAsing.ok) {
																			switch (tecnologia) {
																				case "FTTH":
																					console.log(`${averia} Asignada, lanzando test FTTH IUA: ${iua}`);
																					const test = testFtth(iua)
																					if (test !== "sin test") {
																						fecha_test = test['fecha'];
																						const data_1 = test['resultado']['datos']['outputParam']

																						for (const key in data_1) {
																							if (data_1.hasOwnProperty(key)) {
																								var element = data_1[key]['key']
																								switch (element) {
																									case "ont_estado_operacional":
																										var ont_estado_operacional = data_1[key]['value']
																										break;
																									case "olt_potencia_rx":
																										var olt_potencia_rx = data_1[key]['value']
																										break;
																									case "olt_potencia_tx":
																										var olt_potencia_tx = data_1[key]['value']
																										break;
																									case "ont_potencia_rx":
																										var ont_potencia_rx = data_1[key]['value']
																										break;
																									case "ont_estado_administrativo":
																										var ont_estado_administrativo = data_1[key]['value']
																										break;
																									default:
																										break;
																								}
																							}
																						}

																						olt_potencia_rx = olt_potencia_rx.slice(1)
																						ont_potencia_rx = ont_potencia_rx.slice(1)
																						olt_potencia_rx = parseInt(olt_potencia_rx);
																						ont_potencia_rx = parseInt(ont_potencia_rx);

																						logTest = new Array({ ont_estado_operacional: ont_estado_operacional, olt_potencia_rx: olt_potencia_rx, olt_potencia_tx: olt_potencia_tx, ont_potencia_rx: ont_potencia_rx, ont_estado_administrativo: ont_estado_administrativo })
																						console.log(`${averia} Comprobando resultados del TEST FTTH`);
																						if (olt_potencia_rx < 29 && ont_potencia_rx < 29) {

																							const coment = addComentIssue(averia, pepito, respuesta, logs, logTest, fecha_test, telfijo, resFijo.data.estado)
																								.then(resComent => {

																									if (resComent.ok) {

																										etiquetaBuscada = ["#AI"];
																										etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																										console.log(`${averia} Comentario añadido, procediendo al cierre`);
																										cerrando = cierreFTTH(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																											.then(resCierre => {
																												console.log(`${averia} Cerrada.`);
																												insertarEnDiario(averia, tipologia, newFecha);
																												contador--;
																												updateTextStatus(`Averías por Cerrar: Total ${contador}`);
																												if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																											})
																									}
																								})
																						} else {
																							console.log("325");
																							asingUser(averia, rel, token, user);
																							contador--
																						}
																					} else {
																						logTest = "";

																						const coment = addComentIssue(averia, pepito, respuesta, logs, logTest, fecha_test, telfijo, resFijo.data.estado)
																							.then(resComent => {

																								if (resComent.ok) {

																									etiquetaBuscada = ["#AI"];
																									etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																									console.log(`${averia} Comentario añadido, procediendo al cierre`);
																									cerrando = cierreFTTH(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																										.then(resCierre => {
																											insertarEnDiario(averia, tipologia, newFecha);
																											console.log(`${averia} Cerrada.`);
																											contador--;
																											updateTextStatus(`Averías por Cerrar: Total ${contador}`);
																											if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																										})
																								}
																							})
																					}
																					break;
																				case "ADSL":
																					fecha_test = "";
																					logsTest = "";

																					const coment = addComentIssue(averia, pepito, respuesta, logs, logsTest, fecha_test, telfijo, resFijo.data.estado)
																						.then(resComent => {

																							if (resComent.ok) {

																								etiquetaBuscada = ["#AI"];
																								etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																								console.log(`${averia} Comentario añadido, procediendo al cierre`);
																								cerrando = cierreAdsl(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																									.then(resCierre => {
																										insertarEnDiario(averia, tipologia, newFecha);
																										console.log(`${averia} Cerrada.`);
																										contador--;
																										updateTextStatus(`Averías por Cerrar: Total ${contador}`)
																										if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																									})
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
												} else {

													if (tipologia === "CORTES DE SERVICIO" && duration < cortesTime) {
														cierre = false;
													}
													if (cierre) {
														contador++
														console.log(`${averia} en estado ${logs}`);
														const asignada = assigneIssue(rel, token, tecnologia, status, pepito)
															.then(resAsing => {

																if (resAsing.ok) {
																	switch (tecnologia) {
																		case "FTTH":
																			console.log(`${averia} Asignada, lanzando test FTTH`);
																			const test = testFtth(iua)
																			if (test !== "sin test") {
																				fecha_test = test['fecha'];
																				const data_1 = test['resultado']['datos']['outputParam']

																				for (const key in data_1) {
																					if (data_1.hasOwnProperty(key)) {
																						var element = data_1[key]['key']
																						switch (element) {
																							case "ont_estado_operacional":
																								var ont_estado_operacional = data_1[key]['value']
																								break;
																							case "olt_potencia_rx":
																								var olt_potencia_rx = data_1[key]['value']
																								break;
																							case "olt_potencia_tx":
																								var olt_potencia_tx = data_1[key]['value']
																								break;
																							case "ont_potencia_rx":
																								var ont_potencia_rx = data_1[key]['value']
																								break;
																							case "ont_estado_administrativo":
																								var ont_estado_administrativo = data_1[key]['value']
																								break;
																							default:
																								break;
																						}
																					}
																				}

																				olt_potencia_rx = olt_potencia_rx.slice(1)
																				ont_potencia_rx = ont_potencia_rx.slice(1)
																				olt_potencia_rx = parseInt(olt_potencia_rx);
																				ont_potencia_rx = parseInt(ont_potencia_rx);

																				logTest = new Array({ ont_estado_operacional: ont_estado_operacional, olt_potencia_rx: olt_potencia_rx, olt_potencia_tx: olt_potencia_tx, ont_potencia_rx: ont_potencia_rx, ont_estado_administrativo: ont_estado_administrativo })
																				console.log(`${averia} Comprobando resultados del TEST FTTH`);
																				if (olt_potencia_rx < 29 && ont_potencia_rx < 29) {

																					const coment = addComentIssue(averia, pepito, respuesta, logs, logTest, fecha_test, false, false)
																						.then(resComent => {

																							if (resComent.ok) {

																								etiquetaBuscada = ["#AI"];
																								etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																								console.log(`${averia} Comentario añadido, procediendo al cierre`);
																								cerrando = cierreFTTH(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																									.then(resCierre => {
																										console.log(`${averia} Cerrada.`);
																										insertarEnDiario(averia, tipologia, newFecha);
																										contador--;
																										updateTextStatus(`Averías por Cerrar: Total ${contador}`);
																										if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																									})
																							}
																						})
																				} else {
																					console.log("454");
																					asingUser(averia, rel, token, user);
																					contador--
																				}
																			} else {
																				logTest = "";

																				const coment = addComentIssue(averia, pepito, respuesta, logs, logTest, fecha_test, false, false)
																					.then(resComent => {

																						if (resComent.ok) {

																							etiquetaBuscada = ["#AI"];
																							etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																							console.log(`${averia} Comentario añadido, procediendo al cierre`);
																							cerrando = cierreFTTH(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																								.then(resCierre => {
																									insertarEnDiario(averia, tipologia, newFecha);
																									console.log(`${averia} Cerrada.`);
																									contador--;
																									updateTextStatus(`Averías por Cerrar: Total ${contador}`);
																									if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																								})
																						}
																					})
																			}
																			break;
																		case "ADSL":
																			fecha_test = "";
																			logsTest = "";

																			const coment = addComentIssue(averia, pepito, respuesta, logs, logsTest, fecha_test, false, false)
																				.then(resComent => {

																					if (resComent.ok) {

																						etiquetaBuscada = ["#AI"];
																						etiquetaAI = comprobarEtiqueta(etiquetas, etiquetaBuscada);

																						console.log(`${averia} Comentario añadido, procediendo al cierre`);
																						cerrando = cierreAdsl(averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil)
																							.then(resCierre => {
																								insertarEnDiario(averia, tipologia, newFecha);
																								console.log(`${averia} Cerrada.`);
																								contador--;
																								updateTextStatus(`Averías por Cerrar: Total ${contador}`)
																								if (contador <= 0) updateTextStatus(`Fin del proceso, esperando reinicio...`);
																							})
																					}
																				})
																			break;
																		default:
																			break;
																	}
																}
															})
													}
												}
												break
										}
									})
							}
						})
				}
			})
	}
	cierres();
}