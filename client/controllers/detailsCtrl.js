/**
 * Created by User on 17.09.2015.
 */
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