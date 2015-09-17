/**
 * Created by User on 17.09.2015.
 */
angular.module('accoRun').controller('AccountCtrl', ['$scope', '$meteor', function ($scope, $meteor) {

    $scope.trLinkTo = function (somewhere, id) {
        location.href = '/' + somewhere + '/' + id ;
    };

    $scope.accounts = $meteor.collection(Accounts);
    $scope.cashError = false;
    $scope.nameError = false;

    //$scope.sortType = $cookies.get("sortType");
    //$scope.sortReverse = $cookies.get("sortReverse");

    $scope.toSortTable = function (type) {
        $scope.sortType = type;
        $scope.sortReverse = !$scope.sortReverse;
        //$cookies.put("sortType", type);
        //$cookies.put("sortReverse", $scope.sortReverse);
    };

    $scope.addAccountsRow = function (name, date, cash) {

        $scope.cashError = false;
        $scope.nameError = false;

        if (name == null && cash == null) {
            $scope.cashError = true;
            $scope.nameError = true;
            return;
        }
        if (name == null || name === '') {
            $scope.nameError = true;
            return;
        }
        if (cash == null) {
            $scope.cashError = true;
            return;
        }
        if (cash < 0) {
            $scope.newAcco.type = 'cost';
        }
        if (cash > 0) {
            $scope.newAcco.type = 'income';
        }
        if (cash === 0) {
            $scope.newAcco.type = 'zero';
        }

        $scope.inputRow = false;
        $scope.newAcco.date = date || new Date();
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