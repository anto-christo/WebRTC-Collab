module.exports = class WebRTC {

    constructor(){
        this.type;
        this.dataChannel;
        this.connections = {};
        this.roomName = 'room';
        this.iceServers = {
            'iceServers': [{
                    'url': 'stun:stun.services.mozilla.com'
                },
                {
                    'url': 'stun:stun.l.google.com:19302'
                }
            ]
        };
        var that = this;
        this.createDataChannel();
        this.onIceCandidate(that);
        this.setupSocketHandlers(that);
    }

    onIceCandidate(that){
        this.rtcPeerConnection.onicecandidate = event => {
            if (event.candidate) {
                console.log('sending ice candidate');
                socket.emit('candidate', {
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate,
                    room: that.roomName
                });
            }
        }
    }

    setupSocketHandlers(that){
        socket.on('connect',function(){
            socket.emit('create or join', that.roomName);
        });

        socket.on('created',function(){
            that.type = 'host';
            console.log('Host ready');
        });

        socket.on('joined', function(room) {
            that.type = 'client';
            console.log('Client ready');
            socket.emit('ready',room);
        });

        socket.on('createOffer',function(event){
            //if(that.type=='host'){
                that.connections[event.id] = new RTCPeerConnection(that.iceServers);
                that.createOffer(that).then(offer => {
                    console.log(offer);
                    socket.emit('offer',{room:event.room, offer:offer});
                });
            //}
        });

        socket.on('sendOffer',function(event) {
            if(that.type=='client'){
                that.createAnswer(that,event.offer).then(answer => {
                    console.log(answer);
                    //socket.emit('answer',{room:event.room, answer: answer});
                    io.to(toId).emit('answer',);
                });   
            }
        });

        socket.on('sendAnswer', function(answer){
            if(that.type=='host'){
                that.setHostRemote(answer);
            }
        });

        socket.on('candidate', function (event) {
            var candidate = new RTCIceCandidate({
                sdpMLineIndex: event.label,
                candidate: event.candidate
            });
            that.rtcPeerConnection.addIceCandidate(candidate);
        });
    }

    async createOffer(that) {
        return await this.rtcPeerConnection.createOffer()
        .then(desc => {
            that.rtcPeerConnection.setLocalDescription(desc);
            return desc;
        })
        .catch(e => console.log(e));
    }

    async createAnswer(that,offer) {
        console.log(offer);
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
        return await this.rtcPeerConnection.createAnswer()
            .then(desc => {
                that.rtcPeerConnection.setLocalDescription(desc);
                return desc;
            })
            .catch(e => console.log(e));
    }

    setHostRemote(answer){
        console.log(answer);
        this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    createDataChannel(){
        this.dataChannel = this.rtcPeerConnection.createDataChannel("myDataChannel");
    
        this.dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };
        
        this.dataChannel.onopen = function () {
            console.log("The Data Channel is Open");
        };
        
        this.dataChannel.onclose = function () {
            console.log("The Data Channel is Closed");
        };

        this.setupReceiver();
    }

    setupReceiver(){
        this.rtcPeerConnection.ondatachannel = event => {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = message => this.onDataReceive(message.data);
        }
    }

    sendData(data){
        this.dataChannel.send(data);
    }
}