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
let tokenBearer = "MjcwOTYyNzYxOTA4OsEnz1BSOW8gm+IKUl8eep496RB9"

const revisar_key_numbers = async () => {

	$('.aui-header-primary ul').append('<li class="toolbar-item"><button type="button" class="btn btn-danger" id="play" style="margin-left: 10px;">Robot en Ejecucion...</button></li></ul>');

	//TODO: PENDIENTE DE DESARROLLAR PARA TGJIRA
	//hacemos login en jira si no tenemos la session iniciada
	// if (token.indexOf("lout") !== -1) {

	// 	const _loginJira = await loginJira();

	// 	if (_loginJira.ok) {
	// 		location.reload();
	// 	}
	// }

	const tabla = $('tbody tr'); //array
	let timer = 120000;
	let title;
	const usuario = $('meta[name=ajs-remote-user]').attr('content');
	let xhr = new XMLHttpRequest();
	let t = 1;
	for (let i = 0; i < tabla.length; i++) {
		const user = "alfonso.asenjo@asesormasmovil.es";
		//const provisioning_code = $('.customfield_10306')[i].innerText;
		//en stop
		//const provisioning_code = "OLTZ3910005CAN112/13/3/17"
		//en alive
		const provisioning_code = "n1410002#1_1007_98"
		const identificador_ot = $('.customfield_10301')[i].innerText;
		const assigned = $('.assignee')[i].innerText;
		const tecnologia = $('.customfield_12331')[i].innerText;
		const key_number = tabla[i].attributes[2].value;
		const rel = tabla[i].attributes[1].value;
		const propietario_red = $('.customfield_10510')[i].innerText;
		const status = $(".status")[i].innerText;
		const Marca = $(".customfield_10322")[i].innerText;
		const movil = $('.customfield_10350')[i].innerText;

		/** extraemos la informacion de la api de la averia y la añadimos al objeto global swiss**/
		swiss.key_number = key_number;
		data_averia(swiss);

		const tipologia = $(".customfield_10325")[i].innerText

		const telFijo = $('.customfield_10349')[i].innerText;
		const fecha_creacion = $(".created span time")[i].dateTime;

		//const idservicio = $('.customfield_10302')[i].innerText;
		const instaAcometida = $('.customfield_10356')[i].innerText;
	
		let etiquetaContrata_N1 = false;
		let etiquetaTECNICONG = false;
		let etiqueta = false;
		let flagOKradius,flagOKftth,flagOKphone = false;

		let iua = $('.customfield_10332')[i].innerText;
		iua = "J41904AFA317";
		//iua = "J08904AEC260";
		let data = "";
		let logs, logTest, fecha_test;
		let nombrecliente = $(".customfield_10334")[i].innerText;
		let apellido1cliente = $(".customfield_10335")[i].innerText;
		let apellido2cliente = $(".customfield_10336")[i].innerText;
		let flagPasoFSM = false
		//busca si existe tabla del campo Comentarios Sistema, donde estan los escalados a externo como FSM y orange
		if($(".customfield_16525:eq("+i+") td").length > 0){
			try {
				//si ha pasado por fsm y registrado ticket cuenta como flagPasoFSM == true
				for (let i = 0; i < $(".customfield_16525 table tbody tr").length; i++) {
					if($(".customfield_16525 table tbody tr:eq("+i+") td:eq(1)")[0].innerText==="FSM" && $(".customfield_16525 table tbody tr:eq("+i+") td:eq(3)")[0].innerText ==="El ticket se ha registrado correctamente") flagPasoFSM = true
				}
			} catch (error) {
				console.log(`error determinando paso por FSM`);
			}
		}
		

		//comprobamos si tiene alguna de las etiquetas no permitidas
		let etiquetas = $(`.labels:eq(${i}) .lozenge`).map(function() {return $(this).text();}).get();
		let etiquetas_no_permitidas = ["@CRUCE", "@cruce", "RETN2", "VIP", "PPCC3", "#OPS", "#UCI_TEAM", "#InstalaCableOperador#"]
		if(etiquetas.filter(value => etiquetas_no_permitidas.includes(value)).length > 0) continue
		

		//comprobamos si tiene etiqueta #AI
		let etiquetaAI = false;
		etiquetaAI = etiquetas.filter(value => ["#AI"].includes(value)).length > 0 ? true : false
	
		//comprobamos si tiene reitero en la descripcion de schaman y marca el numero de reiteros por si hay que utilizarlo mas adelante
		let num_reiteros = null
		try {
				const regex_reiterado = RegExp('(#REITERADAX)([0-9]+)', 'g');
				let descripcion_reiterado = $('.description:eq('+i+') .confluenceTable .confluenceTh:contains("Reiterado Avería")').next()[0].innerText
				const res_regex = [...descripcion_reiterado.matchAll(regex_reiterado)];
				if(res_regex[0][1]!=="#REITERADAX") alerta(`${key_number} : sin descripcion de reiterado`, timer);
				num_reiteros = parseInt(res_regex[2])
		} catch (error) {
			alerta(`${key_number} : sin descripcion de reiterado`, timer);
		}

		//si la averia tiene reitero > 0, osea, esta reiterada, se omite
		if (num_reiteros > 0) {
			console.log(`Averia ${key_number} Reiterada ${num_reiteros} saltando a la siguiente`);
			alerta(`Averia ${key_number} Reiterada ${num_reiteros} saltando a la siguiente`);
			await sleep(0.5);
			continue;
		}


		//TODO revisar con operativa si sigue vigente 
		//si el IUA es de adamo continua a la siguiente
		//if (iua.slice(0, 1) === "A") {colorForIssue(i, "red"); continue;}


		t = t + 2;
		//TODO no se que hace esto
		//comprobamos que no falle el filtro de jira y muestre las asignadas al usuario
		if (assigned === "Alfonso Asenjo") { colorForIssue(i, "red"); continue;}
		//TODO preguntar a operativa si se necesita segmentacion por estados
		/*switch (status) {
			//TODO poner estados correctamente
			case "RESUELTA":
			case "CLOSE":
			case "ESCALADO FSM":
				//TODO que se hace con las escaladas
			// //SI ESTA RESUELTA Y ASIGNADA QUITAMOS ASIGNACION
			// console.log(`${key_number} Quitando Asignacion...`);
			// alerta(`${key_number} Quitando Asignacion...`, timer);
			// await sleep(0.5);

			// const _quitarAsignacion = quitarAsignacion(rel, token);
			// _quitarAsignacion ? console.log(`${key_number} desasignada`) : console.log(`${key_number} fallo al desasignar`);
			// colorForIssue(i, "purple");
			// continue;

			case "REGISTRADA":
			case "DERIVADA":

				if (assigned !== "ALFONSO ASENJO CASTELLOTE") {

					console.log(`${key_number}: Asignando Avería...`);
					alerta(`${key_number} Asignando Avería...`, timer);
					await sleep(0.5);

					await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");
				}

				console.log(`${key_number}: Cambiando estado a EN PROGRESO...`);
				alerta(`${key_number} Cambiando estado a EN PROGRESO...`, timer);
				await sleep(0.5);

				await changeStatusToInProgress(key_number, tokenBearer);

			default:
				break;
		}*/

		

		alerta(`${key_number} Comprobando estado en radius...`, timer);
		await sleep(0.5);
		console.log(`${key_number} Comprobando estado en radius...`);

		try {
			var _consultaRadius = await consultaRadius(provisioning_code, iua);
			responseConsultaRadius = true;
		} catch (error) {
			responseConsultaRadius = false;
		}

		responseConsultaRadius = _consultaRadius.data.data;

		if (!responseConsultaRadius || responseConsultaRadius === undefined) {

			console.log(`${key_number}: Asignando Avería...`);
			alerta(`${key_number} Asignando Avería...`, timer);
			await sleep(0.5);

			await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

			await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Sin registros en Radius de este cliente*` })

			title = `${key_number}ASIGNADA PARA SU REVISION`
			alerta(title, timer);
			await sleep(1);
			console.log(`${key_number} ASIGNADA PARA SU REVISION`);
			continue;
		}

		const ultimoRegistro = responseConsultaRadius[0];
		const testRadius = responseConsultaRadius[0];
		//falta comentario sobre esta funcion
		try {
			var fecha_inicio = responseConsultaRadius[1].fecha_fin;
		} catch (error) {
			var fecha_inicio = responseConsultaRadius[0].fecha_fin;
		}

		//dejo unicamente las partes del test que me interesan
		let claves = ["fecha","fecha_fin","UserName","duration","FramedAddress","NatIpAddress","Host"]
		let testRadiusRes = {}
		let acctstatus = {"AcctStatusType" : ultimoRegistro["AcctStatusType"]}

		//asigno sobre las claves que quiero mantener los valores del test de radius 
		for (const item of claves){
			testRadiusRes[item] = ultimoRegistro[item]
		}

		//si ultimo registro de radius esta en stop pasamos a la siguiente
		if(acctstatus["AcctStatusType"] == "Stop"){
			title = `${key_number} ESTADO RADIUS ${acctstatus["AcctStatusType"]}`
			alerta(title, timer);
			console.log(`${key_number} ESTADO RADIUS ${acctstatus["AcctStatusType"]}`);
			continue;
		}

		//TODO modificado para pruebas
		//si la fecha de creacion de la averia es posterior a la ultima sesion de radius y esta es start o alive quiere decir que puede ser un cruce o un no navega cable
		if(Date.parse(fecha_creacion) < Date.parse(testRadiusRes["fecha"]) && (acctstatus["AcctStatusType"] === "Start" || acctstatus["AcctStatusType"] === "Alive")){
			title = `${key_number} fecha radius anterior a creacion averia`
			alerta(title, timer);
			console.log(`${key_number} fecha radius anterior a creacion averia`);
			continue;
		}

		// crear comentario para pegar
		let keys = Object.keys(testRadiusRes)
		let vals = Object.values(testRadiusRes)
		
		let radiusPanel = `||{panel:title=*RADIUS*}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}${String.fromCharCode(13)}\n`

		let radiuskeys = "||" + keys.join("||") + "||Status||\n"

		let radiusvalues = "|"
		for (let item of vals) item === null ? radiusvalues += "nulo|" : radiusvalues += item + "|"
		radiusvalues +=  '|{color:'+acctstatus["AcctStatusType"] == "Stop" ? "red" : "green" +`}${acctstatus["AcctStatusType"]}{color}||${String.fromCharCode(13)}`
		let comentarioradius = comentarioRadius = radiusPanel + radiuskeys+ radiusvalues

		alerta(`${key_number} estado en radius: ${acctstatus["AcctStatusType"]}`, timer);
		await sleep(0.5);
		console.log(`${key_number} estado en radius: ${acctstatus["AcctStatusType"]}`);

		
		if (acctstatus["AcctStatusType"] === "Start" || acctstatus["AcctStatusType"] === "Alive") {
			// OK RADIUS
			flagOKradius = true;
			let testFtth = "sin test"
			//si es neba o vula no se lanza test
			if(tecnologia === "FTTH"){

				console.log(`${key_number}  : Lanzando Test FTTH...`);
				alerta(`${key_number}  : Lanzando Test FTTH...`, timer);
				await sleep(0.5);

				testFtth = await testFtthLaunch(iua, swiss);

				//si no hay test se pasa a la siguiente averia
				if (testFtth === null || testFtth === "sin test") {
					continue;
				}
			}

			if (testFtth !== "sin test") {

				let claves = ["olt_potencia_rx","olt_potencia_tx","ont_potencia_rx","ont_potencia_tx"]
				let testFtthRes = {}
				
				for (const item of claves){
					i = testFtth.resultado.datos.outputParam.find(e => e.key === item);
					testFtthRes[i.key] = parseInt(i.value)
				}
				
				let keys = Object.keys(testFtthRes)
				let vals = Object.values(testFtthRes)

				const testPanelFTTH = `{panel:title=*TEST FTTH / Fecha del Test: ${testFtth.fecha}*}${String.fromCharCode(13)}`;

				let panelTestFTTH = "||" + keys.join("||") + "||\n"
						
				let tablaFTTH = "|"
				for (let item of vals) item === null ? tablaFTTH += "nulo|" : tablaFTTH += item + "|"

				let comentarioFTTH = testPanelFTTH + panelTestFTTH + tablaFTTH

				console.log(`${key_number} Comprobando resultados del TEST FTTH`);

				//si el valor de potencia es menor a lo que nos indique operativa estara correcto
				if (testFtthRes["olt_potencia_rx"] < 29 && testFtthRes["ont_potencia_rx"] < 29) {

					flagOKftth = true
					
					//logTest = new Array({ ont_estado_operacional: ont_estado_operacional, olt_potencia_rx: olt_potencia_rx, olt_potencia_tx: olt_potencia_tx, ont_potencia_rx: ont_potencia_rx, ont_estado_administrativo: ont_estado_administrativo });

					if (Marca !== "PEPEPHONE") {

						console.log(`${key_number} : Test Correcto, Comprobando estado del Fijo...`);
						title = `${key_number} : Test Correcto, Comprobando estado del Fijo...`;
						alerta(title, timer);
						await sleep(0.5);

						const TestFijo = await consultaFijoRadius(telFijo);

						try {

							let claves = ["CpeRegistered","ENUM","ExistsIMS","Portability","Route","XenaStaus"]
							let testTelfRes = {}

							for (const item of claves){
								testTelfRes[item] = TestFijo.data.estado[item]
							}

							let keys = Object.keys(testTelfRes)
							let vals = Object.values(testTelfRes)

							const testPanelFijo = "{panel:title=*ESTADO FIJO*}" + String.fromCharCode(13) + String.fromCharCode(13) + String.fromCharCode(13)

							let panelTestTelf = "||" + keys.join("||") + "||\n"
									
							let tablaTestTelf= "|"
							for (let item of vals) item === null ? tablaTestTelf += "nulo|" : tablaTestTelf += item + "|"
							tablaTestTelf +=  `|`

							let comentarioTelf = testPanelFijo + panelTestTelf + tablaTestTelf

						} catch (error) {

							console.log(`${key_number} CPE Registrado : error, Asignando a ${user}`);
							alerta(`${key_number} CPE Registrado : error, Asignando a ${user}`, timer);
							await sleep(0.5);

							await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : CPE Registrado : Error*` })

							colorForIssue(i, "purple");

							continue;

						}

						if (testTelfRes["CpeRegistered"] !== "REGISTERED") {

							console.log(`Asignando : ${key_number} a ${user}`);
							alerta(`Asignando : ${key_number}`);
							await sleep(0.5);

							await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Asignado para revision, estado del CPE : ${CpeRegistered}*` })

							location.reload();

						} else {

							// TODO CORRECTO PARA EL CIERRE
							console.log(`Comentando : ${key_number}...`);
							alerta(`${key_number} : Comentando...`, timer);
							await sleep(0.5);

							if (Marca !== "PEPEPHONE") {
								//añadimos comentario con datos del fijo
								await addComentIssue(key_number, tablaradius, testFtth, fecha_test, telFijo, datosFijoRadius, `*ROBOT CIERRES : LINEA RECUPERA SERVICIO, SE RESUELVE TICKET*`);
							} else {
								//añadimos comentario sin datos del fijo
								await addComentIssue(key_number, tablaradius, testFtth, fecha_test, telFijo, false, `*ROBOT CIERRES : LINEA RECUPERA SERVICIO, SE RESUELVE TICKET*`);
							}

							console.log(`Cerrando : ${key_number}...`);
							alerta(`${key_number} : Procediendo a Cierre...`, timer);
							await sleep(0.5);

							//cerramos avería
							await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI);

							continue;

						}
					} else {

						//SI NO TIENE FIJO 
						logTest = undefined;
						console.log(`Comentando : ${key_number}...`);
						alerta(`${key_number}  : Comentando...`, timer);
						await sleep(0.5);

						const resComent = await addComentIssue(key_number, tablaradius, logTest, fecha_test, false, false, `*ROBOT CIERRES : LINEA RECUPERA SERVICIO, SE RESUELVE TICKET*`);

						console.log(`${key_number} Comentario añadido, procediendo al cierre`);
						alerta(`${key_number} Comentario añadido, procediendo al cierre`, timer);
						await sleep(0.5);

						await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI);

						colorForIssue(i, "darkgreen");

						console.log(`${key_number} Cerrada.`);
					}

				} else {

					console.log(`Asignando : ${key_number} a ${user}`);
					alerta(`Asignando : ${key_number}`);
					await sleep(0.5);
					
					await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

					await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : POTENCIA INCORRECTA, Asignando para revision*` })

					location.reload();
				}
			}
		}//FIN CIERRE 

	}//FIN BUCLE FOR
	await sleep(0.5);
	console.log("Reiniciando Proceso...");
	alerta('Sin averías validas para escalar, en pausa de 30 segundos hasta nuevo reinicio.', timer);

	try {
		var countTotal = parseInt($('.results-count-total')[0].innerText);
	} catch (error) {
		await sleep(30);
		location.reload();
	}

	var countTotal = parseInt($('.results-count-total')[0].innerText);
	var countStart = parseInt($('.results-count-start')[0].innerText);
	var countEnd = parseInt($('.results-count-end')[0].innerText);

}
revisar_key_numbers()
