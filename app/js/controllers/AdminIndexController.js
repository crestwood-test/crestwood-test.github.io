app.controller('AdminIndexController', ['$scope', function($scope){

	$scope.currentUser = Parse.User.current().attributes.email;

	$scope.createUser = function(user){		
		// Create and initialize the new user
		Parse.Cloud.run("createNewUser", user, {
			success: function(response){
				// Reset the form on successful user creation
				$('#createUserForm').each(function() {
		            this.reset();
		        });
				// $('#accountType').change(function(){
				// 	$('#accountType').prop('selectedIndex',0);	
				// })

				$scope.user.accountType = "Student";
				

				$('#createUserSuccess').show();
				$('#createUserError').hide();
				getTeachers();
				getStudents();
				getAdmins();
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
		window.location = "/index.html";
	};

	getTeachers = function(){
		// The ID of the Teacher ROLE in parse.
		var pasreTeacherId = 'E55DQCNBCp';
		$scope.allTeachers = [];
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
								success: function(courseObjects){
									// If the teacher is not already in our list, add them.
										var courses = [];
										// Determine all the classes this user teaches
										courseObjects.forEach(function(courseObject){
											// debugger;
											courses.push(courseObject.attributes.courseCode);
										});
										// Ensure the teacher has been assigned at least one class.
										//if (classes.length > 0){
											// debugger;
										$scope.allTeachers.push(
										{
											name : userObject.attributes.email,
											id: userObject.id,
											assignedCourses : courses,
											object: userObject
										});
										$scope.$apply();
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
	getTeachers();

	getStudents = function(){
		// The ID of the Student ROLE in Parse
		var parseStudentId = "fyjKtYgSxh";
		$scope.allStudents = [];
		var query = (new Parse.Query(Parse.Role));
		query.get(parseStudentId, {
			success: function(role){
				role.relation('users').query().find({
					success: function(userObjects){
						// These are all the student users
						var AssignedCoursesStudents = Parse.Object.extend("AssignedCoursesStudents");
						var query = new Parse.Query(AssignedCoursesStudents);
						// getAssignedCourses(users);
						userObjects.forEach(function(userObject){
							query.equalTo("assignedStudent", userObject);
							query.find({
								success: function(courseObjects){
									var courses = [];
									courseObjects.forEach(function(courseObject){
										courses.push(courseObject.attributes.courseCode);
									});
									// debugger;
									$scope.allStudents.push(
									{
										name: userObject.attributes.email,
										id: userObject.id,
										assignedCourses: courses,
										object: userObject
									});
									$scope.$apply();

								},
								error: function(error){
									// debugger;
								}
							});
						});

					},
					error: function(error){
						// debugger;
					}
				});
			},
			error: function(error){
				// debugger;
			}

		});
	};
	getStudents();

	getAdmins = function(){
		// The ID of the Administrator ROLE in Parse
		var parseAdministratorId = "o2rT3O0sFy";
		$scope.allAdministrators = [];
		var query = (new Parse.Query(Parse.Role));
		query.get(parseAdministratorId, {
			success: function(role){
				role.relation('users').query().find({
					success: function(userObjects){
						userObjects.forEach(function(userObject){
							// Don't display the super admin, which cannot be deleted.
							// Super admin is tyler.haugen-stanley@crestwood.on.ca
							if (userObject.id != "jdRKpS7qyE"){
								$scope.allAdministrators.push(
								{
									name: userObject.attributes.email,
									id: userObject.id,
									object: userObject
								});
								// debugger;
								$scope.$apply();
							}
						});

					},
					error: function(error){

					}
				});

			},
			error: function(erorr){

			}

		});

	};
	getAdmins();

	/*
	* Custom angular filter to only display the users that have been assigned courses.
	*/
	$scope.hasClasses = function(user){
		if (user.assignedCourses.length > 0){
			return user;
		}
	}

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
								getAllCourses();
								// Clear the text field on course creation.
								$('#courseCodeInput').val("");
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

	getAllCourses = function(){
		$scope.allCourses = [];
		var Courses = Parse.Object.extend("Courses");
		var query = new Parse.Query(Courses);
		query.find({
			success: function(courses){
				courses.forEach(function(course){
					$scope.allCourses.push(
					{
						code: course.attributes.courseCode,
						id: course.id,
						object: course
					});
					$scope.$apply();
				});

			},
			error: function(error){

			}
		});
	}
	getAllCourses();

	getUnassignedCourses = function(){

		// Hide any previous errors/success messages
		$('#teacherAssignNoCourseSelected').hide();
		$('#assignTeacherError').hide();
		$('#assignTeacherSuccess').hide();
		$('#teacherAssignNoTeacherSelected').hide();

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
									code: course.attributes.courseCode
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

	$scope.teacherAssignCourses = {
		courses: []
	};

	$scope.studentAssignCourses = {
		courses: []
	}

	$scope.assignStudent = function(assign){
		// debugger;
		if (assign){
			var studentEmail = assign.studentName;
		}
		var courseCodes = $scope.studentAssignCourses.courses;
		var studentObject;
		$scope.studentCoursesAlreadyAssigned = [];
		$scope.studentCoursesSuccessfullyAssigned = [];

		// Hide any previous messages
		$('#assignStudentError').hide();
		$('#studentAssignNoStudentSelected').hide();
		$('#studentAssignNoCourseSelected').hide();
		$('#assignStudentSuccess').hide();
		$('#studentCoursesAlreadyAssigned').hide();
		$('#studentCoursesAlreadyAssignedConfirmation').hide();

		if (!studentEmail){
			// Please select a student
			$('#studentAssignNoStudentSelected').show();
			console.log("No student selected");

		} else if (courseCodes.length == 0){
			// Please select a class to assign
			$('#studentAssignNoCourseSelected').show();
			console.log("No course selected");
		} else { // Assign the student to the courses. 
			$scope.allStudents.forEach(function(student){
				if (student.name == studentEmail){
					studentObject = student;
					console.log("Found student object");
				}
			});

			var AssignedCoursesStudents = Parse.Object.extend("AssignedCoursesStudents");
			
			// debugger;
			courseCodes.forEach(function(courseCode){
				console.log(courseCode);
				// debugger;
				// Need to ensure the student is not already assigned this class
				// If the course trying to be added is not already added, go ahead and add it
				if ($.inArray(courseCode, studentObject.assignedCourses) < 0){

					var assignedCourse = new AssignedCoursesStudents();
					
					assignedCourse.set("assignedStudent", studentObject.object);
					assignedCourse.set("courseCode", courseCode);

					
					console.log("Before save call: "  + assignedCourse.attributes.courseCode);
					assignedCourse.save(null, {
					// 	assignedStudent: studentObject.object,
					// 	courseCode: courseCode
					// }, {
						success: function(assignedCourse){
							// console.log("SAdasdadS" + assignedCourse.attributes.courseCode);
							// debugger;
							
							// Permissions
							var acl = new Parse.ACL();
							acl.setPublicWriteAccess(false);
							acl.setPublicReadAccess(false);
							acl.setRoleReadAccess("Administrator", true);
							acl.setRoleWriteAccess("Administrator", true);
							acl.setReadAccess(studentObject.object.id, true);
							assignedCourse.setACL(acl);
							assignedCourse.save();

							$('#assignStudentSuccess').show();
							// $scope.studentCoursesSuccessfullyAssigned.push(assignedCourse.attributes.courseCode);
							$scope.studentCoursesSuccessfullyAssigned.push(courseCode);

						},
						error: function(assignedCourse, error){
							// $('#assignStudentSuccess').hide()
							debugger;
							$('#assignStudentError').show();
							console.log(error);

						}
					});
				} else {
					// User has already been assigned this course
					$scope.studentCoursesAlreadyAssigned.push(courseCode);
					$('#studentCoursesAlreadyAssigned').show();
					console.log("Some courses already assigned: " + courseCode);
				}

			});
			// Reset the selected courses
			$scope.studentAssignCourses.courses = [];
			getStudents();
		}

	};

	$scope.assignTeacher = function(assign){
		// debugger;
		if (assign){
			var teacherEmail = assign.teacherName;
		}
		var courseCodes = $scope.teacherAssignCourses.courses
		var teacherObject;
		$scope.teacherCoursesSuccessfullyAssigned = [];

		// Hide any previous errors
		$('#teacherAssignNoCourseSelected').hide();
		$('#assignTeacherError').hide();
		$('#assignTeacherSuccess').hide();
		$('#teacherAssignNoTeacherSelected').hide();

		// Error checking
		if (!teacherEmail){
			// Please select a teacher
			$('#teacherAssignNoTeacherSelected').show();
		} else if(courseCodes.length == 0){
			// Please select a class to assign
			$('#teacherAssignNoTeacherSelected').hide();
		} else { // Assign the teacher to the courses.

			// Get the teacher user object. 
			$scope.allTeachers.forEach(function(teacher){
				if (teacher.name == teacherEmail){
					teacherObject = teacher.object;
				}
			});

			var AssignedCourses = Parse.Object.extend("AssignedCourses");
			courseCodes.forEach(function(courseCode){
				var assignedCourse = new AssignedCourses();
				assignedCourse.set("assignedTeacher", teacherObject);
				assignedCourse.set("courseCode", courseCode);
				// debugger;
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

						$scope.teacherCoursesSuccessfullyAssigned.push(assignedCourse.attributes.courseCode);
						// getUnassignedCourses();
						// getTeachers();
						// getTeachers();
						// getUnassignedCourses();
					},
					error: function(assignedCourse, error){
						$('#assignTeacherError').show();
						console.log(error);
					}
				});
				// getTeachers();
				// Refresh list of available courses now.
			});
			getUnassignedCourses();
			getTeachers();
			$scope.teacherAssignCourses.courses = [];
			
		}

	};
	/*
	 * Remove this user as the assigned teacher for this course
	 */
	$scope.unassignTeacher = function(teacherObject, assignedCourse){

		// debugger;
		var AssignedCourses = Parse.Object.extend("AssignedCourses");
		var query = new Parse.Query(AssignedCourses);
		query.equalTo("assignedTeacher", teacherObject);
		// There should only ever be one teacher assigned to one course code.
		query.first({
			success: function(assignedCourseObject){
				if (assignedCourseObject){
					assignedCourseObject.destroy({
						success: function(assignedCourseObject){
							// object delted successfully
							// Hide any previous errors
							$('#teacherAssignNoCourseSelected').hide();
							$('#assignTeacherError').hide();
							$('#assignTeacherSuccess').hide();
							$('#teacherAssignNoTeacherSelected').hide();

							getTeachers();
							getUnassignedCourses();
							$scope.$apply();
							console.log("Deleted assigned teacher course object" + assignedCourseObject);
						},
						error: function(assignedCourseObject, error){
							// error deleting assigned course object
							console.log("Error: " + error + " Assigned course object: " + assignedCourseObject);
						}
					});
				} else {
					// TODO: Add error message
				}
			},
			error: function(assignedCourseObject, error){
				// TODO: add error message.
				console.log(error);

			}
		});

	};
	
	/*
	 * Remove this user as an assigned student for this course
	 */
	$scope.unassignStudent = function(studentObject, assignedCourse){

		var AssignedCoursesStudents = Parse.Object.extend("AssignedCoursesStudents");
		var query = new Parse.Query(AssignedCoursesStudents);
		query.equalTo("assignedStudent", studentObject);
		query.equalTo("courseCode", assignedCourse);
		// This student should only be assigned to this specific course once.
		query.first({
			success: function(assignedCourseObject){
				if (assignedCourseObject){
					assignedCourseObject.destroy({
						success: function(assignedCourseObject){
							// Hide any previous messages
							$('#assignStudentError').hide();
							$('#studentAssignNoStudentSelected').hide();
							$('#studentAssignNoCourseSelected').hide();
							$('#assignStudentSuccess').hide();
							$('#studentCoursesAlreadyAssigned').hide();
							$('#studentCoursesAlreadyAssignedConfirmation').hide();

							getStudents();
							$scope.$apply();
							console.log("Deleted assigned student course Object" + studentObject);
						},
						error: function(assignedCourseCodes, error){
							//error deleting assigned course object
							console.log("Error: " + error + " Assigned course object: " + assignedCourseObject);
						}
					});
				} else {
					// TODO: Add error message
				}
			},
			error: function(studentObject, error){
				console.log(error);

			}
		});

	};

	/*
	 * Remove this teacher from the system
	 */
	$scope.deleteTeacher = function(teacherObject){
		// Before deleting a teacher from the user table, we must also unassign them from all classes.

		// Get all courses this teacher has been assigned.
		var AssignedCourses = Parse.Object.extend("AssignedCourses");
		var query = new Parse.Query(AssignedCourses);
		query.equalTo("assignedTeacher", teacherObject);
		query.find({
			success: function(assignedCourseObjects){
				assignedCourseObjects.forEach(function(assignedCourseObject){
					// Remove each record of each course this teacher has been assigned.
					if (assignedCourseObject){
						assignedCourseObject.destroy({
							success: function(assignedCourseObject){
								console.log("Deleted assigned teacher course Object" + assignedCourseObject.id);
							},
							error: function(assignedCourseObject, error){
								console.log("Error: " + error + " Assigned course object: " + assignedCourseObject.id);
							}
						});
					} else {
						//TODO: Add error message (MAYBE) – No courses assigned to this teacher
					}
				});
				// Now delete the actual teacher object
				Parse.Cloud.run("deleteUser", {userId: teacherObject.id}, {
					success: function(response){
						console.log(response);
						// Update the list of assigned teachers.
						getTeachers();
						$scope.$apply();
					},
					error: function(error){
						console.log(error.message + " – Code: " + error.code);
					}
				});

			},
			error: function(error){
				// Error getting courses assigned to this teacher
			}
		});



	};

	/*
	 * Remove this student from the system
	 */
	$scope.deleteStudent = function(studentObject){
		// Before deleting a student from the user table, we must also unassign them from all classes.

		// Get all courses this studnet has been assigned.
		var AssignedCoursesStudents = Parse.Object.extend("AssignedCoursesStudents");
		var query = new Parse.Query(AssignedCoursesStudents);
		query.equalTo("assignedStudent", studentObject);
		query.find({
			success: function(assignedCourseObjects){
				assignedCourseObjects.forEach(function(assignedCourseObject){
					// Remove each record of each course this studnet has been assigned.
					if (assignedCourseObject){
						assignedCourseObject.destroy({
							success: function(assignedCourseObject){
								console.log("Deleted assigned student course Object" + assignedCourseObject.id);
							},
							error: function(assignedCourseObject, error){
								console.log("Error: " + error + " Assigned course object: " + assignedCourseObject.id);
							}
						});
					} else {
						//TODO: Add error message (MAYBE) – No courses assigned to this student
					}
				});
				// Now delete the actual student object
				Parse.Cloud.run("deleteUser", {userId: studentObject.id}, {
					success: function(response){
						console.log(response);
						// Update the list of assigned teachers.
						getStudents();
						$scope.$apply();
					},
					error: function(error){
						console.log(error.message + " – Code: " + error.code);
					}
				});

			},
			error: function(error){
				// Error getting courses assigned to this student

			}
		});

	};

	/*
	 * Remove this admin from the system
	 */
	$scope.deleteAdmin = function(adminObject){
		// Ensure that Admin's can't delete themselves. 
		if (adminObject.id == Parse.User.current().id){
			alert("Sorry, You can not delete yourself");
		} else {
			// Admin's are not assigned courses, simply remove them from the system.
			Parse.Cloud.run("deleteUser", {userId: adminObject.id}, {
				success: function(response){
					console.log(response);
					// Update the list of assigned teachers.
					getAdmins();
					$scope.$apply();
				},
				error: function(error){
					console.log(error.message + " – Code: " + error.code);
				}
			});
		}

	};

	/*
	 * Remove this course from the system. 
	 */
	$scope.deleteCourse = function(courseObject){
		/*
		* If a course is deleted, then anyone assigned to that course should also be removed from the course. 
		*
		*/
	}

	// $scope.teachersExist = function(){
	// 	if ($scope.allTeachers.length == 0){
	// 		return false;
	// 	}

	// 	return true;
	// };
	
	// $scope.studentsExist = function(){
	// 	if ($scope.allStudents.length == 0){
	// 		return false;
	// 	}
		
	// 	return true;
	// };

	// $scope.adminsExist = function(){
	// 	if ($scope.allAdminis.length == 0){
	// 		return false;
	// 	}
		
	// 	return true;
	// };
}]);