const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 8080
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const qr_code = require('qrcode')


// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
  // console.log('New WS Connection')

 
  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }
   // Handle Messages
  socket.emit('message', { message: 'Welcome To Ingame Chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });

  socket.on('generate', function (code) {
    var file_path = "public/images"+ Date.now() +".png";
    var url = urlgen
    qr_code.toFile(file_path,url, {
      color: {
        dark: '#000',  // Black dots
        light: '#0000' // Transparent background
      }
    });
  });



  // Tell the connecting client what player number they are
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  // Ignore player 3
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // Tell eveyone what player number just connected
  socket.broadcast.emit('player-connection', playerIndex)

  // Handle Diconnect
  socket.on('disconnect', () => {
    console.log(`Player ${playerIndex} disconnected`)
    connections[playerIndex] = null
    //Tell everyone what player numbe just disconnected
    socket.broadcast.emit('player-connection', playerIndex)
  })

  // On Ready
  socket.on('player-ready', () => {
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    console.log(square)

    // Forward the reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })


  // Timeout connection
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
  }, 600000) // 10 minute limit per player

  app.get('/', function(req, res){
    res.render('index',{QR_code:''});
  });
  
  app.post('/', function(req, res){
    const url = req.body.url;
    console.log(url);
    if(url){
      qr_code.toDataURL(url, function(err, src){
        if(err){res.send(err); console.log(err);}
        var file_path = "store/"+ Date.now() +".png";
        qr_code.toFile(file_path,url, {
          color: {
            dark: '#000',  // Black dots
            light: '#0000' // Transparent background
          }
        });
        res.render('index',{QR_code:src,img_src:file_path}); 
      });
  
    }else{
      res.send('URL Not Set!');
    }
  
  });
})