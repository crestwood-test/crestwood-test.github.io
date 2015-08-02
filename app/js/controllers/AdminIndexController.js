app.controller('AdminIndexController', ['$scope', function($scope){
	
	//Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");

	$scope.currentUser = Parse.User.current().attributes.email;

	$scope.createUser = function(user){		
		// Create and initialize the new user
		Parse.Cloud.run("createNewUser", user, {
			success: function(response){
				// Reset the form on successful user creation
				$('#createUserForm').each(function() {
		            this.reset();
		        });

				$('#createUserSuccess').show();
				$('#createUserError').hide();
				getTeachers();
				console.log(response);
			},
			error: function(error){
				$('#createUserSuccess').hide();
				$('#createUserError').show();

				console.log(error.message + " – Code: " + error.code);
			}
		});
	};

	$scope.logout = function(){
		Parse.User.logOut();
		window.location = "/Index.html";
	};

	getTeachers = function(){
		// The ID of the Teacher ROLE in parse.
		var pasreTeacherId = 'E55DQCNBCp';
		$scope.allTeachers = [];
		// var allTeachers = [];
		// Parse call.
		var query = (new Parse.Query(Parse.Role));
		query.get(pasreTeacherId, {
			success: function(role){
				// debugger;
				// Get all of the users from the teacher role.
				role.relation('users').query().find({
					success: function(userObjects){
						/*This is inefficient, making a call to parse for each user to check their 
						 course assignments. */
						// Retrieve all AssignedCourses 
						var AssignedCourses = Parse.Object.extend("AssignedCourses");
						var query = new Parse.Query(AssignedCourses);
						// getAssignedCourses(users);
						userObjects.forEach(function(userObject){

							// var AssignedCourses = Parse.Object.extend("AssignedCourses");
							// var query = new Parse.Query(AssignedCourses);
							query.equalTo("assignedTeacher", userObject);
							query.find({
								success: function(classObjects){
									// If the teacher is not already in our list, add them.
									// if ($.inArray(userObject, $scope.allTeachers) < 0){
										var classes = [];
										// Determine all the classes this user teaches
										classObjects.forEach(function(classObject){
											// debugger;
											classes.push(classObject.attributes.courseCode);
										})
										// Ensure the teacher has been assigned at least one class.
										//if (classes.length > 0){
											// debugger;
										$scope.allTeachers.push(
										{
											name : userObject.attributes.email,
											id: userObject.id,
											assignedClasses : classes,
											object: userObject
										});
										$scope.$apply();
									// }
									//}
								},
								error: function(error){

								}
							});
						});
					},
					error: function(error){

					}
				});
			},
			error: function(error){

			}
		});
		// format the data.
		// debugger;
		// return allTeachers;
	};
	// The first entry in the assigned classes array must correspond with the 
	getTeachers();

	/*
	* Custom angular filter to only display the teachers that have been assigned courses.
	*/
	$scope.hasClasses = function(teacher){
		if (teacher.assignedClasses.length > 0){
			return teacher;
		}
	}
	// $scope.allTeachersAssignedClasses = [];
	// getAllTeachersAssignedClasses = function(){
	// 	$scope.allTeachers.forEach(function(teacher){
	// 		debugger;
	// 		if (teacher.assignedClasses.length != 0){
	// 			$scope.allTeachersAssignedClasses.push(teacher);
	// 		}
	// 	});
	// }
	// getAllTeachersAssignedClasses();
	
	$scope.addCourse = function(course){
		// Make sure course is unique by searhing for the course by its code
		if (course){
			var courseCode = course.code.toUpperCase();

			var Courses = Parse.Object.extend("Courses");
			var query = new Parse.Query(Courses);
			query.equalTo("courseCode", courseCode);
			query.first({
				success: function(course){
					// debugger;
					// There is already a course with this code.
					if (course){
						$('#courseAdded').hide();
						$('#courseError').show();
					} else { // Create the course
						var course = new Courses();
						course.set("courseCode", courseCode);
						
						// Ensure that only Administrator roles can read and write to the
						// course table. 
						var acl = new Parse.ACL();
						acl.setPublicReadAccess(false);
						acl.setPublicWriteAccess(false);
						acl.setRoleReadAccess("Administrator", true);
						acl.setRoleWriteAccess("Administrator", true);
						course.setACL(acl);

						course.save(null, {
							success: function(){
								$('#courseError').hide();
								$('#courseAdded').show();
								getUnassignedCourses();
							},
							error: function(){

							}
						});
					}
				},
				error: function(){
				}
			});
		}
	};

	getUnassignedCourses = function(){
		$scope.allUnassignedCourses = [];
		// Need to look at Courses. 
		var Courses = Parse.Object.extend("Courses");
		var query = new Parse.Query(Courses);
		query.find({
			success: function(courses){
				var AssignedCourses = Parse.Object.extend("AssignedCourses");
				var query2 = new Parse.Query(AssignedCourses);
				query2.find({
					success: function(assignedCourses){
						assignedCourseCodes = [];
						for (i = 0; i < assignedCourses.length; i++){
							assignedCourseCodes.push(assignedCourses[i].attributes.courseCode);
						}
						courses.forEach(function(course){
							if ($.inArray(course.attributes.courseCode, assignedCourseCodes) < 0){
							// if (course.attributes.courseCode in assignedCourseCodes){
								$scope.allUnassignedCourses.push({
									name: course.attributes.courseCode
								});
								$scope.$apply();
							}
						})
					},
					error: function(){

					}
				});
				// Look at each course and see if it is assigned.

			},
			error: function(){

			}
		});
	};
	getUnassignedCourses();

	/*
	*	Assign representes a teachers username and a course they should be assigned. 
	*/

	$scope.teacherAssignedCourses = {
		courses: []
	};

	$scope.assignTeacher = function(assign){
		// debugger;

		var teacherEmail = assign.teacherName;
		var courseCodes = $scope.teacherAssignedCourses.courses
		var teacherObject;

		// Error checking
		if (!teacherEmail){
			// Please select a teacher
			$('#teacherAssignedSuccessfully').hide();
			$('#teacherAssignNoCourseSelected').hide();
			$('#assignTeacherError').hide();
			$('#assignTeacherSuccess').hide();
			$('#teacherAssignNoTeacherSelected').show();
		} else if(!courseCodes){
			// Please select a class to assign
			$('#teacherAssignedSuccessfully').hide();
			$('#assignTeacherError').hide();
			$('#assignTeacherSuccess').hide();
			$('#teacherAssignNoCourseSelected').show();
			$('#teacherAssignNoTeacherSelected').hide();
		} else { // Assign the teacher to the classes.

			// Get the teacher user object. 
			$scope.allTeachers.forEach(function(teacher){
				if (teacher.name == teacherEmail){
					teacherObject = teacher.object;
					// break;
				}
			});

			var AssignedCourses = Parse.Object.extend("AssignedCourses");
			var assignedCourse = new AssignedCourses();
			courseCodes.forEach(function(courseCode){
				assignedCourse.set("assignedTeacher", teacherObject);
				assignedCourse.set("courseCode", courseCode);
				debugger;
				var acl = new Parse.ACL();
				acl.setPublicWriteAccess(false);
				acl.setPublicReadAccess(false);
				acl.setRoleReadAccess("Administrator", true);
				acl.setRoleWriteAccess("Administrator", true);
				acl.setReadAccess(teacherObject.id, true);
				assignedCourse.setACL(acl);

				assignedCourse.save(null, {
					success: function(assignedCourse){
						$('#assignTeacherSuccess').show();
						$('#assignTeacherError').hide();
						getTeachers();

					},
					error: function(assignedCourse, error){
						$('#assignTeacherSuccess').hide();
						$('#assignTeacherError').show();
						debugger;
					}
				});
			});
			
		}

	};
	/*
	 * Remove this user as the assigned teacher for this course
	*/
	$scope.unassignTeacher = function(unassign){
		debugger;

	};
}]);