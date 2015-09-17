/**
 * Created by User on 17.09.2015.
 */
angular.module('accoRun').directive('donutGraphic', ['$meteor','$window', function ($meteor, $window) {
    return function (scope, element, attrs) {
        var graphWidth = element[0].offsetWidth;

        function setFontSize() {
            if (graphWidth < 700) {
                return graphWidth / 50;
            } else {
                return 14;
            }
        }

        $(element).css('width', graphWidth + "px")
            .css('height', graphWidth / 2 + "px")
            .css("font-size", setFontSize() +"px");

        scope.type = attrs.sorttype;
        /*            scope.accountsSort = $meteor.collection(function () {
         return Accounts.find({type : scope.type})
         });*/

        /*            angular.element($window).bind('resize', function() {
         change(initData());
         scope.$apply();
         });*/

        scope.$watchCollection('accounts', function (newValue, oldValue) {
            if (newValue) {
                scope.sumAccounts = totalSum();
                change(initData(scope.accounts));
            }
        });

        function totalSum() {
            var sum = 0;
            for (var i = 0; i < scope.accounts.length; i++) {
                if (scope.accounts[i].cash > 0) {
                    sum += scope.accounts[i].cash;
                }
            }
            return sum;
        }

        function initData (obj){
            return obj.map(function(d){
                /*neeed fix bug*/
                return {
                    label: d.name /*+ ' (' + (( d.cash / scope.sumAccounts ) * 100).toFixed(2) +'%)'*/ , value: d.cash
                }
            }).filter(function(d){
                if (d.value > 0) {
                    return d;
                }
            });
        }

        function pastelColors(){
            var r = (Math.round(Math.random()* 127) + 100).toString(16);
            var g = (Math.round(Math.random()* 127) + 100).toString(16);
            var b = (Math.round(Math.random()* 127) + 100).toString(16);
            return '#' + r + g + b;
        }

        var svg = d3.select(element[0])
            .append("svg")
            .append("g");

        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        var width = graphWidth,
            height = graphWidth / 2,
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

            /!* ------- PIE SLICES -------*!/
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

            /!* ------- TEXT LABELS -------*!/

            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function(d) {
                    if ((( d.value / scope.sumAccounts ) * 100).toFixed(2) > 3) {
                        return d.data.label;
                    }
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

            /!* ------- SLICE TO TEXT POLYLINES -------*!/

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function(d){
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    if ((( d.value / scope.sumAccounts ) * 100).toFixed(2) > 3) {
                        return function(t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                            return [arc.centroid(d2), outerArc.centroid(d2), pos];
                        };
                    }
                });

            polyline.exit()
                .remove();
        }

    }
}]);