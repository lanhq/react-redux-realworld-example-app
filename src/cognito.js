import AWS from "aws-sdk";
import readline from 'readline';
var AmazonCognitoIdentity = require("amazon-cognito-identity-js");

var userPool, cognitoUser, JwtToken;

var poolData = {
    UserPoolId : 'us-east-1_WhcCjjXKO',
    ClientId : '54rqlmi8bsfusb4smm3037gmpc'
};

userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

function getCognitoUser() {
    return cognitoUser;
}

function signUp(email, name, password, callback) {
    var attributeList = [];
 
    var dataEmail = {
        Name : 'email',
        Value : email
    };
    var dataGivenName = {
        Name : 'name',
        Value : name
    };
    var attributeEmail = 
    new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
    var attributeGivenName = 
    new AmazonCognitoIdentity.CognitoUserAttribute(dataGivenName);
    
    attributeList.push(attributeEmail);
    attributeList.push(attributeGivenName);
    userPool.signUp(email, password, attributeList, null, function(err, result){
        if (err) {
            console.error(err);
            callback.error(err);
            return;
        }
        cognitoUser = result.user;
        console.log('user name is ' + cognitoUser.getUsername());
        callback.success(result);
    });
}

function confirmRegistration(verificationCode) {
    cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('call result: ' + result);
    });
}

function authenticateUser(email, password, callback) {
    var authenticationData = {
        Username : email,
        Password : password
    };
    var authenticationDetails = 
    new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
    cognitoUser = new AmazonCognitoIdentity.CognitoUser({
        Username: email,
        Pool: userPool
    });
    // cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            JwtToken = result.getIdToken().getJwtToken();
            console.log('access token + ' + JwtToken);
            console.log('AuthenticationFlowType: ', cognitoUser.getAuthenticationFlowType());
            AWS.config.region = 'us-east-1';
            console.log('JwtToken: ', JwtToken);
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'us-east-1:7cbeb182-ba5e-481a-a48d-4b0a40f6d726',
                Logins: {
                    'cognito-idp.us-east-1.amazonaws.com/us-east-1_WhcCjjXKO': JwtToken
                }
            });
            callback.success(result);
        },
    
        onFailure: function(err) {
            console.error(err);
            callback.error(err);
        },
        mfaRequired: function(codeDeliveryDetails) {
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('Please input verification code: ', (verificationCode) => {
                cognitoUser.sendMFACode(verificationCode, this);

                rl.close();
            });
        }
    });
}

function forgotPassword() {
    cognitoUser.forgotPassword({
        onSuccess: function (result) {
            console.log('call result: ' + result);
        },
        onFailure: function(err) {
            console.error(err);
        },
        inputVerificationCode() {
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            var verificationCode, newPassword;

            rl.question('Please input verification code: ', (answer) => {
                verificationCode = answer;
                rl.question('Enter new password: ', (answer) => {
                    newPassword = answer;
                    cognitoUser.confirmPassword(verificationCode, newPassword, this);
                    rl.close();
                });
            });
        }
    });
}

function initCredentials() {
    AWS.config.region = 'us-east-1';
    console.log('JwtToken: ', JwtToken);
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:7cbeb182-ba5e-481a-a48d-4b0a40f6d726',
        Logins: {
            'cognito-idp.us-east-1.amazonaws.com/us-east-1_WhcCjjXKO': JwtToken
        }
    });
}

function getCredentials() {
    AWS.config.credentials.get(function(err){
        if (err) {
            console.error(err);
        } else {
            console.log('accessKeyId: ', AWS.config.credentials.accessKeyId);
            console.log('secretAccessKey: ', AWS.config.credentials.secretAccessKey);
            console.log('sessionToken: ', AWS.config.credentials.sessionToken);
        }
    });
}

function getUserData(callback) {
    const currentUser = userPool.getCurrentUser();
    console.log('currentUserName: ', currentUser.getUsername());
    return userPool.getCurrentUser().getUserData(callback);
}

function getCurrentUser() {
    return userPool.getCurrentUser();
}


export default {
    userPool: userPool,
    cognitoUser: cognitoUser,
    signUp: signUp,
    confirmRegistration: confirmRegistration,
    authenticateUser: authenticateUser,
    forgotPassword: forgotPassword,
    initCredentials: initCredentials,
    getCredentials: getCredentials,
    getCognitoUser: getCognitoUser,
    getUserData: getUserData,
    getCurrentUser: getCurrentUser
};
