// Callback fired if Instance ID token is updated.
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BNnWxEZztbbtTN04VtO70CrtxJYeRdbruzeyitTymn8VYS5-JJAU65A9TJ-XH2EuhbvOy9KaDN1SNGrPskGY-Wo");

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

$("form[name='sendNotification']").submit(function(e){
    e.preventDefault();
    let title = $("[name='title']").val();
    let description = $("#description").val();
    $.ajax({
        type:"POST",
        url:"https://fcm.googleapis.com/fcm/send",
        dataType:"json",
        contentType:"application/json",
        headers:{
            "Authorization": "key= AAAA4uqYCxM:APA91bF7LEuHwG5-2obu_GJsJbMx0vtl_y-1ILsFGT8Isjpa1MQNykQ7YtICMKvDvzezzVnSbiB2POYqVJyqC9IZ7TDVCfXrniNnei8N3LcFzpsI2wrafPB2lHSUB9a0kqznK-E9GUdU"
        },
        data:JSON.stringify({
            "to":"eeQqM0qvJuo:APA91bES_ilvxw03-5-2p3HJR2VNeETlniRt_voVHFgyX58OqYLABLtJFRJUSE1Zqb4Q0fGZsaJwIBFSrC5YVYRTdiZ7Jm4rNXIt5CiV7cxfbnVw1HBRq3X3FginprF0eDWDwrRVRRb_",
            "notification": {
                "title": title,
                "body": description,
                "icon": "images/img_557022.png"
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
      
retrieveToken = (id) => {
    messaging.requestPermission()
    .then(function() {
        console.log('Notification permission granted.');
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });

    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            sendTokenToServer(currentToken, id);
        } else {
            console.log('No Instance ID token available. Request permission to generate one.');
            alert('Пожалуйста, разрешите отправлять вам уведомления');
            setTokenSentToServer(false);
        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
};
  
function sendTokenToServer(currentToken, id) {
    console.log('Sending token to server...');
    $.ajax({
        type: "POST",
        url: "/subscribe",
        data: JSON.stringify({AppInstanceToken: currentToken, subscribeId: id}),
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
}
  
function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') == 1;
}