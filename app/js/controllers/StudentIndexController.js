app.controller('StudentIndexController', ['$scope', function($scope){
	
	//Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");

	$scope.currentUserName = Parse.User.current().attributes.email;

	
	$scope.logout = function(){
		Parse.User.logOut();
		window.location = "/index.html";
	}

	getTests = function(){
		// Get all classes this student has been assigned
		var AllAssignedCoursesStudents = Parse.Object.extend("AssignedCoursesStudents");
		var query = new Parse.Query(AllAssignedCoursesStudents);


		
		$scope.coursesWithActiveTests = [];

		query.equalTo("assignedStudent", Parse.User.current());
		query.find({	// Get all courses assigned to this student
			success: function(assignedCourses){
				// debugger;
				assignedCourses.forEach(function(course){
					var currentCourseCode = course.attributes.courseCode;
					// debugger;
					var AllTests = Parse.Object.extend("AllTests");
					var query2 = new Parse.Query(AllTests);

					query2.equalTo("CourseCode", currentCourseCode);
					query2.equalTo("Active", true);
					query2.find({	// Get all active tests for each course code this student has been assinged
						success: function(testObjects){
							if (testObjects.length > 0){ // If the query finds no maching test, testObjects will be an empty array
								$scope.coursesWithActiveTests.push(
								{
									courseCode: currentCourseCode,
									tests: []
								});

								testObjects.forEach(function(testObject){
									// Have all active tests for the currnet course code.
									// push the details of each test into the tests array that is associated with a single course code
									$scope.coursesWithActiveTests[$scope.coursesWithActiveTests.length - 1].tests.push(
									{
										name: testObject.attributes.TestName,
										publishedUrl: testObject.attributes.PublishedUrl,
									});
								});
								// Update the display
								$scope.$apply();
							}
						},
						error: function(error){
							console.log(error);
						}
					});
				});
			},
			error: function(error){
				console.log(error);
			}
		});
	};
	getTests();

}]);