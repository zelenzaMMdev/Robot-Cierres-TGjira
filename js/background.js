/*chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.executeScript(null, { file: "jquery-3.2.1.min.js" }, function() {
	    chrome.tabs.executeScript(null, { file: "pr.js" });
	});
});*/
/*chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
	chrome.tabs.executeScript(null, { file: "jquery-3.2.1.min.js" }, function() {
	    chrome.tabs.executeScript(null, { file: "pr.js" });
	});
  }
})*/
/*
window.onload=function(){
	console.log("pageload");
	chrome.tabs.executeScript(null, { file: "jquery-3.2.1.min.js" }, function() {
	    chrome.tabs.executeScript(null, { file: "pr.js" });
      chrome.tabs.executeScript(null, { file: "js.cookie.js" });
      //chrome.tabs.executeScript(null, { file: "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" });
	});
};*/
/*chrome.contextMenus.create({
  title: "escalar", 
  contexts:["all"], 
  onclick: chrome.tabs.create({url:"https://jira.masmovil.com/servicedesk/customer/portal/7/create/108"}),
});*/


//chrome.tabs.query({active:true,windowType:"normal", currentWindow: true},function(d){alert(d[0].id);});
// Set up context menu at install time.


/*chrome.runtime.onInstalled.addListener(function() {
  var context = "all";
  var title = "Llamar a este numero";
  var id = chrome.contextMenus.create({"title": title, 
  										"contexts":[context],
										"id": "context" + context});  
});


chrome.contextMenus.onClicked.addListener(onClickHandler);

function onClickHandler(info, tab) {

	var sText = info.selectionText;
	var url = "https://jira.masmovil.com/servicedesk/customer/portal/7/create/108";  
	window.open(url, '_blank');
};*/

function getword(info,tab) {
  chrome.tabs.create({  
  	url: "http://192.168.98.135/servlet?p=contacts-callinfo&q=call&type=manual&num="+info.selectionText+"&acc=0&random=0.1167390430686055",
  });           
}
chrome.contextMenus.create({
  title: "Llamar al: %s", 
  contexts:["selection"], 
  onclick: getword,
});