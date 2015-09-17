/**
 * Created by User on 17.09.2015.
 */
angular.module('accoRun').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function ($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider
            .state('intro', {
                url: '/intro',
                templateUrl: 'client/views/intro.ng.html'
            })
            .state('accounts', {
                url: '/accounts',
                templateUrl: 'client/views/accounts-list.ng.html',
                controller: 'AccountCtrl'
            })
            .state('partyDetails', {
                url: '/accounts/:partyId',
                templateUrl: 'client/views/party-details.ng.html',
                controller: 'PartyDetailsCtrl'
            });

        $urlRouterProvider.otherwise("/intro");
    }]);