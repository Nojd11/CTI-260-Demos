window.onload = function() {

    var messages = [];
    const socket = io();
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById("name");
    var generateButton = document.getElementById("generate");
    var qrcodes = document.getElementById("qrcodes");
    var url = document.getElementById("url");
    const qr_code = require('qrcode')

    //message listener
    socket.on('message', function (data) {
        if(data.message) {
            messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].username ? messages[i].username : 'Server') + ': </b>';
                html += messages[i].message + '<br />';
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });

    // button to send message to socket
    sendButton.onclick = function() {
    	if(name.value == "") {
            alert("Please type your name!");
        } else {
        var text = field.value;
        socket.emit('send', { message: text, username: name.value });
        field.value = '';
        }
    };

    generateButton.onclick = function() {
    	if(url.value == "") {
            alert("Please enter url");
        } else {
        var urlgen = url.value;
        socket.emit('generate', { generate: urlgen  });
        url.value = '';
        }
    };
    // set enter key listener 
    field.addEventListener('keypress', function (e) {
	    var key = e.which || e.keyCode;
	    if (key === 13) { 
	    	sendButton.onclick();
    	}
	});
}