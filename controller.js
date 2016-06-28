var myApp = angular.module('app', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/index.html");
  //
  // Now set up the states
  $stateProvider
    .state('eModule', {
      url: "/eModule",
      templateUrl: "eModule/index.html"
    })
    .state('module', {
      url: "/module",
      templateUrl: "module/index.html"
    })
    });