var AWS = require('aws-sdk');

var apig = new AWS.APIGateway({apiVersion: '2018/04/02'});

function createRestApi(name, description, version, callback) {
    apig.createRestApi({
        name: name,
        binaryMediaTypes: [
            '*'
        ],
        description: description,
        version: version
    }, callback);
}

function getResources(restApiId, callback) {
    apig.getResources({
        restApiId: restApiId
    }, callback)
}

function createResource(restApiId, parentId, pathPart, callback) {
    apig.createResource({
        restApiId: restApiId,
        parentId: parentId,
        pathPart: pathPart
    }, callback)
}

function putMethod(restApiId, resourceId, httpMethod, authorizationType, callback) {
    apig.putMethod({
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod,
        authorizationType: authorizationType
    }, callback)
}

function putMethodResponse(restApiId, resourceId, httpMethod, statusCode, callback) {
    apig.putMethodResponse({
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod,
        statusCode: statusCode
    }, callback)
}

function putIntegration(restApiId, resourceId, httpMethod, type, integrationHttpMethod, options, callback) {
    apig.putIntegration({
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod,
        type: type,
        integrationHttpMethod: integrationHttpMethod,
        uri: options.uri
    }, callback)
}

function putIntegrationResponse(httpMethod, restApiId, resourceId, statusCode, options, callback) {
    apig.putIntegrationResponse({
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod,
        statusCode: statusCode,
        selectionPattern: options.selectionPattern
    }, callback)
}

function testInvokeMethod(httpMethod, restApiId, resourceId, params, callback) {
    apig.testInvokeMethod({
        restApiId: restApiId,
        resourceId: resourceId,
        httpMethod: httpMethod,
        pathWithQueryString: params.pathWithQueryString
    }, callback)
}

function createDeployment (restApiId, callback) {
    apig.createDeployment({
        restApiId: restApiId,
        stageName: 'test',
        stageDescription: 'test deployment',
        description: 'API deployment'
    }, callback)
}

export default {
    createRestApi,
    getResources,
    createResource,
    putMethod,
    putMethodResponse,
    putIntegration,
    putIntegrationResponse,
    testInvokeMethod,
    createDeployment
}
