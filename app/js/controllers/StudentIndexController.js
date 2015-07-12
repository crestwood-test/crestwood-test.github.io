app.controller('StudentIndexController', ['$scope', function($scope){
	
	Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");

	$scope.currentUser = Parse.User.current().attributes.email;

	
	$scope.logout = function(){
		Parse.User.logOut();
		window.location.href="/index.html"
	}

	$scope.classes = 
	[
		{
			name: "ENG101"
		},
		{
			name: "MAT223"
		}
	];

	$scope.availableTests = 
	[
		{
			className: "ENG101",
			testName: "Spelling 101",
			publishedUrl: "http://www.google.com"
		},
		{
			className: "MAT223",
			testName: "Vectors",
			publishedUrl: "http://www.reddit.com"
		}
	];
}]);