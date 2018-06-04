'use strict'
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

$("#sendNotification").submit(function(e){
    e.preventDefault();
    let title = $("[name='title']").val();
    let description = $("#description").val();
    let token = $("#devices").val();
    //TODO
    //Здесь нельзя поставить messaging.getToken().then(f())
    //потому что сначала выполнится ajax, потом Promise
    $.ajax({
        type:"POST",
        url:"https://fcm.googleapis.com/fcm/send",
        dataType:"json",
        contentType:"application/json",
        headers:{
            "Authorization": "key= AAAA4uqYCxM:APA91bF7LEuHwG5-2obu_GJsJbMx0vtl_y-1ILsFGT8Isjpa1MQNykQ7YtICMKvDvzezzVnSbiB2POYqVJyqC9IZ7TDVCfXrniNnei8N3LcFzpsI2wrafPB2lHSUB9a0kqznK-E9GUdU"
        },
        data:JSON.stringify({
            "to": token,//"dq475XSZFhI:APA91bEfhtXgFMUn0ZD8UUrwOBZmaUb1e85Zr3pAf8-yH7_OoNhT0-30nR0acm0HUUiZPAWmQ1DWXoi77TLbeXORwB5eoq8BHIp2SchIEVSZiGHDTJ2i_uDvcJYcw2ldd5UTr4mThacw",
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
      
function retrieveToken(id){
    messaging.requestPermission()
    .then(function() {
        console.log('Notification permission granted.');
    }).catch(function(err) {
        console.log('Unable to get permission to notify.', err);
    });

    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            id = id.replace('Subscribe_', '');
            sendTokenToServer(currentToken, id, false);
        } else {
            console.log('No Instance ID token available. Request permission to generate one.');
            alert('Пожалуйста, разрешите отправлять вам уведомления');
            setTokenSentToServer(false);
        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
}

function deleteToken(id){
    messaging.getToken().then(function(currentToken) {
        if (currentToken) {
            id = id.replace('Unsubscribe_', '');
            sendTokenToServer(currentToken, id, true);
        } else {
            alert('У нас нет разрешения отправлять вам уведомления.');
            setTokenSentToServer(false);
        }
    }).catch(function(err) {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
    });
}
  
function sendTokenToServer(currentToken, id, forDelete) {
    console.log('Sending token to server...');
    $.ajax({
        type: "POST",
        url: forDelete?"/push/unsubscribe":"/push/subscribe",
        data: JSON.stringify({AppInstanceToken: currentToken, subscribeId: id}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){ 
            console.log(data);
            $("#message-block").html("<p>"+data+"</p>");
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