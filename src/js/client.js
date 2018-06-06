const FrappeRTC = require('../../frappeRTC/frappeRTC');

const frappeRTC = new FrappeRTC();

frappeRTC.createOffer().then(offer => {

        console.log(offer);    
        
        frappeRTC.createAnswer(offer).then(answer => {

            console.log(answer);
        });
});