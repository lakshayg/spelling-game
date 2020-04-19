var speak = function(text) {
  var utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
};

var app = angular.module('myApp', ['ngStorage', 'ngMaterial', 'ngMessages']);
app.controller('myCtrl', ($scope, $http, $localStorage, $mdSidenav) => {
  $scope.index = 0;
  $scope.words_loaded = true;
  $scope.n_correct = 0;
  $scope.n_attempts = 0;
  $scope.word_list_sidebar = null;
  $scope.words = null;

  var word = function() {
    return $scope.words[$scope.index];
  };

  var incrementWord = function() {
    $scope.index = ($scope.index + 1) % $scope.words.length;
  };

  var correctResponseSequence = function() {
    $scope.n_correct += 1;
    $scope.spelling = ''; // Clear the text box
    speak("That's correct, good job!");
    incrementWord();
    speak(word());
  };

  var provideFeedback = function(input, expected) {
    var sounds_same = soundexCode(input) == soundexCode(expected) || metaphone(input) == metaphone(expected);
    var edit_distance = levenshteinEditDistance(input, expected);

    if (sounds_same) {
      speak("Good try! that does sound like " + expected);
    } else if (edit_distance <= 1) {
      speak("Good try! that's almost correct");
    }
  };

  var incorrectResponseSequence = function() {
    provideFeedback($scope.spelling, word());
    speak("Let's try again, the word is: " + word());
  };

  $scope.check = function() {
    var input = $scope.spelling;
    if (input == undefined || input.length == 0) {
      speak("The word is " + word());
      return;
    }
    var expected = word().toLowerCase();
    if (input.toLowerCase() == expected) {
      correctResponseSequence();
    } else {
      incorrectResponseSequence();
    }
    $scope.n_attempts += 1;
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
    speak(word());
  }
});
