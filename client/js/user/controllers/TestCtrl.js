var module = require('./module');
module.controller('TestCtrl', function ($scope) {
  $scope.testVar = 'blah';
  $scope.$watch('testVar', function (newValue) {
    console.log($scope.someForm);
  }, true);
});
