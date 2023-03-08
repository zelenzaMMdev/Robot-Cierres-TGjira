(async () => {

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

	let token = $("#atlassian-token").attr('content');
	sessionStorage.setItem("token_TGJira", token);

	let tokenBearer = "NjQxMDg0NzU0MTAwOvHOvewDJL9RWPzitW9OQK0exhqb"; //TOKEN RAFA TGJIRA PRO

	// let tokenBearer = "MjcwOTYyNzYxOTA4OsEnz1BSOW8gm+IKUl8eep496RB9" //TOKENS SITO
	// tokenBearer = "NjgyODU3MzAzMjQyOvHTcfsSRzQ2ZHfTV0TFnGgRVauZ"//TOKENS SITO

	const timeini = "08:00";
	const timefin = "00:00";
	let tiempo = new Date(Date.now());
	const h = tiempo.getHours();
	const m = tiempo.getMinutes();
	const time = `${h}:${m}`
	const horario = horarioRobot(timeini, timefin, time);

	if (!horario) {
		updateTextStatus("ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )");
		console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
		console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
		console.log('ROBOT PARADO, Fuera de horario permitido( 08:00 a 00:00 )');
		return;
	}

	//TODO:: PENDIENTE DE DESARROLLAR PARA TGJIRA
	//hacemos login en jira si no tenemos la session iniciada
	// if (token.indexOf("lout") !== -1) {

	// 	const _loginJira = await loginJira();

	// 	if (_loginJira.ok) {
	// 		location.reload();
	// 	}
	// }

	const tabla = $("#issuetable tr.issuerow");
	const usuario = $('meta[name=ajs-remote-user]').attr('content');
	const user = "bost.rpa2@asesormasmovil.es";

	let timer = 120000;
	let title;
	let t = 1;

	for (let i = 0; i < tabla.length; i++) {

		/** declaramos las variables necesarias para la obtencion de los datos **/
		const provisioning_code = $('.customfield_10306')[i].innerText;
		const identificador_ot = $('.customfield_10301')[i].innerText;
		const assigned = $('.assignee')[i].innerText;
		const key_number = tabla[i].attributes[2].value;
		const rel = tabla[i].attributes[1].value;
		const status = $(".status")[i].innerText;
		const marca = $(".customfield_10322")[i].innerText;
		const motivoDeApertura = $(".customfield_10325")[i].innerText
		const telefonoFijo = $('.customfield_10349')[i].innerText;
		const telefonoDeContacto = $(".customfield_10350")[i].innerText;
		const fecha_creacion = $(".created span time")[i].dateTime;
		const idservicio = $('.customfield_10302')[i].innerText;
		const instaAcometida = $('.customfield_10356')[i].innerText;
		const descripcion_reiterado = $(".customfield_14060")[i].innerText;

		let etiquetaContrata_N1 = false;
		let etiquetaTECNICONG = false;
		let etiqueta = false;
		let flagOKradius = false, flagOKftth = false, flagOKphone = false;
		let iua = $('.customfield_10332')[i].innerText;
		//iua = "J41904AFA317";
		//iua = "J08904AEC260";
		let data = "";
		let logs, logTest, fecha_test;
		let nombrecliente = $(".customfield_10334")[i].innerText;
		let apellido1cliente = $(".customfield_10335")[i].innerText;
		let apellido2cliente = $(".customfield_10336")[i].innerText;
		let flagPasoFSM = false
		let responseConsultaRadius;
		let testFtth;

		/** extraemos la informacion de la api de la averia y la añadimos al objeto global swiss**/
		swiss.key_number = key_number;
		data_averia(swiss);

		//TODO: PENDIENTE DE VER QUE COLUMNA ES COMENTARIOS SISTEMA PARA EL MANEJO DE LOS DATOS
		const comentariosSistema = $(".customfield_13606:eq(" + i + ") td");
		//busca si existe tabla del campo Comentarios Sistema, donde estan los escalados a externo como FSM y orange
		if (comentariosSistema.length > 0) {
			try {
				//si ha pasado por fsm y registrado ticket cuenta como flagPasoFSM == true
				for (let e = 1; e < $(".customfield_16525:eq(" + i + ") table tbody tr").length; e++) {
					if ($(".customfield_16525:eq(" + i + ") table tbody tr:eq(" + e + ") td:eq(1)")[0].innerText === "FSM" && $(".customfield_16525:eq(" + i + ") table tbody tr:eq(" + e + ") td:eq(3)")[0].innerText === "El ticket se ha registrado correctamente") flagPasoFSM = true;
				}
			} catch (error) {
				/** funcion que sirve para colorear la linea de la averia en curso **/
				colorForIssue(tabla, i, "red");
				console.log(`error determinando paso por FSM`);
			}
		}

		//comprobamos si tiene alguna de las etiquetas no permitidas
		let etiquetas = $(`.labels:eq(${i}) .lozenge`).map(function () { return $(this).text(); }).get();
		let etiquetas_no_permitidas = ["@CRUCE", "@cruce", "RETN2", "VIP", "PPCC3", "#OPS", "#UCI_TEAM", "#InstalaCableOperador#"];
		if (etiquetas.filter(value => etiquetas_no_permitidas.includes(value)).length > 0) continue;

		//comprobamos si tiene etiqueta #AI
		let etiquetaAI = false;
		etiquetaAI = etiquetas.filter(value => ["#AI"].includes(value)).length > 0 ? true : false;

		//comprobamos si tiene reitero en la descripcion de schaman y marca el numero de reiteros por si hay que utilizarlo mas adelante
		let num_reiteros = null;
		try {

			const regex_reiterado = RegExp('(#REITERADAX)([0-9]+)', 'g');
			//let descripcion_reiterado = $('.description:eq(' + i + ') .confluenceTable .confluenceTh:contains("Reiterado Avería")').next()[0].innerText;
			const res_regex = [...descripcion_reiterado.matchAll(regex_reiterado)];

			if (res_regex[0][1] !== "#REITERADAX") showAlert(`${key_number} : sin descripcion de reiterado`, timer);

			num_reiteros = parseInt(res_regex[0][2]);

		} catch (error) {

			colorForIssue(tabla, i, "red");
			showAlert(`${key_number} : sin descripcion de reiterado`, timer);
			await sleep(0.5);
			continue;
		}

		//si la averia tiene reitero > 0, osea, esta reiterada, se omite
		if (num_reiteros > 0) {
			/** funcion que sirve para colorear la linea de la averia en curso **/
			colorForIssue(tabla, i, "red");
			showAlert(`Averia ${key_number} Reiterada ${num_reiteros} saltando a la siguiente`, timer, true);
			await sleep(0.5);
			continue;
		}


		//TODO: CUANDO EL REMOTE ID ESTE EN FUNCIONAMIENTO LAS GESTIONAREMOS
		if (huella === "Adamo") { colorForIssue(tabla, i, "red"); continue; }

		/** si esta asignada al usuario no la gestionamos **/
		if (assigned === "BOST.RPA2 BOST.RPA2") {
			/** funcion que sirve para colorear la linea de la averia en curso **/
			colorForIssue(tabla, i, "red");
			continue;
		}

		/** esta segmentacion deveria estar filtrada en el JQL, PODEMOS AÑADIRLA POR SEGURIDAD **/
		switch (status) {
			//TODO: poner estados correctamente
			case "RESUELTA":
			case "CLOSE":
				colorForIssue(tabla, i, "red");
				continue;
			default:
				break;
		}

		showAlert(`${key_number} Comprobando estado en radius...`, timer, true); await sleep(0.5);

		try {
			/** lanzamos consulta radius **/
			var _consultaRadius = await consultaRadius(provisioning_code, iua);
		} catch (error) {
			responseConsultaRadius = false;
		}

		responseConsultaRadius = _consultaRadius.data.data;

		if (!responseConsultaRadius || responseConsultaRadius === undefined) {

			/** si falla la respuesta radius asignamos para revision **/
			showAlert(`${key_number}: Asignando Avería...`, timer, true); await sleep(0.5);

			if (status !== "EN PROGRESO") {
				/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
				await changeStatusToInProgress(key_number, tokenBearer);
			}

			/** funcion que sirve para asigar la avería **/
			await asignarAveria(key_number, tokenBearer, "bost.rpa2@asesormasmovil.es");

			/** funcion que siver para añadir un comentario en la avería **/
			await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Sin registros en Radius de este cliente*` });

			/** funcion que sirve para actualizar la avería **/
			await actualizarAveria(key_number, tokenBearer);

			/** funcion que sirve para colorear la linea de la averia en curso **/
			colorForIssue(tabla, i, "purple");

			showAlert(`${key_number} ASIGNADA PARA SU REVISION`, timer, true); await sleep(1);

			continue;
		}

		/** filtramos la respuesta recibida del test de radius **/
		const ultimoRegistro = responseConsultaRadius[0];
		const testRadius = responseConsultaRadius[0];

		/** dependiendo de la respuesta extraemos la fecha de inicio **/
		try {
			var fecha_inicio = responseConsultaRadius[1].fecha_fin;
		} catch (error) {
			var fecha_inicio = responseConsultaRadius[0].fecha_fin;
		}

		//creo comentario de radius
		//dejo unicamente las partes del test que me interesan
		let claves = ["fecha", "fecha_fin", "UserName", "duration", "FramedAddress", "NatIpAddress", "Host"]

		//contiene testRadiusRes con el resumen de las claves escogidas del test , comentarioradius con el comentario para jira, acctstatus con el ultimo estado para radius
		let comentarioRadius = commentRadius(claves, ultimoRegistro);

		//si ultimo registro de radius esta en stop pasamos a la siguiente
		if (comentarioRadius["acctstatus"] == "Stop") {
			showAlert(`${key_number} ESTADO RADIUS ${comentarioRadius["acctstatus"]}`, timer, true); await sleep(0.2);
			continue;
		}

		//TODO: modificado para pruebas pendiente de ver con OPERATIVA
		//si la fecha de creacion de la averia es posterior a la ultima sesion de radius y esta es start o alive quiere decir que puede ser un cruce o un no navega cable
		/*if(Date.parse(fecha_creacion) > Date.parse(comentarioradius["testRadiusRes"]["fecha"]) && (comentarioradius["acctstatus"] === "Start" || comentarioradius["acctstatus"] === "Alive")){
			showAlert(`${key_number} fecha radius anterior a creacion averia`,timer,true); await sleep(0.5);
			continue;
		}*/

		showAlert(`${key_number} estado en radius: ${comentarioRadius["acctstatus"]}`, timer, true); await sleep(0.5);

		// COMPROBAMOS SI FUNCIONA
		if (comentarioRadius["acctstatus"] === "Start" || comentarioRadius["acctstatus"] === "Alive") {
			// OK RADIUS
			flagOKradius = true;

			showAlert(`${key_number}  : Lanzando Test FTTH...`, timer, true); await sleep(0.5);

			try {
				testFtth = await testFtthLaunch(iua, swiss);
			} catch (error) {
				/** si nos da fallo el cpe asignamos a usuario **/
				showAlert(`${key_number} TEST CON ERROR : Asignando para revision`, timer, true); await sleep(0.5);

				if (status !== "EN PROGRESO") {
					/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
					await changeStatusToInProgress(key_number, tokenBearer);
				}

				/** funcion que sirve para asigar la avería **/
				await asignarAveria(key_number, tokenBearer, "bost.rpa2@asesormasmovil.es");

				/** funcion que siver para añadir un comentario en la avería **/
				await comentarTicket(key_number, tokenBearer, { body: `*TEST CON ERROR : Asignando para revision*` })

				/** funcion que sirve para actualizar la avería **/
				await actualizarAveria(key_number, tokenBearer);

				/** funcion que sirve para colorear la linea de la averia en curso **/
				colorForIssue(tabla, i, "purple");

				continue;


			}

			/** zona de cierre para los que no son NEBA/VULA **/
			if (testFtth !== "sin test") {

				let claves = ["olt_potencia_rx", "olt_potencia_tx", "ont_potencia_rx", "ont_potencia_tx"]
				//devuelve testFtthRes, comentarioFTTH,ont_potencia_rx,olt_potencia_rx
				let comentarioFtth = commentFtth(claves, testFtth)

				console.log(`${key_number} Comprobando resultados del TEST FTTH`);

				//si el valor de potencia es menor seguimos con el cierre
				if (comentarioFtth["olt_potencia_rx"] < 29 && comentarioFtth["ont_potencia_rx"] < 29) {

					flagOKftth = true

					if (marca !== "Pepephone") {

						showAlert(`${key_number} : Test Correcto, Comprobando estado del Fijo...`, timer, true); await sleep(0.5);

						const TestFijo = await consultaFijoRadius(telefonoFijo);
						let comentarioTelf = undefined
						try {

							let claves = ["CpeRegistered", "ENUM", "ExistsIMS", "Portability", "Route", "XenaStaus"]
							comentarioTelf = commentTelf(claves, TestFijo)


						} catch (error) {
							/** si nos da fallo el cpe asignamos a usuario **/
							showAlert(`${key_number} CPE Registrado : error, Asignando a ${user}`, timer, true); await sleep(0.5);

							if (status !== "EN PROGRESO") {
								/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
								await changeStatusToInProgress(key_number, tokenBearer);
							}

							/** funcion que sirve para asigar la avería **/
							await asignarAveria(key_number, tokenBearer, "bost.rpa2@asesormasmovil.es");

							/** funcion que siver para añadir un comentario en la avería **/
							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : CPE Registrado : Error*` });

							/** funcion que sirve para actualizar la avería **/
							await actualizarAveria(key_number, tokenBearer);

							/** funcion que sirve para colorear la linea de la averia en curso **/
							colorForIssue(tabla, i, "purple");

							continue;

						}

						/** si el el cpe no esta registrado asignamos a usuario **/
						if (comentarioTelf["CpeRegistered"] !== "REGISTERED") {

							showAlert(`Asignando : ${key_number} a ${user}`, timer, true); await sleep(0.5);

							if (status !== "EN PROGRESO") {
								/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
								await changeStatusToInProgress(key_number, tokenBearer);
							}

							/** funcion que sirve para asigar la avería **/
							await asignarAveria(key_number, tokenBearer, "bost.rpa2@asesormasmovil.es");

							/** funcion que siver para añadir un comentario en la avería **/
							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Asignado para revision, estado del CPE : ${CpeRegistered}*` });

							/** funcion que sirve para actualizar la avería **/
							await actualizarAveria(key_number, tokenBearer);

							/** funcion que sirve para colorear la linea de la averia en curso **/
							colorForIssue(tabla, i, "purple");

							continue;

						} else {

							/** TODO CORRECTO PARA EL CIERRE **/
							showAlert(`Comentando : ${key_number}...`, timer, true); await sleep(0.5);

							if (status !== "EN PROGRESO") {
								/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
								await changeStatusToInProgress(key_number, tokenBearer);
							}

							if (marca !== "Pepephone") {
								//añadimos comentario con pruebas de cierre, son paneles si se añade el comentario undefined no se pega el test
								await comentarAveria(key_number, tokenBearer, comentarioTelf["comentarioTelf"], comentarioFtth["comentarioFTTH"], comentarioRadius["comentarioradius"], false)

							} else {
								//añadimos comentario sin datos del fijo
								await comentarAveria(key_number, tokenBearer, false, comentarioFtth["comentarioFTTH"], comentarioRadius["comentarioradius"], false)
							}

							showAlert(`Cerrando : ${key_number}...`, timer, true); await sleep(0.5);

							//cerramos avería
							await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI, marca, telefonoDeContacto);

							continue;

						}
					} else {

						//SI NO TIENE FIJO, MARCA PEPEPHONE
						logTest = undefined;

						showAlert(`Comentando : ${key_number}...`, timer, true); await sleep(0.5);
						if (status !== "EN PROGRESO") {
							/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
							await changeStatusToInProgress(key_number, tokenBearer);
						}

						//añadimos comentario sin datos del fijo
						await comentarAveria(key_number, tokenBearer, false, comentarioFtth["comentarioFTTH"], comentarioRadius["comentarioradius"], false)

						showAlert(`${key_number} Comentario añadido, procediendo al cierre`, timer, true); await sleep(0.5);

						//cerramos avería
						await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI, marca, telefonoDeContacto);

						/** funcion que sirve para colorear la linea de la averia en curso **/
						colorForIssue(tabla, i, "darkgreen");

						console.log(`${key_number} Cerrada.`);
					}

				} else {

					/** SI LA POTENCIA ES INCORRECTA ASIGNAMOS A USUARIO PARA SU REVISION **/
					showAlert(`Asignando : ${key_number} a ${user}`, timer, true); await sleep(0.5);

					if (status !== "EN PROGRESO") {
						/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
						await changeStatusToInProgress(key_number, tokenBearer);
					}

					/** funcion que sirve para actualizar la avería **/
					await asignarAveria(key_number, tokenBearer, "bost.rpa2@asesormasmovil.es");

					/** funcion que siver para añadir un comentario en la avería **/
					await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : POTENCIA INCORRECTA, Asignando para revision*` });

					/** funcion que sirve para actualizar la avería **/
					await actualizarAveria(key_number, tokenBearer);

					/** funcion que sirve para colorear la linea de la averia en curso **/
					colorForIssue(tabla, i, "purple");

					continue;
				}
			} else {

				/** zona de cierre para los que si son NEBA/VULA **/

				if (status !== "EN PROGRESO") {
					/** funcion que sirve para cambiar el status de la avería a EN PROGRESO **/
					await changeStatusToInProgress(key_number, tokenBearer);
				}

				//añadimos comentario sin datos del fijo
				await comentarAveria(key_number, tokenBearer, false, false, comentarioRadius["comentarioradius"], false);

				//cerramos avería
				await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI, marca, telefonoDeContacto);

				continue;

			}
		}//FIN CIERRE 

	}//FIN BUCLE FOR
	await sleep(0.5);
	try {
		var countTotal = parseInt($('.results-count-total')[0].innerText);

	} catch (error) {
		await sleep(30);
		location.reload();
	}
	/** convertimos el numero a integrer **/
	var countTotal = parseInt($('.results-count-total')[0].innerText);
	var countStart = parseInt($('.results-count-start')[0].innerText);
	var countEnd = parseInt($('.results-count-end')[0].innerText);

	/** si el numero final de la pagina corresponde con el total reiniciamos el proceso **/
	if (countEnd === countTotal) {
		if (window.location.href.indexOf(swiss.tgjira_pro_filter) > -1) {
			console.log("Reiniciando Proceso...");

			let timerInterval

			Swal.fire({
				title: '',
				html:
					'<h1>El proceso se reiniciara en<br/><strong></strong> <br/>segundos</h1><br/><br/>',
				timer: 30000,
				position: 'center',
				imageUrl: 'https://jarvis.masmovil.com/img-jarvis/dedosgordos.gif',
				imageWidth: 200,
				imageHeight: 200,
				allowOutsideClick: false,
				allowEscapeKey: false,
				footer: 'By Departamento de Desarrollo @Zelenza 2023',
				didOpen: () => {
					const content = Swal.getHtmlContainer()
					const $ = content.querySelector.bind(content)
					Swal.showLoading()

					timerInterval = setInterval(() => {
						Swal.getHtmlContainer().querySelector('strong')
							.textContent = (Swal.getTimerLeft() / 1000)
								.toFixed(0)
					}, 100)
				},
				willClose: () => {
					clearInterval(timerInterval)
				}
			})

			await sleep(30);
			location.href = swiss.tgjira_pro_filter;
		}
	} else {

		/** si el numero final de la pagina no corresponde con el total cambiamos a la siguiente hoja **/
		if (window.location.href.indexOf(swiss.tgjira_pro_filter) > -1) {
			await sleep(30);
			location.href = `${swiss.tgjira_pro_filter}&startIndex=${countEnd}`;
		}
	}

})();

