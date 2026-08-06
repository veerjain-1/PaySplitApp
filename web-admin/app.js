var app = angular.module('paySplitAdmin', []);

app.controller('MainController', function($scope, $http) {
    $scope.backendStatus = 'Checking...';
    $scope.aiStatus = 'Checking...';
    $scope.expenses = [];

    const BACKEND_URL = 'http://localhost:5000';
    const AI_PIPELINE_URL = 'http://localhost:8000';

    $scope.checkHealth = function() {
        $scope.backendStatus = 'Checking...';
        $scope.aiStatus = 'Checking...';

        $http.get(BACKEND_URL + '/health').then(function(response) {
            $scope.backendStatus = 'Online';
        }).catch(function(error) {
            $scope.backendStatus = 'Offline';
        });

        $http.get(AI_PIPELINE_URL + '/health').then(function(response) {
            $scope.aiStatus = 'Online';
        }).catch(function(error) {
            $scope.aiStatus = 'Offline';
        });
    };

    $scope.loadExpenses = function() {
        $http.get(BACKEND_URL + '/api/expenses').then(function(response) {
            $scope.expenses = response.data;
        }).catch(function(error) {
            console.error('Error loading expenses:', error);
            // Fallback mock data for demo if backend is offline
            $scope.expenses = [
                { title: 'Dinner at Olive Garden', amount: 85.50, payerId: 'user123', createdAt: new Date() },
                { title: 'Uber to Airport', amount: 42.00, payerId: 'user456', createdAt: new Date() }
            ];
        });
    };

    // Initial load
    $scope.checkHealth();
    $scope.loadExpenses();
});
