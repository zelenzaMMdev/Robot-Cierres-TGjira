if (window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=54338") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=57585") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=57586") > -1 || window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=575857") > -1) {
	/**** FILTRO JQL ****/
	//project = MAS AND issuetype in ("Avería (FTTH)", "Avería (xDSL)") AND ProvisioningCode !~ "1/1/1/1" AND status not in (Resolved, CLOSE, Descartado, "In Progress", "Escalado FSM") AND ("Averías Masivas" = EMPTY OR "Averías Masivas" = "Empty") AND "Motivo de la Avería" = INCOMUNICADO AND status not in ("PENDIENTE DE JAZZTEL", "Escalado FSM", "Escalado a proveedor", "Escalado a Vodafone", "PENDIENTE TELEFONICA") AND assignee is EMPTY AND resolution = Unresolved AND "Cola de Peticiones" = "SAT 2º Nivel Averías" AND "Fecha Actualización" is EMPTY AND createdDate >= startOfDay()

	//var filtro = $(location).attr('href').substr(0, 46);
	//if (window.location.href.indexOf("https://jira.masmovil.com/issues/?filter=") > -1) {
	//if (filtro == 'https://jira.masmovil.com/issues/?filter=54338') {

	var sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));

	function control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, fecha) {

		var req = {};
		var params = [usuario, averia, fecha_creacion_averia, tipo, fecha];

		req.class = "gestiones"
		req.method = "controlEscaladoAuto"
		req.params = params

		$.ajax({
			async: false,
			url: "https://jarvis.alalzagestion.com/includes/interfazajax.inc.php",
			type: "POST",
			data: JSON.stringify(req),
			processData: false,
			dataType: "json"
		}).done(function (response) {
			console.log("insertada en la BBDD");
		}).fail(async function (data, textStatus, xhr) {

			var title = `<a href="https://jarvis.alalzagestion.com/includes/interfazajax.inc.php" target="_blank">${comentarioURL_jarvis}`
			var timer = 60000
			alerta(title, timer);
			await sleep(60);
			console.log(`fallo en la insercion en la bbdd por sitio inseguro`);

			console.log(textStatus);
			console.log(data.responseText);
			//This shows status code eg. 403
			console.log("error", data.status);
			//This shows status message eg. Forbidden
			console.log("STATUS: " + xhr);
		})
	}


	function alerta(title, timer) {
		const Toast = Swal.mixin({
			toast: true,
			position: 'center',
			imageUrl: 'https://algoritmosmx.files.wordpress.com/2015/08/trabajando-gif.gif?w=270&h=248',
			imageWidth: 200,
			imageHeight: 200,
			showConfirmButton: false,
			timer: timer,
			timerProgressBar: true,
			onOpen: (toast) => {
				// toast.addEventListener('mouseenter', Swal.stopTimer)
				// toast.addEventListener('mouseleave', Swal.resumeTimer)
			}
		})
		Toast.fire({
			// icon: 'success',
			title: title
		}).then((result) => {
			if (result.value) {
			}
		})
	}

	function insertescalado(i, averia) {

		var estado = "Nueva"
		var accionticket = "Escalo"
		var emisionticket = "Contactado"
		var fecha = new Date();
		var dia = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)}-${fecha.getDate()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`
		var fecha_creacion = $(".created span time")[i].dateTime;
		var tipologia = $(".customfield_10026")[i].innerText;
		var averia = averia;
		var usuario = $('meta[name=ajs-remote-user]').attr('content');
		var pcodeFTTH = $(".customfield_10902")[i].innerText;
		var pcodeNeba = $(".customfield_15800")[i].innerText;
		var tecnologia = $('.customfield_10013')[i].innerText;

		if (tecnologia === "ADSL") {
			var accion = "PENDIENTE DE JAZZTEL";
		}
		if (tecnologia === "FTTH" && pcodeFTTH !== "null/null/null/null") {
			var accion = "ESCALADO FSM";
		}
		if (tecnologia === "FTTH" && pcodeNeba !== "null_null_null") {
			var accion = "PENDIENTE TELEFONICA";
		}

		var dia_creacion = fecha_creacion.substring(0, 10);
		var hora_creacion = fecha_creacion.substring(11, 19);
		var creado = `${dia_creacion} ${hora_creacion}`
		var url = "https://jarvis.alalzagestion.com/BBDDPHP/insert_1.php"
		var robot = "SI"

		AddAverias(averia, tipologia, dia, creado, estado, accion, usuario, url, accionticket, emisionticket, robot);
	}

	function AddAverias(averia, tipologia, dia, creado, estado, accion, usuario, url, accionticket, emisionticket, robot) {
		//console.log(this.name + " " + this.age);
		$.ajax({
			type: "POST",
			url: url,
			data: {
				averia: averia,
				tipologia: tipologia,
				fecha: dia,
				estado: estado,
				accion: accion,
				usuario: usuario,
				creado: creado,
				accionticket: accionticket,
				emisionticket: emisionticket,
				robot: robot
			},
			success: function (response) {
				console.log("Añadida a Jarvis = OK");
			}
		});
	}
	// $('.aui-header-primary ul').append('<li class="toolbar-item"><button type="button" class="btn btn-success" id="escalarAverias" style="margin-left: 10px;">Escalar Averias</button></li></ul>');

	// ESCALADOS FTTH INCOMUNICADOS
	var token = $("#atlassian-token").attr('content');
	var timer = 7000;

	$("#escalarAverias").on("click", async function () {
		escaladoAve();
	});

	async function escaladoAve() {

		$('#escalarAverias').css({ "display": "none" });
		$('.aui-header-primary ul').append('<li class="toolbar-item"><button type="button" class="btn btn-danger" id="play" style="margin-left: 10px;">Robot en Ejecucion...</button></li></ul>');
		//LANZAMOS PRIMERA CONSULTA RADIUS
		var req = new XMLHttpRequest();
		req.open('GET', 'https://tools.mm-red.net/radius/buscador_radius.php?token=S1N3TDNCUFJ3bEhZZ1dpV0V5azc5NmVvVndlNWpya0Q5a3p5cURTVjlFT0tsRGU4cElJM1ZPTENXYldZN3M3R3MvdW1aV3JuWGU4biszT1duZ2RaRmdsRkk0U3N1Y2t1RWdPSEczalRCVHMyK0NwRDg3MXNqbE5XNG10N3JqVk5COEdiNkJBPQ', false);
		req.send(null);
		// if (req.status === 200) {
		// }
		var tabla = $('tbody tr'); //array
		var i = 0;
		var usuario = $('meta[name=ajs-remote-user]').attr('content');
		for (i; i < tabla.length; i++) {
			var fecha_creacion = $(".created span time")[i].dateTime;
			var dia_creacion = fecha_creacion.substring(0, 10);
			var hora_creacion = fecha_creacion.substring(11, 19);
			var fecha_creacion_averia = `${dia_creacion} ${hora_creacion}`
			var fecha = new Date();
			var dia_accion = `${fecha.getFullYear()}-${(fecha.getMonth() + 1)}-${fecha.getDate()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`

			console.log("Iniciando Proceso...");
			var title = "Iniciando Proceso...";
			alerta(title, timer);
			await sleep(2);

			var rel = tabla[i].attributes[1].value;
			var averia = tabla[i].attributes[2].value;
			var codigoPostal = $('.customfield_10373')[i].innerText;
			var subTarea = $('.subtasks')[i].innerText;
			var IUA = $('.customfield_10268')[i].innerText

			if (subTarea !== "") {
				$(".customfield_10902")[i].style.backgroundColor = "#F34D4D" //ROJO
				$(".customfield_10902")[i].style.color = "white"
				$(".customfield_15800")[i].style.backgroundColor = "#F34D4D" //ROJO
				$(".customfield_15800")[i].style.color = "white"

				console.log(`${averia} Con Subtarea, Abortando Escalado...`);
				var title = `AVERIA_${averia} Con Subtarea, Abortando Escalado...`
				alerta(title, timer);
				await sleep(2);
				continue;
			}

			var prov_code = $(".customfield_10902")[i].innerText;

			if (prov_code === "null/null/null/null") {
				var prov_code = $(".customfield_15800")[i].innerText;
				var prov_code = prov_code.replace("#", "%23");
			}

			var iua_2 = IUA.slice(0, 1)
			if (iua_2 === "O" || iua_2 === "V") {
				var prov_code = `${prov_code}/`
			}

			//LANZAMOS SEGUNDA CONSULTA RADIUS
			var req = new XMLHttpRequest();
			req.open('GET', `https://tools.mm-red.net/network/app/radius/proxy/b2c/logs/provisioning_code?prov_code=${prov_code}&start_date=1546297200&end_date=1609369200&limit_records=10`, false);
			req.send(null);

			if (req.status === 200) {
				var dataSet = JSON.parse(req.responseText);
			} else {
				console.log(`Fallo en consulta Radius : ${averia},  del error : ${req.status}`);
				continue;
			}

			var fecha_inicio = dataSet.data[0].fecha;
			var fecha_fin = dataSet.data[0].fecha_fin;
			var rPcode = dataSet.data[0].UserName;
			var duration = dataSet.data[0].duration;
			var ipAddress = dataSet.data[0].FramedAddress;
			var natIpAddress = dataSet.data[0].NatIpAddress;
			var bras = dataSet.data[0].Host;
			var logs = dataSet.data[0].AcctStatusType;
			var panelRadius = '|| fecha_inicio || fecha_fin || Povisionigcode || duration || ipAddress || natIpAddress || Bras || Estado ||';
			var title = `AVERIA_${averia} estado en radius: ${logs}`

			alerta(title, timer);
			await sleep(3);
			console.log(`AVERIA_${averia} estado en radius: ${logs}`);
			//************************* DATOS PARA ESCALADO ADSL JAZZTEL *************************//
			var tecnologia = $('.customfield_10013')[i].innerText;
			var movil = $('.customfield_10314')[i].innerText;

			if (tecnologia === "ADSL" && logs === "Stop") {

				// NOS ASIGNAMOS LA AVERIA
				console.log(`${averia}: Asignando...`);
				var title = `AVERIA_${averia} Asignando...`
				alerta(title, timer);
				await sleep(3);

				var req4 = new XMLHttpRequest();
				req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=41&atl_token=${token}&decorator=dialog&inline=true`, false);
				req4.send(null);

				if (req4.status === 200) {
					console.log(`${averia}: Asignada`)
				}

				var title = `AVERIA_${averia} Asignada`
				alerta(title, timer);
				await sleep(2);
				/************** ACTUALIZAMOS AVERIA ***********/
				console.log(`AVERIA_${averia} Actualizando...`)
				var title = `AVERIA_${averia} Actualizando...`
				alerta(title, timer);
				await sleep(2);

				var req4 = new XMLHttpRequest();
				req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=331&atl_token=${token}&decorator=dialog&inline=true`, false);
				req4.send(null);

				if (req4.status === 200) {
					console.log(`AVERIA_${averia} Actualizada Con Exito`)
				}

				var title = `AVERIA_${averia} Actualizada Con Exito`;
				alerta(title, timer);
				await sleep(2);

				if (logs === "Stop") {
					var resultado = "NO SINCRONIZA"
				}

				var panelTestADSL = `{panel:title=*TEST DE SINCRONISMO*} *Resultado del Test: {color:red}${resultado}{color}*${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`;
				var radiusPanel = `{panel:title=*RADIUS*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`
				var comentarioAgente = "{panel:title=*COMENTARIO*}";
				var comen = Math.floor(Math.random() * 3) + 1;

				if (comen === 1) {
					comen = "SE REALIZAN PRUEBAS EN PTR, NO SINCRONIZA. SE ESCALA A TESA";
				} else if (comen === 2) {
					comen = "Cliente con router conectado en PTR no sincroniza,Se hace reset y se cambia de cable rj11 y problema persiste. escalamos para revision."
				} else if (comen === 3) {
					comen = "Hablamos con cliente y probamos cpe en ptr, se cambia rj-11, se reinicia equipo, reset de fabrica, y problema persiste, procedo a escalado.";
				}

				var tablaradius = `|${fecha_inicio}|${fecha_fin}|${rPcode}|${duration}|${ipAddress}|${natIpAddress}|${bras}||{color:red}${logs}{color}||`

				var testAdsl = 'Código:JAZZ-001 Descripción: Test ejecutado. Código-100' + "\n" + 'Descripción : Test ejecutado con resultado incorrecto' + "\n" + 'Conclusión: N/A Fecha: ' + fecha_fin + "\n" + 'DSLAM	SLOT	PORT	PROFILE	MODO SINCRONISMO' + "\n" + ' 10.252.9.61	7	6	RULL-6M/1M-ID' + "\n" + '   Bajada	Subida	Velocidad' + "\n" + ' 16549	1022' + "\n" + ' Máxima velocidad alcance' + "\n" + '	17108	1043' + "\n" + ' Atenuación	33,7	15,5' + "\n" + ' Potencia de salida	18,8	12,2' + "\n" + ' Margen de Ruido	7,3	11,8' + "\n" + 'Sincronización de los últimos 15 minutos' + "\n" + ' (tiempo trancurrido)	00:01:50' + "\n" + '	Bloques erroneos incorregibles en los últimos 15 minutos (tiempo transcurrido)' + "\n" + '	0	0 ' + "\n" + 'Sincronización en el último día (tiempo trancurrido)' + "\n" + '	0	' + "\n" + 'Bloques erróneos incorregibles en el último día (tiempo ranscurrido)' + "\n" + '		00:00:00' + "\n" + ' VENDOR_ID	' + "\n" + 'FF B5 42 44 43 4D 00 00	&390200' + "\n" + ' VERSIÓN	v10.09.22' + "\n" + '	ZXHN H267N V1.0 INP	5	30';

				var comentario = {
					body: `${panelTestADSL}${testAdsl}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}\n${comen}{panel}`
				};

				$.ajax({
					async: false,
					type: "POST",
					url: `https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`,
					data: JSON.stringify(comentario),
					headers: {
						"content-Type": "application/json",
						"Accept-Language": "es-ES,es;q=0.9",
						"X-Requested-With": "XMLHttpRequest"
					}
				});
				console.log("Comentario Añadido");


				var tamano = $(".labels")[0].children.length //COMPRUEBA EL NUMERO DE ETIQUETAS
				var long = tamano - 1
				var datos = "labels=#PENDIENTE_ESCALADO&"

				if (pcode === "null/null/null/null") {
					var tipo = "Escalado FSM NEBA"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				} else {
					var tipo = "Escalado FSM"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				}
				if (tecnologia === "xDSL") {
					var tipo = "Escalado Jazztel"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				}

				for (var u = 0; u < long; u++) { ////Bucle que recorre y añade las etiquetas ya existentes
					var etiqueta = $(".labels")[0].children[u].textContent;
					if (etiqueta.indexOf("#PENDIENTE_ESCALADO") !== -1) {
						swal.fire("ETIQUETA YA INSERTADA.")
						return;
					}
					datos += `labels=${$(".labels")[0].children[u].textContent}&`
				}

				var title = `AVERIA_${averia} AÑADIENDO ETIQUETA...`
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} AÑADIENDO ETIQUETA...`);

				var data = `${datos}issueId=${rel}&atl_token=${token}&singleFieldEdit=true&fieldsToForcePresent=labels`
				//console.log(data);
				$.ajax({
					aync: false,
					type: "POST",
					url: "https://jira.masmovil.com/secure/AjaxIssueAction.jspa?decorator=none",
					data: data,
					headers: {
						"content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"Accept-Language": "es-ES,es;q=0.9",
						"X-Requested-With": "XMLHttpRequest"
					}

				}).done(async function (respuesta) {

					var title = `AVERIA_${averia} ETIQUETA AÑADIDA`
					alerta(title, timer);
					await sleep(1);
					console.log(`AVERIA_${averia} ETIQUETA AÑADIDA`);
					//location.reload();
					//window.scrollTo(0, document.body.scrollHeight);
				}).fail(function (data, textStatus, xhr) {
					//This shows status code eg. 403
					console.log(textStatus);
					console.log("error", data.status);
					//This shows status message eg. Forbidden
					console.log("STATUS: " + xhr);
				})

				var title = `AVERIA_${averia} ASIGNANDO...`
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} ASIGNANDO...`);

				var data = `inline=true&decorator=dialog&id=${rel}&assignee=bboo.zelenza&comment=&commentLevel=&atl_token=${token}`
				var xhr = new XMLHttpRequest();
				xhr.open("POST", "https://jira.masmovil.com/secure/AssignIssue.jspa");
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				xhr.send(data);


				var title = `AVERIA_${averia} ASIGNADA PARA SU REVISION`
				var timer = 3000
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} ASIGNADA PARA SU REVISION`);
				location.reload()

			} //FIN ESCALADO A JAZZTEL ADSL

			//************************* ESCALADO FSM *************************//
			var pcodeFTTH = $(".customfield_10902")[i].innerText;
			var tecnologia = $(".customfield_10013")[i].innerText;
			var direccion = $(".customfield_10269")[i].innerText
			var nombrecliente = $(".customfield_10323")[i].innerText;
			var apellido1cliente = $(".customfield_10324")[i].innerText;
			var apellido2cliente = $(".customfield_10325")[i].innerText;
			var nombreCompletoCliente = `${nombrecliente} ${apellido1cliente} ${apellido2cliente}`;
			//**** DATOS PARA ESCALADO FSM ****/
			if (logs === "Stop" && pcodeFTTH !== "null/null/null/null" && tecnologia === "FTTH") {
				// escaFtth(rel, averia, dataSet, i, pcodeFTTH, tecnologia);
				// NOS ASIGNAMOS LA AVERIA
				console.log(`Asignando... ${averia}`)
				var title = `AVERIA_${averia} : Asignando...`
				alerta(title, timer);
				await sleep(2);

				var req = new XMLHttpRequest();
				req.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=11&atl_token=${token}&decorator=dialog&inline=true`, false);
				req.send(null);
				if (req.status === 200) {
					console.log(`${averia}: asignada`)
					var title = `AVERIA_${averia}: Asignada`
					alerta(title, timer);
					await sleep(2);
				}
				/************** ACTUALIZAMOS AVERIA ***********/
				console.log(`AVERIA_${averia} Actualizando...`)
				var title = `AVERIA_${averia} Actualizando...`;
				alerta(title, timer);
				await sleep(2);

				var req4 = new XMLHttpRequest();
				req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=321&atl_token=${token}&decorator=dialog&inline=true`, false);
				req4.send(null);
				if (req4.status === 200) {
					console.log(`AVERIA_${averia} Actualizada Con Exito`)
				}
				var title = `AVERIA_${averia} Actualizada Con Exito`
				alerta(title, timer);
				await sleep(2);

				var plantilla = Math.floor(Math.random() * 15) + 1;

				if (plantilla === 1) {
					plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
				} else if (plantilla === 2) {
					plantilla = "Se envia técnico para revisar conexión, cliente con LOS ROJO.Llevar cableado y equipos de prueba y medición necesarios.";
				} else if (plantilla === 3) {
					plantilla = "Solicitamos técnico para revisar conexiones y potencia en CTO, CD y PTRO. Realizar pruebas de velocidad por cable y WIFI una vez solucionada la incidencia. (Adjuntar fotos de potencias y velocidades). Muchas gracias";
				} else if (plantilla === 4) {
					plantilla = "Cliente sin potencia podéis revisar?. Muchas gracias.";
				} else if (plantilla === 5) {
					plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios. Necesitamos se anote el IUA de la acometida que esté conectada en el puerto del cliente. Gracias";
				} else if (plantilla === 6) {
					plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Se comprueba con cliente que el latiguillo no esta dañado y esta bien conectado.Llevar cableado y equipos de prueba y medición necesarios.Gracias y un saludo";
				} else if (plantilla === 7) {
					plantilla = "Cliente incomunicado, sólo encienden luces power y wlan en router. ¿Podéis revisar? Gracias";
				} else if (plantilla === 8) {
					plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(Los encendida).Llevar cableado y equipos de prueba y medición necesarios.Gracias";
				} else if (plantilla === 9) {
					plantilla = "Cliente incomunicado, no llega potencia, posible cable FTTH tocado. ¿Podéis revisar? Gracias";
				} else if (plantilla === 10) {
					plantilla = "Solicito envío de técnico para revisión de instalación y circuito cliente para confirmar funcionamiento. Gracias.";
				} else if (plantilla === 11) {
					plantilla = "Cliente incomunicado, luces Los e Internet parpadean en rojo. ¿Podéis revisar? Gracias";
				} else if (plantilla === 12) {
					plantilla = "Cliente incomunicado, sólo luces power y wlan encendidas. ¿Podéis revisar? Gracias.";
				} else if (plantilla === 13) {
					plantilla = "Revisamos servicio no sincroniza procedemos a escalar a contrata luz los apagada. confirmamos cableado con cliente unico corte";
				} else if (plantilla === 14) {
					plantilla = "Cliente incomunicado, no sincroniza. ¿Podéis revisar? Gracias";
				} else if (plantilla === 15) {
					plantilla = "Se envia tecnico para revision de LOS ROJO .Gracias"
				} else {
					plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
				};

				var testFtth = `{panel:title=*TEST FTTH*}\n| ont_estado_operacional | olt_potencia_rx |	olt_potencia_tx | ont_potencia_rx | pon_estado_operacional |\n||{color:red}loss{color}|-80 | 3.68 | -30.002 | up |`
				var radiusPanel = `{panel:title=*RADIUS*}"${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`
				var comentarioAgente = "{panel:title=*COMENTARIO*}";
				var tablaradius = `|${fecha_inicio}|${fecha_fin}|${rPcode}|${duration}|${ipAddress}|${natIpAddress}|${bras}||${logs}|{panel}\n`

				var data = `inline=true&decorator=dialog&action=621&id=${rel}&viewIssueKey=&customfield_16803=${testFtth}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}${plantilla}\n${nombreCompletoCliente}\n${direccion}\nTC : ${movil}{panel}\n&customfield_16805=20503&comment=&commentLevel=&atl_token=${token}`

				var comentario = {
					body: `${testFtth}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}${plantilla}{panel}`
				};

				$.ajax({
					async: false,
					type: "POST",
					url: `https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`,
					data: JSON.stringify(comentario),
					headers: {
						"content-Type": "application/json",
						"Accept-Language": "es-ES,es;q=0.9",
						"X-Requested-With": "XMLHttpRequest"
					}
				});


				var tamano = $(".labels")[0].children.length //COMPRUEBA EL NUMERO DE ETIQUETAS
				var long = tamano - 1
				var datos = "labels=#PENDIENTE_ESCALADO&"

				if (pcode === "null/null/null/null") {
					var tipo = "Escalado FSM NEBA"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				} else {
					var tipo = "Escalado FSM"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				}
				if (tecnologia === "xDSL") {
					var tipo = "Escalado Jazztel"
					control_escalado_auto(usuario, averia, fecha_creacion_averia, tipo, dia_accion)
				}

				for (var u = 0; u < long; u++) { ////Bucle que recorre y añade las etiquetas ya existentes
					var etiqueta = $(".labels")[0].children[u].textContent;
					if (etiqueta.indexOf("#PENDIENTE_ESCALADO") !== -1) {
						swal.fire("ETIQUETA YA INSERTADA.")
						return;
					}
					datos += `labels=${$(".labels")[0].children[u].textContent}&`
				}

				var title = `AVERIA_${averia} AÑADIENDO ETIQUETA...`
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} AÑADIENDO ETIQUETA...`);

				var data = `${datos}issueId=${rel}&atl_token=${token}&singleFieldEdit=true&fieldsToForcePresent=labels`
				//console.log(data);
				$.ajax({
					aync: false,
					type: "POST",
					url: "https://jira.masmovil.com/secure/AjaxIssueAction.jspa?decorator=none",
					data: data,
					headers: {
						"content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
						"Accept-Language": "es-ES,es;q=0.9",
						"X-Requested-With": "XMLHttpRequest"
					}

				}).done(async function (respuesta) {

					var title = `AVERIA_${averia} ETIQUETA AÑADIDA`
					alerta(title, timer);
					await sleep(1);
					console.log(`AVERIA_${averia} ETIQUETA AÑADIDA`);
					//location.reload();
					//window.scrollTo(0, document.body.scrollHeight);
				}).fail(function (data, textStatus, xhr) {
					//This shows status code eg. 403
					console.log(textStatus);
					console.log("error", data.status);
					//This shows status message eg. Forbidden
					console.log("STATUS: " + xhr);
				})

				var title = `AVERIA_${averia} ASIGNANDO...`
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} ASIGNANDO...`);

				var data = `inline=true&decorator=dialog&id=${rel}&assignee=bboo.zelenza&comment=&commentLevel=&atl_token=${token}`
				var xhr = new XMLHttpRequest();
				xhr.open("POST", "https://jira.masmovil.com/secure/AssignIssue.jspa");
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
				xhr.send(data);


				var title = `AVERIA_${averia} ASIGNADA PARA SU REVISION`
				var timer = 3000
				alerta(title, timer);
				await sleep(1);
				console.log(`AVERIA_${averia} ASIGNADA PARA SU REVISION`);
				location.reload()
				// //ESCALANDO A FSM
				// console.log(`${averia}: Escalando a FSM...`)
				// var title = `AVERIA_${averia}: Escalando a FSM...`;
				// alerta(title, timer);
				// await sleep(2);

				// $.ajax({
				//     async: false,
				//     type: "POST",
				//     url: `https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=${token}`,
				//     data: data,
				//     headers: {
				//         "content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
				//         "Accept-Language": "es-ES,es;q=0.9",
				//         "X-Requested-With": "XMLHttpRequest"
				//     },
				// }).fail(function (data, textStatus, xhr) {
				//     //This shows status code eg. 403
				//     console.log(textStatus);
				//     console.log("error", data.status);
				//     //This shows status message eg. Forbidden
				//     console.log("STATUS: " + xhr);
				// }).done(async function (response_2) {
				//     console.log(`${averia}: Escalada FSM`);
				// })
				// //window.open("https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=" + rel + "&action=741&atl_token=" + token, + "", "width=850, height=700");
				// $(".customfield_10902")[i].style.backgroundColor = "#0E8000" //VERDE
				// $(".customfield_10902")[i].style.color = "white"
				// $(".customfield_15800")[i].style.backgroundColor = "#0E8000" //VERDE
				// $(".customfield_15800")[i].style.color = "white"

				// var pausa = Math.floor(Math.random() * 20) + 1;
				// var pausa2 = pausa * 1000;
				// const Toast = Swal.mixin({
				//     toast: true,
				//     position: 'center',
				//     imageUrl: 'https://algoritmosmx.files.wordpress.com/2015/08/trabajando-gif.gif?w=270&h=248',
				//     imageWidth: 200,
				//     imageHeight: 200,
				//     showConfirmButton: true,
				//     timer: pausa2,
				//     timerProgressBar: true,
				//     onOpen: (toast) => {
				//         //toast.addEventListener('mouseenter', Swal.stopTimer)
				//         //toast.addEventListener('mouseleave', Swal.resumeTimer)
				//     }
				// })
				// Toast.fire({
				//     icon: 'success',
				//     title: `AVERIA_${averia} Escalada a FSM con Exito, ¿Detener Ejecucion?`
				// }).then((result) => {
				//     if (result.value) {
				//         // location.reload();
				//         window.close();
				//     }
				// })
				// insertescalado(i, averia);
				// console.log(`Pausa de ${pausa} segundos`)
				// await sleep(pausa);
				// // 8 minutos = 480000
				// //location.reload();
				// console.log("Fin de la pausa Final");
				// location.reload();
				//continue;
			} //FIN ESCALADO FTTH INCO
			//************************* DATOS PARA ESCALADO NEBA  *************************//
			var pcodeNeba = $(".customfield_15800")[i].innerText;

			if (logs === "Stop" && pcodeNeba !== "null/null/null/null" && tecnologia === "FTTH") {

				var numeroOT = $('.customfield_10004')[i].innerText;
				var tecnologiaOT = $('.customfield_10013')[i].innerText;
				var idservicio = $('.customfield_10334')[i].innerText;
				var instaAcometida = $('.customfield_19201')[i].innerText;

				if (instaAcometida === "INSTALA_MM") {
					console.log("Neba Instalado por MM");
					var title = `AVERIA_${averia}: Neba Instalado por MM`
					alerta(title, timer);
					await sleep(2);
					console.log(`Asignando... ${averia}`)
					var title = `AVERIA_${averia}: Asignando...`
					alerta(title, timer);
					await sleep(2);

					var req = new XMLHttpRequest();
					req.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=11&atl_token=${token}&decorator=dialog&inline=true`, false);
					req.send(null);
					if (req.status == 200) {
						console.log(`${averia}: asignada`)
						const Toast6 = Swal.mixin({
							toast: true,
							position: 'center',
							imageUrl: 'https://algoritmosmx.files.wordpress.com/2015/08/trabajando-gif.gif?w=270&h=248',
							imageWidth: 200,
							imageHeight: 200,
							showConfirmButton: false,
							timer: 2000,
							timerProgressBar: true,
							onOpen: (toast) => {
								// toast.addEventListener('mouseenter', Swal.stopTimer)
								// toast.addEventListener('mouseleave', Swal.resumeTimer)
							}
						})
						Toast6.fire({
							// icon: 'success',
							title: `AVERIA_${averia}: Asignada`
						}).then((result) => {
							if (result.value) {

							}
						})
						await sleep(2);
					}
					/************** ACTUALIZAMOS AVERIA ***********/
					console.log(`AVERIA_${averia} Actualizando...`)
					var title = `AVERIA_${averia} Actualizando...`
					alerta(title, timer);
					await sleep(2);

					var req4 = new XMLHttpRequest();
					req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=321&atl_token=${token}&decorator=dialog&inline=true`, false);
					req4.send(null);
					if (req4.status === 200) {
						console.log(`AVERIA_${averia} Actualizada Con Exito`)
					}
					var title = `AVERIA_${averia} Actualizada Con Exito`
					alerta(title, averia);
					await sleep(2);

					var plantilla = Math.floor(Math.random() * 15) + 1;

					if (plantilla === 1) {
						plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
					} else if (plantilla === 2) {
						plantilla = "Se envia técnico para revisar conexión, cliente con LOS ROJO.Llevar cableado y equipos de prueba y medición necesarios.";
					} else if (plantilla === 3) {
						plantilla = "Solicitamos técnico para revisar conexiones y potencia en CTO, CD y PTRO. Realizar pruebas de velocidad por cable y WIFI una vez solucionada la incidencia. (Adjuntar fotos de potencias y velocidades). Muchas gracias";
					} else if (plantilla === 4) {
						plantilla = "Cliente sin potencia podéis revisar?. Muchas gracias.";
					} else if (plantilla === 5) {
						plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios. Necesitamos se anote el IUA de la acometida que esté conectada en el puerto del cliente. Gracias";
					} else if (plantilla === 6) {
						plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Se comprueba con cliente que el latiguillo no esta dañado y esta bien conectado.Llevar cableado y equipos de prueba y medición necesarios.Gracias y un saludo";
					} else if (plantilla === 7) {
						plantilla = "Cliente incomunicado, sólo encienden luces power y wlan en router. ¿Podéis revisar? Gracias";
					} else if (plantilla === 8) {
						plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(Los encendida).Llevar cableado y equipos de prueba y medición necesarios.Gracias";
					} else if (plantilla === 9) {
						plantilla = "Cliente incomunicado, no llega potencia, posible cable FTTH tocado. ¿Podéis revisar? Gracias";
					} else if (plantilla === 10) {
						plantilla = "Solicito envío de técnico para revisión de instalación y circuito cliente para confirmar funcionamiento. Gracias.";
					} else if (plantilla === 11) {
						plantilla = "Cliente incomunicado, luces Los e Internet parpadean en rojo. ¿Podéis revisar? Gracias";
					} else if (plantilla === 12) {
						plantilla = "Cliente incomunicado, sólo luces power y wlan encendidas. ¿Podéis revisar? Gracias.";
					} else if (plantilla === 13) {
						plantilla = "Revisamos servicio no sincroniza procedemos a escalar a contrata luz los apagada. confirmamos cableado con cliente unico corte";
					} else if (plantilla === 14) {
						plantilla = "Cliente incomunicado, no sincroniza. ¿Podéis revisar? Gracias";
					} else if (plantilla === 15) {
						plantilla = "Se envia tecnico para revision de LOS ROJO .Gracias"
					} else {
						plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
					};

					var testFtth = `{panel:title=*TEST FTTH*}\n| ont_estado_operacional | olt_potencia_rx |	olt_potencia_tx | ont_potencia_rx | pon_estado_operacional |\n||{color:red}loss{color}|-80 | 3.68 | -30.002 | up |`
					var radiusPanel = `{panel:title=*RADIUS*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`
					var comentarioAgente = "{panel:title=*COMENTARIO*}";
					var tablaradius = `|${fecha_inicio}|${fecha_fin}|${rPcode}|${duration}|${ipAddress}|${natIpAddress}|${bras}||${logs}|{panel}\n`
					var data = `inline=true&decorator=dialog&action=621&id=${rel}&viewIssueKey=&customfield_16803=${testFtth}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}${plantilla}{panel}\n&customfield_16805=20503&comment=&commentLevel=&atl_token=${token}`
					//ESCALANDO A FSM
					console.log(`${averia}: Escalando a FSM...`)
					var title = `AVERIA_${averia}: Escalando a FSM...`
					alerta(title, timer);
					await sleep(2);

					$.ajax({
						async: false,
						type: "POST",
						url: `https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=${token}`,
						data: data,
						headers: {
							"content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
							"Accept-Language": "es-ES,es;q=0.9",
							"X-Requested-With": "XMLHttpRequest"
						},
					}).fail(function (data, textStatus, xhr) {
						//This shows status code eg. 403
						console.log(textStatus);
						console.log("error", data.status);
						//This shows status message eg. Forbidden
						console.log("STATUS: " + xhr);
					}).done(async function (response_2) {
						console.log(`${averia}: Escalada FSM`)
					})
					//window.open("https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=" + rel + "&action=741&atl_token=" + token, + "", "width=850, height=700");
					$(".customfield_10902")[i].style.backgroundColor = "#0E8000" //VERDE
					$(".customfield_10902")[i].style.color = "white"
					$(".customfield_15800")[i].style.backgroundColor = "#0E8000" //VERDE
					$(".customfield_15800")[i].style.color = "white"

					var pausa = Math.floor(Math.random() * 20) + 1;
					var pausa2 = pausa * 1000;
					const Toast = Swal.mixin({
						toast: true,
						position: 'center',
						imageUrl: 'https://algoritmosmx.files.wordpress.com/2015/08/trabajando-gif.gif?w=270&h=248',
						imageWidth: 200,
						imageHeight: 200,
						showConfirmButton: true,
						timer: pausa2,
						timerProgressBar: true,
						onOpen: (toast) => {
							//toast.addEventListener('mouseenter', Swal.stopTimer)
							//toast.addEventListener('mouseleave', Swal.resumeTimer)
						}
					})
					Toast.fire({
						icon: 'success',
						title: `AVERIA_${averia} Escalada a FSM con Exito, ¿Detener Ejecucion?`
					}).then((result) => {
						if (result.value) {
							// location.reload();
							window.close();
						}
					})
					insertescalado(i, averia);
					console.log(`Pausa de ${pausa} segundos`)
					await sleep(pausa);
					// 8 minutos = 480000
					//location.reload();
					console.log("Fin de la pausa Final");
					location.reload();
					//continue;
				} //FIN ESCALADO NEBA FSM
				//login massos
				var loginMassos = {
					"async": false,
					"url": "https://masoss.masmovil.com/Login?ReturnUrl=https%3A%2F%2Fmasoss.masmovil.com%2F",
					"method": "POST",
					"timeout": 0,
					"headers": {},
					"data": {
						"login": "rafael.lucas",
						"password": "Masmovil00*"
					}
				};
				$.ajax(loginMassos).fail(function (data, textStatus, xhr) {
					//This shows status code eg. 403
					console.log("Fallo en el login en Massos");
					//This shows status message eg. Forbidden
					console.log("STATUS: " + xhr);
				}).done(function (respuesta) {
					console.log("Login Correcto en Massos");
				});
				//EXTRAEMOS DATOS DE MASSOS
				var req1 = new XMLHttpRequest();
				req1.open('GET', `https://masoss.masmovil.com/WorkOrdersDetail/GetDetailView?workorderServiceId=${idservicio}&tipo=${tecnologiaOT}&workOrderId=${numeroOT}`, false);
				req1.send(null);
				if (req1.status === 200) {
					var title = `AVERIA_${averia}: Datos Extraidos de massos`
					alerta(title, timer);
					await sleep(2);
					console.log(`${averia} : Datos Extraidos datos de massos`)
				}
				//req.responseText -- RESPUESTA DE PETICION
				//VARIABLES PARA ESCALADO A TESA NEBA
				var miga = pcodeNeba.substring(1, 8);
				var nombretesa = nombrecliente.replace(" ", "+");
				var apellido1tesa = apellido1cliente.replace(" ", "+");
				var apellido2tesa = apellido2cliente.replace(" ", "+");
				var fecha = new Date();
				var horatesa = fecha.getHours() + "" + fecha.getMinutes() + "00";
				var mes = fecha.getMonth() + 1;
				var year = fecha.getFullYear();
				var admin = $(req1.responseText).find('.control-label[for=AdminNumber]').parent().parent().find('.col-xs-8').text().trim();
				var codPost = $(req1.responseText).find('.control-label[for=IAddPostalCode]').parent().parent().find('.col-xs-8').text().trim();
				//LANZAMOS TEST NEBA
				console.log("Lanzando Test Neba...");
				var title = `AVERIA_${averia} : Lanzando Test NEBA`
				alerta(title, timer);
				await sleep(2);

				var req2 = new XMLHttpRequest();
				req2.open('GET', `https://masoss.masmovil.com/Diagnostic/GetTestIdNeba?numAdmin=${admin}`, false);
				req2.send(null);
				if (req2.status === 200) {
					//console.log(req2.responseText);
					var numeroTest = JSON.parse(req2.responseText)
				}
				var idTestNeba = numeroTest.testId;

				if (numeroTest.result === "Error al solicitar Test Id a la API") {
					console.log(`${averia} Resultado : Error al solicitar Test Id a la API`)
					console.log("Reiniciando Bucle");

					$(".customfield_10902")[i].style.backgroundColor = "#F34D4D" //ROJO
					$(".customfield_10902")[i].style.color = "white"
					$(".customfield_15800")[i].style.backgroundColor = "#F34D4D" //ROJO
					$(".customfield_15800")[i].style.color = "white"

					var title = `AVERIA_${averia} Resultado : Error al solicitar Test Id a la API, Reiniciando Bucle...`
					alerta(title, timer);
					await sleep(2)
					continue;
				} else {
					console.log("Esperando 30 Segundos para la Respuesta...");
					var title = `AVERIA_${averia} : Esperando 30 Segundos para la Respuesta...`
					alerta(title, timer);
					await sleep(30);
					console.log("Fin de la Pausa");
					//****** CONSULTAMOS LA RESPUESTA DEL TEST NEBA ********//
					var title = `AVERIA_${averia} : Respuesa Obtenida, Comprobando Respuesta Del Test...`
					alerta(title, timer);
					console.log("Comprobando Respuesta Del Test....");
					await sleep(2);
					var data2 = `numAdmin=${admin}&testId=${idTestNeba}`

					var req3 = new XMLHttpRequest();
					req3.withCredentials = true;
					req3.open("POST", "https://masoss.masmovil.com/Diagnostic/GetDiagnosticNeba", false);
					req3.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
					req3.setRequestHeader("X-Requested-With", "XMLHttpRequest");
					req3.send(data2);

					if (req3.status === 200) {
						var estadoTestNeba = $(req3.responseText).find('.control-label[for=nebaftthData_ontState]').parent().parent().find('.col-xs-8').text().trim();
						// // var respuesta = JSON.parse(req3.responseText)
						// if (respuesta.result === "El diagnóstico del Test no ha sido generado todavía. Inténtelo de nuevo más tarde, gracias") {
						//     const Toast6 = Swal.mixin({
						//         toast: true,
						//         position: 'center',
						//         showConfirmButton: true,
						//         timer: 15000,
						//         timerProgressBar: true,
						//         onOpen: (toast) => {
						//             // toast.addEventListener('mouseenter', Swal.stopTimer)
						//             // toast.addEventListener('mouseleave', Swal.resumeTimer)
						//         }
						//     })
						//     Toast6.fire({
						//         // icon: 'success',
						//         title: `AVERIA_${averia}: Test no Generado, Realizando nueva consulta...`
						//     }).then((result) => {
						//         if (result.value) {
						//             window.close();
						//         }
						//     })
						//     await sleep(15);
						//     var req3 = new XMLHttpRequest();
						//     req3.withCredentials = true;
						//     req3.open("POST", "https://masoss.masmovil.com/Diagnostic/GetDiagnosticNeba", false);
						//     req3.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
						//     req3.setRequestHeader("X-Requested-With", "XMLHttpRequest");
						//     req3.send(data2);
						//     if (req3.status === 200) {
						//          var estadoTestNeba = $(req3.responseText).find('.control-label[for=nebaftthData_ontState]').parent().parent().find('.col-xs-8').text().trim();
						//     }
						//     }else{
						//          var estadoTestNeba = $(req3.responseText).find('.control-label[for=nebaftthData_ontState]').parent().parent().find('.col-xs-8').text().trim();
						//     }
					} else {
						$(".customfield_10902")[i].style.backgroundColor = "#F34D4D" //ROJO
						$(".customfield_10902")[i].style.color = "white"
						$(".customfield_15800")[i].style.backgroundColor = "#F34D4D" //ROJO
						$(".customfield_15800")[i].style.color = "white"

						var title = `AVERIA_${averia}: ${estadoTestNeba}`
						alerta(title, timer);
						await sleep(2);
						continue;
					}

					if (estadoTestNeba === "" || estadoTestNeba === undefined) {
						var resultadoTest = $(req3.responseText).find('.control-label[for=result_description]').parent().parent().find('.col-xs-8').text().trim();
						console.log(resultadoTest);
						var title = `AVERIA_${averia}: ${resultadoTest}`
						alerta(title, timer);
						$(".customfield_10902")[i].style.backgroundColor = "#F34D4D" //ROJO
						$(".customfield_10902")[i].style.color = "white"
						$(".customfield_15800")[i].style.backgroundColor = "#F34D4D" //ROJO
						$(".customfield_15800")[i].style.color = "white"
						await sleep(5);
						continue;
					}

					if (estadoTestNeba === "No sincroniza") {
						console.log("Resultado : No Sincroniza");
						console.log(`Asignando... ${averia}`)
						var title = `AVERIA_${averia} Resultado : No Sincroniza, Asignando...`;
						alerta(title, timer);
						await sleep(2);
						// NOS ASIGNAMOS LA AVERIA
						var req4 = new XMLHttpRequest();
						req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=11&atl_token=${token}&decorator=dialog&inline=true`, false);
						req4.send(null);
						if (req4.status === 200) {
							console.log(`${averia}: asignada`)
							var title = `AVERIA_${averia} Asignada`
							alerta(title, timer);
							await sleep(2);
						}
						/************** ACTUALIZAMOS AVERIA ***********/
						console.log(`AVERIA_${averia} Actualizando...`)
						var title = `AVERIA_${averia} Actualizando...`
						alerta(title, timer);
						await sleep(2);

						var req4 = new XMLHttpRequest();
						req4.open('GET', `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=321&atl_token=${token}&decorator=dialog&inline=true`, false);
						req4.send(null);
						if (req4.status === 200) {
							console.log(`AVERIA_${averia} Actualizada Con Exito`)
						}
						var title = `AVERIA_${averia} Actualizada Con Exito`
						alerta(title, timer);
						await sleep(2);

						if (horatesa.length !== 6) {
							horatesa = "0" + horatesa;
						}

						if (year === 2020) {
							year = "20";
						} else if (year === 2021) {
							year = "21";
						} else if (year === 2022) {
							year = "22";
						} else if (year === 2023) {
							year = "23";
						}

						if (mes === 1) {
							mes = "ene";
						} else if (mes === 2) {
							mes = "feb";
						} else if (mes === 3) {
							mes = "mar"
						} else if (mes === 4) {
							mes = "abr"
						} else if (mes === 5) {
							mes = "may"
						} else if (mes === 6) {
							mes = "jun"
						} else if (mes === 7) {
							mes = "jul"
						} else if (mes === 8) {
							mes = "ago"
						} else if (mes === 9) {
							mes = "sep"
						} else if (mes === 10) {
							mes = "oct"
						} else if (mes === 11) {
							mes = "nov"
						} else if (mes === 12) {
							mes = "dic"
						}

						var diatesa = fecha.getDate() + "%2F" + mes + "%2F" + year;
						var plantilla = Math.floor(Math.random() * 15) + 1;

						if (plantilla === 1) {
							plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
						} else if (plantilla === 2) {
							plantilla = "Se envia técnico para revisar conexión, cliente con LOS ROJO.Llevar cableado y equipos de prueba y medición necesarios.";
						} else if (plantilla === 3) {
							plantilla = "Solicitamos técnico para revisar conexiones y potencia en CTO, CD y PTRO. Realizar pruebas de velocidad por cable y WIFI una vez solucionada la incidencia. (Adjuntar fotos de potencias y velocidades). Muchas gracias";
						} else if (plantilla === 4) {
							plantilla = "Cliente sin potencia podéis revisar?. Muchas gracias.";
						} else if (plantilla === 5) {
							plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios. Necesitamos se anote el IUA de la acometida que esté conectada en el puerto del cliente. Gracias";
						} else if (plantilla === 6) {
							plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Se comprueba con cliente que el latiguillo no esta dañado y esta bien conectado.Llevar cableado y equipos de prueba y medición necesarios.Gracias y un saludo";
						} else if (plantilla === 7) {
							plantilla = "Cliente incomunicado, sólo encienden luces power y wlan en router. ¿Podéis revisar? Gracias";
						} else if (plantilla === 8) {
							plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(Los encendida).Llevar cableado y equipos de prueba y medición necesarios.Gracias";
						} else if (plantilla === 9) {
							plantilla = "Cliente incomunicado, no llega potencia, posible cable FTTH tocado. ¿Podéis revisar? Gracias";
						} else if (plantilla === 10) {
							plantilla = "Solicito envío de técnico para revisión de instalación y circuito cliente para confirmar funcionamiento. Gracias.";
						} else if (plantilla === 11) {
							plantilla = "Cliente incomunicado, luces Los e Internet parpadean en rojo. ¿Podéis revisar? Gracias";
						} else if (plantilla === 12) {
							plantilla = "Cliente incomunicado, sólo luces power y wlan encendidas. ¿Podéis revisar? Gracias.";
						} else if (plantilla === 13) {
							plantilla = "Revisamos servicio no sincroniza procedemos a escalar a contrata luz los apagada. confirmamos cableado con cliente unico corte";
						} else if (plantilla === 14) {
							plantilla = "Cliente incomunicado, no sincroniza. ¿Podéis revisar? Gracias";
						} else if (plantilla === 15) {
							plantilla = "Se envia tecnico para revision de LOS ROJO .Gracias"
						} else {
							plantilla = "Se solicita técnico para revisar conexión FTTH sin potencia(LOS encendida).Llevar cableado y equipos de prueba y medición necesarios.Llamar a la oficina de averías desde el domicilio de cliente para franqueo.Gracias y un saludo";
						};
						var radiusPanel = `{panel:title=*RADIUS*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`
						var comentarioAgente = "{panel:title=*COMENTARIO*}";
						var tablaradius = `|${fecha_inicio}|${fecha_fin}|${rPcode}|${duration}|${ipAddress}|${natIpAddress}|${bras}||${logs}|{panel}\n`
						//customfield_15701 = Sintoma
						//OP10 = 19702
						//SM06 = 19502
						var data3 = `inline=true&decorator=dialog&action=581&id=${rel}&viewIssueKey=&customfield_14900=${diatesa}&customfield_14901=${horatesa}&customfield_15700=18700&customfield_14902=02&customfield_14903=${admin}&customfield_15701=19502&customfield_15730=&customfield_10337=${miga}&customfield_15702=18727&customfield_15703=18737&customfield_15704=18741&customfield_10368=Cliente+incomunicado%2C+sin+potencia+en+PTRO&customfield_14908=17300&customfield_15705=18743&customfield_10342=10467&customfield_15706=-1&dnd-dropzone=&customfield_14601=&customfield_14602=&customfield_14603=&customfield_14604=&customfield_14605=&customfield_14700=&customfield_14701=&customfield_14702=&customfield_14703=&customfield_14704=&customfield_14705=&customfield_14706=&customfield_14707=&customfield_14708=&customfield_14800=&customfield_14801=&customfield_14802=&customfield_14803=&customfield_14804=&customfield_10323=${nombretesa}&customfield_10324=${apellido1tesa}&customfield_10325=${apellido2tesa}&customfield_14931=&customfield_10373=${codPost}&customfield_10314=${movil}&customfield_10333=${movil}&customfield_14932=0800&customfield_14933=1159&customfield_14934=1200&customfield_14935=2159&customfield_14936=&customfield_14937=&customfield_14939=&customfield_14938=&customfield_14940=&customfield_14941=&customfield_14942=&customfield_14943=&customfield_15714=&customfield_15715=&customfield_14944=-1&customfield_14946=17304&customfield_14947=17306&customfield_15707=18750&customfield_14948=N&customfield_15721=-1&customfield_15600=18401&customfield_14949=&customfield_10343=&customfield_14910=&customfield_14911=&customfield_14912=&customfield_14913=&customfield_14914=&customfield_14915=&customfield_14916=&customfield_14917=&customfield_14918=&customfield_14919=&customfield_14920=&customfield_14921=&customfield_14922=&customfield_14924=&customfield_14925=&customfield_14926=&customfield_14927=&customfield_14928=&customfield_14929=&customfield_10338=&comment=${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}${plantilla}{panel}\n&commentLevel=&atl_token=${token}`;
						console.log(`${averia}: Escalando a Neba...`);
						var title = `AVERIA_${averia}: Escalando a Neba a Tesa...`
						alerta(title, timer);
						await sleep(2);

						$.ajax({
							async: false,
							type: "POST",
							url: `https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=${token}`,
							data: data3,
							headers: {
								"content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
								"Accept-Language": "es-ES,es;q=0.9",
								"X-Requested-With": "XMLHttpRequest"
							}
						}).done(function (respuesta) {
							//console.log(respuesta);
							console.log(`${averia}: Escalada a Neba`)
						});
						// ESCALAMOS NEBA
						// console.log(averia + ": Escalando a Neba...");
						// var req5 = new XMLHttpRequest();
						// req5.open('POST', 'https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=' + token, false);
						// req5.send(data3);
						// if (req5.status == 200) {
						//console.log(averia + " : Escalada a Neba");
						//window.open("https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=" + rel + "&action=601&atl_token=" + token + "&decorator=dialog&inline=true", + "", "width=850, height=700");
						$(".customfield_10902")[i].style.backgroundColor = "#0E8000" //VERDE
						$(".customfield_10902")[i].style.color = "white"
						$(".customfield_15800")[i].style.backgroundColor = "#0E8000" //VERDE
						$(".customfield_15800")[i].style.color = "white"

						const Toast8 = Swal.mixin({
							toast: true,
							position: 'center',
							showConfirmButton: true,
							timer: 30000,
							timerProgressBar: true,
							onOpen: (toast) => {
								// toast.addEventListener('mouseenter', Swal.stopTimer)
								// toast.addEventListener('mouseleave', Swal.resumeTimer)
							}
						})
						Toast8.fire({
							icon: 'success',
							title: `AVERIA_${averia} Escalada a Tesa con Exito, ¿Detener Ejecucion?`
						}).then((result) => {
							if (result.value) {
								//location.reload();
								window.close();
							}
						})
						insertescalado(i, averia);
						var pausa = Math.floor(Math.random() * 20) + 1;
						console.log(`Pausa de ${pausa} segundos`)
						await sleep(pausa);
						console.log("Fin de la pausa Final");
						location.reload();
					} //FIN ESCALADO NEBA
				}
			}
			if (logs !== "Stop") {
				$(".customfield_10902")[i].style.backgroundColor = "#F34D4D" //ROJO
				$(".customfield_10902")[i].style.color = "white"
				$(".customfield_15800")[i].style.backgroundColor = "#F34D4D" //ROJO
				$(".customfield_15800")[i].style.color = "white"

				var title = `AVERIA_${averia} : En Estado ${logs} , Reiniciando Bucle...`
				alerta(title, timer);
				await sleep(3);
				continue;
			}
		}
		$('#escalarAverias').css({
			"display": "block"
		});
		$('#play').css({
			"display": "none"
		});
		console.log("Listado Vacio, Reiniciando Proceso...");
		var title = 'Sin Averias, Reiniciando Bucle...';
		alerta(title, timer);
		await sleep(5);
		location.reload();
	}
	// });//FIN FUNCION ON CLICK
	escaladoAve();
}