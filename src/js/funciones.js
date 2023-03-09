/** creamos el objeto global swiss**/
var swiss = new Object();

swiss.manifestData = chrome.runtime.getManifest();
swiss.url_jarvis_masmovil = "https://jarvis.masmovil.com/includes/interfazajax.inc.php";
swiss.url_jarvis_zelenza = "https://jarvis.zelenza.com/includes/interfazajax.inc.php";
swiss.url_tgjira_pro = "https://tgjira.masmovil.com";
swiss.url_tgjira_pre = "https://jira-pre.service-dev.k8s.masmovil.com";
swiss.tgjira_pro_filter = "https://tgjira.masmovil.com/issues/?filter=26206";  //FILTRO DEL ROBOT DE CIERRES

swiss.issue_labels = [];

switch (window.location.pathname.split("/")[1]) {
  case "browse":
    swiss.contexto = "individual";
    break;
  case "secure":
    swiss.contexto = "dashboard";
    break;
  case "issues":
    swiss.contexto = window.location.search.match(new RegExp('[(\?|\&)]([^=]+)\=([^&#]+)'))[1] === "jql" ? "busqueda" : "filtro";
    break;
  default:
    break;
}

/** funcion para añadir paradas de tiempo en la ejecucion **/
const sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));

/** funcion para colorear las averías **/
const colorForIssue = (tabla, i, color) => {
  tabla[i].style.backgroundColor = color;//ROJO
  tabla[i].style.color = "white";
  tabla[i].style.backgroundColor = color; //ROJO
  tabla[i].style.color = "white";
}

/** funcion para comprobar si el numero es negativo **/
const is_negative_number = (number) => { return (number < 0) ? true : false; }

/** funcion para comprobar las horas a la que se para y no escala mas **/
const horarioRobot = (timeini, timefin, time) => {
  let tiempo = new Date(Date.now());
  const h = tiempo.getHours();

  switch (h) {
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
}

const horarioLocucion = (timeini, timefin, time) => {
  let tiempo = new Date(Date.now());
  const h = tiempo.getHours();

  switch (h) {
    //horas a la que se para y no envia mas locuciones
    case 22:
    case 23:
    case 00:
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
}

const locucion = async (telefonoDeContacto, seguridad, key_number) => {

  let now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  let _day = now.getUTCDate();
  let _month = now.getMonth();
  _month += 1;

  let year = now.getFullYear();
  let hour = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  let operadorC2C = "OTRO";

  _day = addZero(_day);
  _month = addZero(_month);
  hour = addZero(hour);
  minutes = addZero(minutes);
  seconds = addZero(seconds);

  let fechaDeLaLlamada = `${_day}/${_month}/${year}`;
  let horaDeLaLlamada = `${hour}:${minutes}:${seconds}`;
  //var horallamada_SQL = hoyano + "-" + str_pad(hoymes) + "-" + str_pad(hoydia) + " " + str_pad(hoyhora) + ":" + str_pad(hoyminutos) + ":" + str_pad(hoy.getSeconds());

  const timeInicio = "08:00";
  const timeFin = "22:00";
  let tiempo = new Date(Date.now());
  const h = tiempo.getHours();
  const m = tiempo.getMinutes();
  const time = `${h}:${m}`
  //comprobamos que estemos dentro del horario permitido para enviar las locuciones.
  const horario = horarioLocucion(timeInicio, timeFin, time);

  if (!horario) {
    const comentariolocucion = { body: `{panel:title=*ROBOT DE CIERRES :*|titleBGColor=#51A9C0}\nLocucion no enviada por estar fuera de horario(08:00 a 22:00)*{panel}` };

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
    myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(comentariolocucion),
    };
    return await fetch(`${swiss.url_tgjira_pro}/rest/api/2/issue/${key_number}/comment`, requestOptions);

  } else {

    switch (seguridad) {
      case "Yoigo":
        operadorC2C = "6";
        break;
      case "MásMóvil":
        operadorC2C = "7";
        break;

      default:
        break;
    }

    const urlC2C = "http://172.30.32.53:8180/ClicktoCall/CreateClicktoCall?";

    const queryC2Carry = {
      date: horaDeLaLlamada,
      idLista: operadorC2C,
      nombre: "Locucion",
      msisdn: telefonoDeContacto,
      lang: "1"
    };

    const v_Bars = 'directories=no, location=no, menubar=no, status=no,titlebar=no,toolbar=no';
    const v_Options = 'scrollbars=yes,resizable=no,Height=10,Width=10,left=100,top=100,visible=false,alwaysLowered=yes';
    const newWindow = window.open(urlC2C + $.param(queryC2Carry), 'PrintWin', v_Bars + ',' + v_Options);
    await sleep(1)
    newWindow.close();

    const comentariolocucion = { body: `{panel:title=*ROBOT DE CIERRES :*|titleBGColor=#51A9C0}\n*Se informa a cliente mediante locucion automatica en el TC: ${telefonoDeContacto} el dia ${fechaDeLaLlamada} a las ${horaDeLaLlamada} del cierre de la incidencia con evidencia de funcionamiento.*{panel}` };

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
    myHeaders.append("Content-Type", "application/json")
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(comentariolocucion),
    };
    return await fetch(`${swiss.url_tgjira_pro}/rest/api/2/issue/${key_number}/comment`, requestOptions)
  }
}

const insertarEnDiario = (averia, tipologia, fecha_creacion) => {

  data = `{\"class\":\"gestiones\",\"method\":\"insertarEnDiario\",\"params\":[\"${averia}\",\"${tipologia}\",\"${fecha_creacion}\",\"Buscada\",\"Resuelvo\",\"bboo.zelenza\",\"No Necesario\",\"Resuelvo\",\"SI\",\"No\"]}`;

  const xhr = new XMLHttpRequest()
  xhr.open("POST", "https://jarvis.zelenza.com/includes/interfazajax.inc.php", false)
  xhr.send(data)
}

//funcion similar a la anterior, pero deja un log en la consola
const showAlert = (title, timer, consola) => {

  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    imageUrl: 'https://jarvis.masmovil.com/img-jarvis/dedosgordos.gif',
    imageWidth: 200,
    imageHeight: 200,
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
  })
  Toast.fire({
    // icon: 'success',
    title: title
  }).then((result) => {
    if (result.value) {
    }
  })
  if (consola) { console.log(title); }
}

/** funcion para añadir un 0 en los numeros menores a 10 **/
const addZero = (i) => {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

const loginJira = async () => {

  return await fetch("https://tgjira.masmovil.com/login.jsp", {
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

  // var req = {};
  // var params = { 'usuario': usuario, 'password': password };
  // req.class = "jiraAPI";
  // req.method = "loginJira";
  // req.params = params;
  // const datos = JSON.stringify(req);

  // return await axios({
  //   method: "post",
  //   url: "https://192.168.98.26/proyectos/includes/interfazajax.inc.php",
  //   data: datos,
  //   processData: false,
  //   dataType: "json",
  // });
}

//funcion para extraer toda la informacion de la avería
const data_averia = (swiss) => {
  $.ajax({
    async: false,
    type: "GET",
    url: `${swiss.url_tgjira_pro}/rest/api/2/issue/${swiss.key_number}`,
    error: function (error) {
      console.log(error);

    },
    success: function (response) {
      swiss.response = response
    },
    timeout: 3000
  })
}

/** funcion para comentar los ticket **/
const comentarTicket = async (key_number, tokenBearer, comentario) => {

  const sendData = await fetch(swiss.url_tgjira_pro + "/rest/api/2/issue/" + key_number + "/comment", {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify(comentario),
    "method": "POST",
  });

  return sendData;
}

const actualizarAveria = async (key_number, tokenBearer) => {

  return await fetch(`${swiss.url_tgjira_pro}/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "accept-language": "en,es-ES;q=0.9,es;q=0.8",
      "content-type": "application/json",
      "Cookie": "visid_incap_2600688=ECDxpcp7Qu2x4K/rhI9o76TPT2MAAAAAQUIPAAAAAAD98aMP7n3WcrxOHR0nz/Ak",
    },
    "body": JSON.stringify({ "transition": { "id": "301" }, }),
    "method": "POST",
  }).then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

const changeStatusToInProgress = async (key_number, tokenBearer) => {

  return await fetch(`${swiss.url_tgjira_pro}/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "accept-language": "en,es-ES;q=0.9,es;q=0.8",
      "content-type": "application/json",
      "Cookie": "visid_incap_2600688=ECDxpcp7Qu2x4K/rhI9o76TPT2MAAAAAQUIPAAAAAAD98aMP7n3WcrxOHR0nz/Ak",
    },
    "body": JSON.stringify({ "transition": { "id": "21" }, }),
    "method": "POST",
  }).then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

const asignarAveria = async (key_number, tokenBearer, userToAssingee) => {

  return await fetch(`${swiss.url_tgjira_pro}/rest/api/2/issue/${key_number}/assignee`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify({ "name": userToAssingee }),
    "method": "PUT",
  }).then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
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

const comprobarEtiqueta = (labels, etiquetaBuscada) => {
  if (labels.indexOf(etiquetaBuscada) !== -1) { return true } else { return false }
}

const consultaRadius = async (provisioning_code, iua) => {

  //añadimos / en los pcode donde es necesario
  const iua_2 = iua.slice(0, 1)
  if (iua_2 === "Z") {
    provisioning_code = `${provisioning_code}/`
  }

  let req = {};
  let params = provisioning_code;
  req.class = "radiusAPI";
  req.method = "consultaRadius";
  req.params = params;
  const datos = JSON.stringify(req);

  return await axios({
    method: "post",
    url: swiss.url_jarvis_masmovil,
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
    url: swiss.url_jarvis_masmovil,
    data: datos,
    processData: false,
    dataType: "json",
  });
}

const commentRadius = (claves, ultimoRegistro) => {
  //dentro de las claves vienen las claves que se quedaran en testresumen
  let testRadiusRes = {};
  let acctstatus = ultimoRegistro["AcctStatusType"];

  //asigno sobre las claves que quiero mantener los valores del test de radius 
  for (const item of claves) { testRadiusRes[item] = ultimoRegistro[item]; }

  // crear comentario para pegar
  let keys = Object.keys(testRadiusRes);
  let vals = Object.values(testRadiusRes);
  let cabecerasTestRadius = "||" + keys.join("||") + "||Status||";
  let radiusvalues = "|";
  let statusColor = (acctstatus === "Stop") ? "#F7D6C1" : "#86CB5D"

  for (let item of vals) item === null ? radiusvalues += "nulo|" : radiusvalues += item + "|";

  radiusvalues += (acctstatus === "Stop") ? "{color:#F7D6C1" : "{color:#86CB5D" + `}*${acctstatus}*{color}|`;

  let comentarioRadius = `{panel:title=*RADIUS :*|titleBGColor=${statusColor}}\n${cabecerasTestRadius}\n${radiusvalues}\n{panel}`;

  return { 'testRadiusRes': testRadiusRes, 'comentarioradius': comentarioRadius, 'acctstatus': acctstatus };
}

const commentFtth = (claves, testFtth) => {
  //dentro de las claves vienen las claves que se quedaran en testresumen
  let testFtthRes = {};

  for (const item of claves) {
    i = testFtth.resultado.datos.outputParam.find(e => e.key === item);
    testFtthRes[i.key] = parseInt(i.value);
  }

  let keys = Object.keys(testFtthRes);
  let vals = Object.values(testFtthRes);
  let cabecerasTestFTTH = "||" + keys.join("||") + "||";
  let tablaFTTH = "|";

  for (let item of vals) item === null ? tablaFTTH += "nulo|" : tablaFTTH += item + "|";

  let comentarioFTTH = `{panel:title=*TEST FTTH / Fecha del Test: ${testFtth.fecha}*}${cabecerasTestFTTH}\n${tablaFTTH}\n{panel}`;

  return { 'testFtthRes': testFtthRes, 'comentarioFTTH': comentarioFTTH, 'ont_potencia_rx': testFtthRes["ont_potencia_rx"], 'olt_potencia_rx': testFtthRes["olt_potencia_rx"] };
}

const commentTelf = (claves, TestFijo) => {
  let testTelfRes = {};

  for (const item of claves) { testTelfRes[item] = TestFijo.data.estado[item]; }

  let keys = Object.keys(testTelfRes);
  let vals = Object.values(testTelfRes);
  let testPanelFijo = "{panel:title=*ESTADO FIJO*}";
  let cabecerasTestTelf = "||" + keys.join("||") + "||";
  let tablaTestTelf = "|";

  for (let item of vals) item === null ? tablaTestTelf += "nulo|" : tablaTestTelf += item + "|";

  tablaTestTelf += `|`;

  let comentarioTelf = `{panel:title=*ESTADO FIJO :*}${cabecerasTestTelf}\n${tablaTestTelf}\n{panel}`;

  return { 'testTelfRes': testTelfRes, 'comentarioTelf': comentarioTelf, 'CpeRegistered': testTelfRes["CpeRegistered"] };
}

const comentarAveria = async (averia, tokenBearer, comentarioTelf, comentarioFTTH, comentarioRadius, comentario) => {
  //si viene sin comentario se añade el tipico de cierres
  comentario = (typeof comentario !== 'string') ? '*ROBOT CIERRES : LINEA RECUPERA SERVICIO, SE RESUELVE TICKET*' : comentario;
  //son paneles si se añade el comentario undefined no se pega el test
  let comment = "";
  comment += comentarioTelf ? comentarioTelf + "\n" : "";
  comment += comentarioFTTH ? comentarioFTTH + "\n" : "";
  comment += comentarioRadius ? comentarioRadius + "\n" : "";
  comment += `{panel:title=*COMENTARIO :*|titleBGColor=#FDA321}\n${comentario}{panel}`;

  const datos = { body: comment };

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${swiss.url_tgjira_pro}/rest/api/2/issue/${averia}/comment`,
    headers: {
      'Authorization': "Bearer " + tokenBearer,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(datos)
  };

  await axios(config)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      return error;
    });
}

const cierre_ftth = async (key_number, tokenBearer, flagPasoFSM, etiquetaAI, marca, telefonoDeContacto) => {

  //cierra la averia indicando si ha pasado por fsm o no y si tiene etiqueta #AI o no

  let body = {
    "transition": {
      "id": "31"
    }, "fields": {
      "customfield_10403": "LINEA RECUPERA SERVICIO, SE RESUELVE TICKET", //detalle de la solucion -- texto libre
      "customfield_10517": [{ "key": "CAT-13174" }] //Categoría de Cierre -- Avería Desaparecida
    }
  };

  //Subcategoría de Cierre -- Resuelto con visita sin actuación CAT-13026 Resuelto sin visita sin actuación	CAT-13025
  body["fields"]["customfield_10518"] = [{ "key": flagPasoFSM === true ? "CAT-13026" : "CAT-13025" }];

  //Abierto Incorrectamente -- value 12401 = NO value 12452 = SI
  body["fields"]["customfield_14015"] = { "value": etiquetaAI ? "Si" : "No" };

  // Motivo Abierta Incorrectamente -- ATC-36782 = Pruebas incompletas
  // solo se incluye si hay etiqueta #AI
  if (etiquetaAI) body["fields"]["customfield_14616"] = [{ "key": "ATC-36792" }];

  //"customfield_10507": { "value": "No" }, //ACTUACION DEL TECNICO VALUE 14410 = NO VALUE 14411 = SI
  //"customfield_10508": { "value": "No" }, //FACTURABLE VALUE 10310 = NO VALUE 10309 = SI

  return await fetch(`${swiss.url_tgjira_pro}/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify(body),
    "method": "POST",
  }).then(response => response.text())
    .then(async result => {

      //mandamos locucion
      console.log(`${key_number} Enviando locucion...`)
      title = `${key_number} Enviando locucion...`
      showAlert(title, 90000);
      await sleep(0.5);
      await locucion(telefonoDeContacto, marca, key_number);

      title = `AVERIA_${key_number} Averia Cerrada`;
      showAlert(title, 12000);
      await sleep(0.5);
    }).catch(error => console.log('error', error));
}

const testFtthLaunch = (iua, swiss) => {

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
      url: swiss.url_jarvis_masmovil,
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

const insert_DB = (usuario, averia, fecha_creacion, accion_robot, fecha_escalado, tipologia, tecnologia, fecha_inicio, fecha_fin, robot) => {

  var req = {};
  var params = [usuario, averia, fecha_creacion, accion_robot, fecha_escalado, tipologia, tecnologia, fecha_inicio, fecha_fin, robot];

  req.class = "gestiones";
  req.method = "insert_DB";
  req.params = params;

  $.ajax({
    async: false,
    url: "https://jarvis.zelenza.com/includes/interfazajax.inc.php",
    type: "POST",
    data: JSON.stringify(req),
    processData: false,
    dataType: "json"
  }).done(function (response) {
    console.log("actualizada en la BBDD");
  }).fail(function (data, textStatus, xhr) {
    console.log(textStatus);
    console.log(data.responseText);
    //This shows status code eg. 403
    console.log("error", data.status);
    //This shows status message eg. Forbidden
    console.log("STATUS: " + xhr);
  })
}

/** funcion para determinar la duracion de los cortes **/
const setCutTime = () => {
  var cortesTime = $("#cortestime").val();
  switch (cortesTime) {
    case '6h':
      cortesTime = '05:58:00';
      break;
    case '12h':
      cortesTime = '11:58:00';
      break;
    case '14h':
      cortesTime = '13:58:00';
      break;
    case '16h':
      cortesTime = '15:58:00';
      break;
    case '18h':
      cortesTime = '17:58:00';
      break;
    case '20h':
      cortesTime = '19:58:00';
      break;
    case '24h':
      cortesTime = '23:58:00';
      break;
    default:
      break;
  }
  localStorage.setItem("tiempoCortes", cortesTime);
}


