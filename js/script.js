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