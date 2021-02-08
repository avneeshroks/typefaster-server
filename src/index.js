// Express
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const socketConnect = require('socket.io');
const channelController = require('./controller/channels');

// Redis -- Currently not using but could be used to 
//          improve performance and keep the channel related logic there
//          instead of keeping in memory
//
// const redis = require('redis');
// const client = redis.createClient();

// Config
const port = 8080;

// Express Routes

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
})

app.use((err, req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = err.status || 500;

    res
    .status(status)
    .json({
        error : {
            message : err.message
        }
    })
})

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.end("Connected !!");
});


const server = require('http').createServer(app);

const options={
    cors : true,
    origins:["http://localhost:3000"],
}

// Socket.io
const io = socketConnect(server, options);

// Socket.io subscriptions

let channels = {};

io.on('connection', (socket) => {

    // capture the endtime when the game ends
    
    console.log("New client connected");
    
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        // cleanup
        // channelController.delete(channelId)
    });
    
    socket.on('playClicked', data => {
        
        if(!data['username']) {
            return;
        }
        
        // add client to already created channel
        let channelId = channelController.addClient(data['username']);
        
        socket.join(channelId.toString());
        console.log(socket.rooms);
        
        if(channelController.hasBothClient(channelId)) {
            // once the users are connected emit countdown event
            io.in(channelId.toString()).emit("bothClientConnected", {channelId, targetText : channelController.getChannelText(channelId)});
        } else {
            // wait on the client side for other user to connect to that channel
            io.in(channelId.toString()).emit("waitingForAnother",  {channelId, targetText : channelController.getChannelText(channelId)});
        }
    });
    
    
    socket.on('gameSubmit', data => {
        
        if(!data['username'] || !data['channelId'] || !data['time']) {
            return;
        }
        
        // add client to already created channel
        let channelId = data['channelId'];
        
        // emit the winner as soon as one of the client finishes
        io.in(channelId.toString()).emit("gameEnded", {winner : data['username'], time: data['time']});
    });
});


// start the Express server
server.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});

