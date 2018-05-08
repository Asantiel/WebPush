// Callback fired if Instance ID token is updated.
const messaging = firebase.messaging();
messaging.onTokenRefresh(function() {
    messaging.getToken().then(function(refreshedToken) {
        console.log('Token refreshed.');
        setTokenSentToServer(false);
        sendTokenToServer(refreshedToken);
    }).catch(function(err) {
        console.log('Unable to retrieve refreshed token ', err);
        showToken('Unable to retrieve refreshed token ', err);
    });
});
  

messaging.usePublicVapidKey("BNnWxEZztbbtTN04VtO70CrtxJYeRdbruzeyitTymn8VYS5-JJAU65A9TJ-XH2EuhbvOy9KaDN1SNGrPskGY-Wo");
messaging.requestPermission()
    .then(function() {
        console.log('Notification permission granted.');
        retrieveToken();
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });

$("form[name='sendNotification']").submit(function(e){
    e.preventDefault();
    let title = $("[name='title']").val();
    let description = $("[name='description']").val();
    $.ajax({
        type:"POST",
        url:"https://fcm.googleapis.com/fcm/send",
        dataType:"json",
        contentType:"application/json",
        headers:{
            "Authorization": "key= AAAA4uqYCxM:APA91bF7LEuHwG5-2obu_GJsJbMx0vtl_y-1ILsFGT8Isjpa1MQNykQ7YtICMKvDvzezzVnSbiB2POYqVJyqC9IZ7TDVCfXrniNnei8N3LcFzpsI2wrafPB2lHSUB9a0kqznK-E9GUdU"
        },
        data:JSON.stringify({
            "to":"dq475XSZFhI:APA91bEfhtXgFMUn0ZD8UUrwOBZmaUb1e85Zr3pAf8-yH7_OoNhT0-30nR0acm0HUUiZPAWmQ1DWXoi77TLbeXORwB5eoq8BHIp2SchIEVSZiGHDTJ2i_uDvcJYcw2ldd5UTr4mThacw",
            "notification": {
                "title": title,
                "body": description,
                "icon": "/public/images/img_557022.png"
            }
        }),
        success:function(data){
            console.log(data);
        },
        error: function(err){
            console.log(err);
        }
    });
});

messaging.onMessage(function(payload){
    console.log('onMessage', payload);
});
      
retrieveToken = () => {
    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            sendTokenToServer(currentToken);
        } else {
            console.log('No Instance ID token available. Request permission to generate one.');
            setTokenSentToServer(false);
        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
};
  
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        $.ajax({
            type: "POST",
            url: "/subscribe",
            data: JSON.stringify({AppInstanceToken: currentToken}),
            dataType: "json",
            contentType: "application/json",
            success: function(data){ 
                console.log(data);
            },
            error: function(err){ 
                console.log(err);
            }
        });
        setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }
}
  
function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === 1;
}