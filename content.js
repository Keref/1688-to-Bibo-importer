// Send a message containing the page details back to the event page
var coverpics = [];
var cp = document.getElementsByClassName('tab-trigger');
for (var k=0; k<cp.length; k++){
	var obj = JSON.parse( cp[k].getAttribute('data-imgs') )
	if ( obj ) { coverpics.push(obj.preview); }
}

chrome.runtime.sendMessage({
    'title2': document.title,
    'title': document.getElementsByTagName('h1')[0].innerHTML,
    'url': window.location.href,
    'summary': window.getSelection().toString(),
    'price': ( document.getElementsByClassName('price-text price-num')[0] ? document.getElementsByClassName('price-text price-num')[0].innerHTML : 100),
	'coverpics': coverpics
});