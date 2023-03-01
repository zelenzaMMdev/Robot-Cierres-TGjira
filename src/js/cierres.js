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
tokenBearer = "NjgyODU3MzAzMjQyOvHTcfsSRzQ2ZHfTV0TFnGgRVauZ"

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

	//const tabla = $('tbody tr'); //array
	const tabla  = $("#issuetable tr.issuerow");
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
		const tecnologia = $('.customfield_12326')[i].innerText; //customfield_12326 PRO customfield_12331 PRE
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
		let flagOKradius = false,flagOKftth = false,flagOKphone = false;

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
				for (let e = 1; e < $(".customfield_16525:eq("+i+") table tbody tr").length; e++) {
					if($(".customfield_16525:eq("+i+") table tbody tr:eq("+e+") td:eq(1)")[0].innerText==="FSM" && $(".customfield_16525:eq("+i+") table tbody tr:eq("+e+") td:eq(3)")[0].innerText ==="El ticket se ha registrado correctamente") flagPasoFSM = true
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
				num_reiteros = parseInt(res_regex[0][2])
		} catch (error) {
			alerta(`${key_number} : sin descripcion de reiterado`, timer);
		}

		//si la averia tiene reitero > 0, osea, esta reiterada, se omite
		if (num_reiteros > 0) {
			alertador(`Averia ${key_number} Reiterada ${num_reiteros} saltando a la siguiente`,timer,true); await sleep(0.5);
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

		
		alertador(`${key_number} Comprobando estado en radius...`,timer,true); await sleep(0.5);

		try {
			var _consultaRadius = await consultaRadius(provisioning_code, iua);
			responseConsultaRadius = true;
		} catch (error) {
			responseConsultaRadius = false;
		}

		responseConsultaRadius = _consultaRadius.data.data;

		if (!responseConsultaRadius || responseConsultaRadius === undefined) {

			alertador(`${key_number}: Asignando Avería...`,timer,true); await sleep(0.5);

			await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

			await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Sin registros en Radius de este cliente*` })

			alertador(`${key_number} ASIGNADA PARA SU REVISION`,timer,true); await sleep(1);

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
		//creo comentario de radius
		//dejo unicamente las partes del test que me interesan
		let claves = ["fecha","fecha_fin","UserName","duration","FramedAddress","NatIpAddress","Host"]
		//contiene testRadiusRes con el resumen de las claves escogidas del test , comentarioradius con el comentario para jira, acctstatus con el ultimo estado para radius
		let comentarioradius = commentradius(claves, ultimoRegistro);
		
		//si ultimo registro de radius esta en stop pasamos a la siguiente
		if(comentarioradius["acctstatus"] == "Stop"){
			alertador(`${key_number} ESTADO RADIUS ${comentarioradius["acctstatus"]}`,timer,true); await sleep(0.2);
			continue;
		}

		//TODO modificado para pruebas
		//si la fecha de creacion de la averia es posterior a la ultima sesion de radius y esta es start o alive quiere decir que puede ser un cruce o un no navega cable
		/*if(Date.parse(fecha_creacion) > Date.parse(comentarioradius["testRadiusRes"]["fecha"]) && (comentarioradius["acctstatus"] === "Start" || comentarioradius["acctstatus"] === "Alive")){
			alertador(`${key_number} fecha radius anterior a creacion averia`,timer,true); await sleep(0.5);
			continue;
		}*/

		alertador(`${key_number} estado en radius: ${comentarioradius["acctstatus"]}`,timer,true); await sleep(0.5);

		if (comentarioradius["acctstatus"] === "Start" || comentarioradius["acctstatus"] === "Alive") {
			// OK RADIUS
			flagOKradius = true;
			let testFtth = "sin test"
			//si es neba o vula no se lanza test
			if(tecnologia === "FTTH"){
				
				alertador(`${key_number}  : Lanzando Test FTTH...`,timer,true); await sleep(0.5);

				testFtth = await testFtthLaunch(iua, swiss);

				//si no hay test se pasa a la siguiente averia
				if (testFtth === null || testFtth === "sin test") {
					continue;
				}
			}

			if (testFtth !== "sin test") {

				let claves = ["olt_potencia_rx","olt_potencia_tx","ont_potencia_rx","ont_potencia_tx"]
				//devuelve testFtthRes, comentarioFTTH,ont_potencia_rx,olt_potencia_rx
				let comentarioftth = commentftth(claves, testFtth)

				console.log(`${key_number} Comprobando resultados del TEST FTTH`);

				//si el valor de potencia es menor a lo que nos indique operativa estara correcto
				if (comentarioftth["olt_potencia_rx"] < 29 && comentarioftth["ont_potencia_rx"] < 29) {

					flagOKftth = true

					if (Marca !== "PEPEPHONE") {

						alertador(`${key_number} : Test Correcto, Comprobando estado del Fijo...`,timer,true); await sleep(0.5);

						const TestFijo = await consultaFijoRadius(telFijo);
						let comentarioTelf = undefined
						try {

							let claves = ["CpeRegistered","ENUM","ExistsIMS","Portability","Route","XenaStaus"]
							comentarioTelf = commentTelf(claves, TestFijo)


						} catch (error) {

							alertador(`${key_number} CPE Registrado : error, Asignando a ${user}`,timer,true); await sleep(0.5);

							await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : CPE Registrado : Error*` })

							colorForIssue(i, "purple");

							continue;

						}

						if (comentarioTelf["CpeRegistered"] !== "REGISTERED") {

							alertador(`Asignando : ${key_number} a ${user}`,timer,true); await sleep(0.5);

							await asignarAveria(key_number, tokenBearer, "alfonso.asenjo@asesormasmovil.es");

							await comentarTicket(key_number, tokenBearer, { body: `*ROBOT CIERRES : Asignado para revision, estado del CPE : ${CpeRegistered}*` })

							location.reload();

						} else {
							// TODO CORRECTO PARA EL CIERRE
							alertador(`Comentando : ${key_number}...`,timer,true); await sleep(0.5);

							if (Marca !== "PEPEPHONE") {
								//añadimos comentario con pruebas de cierre, son paneles si se añade el comentario undefined no se pega el test
								await comentarAveria(key_number, tokenBearer, comentarioTelf["comentarioTelf"], comentarioftth["comentarioFTTH"],comentarioradius["comentarioradius"],undefined)

							} else {
								//añadimos comentario sin datos del fijo
								await comentarAveria(key_number, tokenBearer, undefined, comentarioftth["comentarioFTTH"],comentarioradius["comentarioradius"],undefined)
							}

							alertador(`Cerrando : ${key_number}...`,timer,true); await sleep(0.5);

							//cerramos avería
							await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI);

							continue;

						}
					} else {

						//SI NO TIENE FIJO 
						logTest = undefined;

						alertador(`Comentando : ${key_number}...`,timer,true); await sleep(0.5);

						await comentarAveria(key_number, tokenBearer, undefined, comentarioftth["comentarioFTTH"],comentarioradius["comentarioradius"],undefined)

						alertador(`${key_number} Comentario añadido, procediendo al cierre`,timer,true); await sleep(0.5);

						await cierre_ftth(key_number, tokenBearer, flagPasoFSM, etiquetaAI);

						colorForIssue(i, "darkgreen");

						console.log(`${key_number} Cerrada.`);
					}

				} else {

					alertador(`Asignando : ${key_number} a ${user}`,timer,true); await sleep(0.5);

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
