if (window.location.href.indexOf("https://jira.masmovil.com/secure/Dashboard.jspa") > -1 || window.location.href === "https://jira.masmovil.com/secure/Dashboard.jspa") {

	var token = $("#atlassian-token").attr('content');
	sessionStorage.setItem("tokenJira", token);

	//$('head').append('	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">')
	//$('head').append('<script src="https://cdn.jsdelivr.net/npm/sweetalert2@9"></script>')
	//$('.aui-header-primary ul').append('<button type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Open Modal</button>')

	// $('.aui-header-primary ul').append('<a class="aui-button aui-button-primary" id="cierres"><img src="http://www.jarvis.alalzagestion.com/img-jarvis/minilogo.png" style="width: 15px; height: 20px;" > R P A </a>');

	// $('.aui-page-header-inner').append("<p id='pluginVersion'>J.A.R.V.I.S. v 1.2.0</p>");
	// $('#pluginVersion').css({ "float": "right" });
	//$('.aui-header-primary ul').append('<a class="aui-button aui-button-primary" id="iniProce"><img src="http://www.jarvis.alalzagestion.com/img-jarvis/minilogo.png" style="width: 15px; height: 20px;" > Migraciones Neba/Vula</a>');

	function setCutTime() {
		var cortesTime = $("#cortestime").val();
		switch (cortesTime) {
			case '6h':
				cortesTime = '05:58:00'
				break;
			case '12h':
				cortesTime = '11:58:00'
				break;
			case '14h':
				cortesTime = '13:58:00'
				break;
			case '16h':
				cortesTime = '15:58:00'
				break;
			case '18h':
				cortesTime = '17:58:00'
				break;
			case '20h':
				cortesTime = '19:58:00'
				break;
			case '24h':
				cortesTime = '23:58:00'
				break;
			default:
				break;
		}
		localStorage.setItem("tiempoCortes", cortesTime);
	}

	//$('#system-help-menu').css("display:", "flex")
	$("#cierres").on("click", async function () {
		"use strict";

		const swalWithBootstrapButtons = Swal.mixin({
			customClass: {
				confirmButton: 'btn btn-success btn-lg',
				cancelButton: 'btn btn-info btn-lg'
			},
			buttonsStyling: false
		})

		swalWithBootstrapButtons.fire({
			title: 'Menu de Seleccion',
			text: 'Selecciona la tarea a realizar',
			imageUrl: 'http://www.jarvis.alalzagestion.com/img-jarvis/zelenza.png',
			imageWidth: 300,
			imageHeight: 100,
			imageAlt: 'Custom image',
			showCancelButton: true,
			confirmButtonText: 'Cierres',
			cancelButtonText: 'Escalados',
			footer: '<p>By departamento de desarrollo <a href="www.jarvis.alalzagestion.com" target="_blank">2020 ©Zelenza</a></p>',
			reverseButtons: true
		}).then((result) => {
			if (result.value) {
				//adsl
				menuCierres();
			} else if (
				/* Read more about handling dismissals below */
				result.dismiss === Swal.DismissReason.cancel
			) {
				menuEscalados()
			}
		})
		$('.swal2-actions').css({ "justify-content": "space-evenly", "width": "80%" })
	});

	async function menuEscalados() {

		const inputOptions = new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					'xDSL': 'ESCALAR INCOMUNICADOS DE ADSL',
					'Neba': 'ESCALAR INCOMUNICADOS DE NEBA',
					'FTTH': "ESCALAR INCOMUNICADOS DE FTTH",
					'ADSL_FTTH': "ESCALAR INCOMUNICADOS FTTH Y ADSL"
				})
				$('.swal2-popup').css({ "width": "51em" })
			}, 1000)
		})

		const { value: tipo } = await Swal.fire({
			title: 'Menu de Selección Escalados',
			input: 'radio',
			showCancelButton: true,
			inputOptions: inputOptions,
			inputValidator: (value) => {
				if (!value) {
					return 'Selecciona algo!'
				}
			},
			html: '',
			cancelButtonText: 'Cancelar',
		})
		switch (tipo) {
			case 'xDSL':
				Swal.fire({ html: `Procediendo al escalado de averias tipo: ${tipo}` })
				window.open('https://jira.masmovil.com/issues/?filter=57586', "", "width=1515, height=750", "Top")
				break;
			case 'Neba':
				Swal.fire({ html: `Procediendo al escalado de averias tipo: ${tipo}` })
				window.open('https://jira.masmovil.com/issues/?filter=57587', "", "width=1515, height=750", "Top")
				break;
			case 'FTTH':
				Swal.fire({ html: `Procediendo al escalado de averias tipo: ${tipo}` })
				window.open('https://jira.masmovil.com/issues/?filter=57585', "", "width=1515, height=750", "Top")
				break;
			case 'ADSL_FTTH':
				Swal.fire({ html: `Procediendo al escalado de averias tipo: ${tipo}` })
				window.open('https://jira.masmovil.com/issues/?filter=54338', "", "width=1515, height=750", "Top")
				break;

			default:
				break;
		}
	}

	async function menuCierres() {
		const inputOptions = new Promise((resolve) => {
			setTimeout(() => {
				resolve({
					'xDSL': 'ADSL(INCOMUNICADOS Y CORTES)',
					'Neba': 'INCOMUNICADOS NEBA',
					'Todo': 'ACTIVAR TODO',
				})
				$('.swal2-popup').css({ "width": "41em" })
			}, 1000)
		})

		const { value: tipo } = await Swal.fire({
			title: 'Menu de Selección',
			input: 'radio',
			showCancelButton: true,
			inputOptions: inputOptions,
			inputValidator: (value) => {
				if (!value) {
					return 'Selecciona algo!'
				}
			},
			html: '<h3>Tiempo de estabilidad (solo para ADSL y TODO)</h3><div class="input-group"><select class="swal2-select" id="cortestime"><option>6h</option><option>12h</option><option>16h</option><option>18h</option><option>20h</option><option>24h</option></select></div><h3>Potencia (solo para ADSL)</h3><div class="input-group"><select class="swal2-select" id="fuerza"><option>1</option><option>2</option><option>3</option></select></div>',
			cancelButtonText: 'Cancelar',
		})

		if (tipo === "xDSL") {
			var fuerza = $('#fuerza').val();
			switch (fuerza) {
				case '1':

					setCutTime()
					window.open('https://jira.masmovil.com/issues/?filter=55127', "", "width=1515, height=750", "Top")
					break;
				case '2':

					setCutTime()
					window.open('https://jira.masmovil.com/issues/?filter=55127', "", "width=780, height=750", "Top")
					window.open('https://jira.masmovil.com/issues/?filter=55127&startIndex=150', "", "width=750, height=750, Left=800")

					break;
				case '3':

					setCutTime()
					window.open('https://jira.masmovil.com/issues/?filter=55127', "", "width=780, height=350", "Top")
					window.open('https://jira.masmovil.com/issues/?filter=55127&startIndex=50', "", "width=780, height=400, Top=500")
					window.open('https://jira.masmovil.com/issues/?filter=55127&startIndex=100', "", "width=750, height=750, Left=800")
					break;

				default:
					break;
			}

		} else if (tipo === "Neba") {
			window.open('https://jira.masmovil.com/issues/?filter=57551', "", "width=2000, height=800", "Top")
		} else if (tipo === "Todo") {
			setCutTime()
			window.open('https://jira.masmovil.com/issues/?filter=55127', "", "width=780, height=340", "Top")
			window.open('https://jira.masmovil.com/issues/?filter=55127&startIndex=150', "", "width=780, height=340, Top=400")
			//window.open('https://jira.masmovil.com/issues/?filter=55127&startIndex=200', "", "width=750, height=340, Left=800")
			window.open('https://jira.masmovil.com/issues/?filter=57551', "", "width=750, height=340 Left=800 Top= 400")

		}
	}

	//var tecnologia = $('#issuedetails').children(1).children(1).children(1).children(1).attr("title").substring(8, 12);
	var administrativo = $('#customfield_10221-val').text().trim();
	var idservicio = $('#customfield_10334-val').text().trim();
	var numeroOT = $('#customfield_10004-val').text().trim();
	var movilcliente = $('#customfield_10314-val').text().trim();
	var operador = $('#customfield_11133-val').text().trim();
	var seguridad = $("#security-val").text().trim();
	var iua = $("#customfield_10268-val").text().trim();
	var vlan = $('#customfield_10902-val').text().trim();
	var vlanneba = $('#customfield_15800-val').text().trim();
	var numaveria = $('meta[name=ajs-issue-key]').attr("content");
	var usuario = $('meta[name=ajs-remote-user]').attr('content');
	var poblacion = $('#customfield_10331-val').text().trim();
	var estado = $('#status-val').text().trim();
	var tipoaveria = $('#type-val').text().trim();
	var codigo_postal = $('#customfield_10373-val').text().trim();
	var hijoneba = $('#issuedetails').children(1).children(1).children(1).children(1).attr("title").substring(9, 19);
	var hijoFTTH = $('#issuedetails').children(1).children(1).children(1).children(1).attr("title").substring(1, 23);
	var hijoADSL = $('#issuedetails').children(1).children(1).children(1).children(1).attr("title").substring(0, 23);
	var propietario = $("#customfield_15732-val").text().trim();
	var pcode = $("#customfield_10902-val").text().trim();
	var pcodeNeba = $("#customfield_15800-val").text().trim();
	var motivoave = $("#customfield_10026").text().trim();
	var nombrecliente = $("#customfield_10323-val").text().trim();
	var apellido1cliente = $("#customfield_10324-val").text().trim();
	var apellido2cliente = $("#customfield_10325-val").text().trim();
	var direccion = $("#customfield_10269-val").text().trim();
	var telfijo = $("#customfield_12114-val").text().trim();
	//var token = $("#atlassian-token").attr('content');
	var accion = $("#status-val").text().trim();
}

function closeCurrentWindow() {
	window.close();
}


//console.log($('tbody tr'));
// if (window.location.href.indexOf("https://jira.masmovil.com/browse/") > -1) {
// 	function ready(callback) {
// 		//in case the document is already rendered
// 		if (document.readyState != 'loading') callback();
// 		// modern browsers
// 		else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
// 		// IE <= 8
// 		else document.attachEvent('onreadystatechange', function () {
// 			if (document.readyState == 'complete') callback();
// 		});
// 	}
// 	ready(async function () {
// 		//var URLactual = window.location;
// 		//URLactual.close()
// 		var ave = $('tbody tr td.stsummary a'); //array
// 		if ($('tbody tr td.stsummary a')[0].dataset.issueKey !== "undefined") {
// 			var ticketHijo = ave[0].dataset.issueKey;
// 		} else {
// 			//closeCurrentWindow();
// 		}
// 		//var ticketHijo = ave[0].dataset.issueKey;
// 		//window.open("https://jira.masmovil.com/browse/" + ticketHijo, + "", "width=300, height=200"); 
// 		if (ticketHijo !== "") {
// 			// var settings = {
// 			// 	"url": "https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=" + rel + "&action=11&atl_token=" + token + "&decorator=dialog&inline=true",
// 			// 	"method": "GET",
// 			// 	"headers": {
// 			// 	},
// 			// };
// 			// $.ajax(settings).done(function (response) {
// 			// 	//console.log(response);
// 			// 	//closeCurrentWindow();
// 			// });
// 			//await sleep(6);
// 			//closeCurrentWindow();
// 		}
// 		//await sleep(6);
// 		//closeCurrentWindow();
// 	});
// }