app.controller('TeacherIndexController', ['$scope', function($scope){
	
	Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");

	$scope.currentUser = Parse.User.current().attributes.email;

	
	$scope.logout = function(){
		Parse.User.logOut();
		window.location = "/index.html";
	}

	$scope.classes = 
	[
		{
			className: "ENG101",
			sectionName: "L0101"
		},
		{
			className: "MAT223",
			sectionName: "L0105"
		}
	];

	$scope.availableTests = 
	[
		[{
			className: "ENG101",
			testName: "Spelling 101",
			publishedUrl: "http://www.google.com"
		},
		{
			className: "ENG101",
			testName: "Canadian Short Stories",
			publishedURL: "https://docs.google.com/a/crestwood.on.ca/forms/d/1Na7FSTZnsv-SG_nmEeY5wQ0UM9AsKsNKfW-sjDEOA7Q/viewform"

		}],

		[{
			className: "MAT223",
			testName: "Vectors",
			publishedUrl: "http://www.reddit.com"
		}]
	];
}]);