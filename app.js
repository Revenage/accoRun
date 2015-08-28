Accounts = new Mongo.Collection("accounts");

if (Meteor.isClient) {
    angular.module('accoRun', ['angular-meteor', 'ui.router', 'angularMoment', 'ngAnimate', 'ui.bootstrap']);

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

        $scope.addAccountsRow = function (name, cash) {

            $scope.cashError = false;
            $scope.nameError = false;

            if (name == null && cash == null) {
                $scope.cashError = true;
                $scope.nameError = true;
                return;
            }
            if (name == null || name == '') {
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
            if (cash == 0) {
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

    angular.module('accoRun').controller('donutChartCtrl', ['$scope', '$meteor', function ($scope, $meteor) {

        $scope.type = 'income';
        $scope.accountsSort = $meteor.collection(function () {
            return Accounts.find({type : $scope.type})
        });

        $scope.$watchCollection('accounts + type', function (newValue, oldValue) {
            if (newValue) {
            console.log('income accounts ' + $scope.accountsSort.length);
                $scope.sumAccounts = totalSum();
                change(initData());
            }
        });

        function totalSum() {
            var sum = 0;
            for (var i = 0; i < $scope.accountsSort.length; i++) {
                sum += $scope.accountsSort[i].cash;
            }
            return sum;
        }

        function initData (){
            return $scope.accountsSort.map(function(d){
                return {label: d.name + ' (' + (( d.cash / $scope.sumAccounts ) * 100).toFixed(2) +'%)' , value: d.cash}
            });
        }

        function pastelColors(){
            var r = (Math.round(Math.random()* 127) + 100).toString(16);
            var g = (Math.round(Math.random()* 127) + 100).toString(16);
            var b = (Math.round(Math.random()* 127) + 100).toString(16);
            return '#' + r + g + b;
        }

        var svg = d3.select("div.donutChart")
            .append("svg")
            .append("g");

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        var width = 960,
            height = 450,
            radius = Math.min(width, height) / 2;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });

        var arc = d3.svg.arc()
            .outerRadius(radius * 0.8)
            .innerRadius(radius * 0.4);

        var outerArc = d3.svg.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var key = function(d){ return d.data.label; };

        function change(data) {

            /* ------- PIE SLICES -------*/
            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            slice.enter()
                .insert("path")
                .style("fill", function(d) { return pastelColors(); })
                .attr("class", "slice");

            slice
                .transition().duration(1000)
                .attrTween("d", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        return arc(interpolate(t));
                    };
                });

            slice.exit()
                .remove();

            /* ------- TEXT LABELS -------*/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.data.label;
                });

            function midAngle(d){
                return d.startAngle + (d.endAngle - d.startAngle)/2;
            }

            text.transition().duration(1000)
                .attrTween("transform", function(d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate("+ pos +")";
                    };
                })
                .styleTween("text-anchor", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start":"end";
                    };
                });

            text.exit()
                .remove();

            /* ------- SLICE TO TEXT POLYLINES -------*/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function(t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        }

    }]);

}


if (Meteor.isServer) {
    Meteor.startup(function () {
        if (Accounts.find().count() === 0) {
            var accounts = [
                {
                    'name': 'Dubstep-Free Zone',
                    'description': 'Fast just got faster with Nexus S.',
                    'cost': 666
                },
                {
                    'name': 'All dubstep all the time',
                    'description': 'Get it on!',
                    'cost': 666
                },
                {
                    'name': 'Savage lounging',
                    'description': 'Leisure suit required. And only fiercest manners.',
                    'cost': 666
                }
            ];
            for (var i = 0; i < accounts.length; i++)
                Accounts.insert(accounts[i]);
        }
    });
}
