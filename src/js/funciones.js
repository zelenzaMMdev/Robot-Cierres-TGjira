/** creamos el objeto global swiss**/
var swiss = new Object();

swiss.manifestData = chrome.runtime.getManifest();
swiss.url_server_jarvis_masmovil = "https://jarvis.masmovil.com/includes/interfazajax.inc.php";
swiss.url_server_jarvis_zelenza = "https://jarvis.zelenza.com/includes/interfazajax.inc.php";
swiss.url_api_tgjira_pro = "https://tgjira.masmovil.com/rest/api/2/issue/";
swiss.url_api_tgjira_pre = "https://jira-pre.service-dev.k8s.masmovil.com/rest/api/2/issue/";
swiss.url_server_local_2 = "https://192.168.98.26/proyectos/includes/interfazajax.inc.php";
swiss.url_server_pc_local = "https://127.0.0.1/zelenza-jarvis/includes/interfazajax.inc.php";
//swiss.url_server_pc_local = "https://localhost/jarvisnew/includes/interfazajax.inc.php";

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

const sleep = secs => new Promise(resolve => setTimeout(resolve, secs * 1000));

const colorForIssue = (i, color) => {
  $(".customfield_10902")[i].style.backgroundColor = color;//ROJO
  $(".customfield_10902")[i].style.color = "white";
  $(".customfield_15800")[i].style.backgroundColor = color; //ROJO
  $(".customfield_15800")[i].style.color = "white";
}

const is_negative_number = (number) => {
  if ((number < 0)) {
    return true;
  } else {
    return false;
  }
}

const isbetween = (timeini, timefin, time) => {
  let tiempo = new Date(Date.now());
  const h = tiempo.getHours();

  switch (h) {
    //horas a la que se para y no escala mas
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

const isbetween_2 = (timeini, timefin, time) => {
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
  const time = `${h}:${m}`
  //comprobamos que estemos dentro del horario permitido para enviar las locuciones.
  const horario = isbetween_2(timeini, timefin, time);

  if (!horario) {
    const comentariolocucion = { body: `*ROBOT VALIDACIONES N1 A CONTRATA -- Locucion no enviada por estar fuera de horario(08:00 a 22:00)*` };

    const myHeaders = new Headers();
    myHeaders.append("X-Requested-With", "XMLHttpRequest");
    myHeaders.append("Accept-Language", "es-ES,es;q=0.9");
    myHeaders.append("Content-Type", "application/json")
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(comentariolocucion),
    };
    return await fetch(`https://jira.masmovil.com/rest/api/2/issue/${averia}/comment`, requestOptions);

  } else {

    switch (seguridad) {
      case "YOIGO":
        operadorC2C = "6";
        break;
      case "MÁSMÓVIL":
        operadorC2C = "7";
        break;

      default:
        break;
    }

    const urlC2C = "http://172.30.32.53:8180/ClicktoCall/CreateClicktoCall?";

    const queryC2Carry = {
      date: horallamada,
      idLista: operadorC2C,
      nombre: "Locucion",
      msisdn: movil,
      lang: "1"
    };

    const v_Bars = 'directories=no, location=no, menubar=no, status=no,titlebar=no,toolbar=no';
    const v_Options = 'scrollbars=yes,resizable=no,Height=10,Width=10,left=100,top=100,visible=false,alwaysLowered=yes';
    const newWindow = window.open(urlC2C + $.param(queryC2Carry), 'PrintWin', v_Bars + ',' + v_Options);
    await sleep(1)
    newWindow.close();

    const comentariolocucion = { body: `*ROBOT VALIDACIONES N1 A CONTRATA -- Se informa a cliente mediante locucion automatica, se cierra incidencia con evidencia de funcionamiento. Informamos a cliente en ${movil} hora de llamada ${horallamada}*` };

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

  // const pepe = { "data": "NO" };
  // return pepe;
}

const actualizarEtiqueta_2 = async (numaveria, etiqueta) => {

  var url = `https://jira.masmovil.com/rest/api/2/issue/${numaveria}`;

  $.ajax({
    async: false,
    type: "PUT",
    url: url,
    data: JSON.stringify({ "update": { "labels": [{ "add": etiqueta }] } }),
    headers: {
      "content-Type": "application/json",
      "Accept-Language": "es-ES,es;q=0.9",
      "X-Requested-With": "XMLHttpRequest"
    }
  }).done(async function (data, textStatus, xhr) {

    console.log("Etiqueta Añadida");

  }).fail(async function (data, textStatus, xhr) {

    console.log(textStatus);
    console.log(data.responseText);
    //This shows status code eg. 403
    console.log("error", data.status);
    //This shows status message eg. Forbidden
    console.log("STATUS: " + xhr);
  })
}

const actualizarEtiqueta = async (averia) => {

  var url = `https://jira.masmovil.com/rest/api/2/issue/${averia}`;
  var fechaInicio = new Date();

  $.ajax({
    async: false,
    type: "PUT",
    url: url,
    data: JSON.stringify({ "update": { "labels": [{ "add": "#PENDIENTE_CONTRATA_N1" }] } }),
    headers: {
      "content-Type": "application/json",
      "Accept-Language": "es-ES,es;q=0.9",
      "X-Requested-With": "XMLHttpRequest"
    }
  }).done(async function (data, textStatus, xhr) {

    console.log("Etiqueta añadida");

  }).fail(async function (data, textStatus, xhr) {

    console.log(textStatus);
    console.log(data.responseText);
    //This shows status code eg. 403
    console.log("error", data.status);
    //This shows status message eg. Forbidden
    console.log("STATUS: " + xhr);

    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Fallo al realizar la accion solicitada',
      footer: 'By Departamento de Desarrollo @Zelenza 2020',
    })

  })
}

const insertarEnDiario = (averia, tipologia, fecha_creacion) => {

  data = `{\"class\":\"gestiones\",\"method\":\"insertarEnDiario\",\"params\":[\"${averia}\",\"${tipologia}\",\"${fecha_creacion}\",\"Buscada\",\"Resuelvo\",\"bboo.zelenza\",\"No Necesario\",\"Resuelvo\",\"SI\",\"No\"]}`;

  const xhr = new XMLHttpRequest()
  xhr.open("POST", "https://jarvis.zelenza.com/includes/interfazajax.inc.php", false)
  xhr.send(data)
}

function alerta(title, timer) {
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    imageUrl: 'https://jarvis.masmovil.com/img-jarvis/dedosgordos.gif',
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
//funcion similar a la anterior, pero deja un log en la consola
async function alertador (title, timer = 120000, consola = true) {
  
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    imageUrl: 'https://jarvis.masmovil.com/img-jarvis/dedosgordos.gif',
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
  if(consola == true){ console.log(title);}
}

function addZero(i) {
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
    url: `${swiss.url_api_tgjira_pro}${swiss.key_number}`,
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

  const sendData = await fetch(swiss.url_api_tgjira_pre + key_number + "/comment", {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify(comentario),
    "method": "POST",
  });

  return sendData;
}


const changeStatusToInProgress = async (key_number, tokenBearer) => {

  return await fetch(`https://jira-pre.service-dev.k8s.masmovil.com/rest/api/latest/issue/${key_number}/transitions`, {
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

  averia = "ATC-14205";
  return await fetch(`https://jira-pre.service-dev.k8s.masmovil.com/rest/api/2/issue/${key_number}/assignee`, {
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

const modificar_etiqueta = async (data) => {

  swal.fire(`AVERÍA REITERADA, MODIFICANDO ETIQUETA</br > ESPERE POR FAVOR...`, "", "warning");

  var url = "https://jira.masmovil.com/secure/AjaxIssueAction.jspa?decorator=none";

  $.ajax({
    type: "POST",
    url: url,
    data: data,
    headers: {
      "content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept-Language": "es-ES,es;q=0.9",
      "X-Requested-With": "XMLHttpRequest"
    }
  }).done(async function (data, textStatus, xhr) {

    console.log("Etiqueta Añadida");

  }).fail(async function (data, textStatus, xhr) {

    console.log(textStatus);
    console.log(data.responseText);
    //This shows status code eg. 403
    console.log("error", data.status);
    //This shows status message eg. Forbidden
    console.log("STATUS: " + xhr);

  })
}

async function quitarAsignacion(rel, token) {

  let xhr = new XMLHttpRequest();

  data = `inline=true&decorator=dialog&id=${rel}&assignee=&comment=&commentLevel=&atl_token=${token}`

  xhr.open("POST", "https://jira.masmovil.com/secure/AssignIssue.jspa", false);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.send(data);

  if (xhr.readyState === 4 && xhr.status === 200) { return true; } else { return false }
}

async function registrarTicketHijo(rel, token) {

  let xhr = new XMLHttpRequest();

  xhr.open("POST", `https://jira.masmovil.com/secure/WorkflowUIDispatcher.jspa?id=${rel}&action=11&atl_token=${token}&returnUrl=https%3A%2F%2Fjira.masmovil.com%2Fissues%2F%3Ffilter%3D58408%26selectedIssueId%3D${rel}&decorator=dialog&inline=true&_=1595831703806`, false);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
  xhr.send();

  if (xhr.readyState === 4 && xhr.status === 200) { return true; } else { return false }
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
    url: swiss.url_server_jarvis_masmovil,
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
    url: swiss.url_server_jarvis_masmovil,
    data: datos,
    processData: false,
    dataType: "json",
  });



}

function commentradius(claves, ultimoRegistro){
      //dentro de las claves vienen las claves que se quedaran en testresumen
      let testRadiusRes = {}
      let acctstatus = ultimoRegistro["AcctStatusType"]

      //asigno sobre las claves que quiero mantener los valores del test de radius 
      for (const item of claves){
        testRadiusRes[item] = ultimoRegistro[item]
      }
  		// crear comentario para pegar
      let keys = Object.keys(testRadiusRes)
      let vals = Object.values(testRadiusRes)
      
      let radiusPanel = `{panel:title=*RADIUS*}`
  
      let cabecerasTestRadius = "||" + keys.join("||") + "||Status||"
  
      let radiusvalues = "|"
      for (let item of vals) item === null ? radiusvalues += "nulo|" : radiusvalues += item + "|"

      radiusvalues +=  (acctstatus == "Stop") ? "{color:red" : "{color:green" +`}${acctstatus}{color}|`

      let comentarioradius = `{panel:title=*RADIUS*}\n${cabecerasTestRadius}\n${radiusvalues}\n{panel}`

      return {'testRadiusRes': testRadiusRes, 'comentarioradius':comentarioradius,'acctstatus':acctstatus}
}
function commentftth(claves, testFtth){
  //dentro de las claves vienen las claves que se quedaran en testresumen
  let testFtthRes = {}
  
  for (const item of claves){
    i = testFtth.resultado.datos.outputParam.find(e => e.key === item);
    testFtthRes[i.key] = parseInt(i.value)
  }
  
  let keys = Object.keys(testFtthRes)
  let vals = Object.values(testFtthRes)

  let cabecerasTestFTTH = "||" + keys.join("||") + "||"
      
  let tablaFTTH = "|"
  for (let item of vals) item === null ? tablaFTTH += "nulo|" : tablaFTTH += item + "|"

  let comentarioFTTH = `{panel:title=*TEST FTTH / Fecha del Test: ${testFtth.fecha}*}${cabecerasTestFTTH}\n${tablaFTTH}\n{panel}`
  return {'testFtthRes': testFtthRes, 'comentarioFTTH':comentarioFTTH,'ont_potencia_rx':testFtthRes["ont_potencia_rx"],'olt_potencia_rx':testFtthRes["olt_potencia_rx"]}
}
function commentTelf(claves,TestFijo){
  let testTelfRes = {}

  for (const item of claves){
    testTelfRes[item] = TestFijo.data.estado[item]
  }

  let keys = Object.keys(testTelfRes)
  let vals = Object.values(testTelfRes)

  const testPanelFijo = "{panel:title=*ESTADO FIJO*}"

  let cabecerasTestTelf = "||" + keys.join("||") + "||"
      
  let tablaTestTelf= "|"
  for (let item of vals) item === null ? tablaTestTelf += "nulo|" : tablaTestTelf += item + "|"
  tablaTestTelf +=  `|`

  let comentarioTelf = `{panel:title=*ESTADO FIJO*}${cabecerasTestTelf}\n${tablaTestTelf}\n{panel}`
  return {'testTelfRes': testTelfRes, 'comentarioTelf':comentarioTelf,'CpeRegistered':testTelfRes["CpeRegistered"]}
}

const comentarAveria = async (averia, tokenBearer, comentarioTelf, comentarioFTTH, comentarioradius, comentario) => {
  //si viene sin comentario se añade el tipico de cierres
  comentario = (typeof comentario !== 'string') ? '*ROBOT CIERRES : LINEA RECUPERA SERVICIO, SE RESUELVE TICKET*' : comentario
  //son paneles si se añade el comentario undefined no se pega el test
  let comment = "";
  comment += typeof comentarioTelf !== undefined ? comentarioTelf + "\n" : "" 
  comment += typeof comentarioFTTH !== undefined ? comentarioFTTH + "\n" : ""
  comment += typeof comentarioradius !== undefined ? comentarioradius + "\n" : "" 
  comment += `{panel:title=*COMENTARIO*}\n${comentario}{panel}`

  const datos = { body: comment};

  var config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${swiss.url_api_tgjira_pro}${averia}/comment`,
    headers: { 
      'Authorization': "Bearer " + tokenBearer, 
      'Content-Type': 'application/json', 
    },
    data : JSON.stringify(datos)
  };

  await axios(config)
  .then(function (response) {
    return response;
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    return error;
    console.log(error);
  });
}

const addComentIssue = (averia, respuesta, logTest, fecha_test, telFijo, datosFijo, comentario) => {

  const radiusPanel = `{panel:title=*RADIUS*}`;
  const comentarioAgente = "{panel:title=*COMENTARIO*}";
  const panelRadius = '|| Fecha_inicio || Fecha_fin || ProvisionigCode || Duration || ipAddress || natIpAddress || Bras || Estado ||';

  if (logTest !== undefined) {
    const testPanel = `{panel:title=*TEST FTTH / Fecha del Test: ${fecha_test}*}`;
    const panelTestFTTH = "|| ont_estado_operacional || olt_potencia_rx || olt_potencia_tx || ont_potencia_rx || ont_estado_administrativo || ";
    const tablaFTTH = `|${logTest[0].ont_estado_operacional}|-${logTest[0].olt_potencia_rx}|${logTest[0].olt_potencia_tx}|-${logTest[0].ont_potencia_rx}|${logTest[0].ont_estado_administrativo}|`;

    if (telFijo) {
      const estadoFijo = "{panel:title=*ESTADO FIJO*}";

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

      comentario = { body: `||${testPanel}${panelTestFTTH}\n${tablaFTTH}\n${estadoFijo}${testFijo}\n${radiusPanel}${panelRadius}\n${respuesta}\n${comentarioAgente}\n${comentario}{panel}` };

    } else {
      comentario = { body: `||${testPanel}${panelTestFTTH}\n${tablaFTTH}\n${radiusPanel}${panelRadius}\n${respuesta}\n${comentarioAgente}\n${comentario}{panel}` };
    }

  } else {

    if (telFijo) {

      const estadoFijo = "{panel:title=*ESTADO FIJO*}";

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
      comentario = { body: `||${estadoFijo}${testFijo}\n${radiusPanel}${panelRadius}\n${respuesta}\n${comentarioAgente}\n${comentario}{panel}` };

    } else {
      comentario = { body: `||${radiusPanel}${panelRadius}\n${respuesta}\n${comentarioAgente}\n${comentario}{panel}` };
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
  return fetch(`${swiss.url_api_tgjira_pre}${averia}/comment`, requestOptions);
}

const cierre_ftth = async (key_number, tokenBearer, flagPasoFSM, etiquetaAI) => {

  //cierra la averia indicando si ha pasado por fsm o no y si tiene etiqueta #AI o no

  let body = {
    "transition": {
      "id": "31"
    },"fields": {
      "customfield_10403": "Resolution Test", //detalle de la solucion -- texto libre
      "customfield_10517": [{ "key": "CAT-36525" }] //Categoría de Cierre -- Avería Desaparecida
    }};

    //Subcategoría de Cierre -- Resuelto con visita sin actuación CAT-36517 Resuelto sin visita sin actuación	CAT-36516
    body["fields"]["customfield_10518"] = [{ "key": flagPasoFSM === true ? "CAT-36517" : "CAT-36516"  }]

    //Abierto Incorrectamente -- value 12401 = NO value 12452 = SI
    body["fields"]["customfield_15004"] = { "value": etiquetaAI == true ? "Si" : "No" }

    // Motivo Abierta Incorrectamente -- ATC-36782 = Pruebas incompletas
    // solo se incluye si hay etiqueta #AI
    if(etiquetaAI == true) body["fields"]["customfield_14616"] = [{ "key": "ATC-36792" }]

    //"customfield_10507": { "value": "No" }, //ACTUACION DEL TECNICO VALUE 14410 = NO VALUE 14411 = SI
    //"customfield_10508": { "value": "No" }, //FACTURABLE VALUE 10310 = NO VALUE 10309 = SI

  return await fetch(`https://jira-pre.service-dev.k8s.masmovil.com/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify(body),
    "method": "POST",
  }).then(response => response.text())
    .then(async result => {

      //mandamos locucion
      // console.log(`${averia} Enviando locucion...`)
      // title = `${averia} Enviando locucion...`
      // alerta(title, 90000);
      // await sleep(0.5);
      //await locucion(movil, seguridad, averia);

      title = `AVERIA_${key_number} Averia Cerrada`;
      alerta(title, 12000);
      await sleep(0.5);
    }).catch(error => console.log('error', error));
}

const derivar_ftth = async () => {

  return await fetch(`https://jira-pre.service-dev.k8s.masmovil.com/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "content-type": "application/json",
    },
    "body": JSON.stringify({
      "transition": {
        "id": "51"
      },
      "fields": {

        "customfield_10327": [{ "key": "ESC-36518" }],
      }
      //ESC-51 = NOC-Fijo
      //ESC-56 = Provision
      //ESC-1009 = Operaciones Cliente Provisión
      //ESC-36518 = SATN2-STFIJO-SGI

    }),
    "method": "POST",
  }).then(response => response.text())
    .then(async result => {


      title = `AVERIA_${key_number} Derivada`;
      alerta(title, 12000);
      await sleep(0.5);
    }).catch(error => console.log('error', error));
}

const escalado_ftth_fsm = async (key_number, tokenBearer) => {

  return await fetch(`https://jira-pre.service-dev.k8s.masmovil.com/rest/api/latest/issue/${key_number}/transitions`, {
    "headers": {
      "Authorization": "Bearer " + tokenBearer,
      "accept-language": "en,es-ES;q=0.9,es;q=0.8",
      "content-type": "application/json",
      "Cookie": "visid_incap_2600688=ECDxpcp7Qu2x4K/rhI9o76TPT2MAAAAAQUIPAAAAAAD98aMP7n3WcrxOHR0nz/Ak",
    },
    "body": JSON.stringify({
      "transition": {
        "id": "111"
      },
      "fields": {
        "customfield_14303": [{ "key": "ACT-36549" }],
        "customfield_10854": { "value": "No" },
        "customfield_11800": "prueba de texto para la contrata",
      },
      "update": {
        "comment": [
          {
            "add": {
              "body": "" //añadimos cadena de texto si fuese necesario
            }
          }
        ]
      },


      //ACT-36549 = Sistema Externo FSM
      //ATC-14130 = Sistema Externo ORANGE
      //customfield_10854 = Pruebas conjuntas 
      //customfield_11800 = Informacion Externo
      //ESC-36518 = SATN2-STFIJO-SGI

      /** PARA ESCALADO ORANGE(ADSL) SE NECESITAN LOS:
       * customfield_11703 = Categoria Externo = ATC-14130 = Posventa
       * 
       * ACT-25269 = FTTH_INS_FALLO_WS_CAMBIO_CTO
       * ACT-25270 = FTTH_INS_FALLO_WS_CONSULTA_CTO
       * ACT-963 = FTTH_POS_ACC_CAMBIO DE CTO
       * ACT-968 = FTTH_POS_ACC_CD SATURADA
       * ACT-929 = FTTH_POS_ACC_CD SIN POTENCIA
       * ACT-934 = FTTH_POS_ACC_CORTES
       * ACT-927 = FTTH_POS_ACC_LENTITUD
       * ACT-25272 = FTTH_POS_ACC_PTO SIN POTENCIA
       * ACT-975 = FTTH_POS_ACC_SINCRONISMO
       * ACT-985 = FTTH_POS_ACC_SYNN
       * ACT-966 = FTTH_POS_IPTV_DEGRADACION
       * ACT-984 = FTTH_POS_IPTV_NO ACCESO
       * ACT-994 = FTTH_POS_IPTV_NO DESCARGA PARRILLA
       *  **/

    }),
    "method": "POST",
  }).then(response => response.text())
    .then(async result => {
      title = `AVERIA_${key_number} ESCALADA A FSM CORRECTAMENTE`;
      alerta(title, 12000);
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
      url: swiss.url_server_jarvis_masmovil,
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

function insert_DB(usuario, averia, fecha_creacion, accion_robot, fecha_escalado, tipologia, tecnologia, fecha_inicio, fecha_fin, robot) {

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

function setCutTime() {
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


