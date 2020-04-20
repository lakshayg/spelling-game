var app = angular.module('myApp', ['ngStorage', 'ngMaterial', 'ngMessages']);
app.controller('myCtrl', ($scope, $http, $localStorage, $mdSidenav) => {
  $scope.index = 0;
  $scope.words_loaded = true;
  $scope.n_correct = 0;
  $scope.n_attempts = 0;
  $scope.word_list_sidebar = null;
  $scope.words = null;
  $scope.last_incorrect_response = "";
  $scope.game_length = 10;

  var speak = function(text) {
    var utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  var word = function() {
    return $scope.words[$scope.index];
  };

  var incrementWord = function() {
    $scope.index = ($scope.index + 1) % $scope.words.length;
  };

  $scope.poseQuestion = function() {
    speak("Spell; " + word());
  };

  var correctResponseSequence = function(pose_next_q) {
    $scope.n_correct += 1;
    $scope.spelling = ''; // Clear the text box
    speak("That's correct, good job!");
    incrementWord();
    if (pose_next_q) {
      $scope.poseQuestion();
    }
  };

  var incorrectResponseSequence = function() {
    var input = $scope.spelling.toLowerCase();
    $scope.last_incorrect_response = input;
    var sounds_same = soundexCode(input) == soundexCode(word()) || metaphone(input) == metaphone(word());
    var edit_distance = levenshteinEditDistance(input, word());
    if (sounds_same) {
      speak("Good try! that does sound like " + word());
    } else if (edit_distance <= 1) {
      speak("Good try! that's almost correct");
    }
    speak("Let's try again, the word is: " + word());
  };

  var finishGameSequence = function() {
    if ($scope.n_correct == $scope.n_attempts) {
      speak("Awesome! you got a perfect score!");
    } else {
      speak("Awesome! You scored " + $scope.n_correct + " points!");
    }
  };

  $scope.check = function() {
    var input = $scope.spelling;
    if (input == undefined || input.length == 0) {
      return;
    }
    var expected = word().toLowerCase();
    if (input.toLowerCase() == expected) {
      $scope.last_incorrect_response = "";
      correctResponseSequence($scope.n_attempts < $scope.game_length - 1);
    } else {
      if (input == $scope.last_incorrect_response) {
        return;
      }
      incorrectResponseSequence();
    }
    $scope.n_attempts += 1;
    if ($scope.n_attempts == $scope.game_length) {
      finishGameSequence();
    }
  };

  $scope.addWord = function(word) {
    word = word.toLowerCase();
    if (!$scope.words.includes(word)) {
      $scope.words.push(word);
      $scope.words.sort();
    }
  };

  $scope.deleteWord = function(index) {
    $scope.words.splice(index, 1);
  };

  // Initialization
  $mdSidenav("wordList", true).then(instance => $scope.word_list_sidebar = instance);
  if ($localStorage.words == undefined || $localStorage.words.length == 0) {
    $localStorage.words = [];
    $scope.words_loaded = false;
  }
  $scope.words = $localStorage.words;

  if (!$scope.words_loaded) {
    speak("No words have been added to the storage, please add some words to continue");
  } else {
    $scope.poseQuestion();
  }
});
