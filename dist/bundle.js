var desk = (function () {
    'use strict';

    var frappeRTC = class FrappeRTC {

        constructor(){
            this.rtcPeerConnection;
            this.iceServers = {
                'iceServers': [{
                        'url': 'stun:stun.services.mozilla.com'
                    },
                    {
                        'url': 'stun:stun.l.google.com:19302'
                    }
                ]
            };
        }   

        async createOffer() {        
            this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
            
            return await this.rtcPeerConnection.createOffer()
                .then(desc => {
                    this.rtcPeerConnection.setLocalDescription(desc);
                    return desc;
                })
                .catch(e => console.log(e));
        }

        async createAnswer(offer) {       
            this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
            this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            return await this.rtcPeerConnection.createAnswer()
                .then(desc => {
                    this.rtcPeerConnection.setLocalDescription(desc);
                    return desc;
                })
                .catch(e => console.log(e));
        }
    };

    var frappeRTC$1 = /*#__PURE__*/Object.freeze({
        default: frappeRTC,
        __moduleExports: frappeRTC
    });

    var FrappeRTC = ( frappeRTC$1 && frappeRTC ) || frappeRTC$1;

    const frappeRTC$2 = new FrappeRTC();

    frappeRTC$2.createOffer().then(offer => {

            console.log(offer);    
            
            frappeRTC$2.createAnswer(offer).then(answer => {

                console.log(answer);
            });
    });

    var src = {

    };

    return src;

}());
//# sourceMappingURL=bundle.js.map
