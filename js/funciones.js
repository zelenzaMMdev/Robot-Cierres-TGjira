const sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));

function isbetween(timeini, timefin, time) {
	let tiempo = new Date(Date.now());
	let h = tiempo.getHours();

	switch (h) {
		// case 22:
		// case 23:
		case 0:
		case 1:
		case 2:
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
			return false;
		default:
			break;
	}
	return true;
	//return time > timeini && time < timefin;
}

const locucion = async (movil, seguridad, averia) => {
	let hoy = new Date();
	hoy.setMinutes(hoy.getMinutes() + 1);
	let hoydia = hoy.getUTCDate();
	let hoymes = hoy.getMonth();
	hoymes += 1;
	let hoyano = hoy.getFullYear();
	let hoyhora = hoy.getHours();
	let hoyminutos = hoy.getMinutes();
	let operadorC2C = "OTRO";
	let horallamada = `${hoyano}-${hoymes}-${hoydia} ${hoyhora}:${hoyminutos}:00`;
	//var horallamada_SQL = hoyano + "-" + str_pad(hoymes) + "-" + str_pad(hoydia) + " " + str_pad(hoyhora) + ":" + str_pad(hoyminutos) + ":" + str_pad(hoy.getSeconds());

	const timeini = "08:00";
	const timefin = "22:00";
	let tiempo = new Date(Date.now());
	const h = tiempo.getHours();
	const m = tiempo.getMinutes();
	const time = `${h}:${m}`;

	const horario = isbetween(timeini, timefin, time);

	if (seguridad === "YOIGO") {
		operadorC2C = "6";
	} else if (seguridad === "MÁSMÓVIL") {
		operadorC2C = "7";
	} else {
		operadorC2C = "OTRO";
	}

	if (horario === 09) {
		var comentariolocucion = {
			body: `ROBOT CIERRES -- Locucion no enviada por estar fuera de horario(08:00 a 22:00)\nSe enviara la locucion a las 0${horario}:${hoyminutos}:00`
		};

		horallamada = `${hoyano}-${hoymes}-${hoydia} 08:${hoyminutos}:00`;

		var queryC2Carry = {
			date: horallamada,
			idLista: operadorC2C,
			nombre: "Locucion",
			msisdn: movil,
			lang: "1"
		};

	} else {
		var comentariolocucion = {
			body: `*ROBOT CIERRES -- Se informa a cliente mediante locucion automatica, se cierra incidencia con evidencia de funcionamiento. Informamos a cliente en ${movil} hora de llamada ${horallamada}*`
		};

		var queryC2Carry = {
			date: horallamada,
			idLista: operadorC2C,
			nombre: "Locucion",
			msisdn: movil,
			lang: "1"
		};
	}
	const urlC2C = "http://172.30.32.53:8180/ClicktoCall/CreateClicktoCall?";

	const v_Bars = 'directories=no, location=no, menubar=no, status=no,titlebar=no,toolbar=no';
	const v_Options = 'scrollbars=yes,resizable=no,Height=10,Width=10,left=100,top=100,visible=false,alwaysLowered=yes';
	const newWindow = window.open(urlC2C + $.param(queryC2Carry), 'PrintWin', v_Bars + ',' + v_Options);
	await sleep(1)
	newWindow.close();

	const myHeaders = new Headers();
	myHeaders.append("X-Requested-With", "XMLHttpRequest");
	myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
	myHeaders.append("Content-Type", "application/json")
	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: JSON.stringify(comentariolocucion),
	};
	return await fetch(`https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`, requestOptions)

}

const loginRadius = () => {
	const req = new XMLHttpRequest();
	req.open('GET', 'https://tools.mm-red.net/radius/buscador_radius.php?token=S1N3TDNCUFJ3bEhZZ1dpV0V5azc5NmVvVndlNWpya0Q5a3p5cURTVjlFT0tsRGU4cElJM1ZPTENXYldZN3M3R3MvdW1aV3JuWGU4biszT1duZ2RaRmdsRkk0U3N1Y2t1RWdPSEczalRCVHMyK0NwRDg3MXNqbE5XNG10N3JqVk5COEdiNkJBPQ', false);
	req.send(null);
	if (req.readyState === 4 && req.status === 200) {
		console.log("Login Correcto en Radius")
	} else {
		console.log("Fallo en el Login de Radius");
	}
}

const extraerNumeroDeFiltro = () => {
	numeroFiltro = window.location.href.split("=")
	numeroFiltro = numeroFiltro[1].split("&")
	sessionStorage.setItem("numeroFiltro", numeroFiltro[0])
	return "extraido"
}

const leerCookie = (cookies) => {
	const lista = document.cookie.split(";");
	for (i in lista) {
		const busca = lista[i].search(cookies);
		if (busca > -1) { micookie = lista[i] }
	}
	const igual = micookie.indexOf("=");
	const valor = micookie.substring(igual + 1);
	return valor
}

const loginMassos = () => {
	const loginMassos = {
		"url": "https://masoss.masmovil.com/Login?ReturnUrl=https%3A%2F%2Fmasoss.masmovil.com%2F",
		"method": "POST",
		"timeout": 0,
		"headers": {},
		"data": {
			"login": "rafael.lucas",
			"password": "Masmovil00*"
		}
	};
	$.ajax(loginMassos).done(function (respuesta) {
		console.log("Login Correcto en Massos");
	}).fail(function (data, textStatus, xhr) {
		//This shows status code eg. 403
		console.log("Fallo en el login en Massos");
		//This shows status code eg. 403
		console.log(textStatus);
		console.log("error", data.status);
		//This shows status message eg. Forbidden
		console.log("STATUS: " + xhr);
	})
}

const loginJira = async () => {

	return await fetch("https://jira.masmovil.com/login.jsp", {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "es-ES,es;q=0.9",
			"cache-control": "max-age=0",
			"content-type": "application/x-www-form-urlencoded",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1"
		},
		"referrer": "https://jira.masmovil.com/login.jsp",
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": "os_username=bboo.zelenza&os_password=DAZ2020*&os_destination=&user_role=&atl_token=&login=Entrar",
		"method": "POST",
		"mode": "cors",
		"credentials": "include"
	});
}

const busquedaJiraIssue = (averia) => fetch(`https://jira.masmovil.com/rest/api/2/issue/${averia}`)

const busquedaJiraFilterJql = (jql, campos, start) => fetch(`https://jira.masmovil.com/rest/api/2/search?jql=${jql}&maxResults=1000&fields=${campos}&startAt=${start}`)

const comprobarEtiqueta = (labels, etiquetaBuscada) => {

	if (labels.length === 0) {
		return false
	}

	let etiqueta;
	for (let e = 0; e < labels.length; e++) {
		for (const key in etiquetaBuscada) {
			if (etiquetaBuscada.hasOwnProperty(key)) {
				etiqueta = etiquetaBuscada[key];
				var pepe = labels[e]
				if (pepe === etiqueta) {
					return true;
				}
			}
		}
	}
}

const fechaFormatoMysql = (fecha) => {

	fecha = Date.parse(fecha);
	fecha = new Date(fecha);

	const dd = fecha.getDate();
	const mm = fecha.getMonth() + 1; //fecha es 0!
	const yyyy = fecha.getFullYear();
	const hh = fecha.getHours();
	const minu = fecha.getMinutes();
	const sec = fecha.getSeconds();
	//var mesNumero = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
	//var mesNum = mesNumero[fecha.getMonth()];
	//var diaNumero = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
	//var dd = dd.toString();
	//var diaNum = diaNumero.indexOf(dd);

	const newFecha = `${yyyy}-${mm}-${dd} ${hh}:${minu}-${sec}`;
	return newFecha;
}

const insertarEnDiario = (averia, tipologia, newFecha) => {

	data = `{\"class\":\"gestiones\",\"method\":\"insertarEnDiario\",\"params\":[\"${averia}\",\"${tipologia}\",\"${newFecha}\",\"Buscada\",\"Resuelta\",\"bboo.zelenza\",\"No Necesario\",\"Resuelvo\",\"SI\",\"No\"]}`;

	const xhr = new XMLHttpRequest()
	xhr.open("POST", "https://jarvis.zelenza.com/includes/interfazajax.inc.php", false)
	xhr.send(data)

	return true;
}

const comprobarReitero = async (ot, fecha) => {

	var req = {};
	var params = [ot, fecha];
	req.class = "consultas";
	req.method = "comprobarReitero";
	req.params = params;
	const datos = JSON.stringify(req);

	return await axios({

		method: "post",
		url: "https://jarvis.zelenza.com/includes/interfazajax.inc.php",
		data: datos,
		processData: false,
		dataType: "json",
	});
	const pepe = { "data": "" };
	return pepe;
}

const consultaRadius = async (pcode, IUA) => {

	//añadimos / en los pcode donde es necesario
	try {
		const iua_2 = IUA.slice(0, 1)
		if (iua_2 === "Z") {
			pcode = `${pcode}/`
		}
	} catch (error) {

	}

	let req = {};
	let params = pcode;
	req.class = "radiusAPI";
	req.method = "consultaRadius";
	req.params = params;
	const datos = JSON.stringify(req);

	return await axios({

		method: "post",
		url: "https://192.168.98.26/proyectos/includes/interfazajax.inc.php",
		data: datos,
		processData: false,
		dataType: "json",
	});
}

const consultaFijoRadius = async (telfijo) => {

	let req = {};
	let params = telfijo;
	req.class = "radiusAPI";
	req.method = "estadoFijoPruebas";
	req.params = params;
	const datos = JSON.stringify(req);

	return await axios({
		method: "post",
		url: "https://192.168.98.26/proyectos/includes/interfazajax.inc.php",
		data: datos,
		processData: false,
		dataType: "json",
	});

}

// const consultaRadius = (i, iua, prov_code) => {
// 	// if (prov_code === "null_null_null") {
// 	//     prov_code = listadoAveriasJira[i].fields['customfield_15800']
// 	//     prov_code = prov_code.replace("#", "%23");
// 	// }

// 	switch (iua) {
// 		case iua !== "":
// 		case iua !== null:
// 			let iua_2 = iua.slice(0, 1)
// 			if (iua_2 === "O" || iua_2 === "V" || iua_2 === "U") {
// 				prov_code = `${prov_code}/`
// 			}
// 			break;
// 		default:
// 			break;
// 	}
// 	return fetch(`https://tools.mm-red.net/network/app/radius/proxy/b2c/logs/provisioning_code?prov_code=${prov_code}&start_date=1546297200&end_date=1609369200&limit_records=10`)
// }

// const consultaFijoRadius = async (telfijo) => {

// 	var req = {};
// 	var params = [telfijo];
// 	req.class = "radiusAPI";
// 	req.method = "estadoFijoWeb";
// 	req.params = params;
// 	const datos = JSON.stringify(req);

// 	return await axios({
// 		method: "post",
// 		url: "https://192.168.98.26/proyectos/includes/interfazajax.inc.php",
// 		data: datos,
// 		processData: false,
// 		dataType: "json",
// 	});
// }

/* NO FUNCIONA POR MIXED CONTENT
const testFtthDirecto = (iua) => fetch(`http://10.100.6.122:82/api/tyd/1/test?iua=${iua}&test=TST_FTTH_STATE_ONT`);
*/

const testFtth = (iua) => {

	let iua_2 = iua.slice(0, 1)

	if (iua_2.indexOf("J") !== -1 || iua_2.indexOf("M") !== -1 || iua_2.indexOf("O") !== -1 || iua_2.indexOf("V") !== -1 || iua_2.indexOf("U") !== -1) {
		var req = {};
		var params = [iua]
		req.class = "massosAPI"
		req.method = "testFTTH"
		req.params = params
		const datos = JSON.stringify(req)

		// //LANZADON PETICION EN AJAX(FUNCIONA CORRECTO)
		const respuesta = $.ajax({
			async: false,
			url: "https://192.168.98.26/proyectos/includes/interfazajax.inc.php",
			type: "POST",
			data: datos,
			processData: false,
			dataType: "json"
		}).done(function (response) {

		}).fail(function (data, textStatus, xhr) {
			console.log(textStatus);
			console.log(data.responseText);
			//This shows status code eg. 403
			console.log("error", data.status);
			//This shows status message eg. Forbidden
			console.log("STATUS: " + xhr);
		})

		return respuesta.responseJSON
	} else { return "sin test" }
}

const asingUser = (averia, rel, token, user) => {

	const comentario = {
		body: `*ROBOT CIERRES* -- ASIGNADA PARA SU REVISION`
	};
	$.ajax({
		async: true,
		type: "POST",
		url: `https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`,
		data: JSON.stringify(comentario),
		headers: {
			"content-Type": "application/json",
			"Accept-Language": "es-ES,es;q=0.9",
			"X-Requested-With": "XMLHttpRequest"
		}
	});

	const data = `inline=true&decorator=dialog&id=${rel}&assignee=${user}&comment=&commentLevel=&atl_token=${token}`
	let xhr = new XMLHttpRequest();
	xhr.open("POST", "https://jira.masmovil.com/secure/AssignIssue.jspa");
	xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	xhr.send(data);
	console.log(`${averia} asignada para revision a : ${user}`);
}

const colorForIssue = (i, logs) => {
	if (logs === 'Stop') {
		$(".customfield_10902")[i].style.backgroundColor = "#F34D4D";//ROJO
		$(".customfield_10902")[i].style.color = "white";
		$(".customfield_15800")[i].style.backgroundColor = "#F34D4D"; //ROJO
		$(".customfield_15800")[i].style.color = "white";
		return 'Stop';
	} else {
		$(".customfield_10902")[i].style.backgroundColor = "#0E8000"; //ROJO
		$(".customfield_10902")[i].style.color = "white";
		$(".customfield_15800")[i].style.backgroundColor = "#0E8000"; //ROJO
		$(".customfield_15800")[i].style.color = "white";
		return 'Start';
	}
}

const assigneIssue = (rel, token, tecnologia, status, pepito) => {
	let action;
	// const filtro = sessionStorage.getItem("mumeroFiltro")
	switch (true) {
		case tecnologia === "ADSL":
			action = "41";
			break;
		case tecnologia === "FTTH" && status === "PENDIENTE TELEFONICA":
			action = "591";
			break;
		case tecnologia === "FTTH":
			action = "11";
			break;
		default:
			break;
	}
	return fetch(`https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=${action}&atl_token=${token}&decorator=dialog&inline=true`);
}

const addComentIssue = (averia, prov_code, respuesta, logs, logTest, fecha_test, telFijo, datosFijo) => {

	const fecha_inicio = respuesta[0].fecha;
	const fecha_fin = respuesta[0].fecha_fin;
	const rPcode = prov_code;
	const duration = respuesta[0].duration;
	const ipAddress = respuesta[0].FramedAddress;
	const natIpAddress = respuesta[0].NatIpAddress;
	const bras = respuesta[0].Host;
	const radiusPanel = `{panel:title=*RADIUS*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`;
	const comentarioAgente = "{panel:title=*COMENTARIO*}";
	const panelRadius = '|| Fecha_inicio || Fecha_fin || ProvisionigCode || Duration || ipAddress || natIpAddress || Bras || Estado ||';
	const tablaradius = `|${fecha_inicio}|${fecha_fin}|${rPcode}|${duration}|${ipAddress}|${natIpAddress}|${bras}||{color:green}${logs}{color}||`;
	let comentario;

	if (logTest !== "") {
		const testPanel = `{panel:title=*TEST FTTH / Fecha del Test: ${fecha_test}*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}`;
		const panelTestFTTH = "|| ont_estado_operacional || olt_potencia_rx || olt_potencia_tx || ont_potencia_rx || ont_estado_administrativo || ";
		const tablaFTTH = `|${logTest[0].ont_estado_operacional}|-${logTest[0].olt_potencia_rx}|${logTest[0].olt_potencia_tx}|-${logTest[0].ont_potencia_rx}|${logTest[0].ont_estado_administrativo}|`;

		if (telFijo) {
			const estadoFijo = "{panel:title=*ESTADO FIJO*}" + String.fromCharCode(13) + String.fromCharCode(13) + String.fromCharCode(13);
			// let removeCaracters = datosFijo.replace(/[&\/\\#,+()$~%'"*?{}]/g, '');
			// let removeTags = removeCaracters.replace(/<br>/g, "");
			// removeTags = removeTags.replace(/<strong>/g, "");
			// removeTags = removeTags.replace(/<strong >/g, "");
			// let dataFijo = removeTags.split("<pre>");
			var testFijo = "";

			for (const key in datosFijo) {

				const element = key;
				const valor = datosFijo[key];

				switch (key) {
					case "CpeRegistered":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "ENUM":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "ExistsIMS":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "Portability":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "Route":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "XenaStaus":
						testFijo += `||${element} : ${valor}\n`;
						break;

					default:
						break;
				}

			}

			comentario = { body: `||${testPanel}${panelTestFTTH}\n${tablaFTTH}\n${estadoFijo}${testFijo}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}\n *ROBOT CIERRES -- LINEA CORRECTA, RESUELVO TICKET*{panel}` };

		} else {
			comentario = { body: `||${testPanel}${panelTestFTTH}\n${tablaFTTH}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}\n*ROBOT CIERRES -- LINEA CORRECTA, RESUELVO TICKET*{panel}` };
		}

	} else {

		if (telFijo) {

			const estadoFijo = "{panel:title=*ESTADO FIJO*}" + String.fromCharCode(13) + String.fromCharCode(13) + String.fromCharCode(13);
			// let removeCaracters = datosFijo.replace(/[&\/\\#,+()$~%'"*?{}]/g, '');
			// let removeTags = removeCaracters.replace(/<br>/g, "");
			// removeTags = removeTags.replace(/<strong>/g, "");
			// removeTags = removeTags.replace(/<strong >/g, "");
			// let dataFijo = removeTags.split("<pre>");

			var testFijo = "";

			for (const key in datosFijo) {

				const element = key;
				const valor = datosFijo[key];

				switch (key) {
					case "CpeRegistered":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "ENUM":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "ExistsIMS":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "Portability":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "Route":
						testFijo += `||${element} : ${valor}\n`;
						break;
					case "XenaStaus":
						testFijo += `||${element} : ${valor}\n`;
						break;

					default:
						break;
				}

			}

			comentario = { body: `||${estadoFijo}${testFijo}\n${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}\n *ROBOT CIERRES -- LINEA CORRECTA, RESUELVO TICKET*{panel}` };

		} else {
			comentario = { body: `||${radiusPanel}${panelRadius}\n${tablaradius}\n${comentarioAgente}\n*ROBOT CIERRES-- LINEA CORRECTA, RESUELVO TICKET*{panel}` };
		}
	}

	const myHeaders = new Headers();
	myHeaders.append("X-Requested-With", "XMLHttpRequest");
	myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
	myHeaders.append("Content-Type", "application/json")
	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: JSON.stringify(comentario),
	};
	return fetch(`https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`, requestOptions);
}

const cierreAdsl = async (averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil) => {

	let data = "";
	switch (tipologia) {
		case "INCOMUNICADO":
			codigoTipologia = "10845";
			break;
		case "NO EMITE NO RECIBE":
			codigoTipologia = "10846";
			break;
		case "NO EMITE":
			codigoTipologia = "10847";
			break;
		case "NO RECIBE":
			codigoTipologia = "10848";
			break;
		case "CORTES LENTITUD WIFI":
			codigoTipologia = "10849";
			break;
		case "CORTES DE SERVICIO":
			codigoTipologia = "10851";
			break;
		case "NO CONECTA WIFI":
			codigoTipologia = "10852";
			break;
		case "NO CONECTA CABLE":
			codigoTipologia = "10853";
			break;
		case "NO NAVEGA CABLE":
			codigoTipologia = "10854";
			break;
		case "NO NAVEGA WIFI":
			codigoTipologia = "10855";
			break;
		case "SVA":
			codigoTipologia = "10856";
			break;
		case "IP FIJA":
			codigoTipologia = "11018";
			break;
		case "FAX TO MAIL":
			codigoTipologia = "11019";
			break;
		case "BACKUP":
			codigoTipologia = "11020";
			break;
		case "FONIAS/ECO":
			codigoTipologia = "11021";
			break;
		case "BAJO SINCRONISMO":
			codigoTipologia = "11022";
			break;
		default:
			break;
	}


	//COMPROBAMOS SI HA ESTADO EN RED
	if (tiempoEnRed !== null) {
		if (etiquetaAI) {
			//si tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10858&customfield_10701=11841&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		} else {
			//si NO tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10858&customfield_10701=11841&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		}
	}
	//COMPROBAMOS SI HA ESTADO EN SISTEMAS
	if (tiempoEnSistemas !== null) {
		if (etiquetaAI) {
			//si tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10858&customfield_10701=11026&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		} else {
			//si NO tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10858&customfield_10701=11026&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		}
	}

	if (data === "") {
		if (subTarea.length > 0 && etiquetaAI) {
			//si tiene etiqueta AI y Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10857&customfield_10701=10803&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		} else if (subTarea.length > 0 && !etiquetaAI) {
			//si NO tiene etiqueta AI y SI tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10857&customfield_10701=10803&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		} else if (subTarea.length === 0 && !etiquetaAI) {
			//si NO tiene etiqueta AI y NO tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10859&customfield_10701=10807&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		} else if (subTarea.length === 0 && etiquetaAI) {
			//si tiene etiqueta AI y NO tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10112=10163&customfield_10113=&customfield_10703=${codigoTipologia}&customfield_10704=10859&customfield_10701=10807&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_10369=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14703&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		}
	}


	if (seguridad === "YOIGO" || seguridad === "MÁSMÓVIL") {
		//mandamos locucion
		console.log(`${averia} Enviando locucion...`)
		await locucion(movil, seguridad, averia);
	}

	const myHeaders = new Headers();
	myHeaders.append("X-Requested-With", "XMLHttpRequest");
	myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
	myHeaders.append("content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: data,
	};
	return fetch(`https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=${token}`, requestOptions)
}


const cierreFTTH = async (averia, token, rel, subTarea, tipologia, etiquetaAI, tiempoEnRed, tiempoEnSistemas, seguridad, movil) => {
	let data = "";

	if (tiempoEnRed !== null) {
		if (etiquetaAI) {
			//si tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10858&customfield_10705=11841&customfield_10707=10866&customfield_10023=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		} else {
			//si NO tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10858&customfield_10705=11841&customfield_10707=10866&customfield_10023=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		}
	}
	//COMPROBAMOS SI HA ESTADO EN SISTEMAS
	if (tiempoEnSistemas !== null) {
		if (etiquetaAI) {
			//si tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10858&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		} else {
			//si NO tiene etiqueta AI
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10858&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		}
	}

	//SI NO A ESTADO EN RED NI EN SISTEMAS BUSCAMOS SUBTAREA
	if (data === "") {
		if (subTarea.length > 0 && etiquetaAI) {
			//si tiene etiqueta AI y Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10857&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12132&customfield_11690%3A1=12134&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`
		} else if (subTarea.length > 0 && !etiquetaAI) {
			//si NO tiene etiqueta AI y SI tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10822&customfield_10704=10857&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		} else if (subTarea.length === 0 && !etiquetaAI) {
			//si NO tiene etiqueta AI y NO tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10829&customfield_10704=10859&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12131&customfield_11690%3A1=&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
		} else if (subTarea.length === 0 && etiquetaAI) {
			//si tiene etiqueta AI y NO tiene Subtarea
			data = `inline=true&decorator=dialog&action=71&id=${rel}&viewIssueKey=&customfield_10702=10829&customfield_10704=10859&customfield_10705=10862&customfield_10707=10866&customfield_10023=-1&customfield_11690=12131&customfield_11690%3A1=12134&customfield_13101=14704&customfield_12519=-1&customfield_12520=&customfield_12521=&dnd-dropzone=&comment=&commentLevel=&atl_token=${token}`;
			console.log(`${averia} Cerrada como #AI`);
		}
	}

	if (seguridad === "YOIGO" || seguridad === "MÁSMÓVIL") {
		//mandamos locucion
		console.log(`${averia} Enviando locucion...`)
		await locucion(movil, seguridad, averia);
	}

	//LANZAMOS PETICION DE CIERRE
	const myHeaders = new Headers();
	myHeaders.append("X-Requested-With", "XMLHttpRequest");
	myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
	myHeaders.append("content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: data,
	};
	return fetch(`https://jira.masmovil.com/secure/CommentAssignIssue.jspa?atl_token=${token}`, requestOptions)
}

