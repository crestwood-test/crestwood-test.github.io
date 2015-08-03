app.controller('IndexController', ['$scope', function($scope){
	
  $scope.validateLogin = function(user){

    // Ensure that the user entered an email and password
    if (user.email && user.password){
      // Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");
      // Do Parse validation here.
      Parse.User.logIn(user.email, user.password, {
        success: function(user) {
          // Determine what type of user just logged in and display the correct page
          // Check to see if the user is a student
          var query = (new Parse.Query(Parse.Role));
          query.equalTo("name", "Student").equalTo("users", Parse.User.current());
          query.first({
            success: function(studentRole){
              if (studentRole){ 
                window.location = "/app/js/views/studentIndex.html";
              } else { // If the user is not a student see if they are a teacher
                query = (new Parse.Query(Parse.Role));
                query.equalTo("name", "Teacher").equalTo("users", Parse.User.current());
                query.first({
                  success: function(teacherRole){
                    if (teacherRole){
                      window.location = "/app/js/views/teacherIndex.html";
                    } else { // If the user is not a teacher ensure that they are an admin.
                      query = (new Parse.Query(Parse.Role));
                      query.equalTo("name", "Administrator").equalTo("users", Parse.User.current());
                      query.first({
                        success: function(adminRole){
                          if (adminRole) {
                            window.location = "/app/js/views/adminIndex.html";
                          } else {
                            window.location = "/app/js/views/404Page.html";
                          }
                        }
                      });
                    }
                  }
                });
              }
            }
          });
          /*.then(function(studentRole){
            debugger;
            if (studentRole){
              window.location = "/app/js/views/studentIndex.html";
            }
          });*/

          
          /*.then(function(teacherRole){
            debugger;
            if (teacherRole){
              window.location = "/app/js/views/teacherIndex.html";
            }
          });*/

          // Check to see if the user is an admin.
          
          /*.then(function(adminRole){
            if (adminRole) {
              window.location = "/app/js/views/adminIndex.html";
            } else{
              window.location = "/app/js/views/404Page.html";
            }
          });*/

          // if unknown user role display 404 page
          //window.location = "/app/js/views/404Page.html"
          /* ASK LIAM*/
          // switch(user.attributes.accountType){
          //   case "student":
          //     window.location = "/app/js/views/studentIndex.html";
          //     break;
          //   case "teacher":
          //     window.location = "/app/js/views/teacherIndex.html";
          //     break;
          //   case "admin":
          //     window.location = "/app/js/views/adminIndex.html";
          //     break;
          // }
          // window.location.href="/app/js/views/studentIndex.html";
        },
        error: function(user, error) {
          // The login failed. Check error to see why.
          // debugger;
          //debugger;
          $('#message_error').append("<p>" + error.message + "</p>").show();

          //alert(error);
        }
      });
    }
  };
  
}]);