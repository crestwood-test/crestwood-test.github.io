app.controller('IndexController', ['$scope', function($scope){
	
  $scope.validateLogin = function(user){

    // Do Parse validation here.
    window.alert("validate");
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