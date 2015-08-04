app.controller('TeacherIndexController', ['$scope', function($scope){
	
	// Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");

	$scope.currentUserName = Parse.User.current().attributes.email;

	
	$scope.logout = function(){
		Parse.User.logOut();
		window.location = "/index.html";
	}

	// Need to get all of this teachers tests that they have published.
	getTests = function(){
		var AllTests = Parse.Object.extend("AllTests");
		var query = new Parse.Query(AllTests);
		var currentUser = Parse.User.current();
		$scope.coursesWithTests = [];

		query.equalTo("PublishingUser", currentUser);
		query.find({
			success: function(testObjects){
				// This is all the tests that this user has published.
				testObjects.forEach(function(testObject){
					// Check if course code is in our object yet.
					var courseIndex = courseCodeExists(testObject.attributes.CourseCode);

					if (courseIndex > -1){ // course object found.
						var courseObject = $scope.coursesWithTests[courseIndex];

						var newTest = 
						{
							name: testObject.attributes.TestName,
							publishedUrl: testObject.attributes.PublishedUrl,
							active: testObject.attributes.Active,
							createdAt: testObject.createdAt,
							updatedAt: testObject.updatedAt,
							id: testObject.id,
							object: testObject
						};

						// Add the test to the list of tests for this specific courseCode
						courseObject.tests.push(newTest);

					} else { // Create a new courseCode object and store it in $scope.coursesWithTests & add the first test
						var newCourseObject = 
						{
							courseCode: testObject.attributes.CourseCode,
							tests: 
							[{
								name: testObject.attributes.TestName,
								publishedUrl: testObject.attributes.PublishedUrl,
								active: testObject.attributes.Active,
								createdAt: testObject.createdAt,
								updatedAt: testObject.updatedAt,
								id: testObject.id,
								object: testObject
							}]
						};
						console.log("Course code doesn't exist");
						$scope.coursesWithTests.push(newCourseObject);
					}
					$scope.$apply();
				});
			},
			error: function(error){
				console.log(error);
			}

		});
	}
	getTests();

	// Look in $scope.coursesWithTests and see if there is a record of this test for this teacher already created
	// Returns the index of the course object if found, or -1 if not found
	courseCodeExists = function(courseCode){	
		for (i = 0; i < $scope.coursesWithTests.length; i++){
			var currentCourseObject = $scope.coursesWithTests[i];

			if (currentCourseObject.courseCode == courseCode){
				return i;
			}
		}
		return -1;
	};


	$scope.toggleActiveTest = function(test){
		
		// Set the test to the opposite on the backend.
		var testObject = test.object;
		testObject.set("Active", !test.active);
		testObject.save();
		
		// Set the test to the opposite locally
		test.active = !test.active;
	};
}]);