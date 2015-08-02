
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("createNewUser", function(user, response){
  var newUser = new Parse.User();
  newUser.set("username", user.params.name);
  newUser.set("password", user.params.password);
  // The username will represent the users email and their name
  newUser.set("email", user.params.name);
  newUser.set("accountType", user.params.accountType);
  
  
  newUser.signUp(null, {
    success: function() {
      response.success("User created");
    },
    error: function(error) {
      // Show the error message somewhere and let the user try again.
      response.error("Users must be unique.");
    }
  });
});

Parse.Cloud.afterSave(Parse.User, function(request) {
  // Enable the master key
  Parse.Cloud.useMasterKey();

  // Add the ACL and the Role for the user that was just saved.
  
  // The User object that was just saved.
  var userThatWasJustSaved = request.user;

  // User is signed up, set their ACL now.
  //Set the ACL for this user.
  var newACL = new Parse.ACL(userThatWasJustSaved);
  newACL.setPublicReadAccess(false);
  newACL.setPublicWriteAccess(false);
  newACL.setRoleReadAccess("Administrator", true);
  userThatWasJustSaved.setACL(newACL);
  userThatWasJustSaved.save();

  // Get the role we will be adding the new user to.
  var query = (new Parse.Query(Parse.Role));
  query.equalTo("name", userThatWasJustSaved.attributes.accountType);
  // Add the user to their correct role.      
  query.first({
    success: function(role){
      role.relation("users").add(userThatWasJustSaved);
      role.save();
      // if (role){
      //   role.getUsers().add(userThatWasJustSaved);
      // }
    },
    error: function(error) {
      throw "Got an error " + error.code + " : " + error.message;
    }
  });
});