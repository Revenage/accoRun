Accounts = new Mongo.Collection("accounts");

if (Meteor.isClient) {
    angular.module('accoRun', ['angular-meteor', 'ui.router', 'angularMoment']);

    angular.module('accoRun').controller('AccountCtrl', ['$scope', '$meteor', function ($scope, $meteor) {

        $scope.trLinkTo = function (somewhere, id) {
            location.href = '/' + somewhere + '/' + id ;
        };

        $scope.accounts = $meteor.collection(Accounts);
        $scope.cashError = false;
        $scope.nameError = false;
        $scope.newAcco.name = '';
        //$scope.sortType = $cookies.get("sortType");
        //$scope.sortReverse = $cookies.get("sortReverse");

        $scope.toSortTable = function (type) {
            $scope.sortType = type;
            $scope.sortReverse = !$scope.sortReverse;
            //$cookies.put("sortType", type);
            //$cookies.put("sortReverse", $scope.sortReverse);
        };

        $scope.addAccountsRow = function () {

            $scope.cashError = false;
            $scope.nameError = false;

            if ($scope.newAcco.name == null || $scope.newAcco.name == null) {
                $scope.nameError = true;
                return;
            }
            if ($scope.newAcco.cash == null) {
                $scope.cashError = true;
                return;
            }
            if ($scope.newAcco.cash < 0) {
                $scope.newAcco.type = 'cost';
            }
            if ($scope.newAcco.cash > 0) {
                $scope.newAcco.type = 'income';
            }
            if ($scope.newAcco.cash == 0) {
                $scope.newAcco.type = 'zero';
            }
            $scope.inputRow = false;
            $scope.newAcco.date = new Date();
            $scope.newAcco.nowDate = new Date();

            $scope.accounts.push($scope.newAcco);
            $scope.newAcco = null;
        };
        $scope.remove = function (account) {
            $scope.accounts.remove(account);
        };

        $scope.removeAll = function () {
            $scope.accounts.remove();
        };
    }]);

    angular.module("accoRun").filter('moneyMask', function () {
        return function (input, signAfterComma, comma, thousandDivider) {
            if (input == '' || input == null) {
                return 0;
            } else {
                Number.prototype.formatMoney = function(c, d, t){
                    var n = this,
                        c = isNaN(c = Math.abs(c)) ? 2 : c,
                        d = d == undefined ? "." : d,
                        t = t == undefined ? "," : t,
                        s = n < 0 ? "-" : "",
                        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
                        j = (j = i.length) > 3 ? j % 3 : 0;
                    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
                };
                return input.formatMoney(signAfterComma, comma, thousandDivider);
            }
        };
    });
    angular.module("accoRun").controller("PartyDetailsCtrl", ['$scope', '$stateParams', '$meteor',
        function ($scope, $stateParams, $meteor) {
            $scope.partyId = $stateParams.partyId;
            $scope.account = $meteor.object(Accounts, $stateParams.partyId, false);

            $scope.save = function () {
                $scope.account.save();
            };

            $scope.reset = function () {
                $scope.account.reset();
            };
        }]);

    angular.module('accoRun').config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
        function ($urlRouterProvider, $stateProvider, $locationProvider) {

            $locationProvider.html5Mode(true);

            $stateProvider
                .state('accounts', {
                    url: '/accounts',
                    templateUrl: 'accounts-list.ng.html',
                    controller: 'AccountCtrl'
                })
                .state('partyDetails', {
                    url: '/accounts/:partyId',
                    templateUrl: 'party-details.ng.html',
                    controller: 'PartyDetailsCtrl'
                });

            $urlRouterProvider.otherwise("/accounts");
        }]);
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Accounts.find().count() === 0) {
            var accounts = [
                {
                    'name': 'Dubstep-Free Zone',
                    'description': 'Fast just got faster with Nexus S.'
                },
                {
                    'name': 'All dubstep all the time',
                    'description': 'Get it on!'
                },
                {
                    'name': 'Savage lounging',
                    'description': 'Leisure suit required. And only fiercest manners.'
                }
            ];
            for (var i = 0; i < accounts.length; i++)
                Accounts.insert(accounts[i]);
        }
    });
}
