app.controller('IndexController', ['$scope', function($scope){
	
  $scope.validateLogin = function(user){

    // Ensure that the user entered an email and password
    if (user.email && user.password){
      Parse.initialize("N7SiZg1sfRYhCWwPT0jc7qayEqKcvjtsj7cHzn72", "kVSHLLY9Xq3zNR3ldJcLEMI1d2jqnxaCy0Z8Ud2l");
      // Do Parse validation here.
      Parse.User.logIn(user.email, user.password, {
        success: function(user) {
          // Do stuff after successful login.
          window.location.href="/app/js/views/studentIndex.html";
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
  }
  
  $scope.title = 'This is my own string';
  $scope.promo = "15% off all childrens books.";

  $scope.products = 
  [
    {
      name: 'The Book of Trees',
      price: 19,
      pubdate: new Date('2014', '03', '08'),
      cover: 'img/the-book-of-trees.jpg',
      likes: 0,
      dislikes: 0
    },
    {
      name: 'Program or be Programmed',
      price: 8,
      pubdate: new Date('2013', '08', '01'),
      cover: 'img/program-or-be-programmed.jpg',
      likes: 0,
      dislikes: 0
    },
    {
      name: "Book 1",
      price: 10,
      pubdate: new Date('2015', '06', '01'),
			cover: 'img/the-book-of-trees.jpg',
      likes: 0,
      dislikes: 0
    },
    {
      name: "Book 2",
      price: 100,
      pubdate: new Date('2015', '06', '02'),
      cover: 'img/program-or-be-programmed.jpg',
      likes: 0,
      dislikes: 0
    }
  ];
  
	$scope.plusOne = function(index){
		$scope.products[index].likes += 1;
	};
  $scope.minusOne = function(index){
  	$scope.products[index].dislikes += 1;
  };
}]);