function save_options() {
  var masossuser = document.getElementById('masossuser').value;
  var masosspass = document.getElementById('masosspass').value;
  chrome.storage.sync.set({
    masoss_USR: masossuser,
    masoss_PASS: masosspass,
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Guardado.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    masoss_USR: null,
    masoss_PASS: null,

  }, function(items) {
    document.getElementById('masossuser').value = items.masoss_USR;
    document.getElementById('masosspass').value = items.masoss_PASS;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('Guardar').addEventListener('click',save_options);