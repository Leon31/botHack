const challangesEasy = ['third-angle-of-a-triangle','opposite-number','correct-the-time-string','even-or-odd','remove-first-and-last-character','jennys-secret-message', 'counting-sheep-dot-dot-dot','sentence-smash','numbers-in-strings','indexed-capitalization','alphabet-symmetry','sum-of-odd-numbers','shortest-word','moves-in-squared-strings-i','word-values','every-nth-array-element-basic','convert-a-linked-list-to-a-string','geometry-a-2-length-of-a-vector'];
const challangesMedium = ['opposite-number','even-or-odd','reverse-or-rotate','up-and-down','getting-along-with-integer-partitions','ball-upwards','twice-linear','magnet-particules-in-boxes','reverse-or-rotate','least-common-multiple','simple-pig-latin','1-s-0-s-and-wildcards','chess-fun-number-7-chess-triangle','where-my-anagrams-at','valid-parentheses','convert-pascalcase-string-into-snake-case','finding-the-closest-maximum-values-of-a-function-to-an-upper-limit','rgb-to-hex-conversion'];
const challangesHard = ['4-by-4-skyscrapers','my-smallest-code-interpreter-aka-brainf-star-star-k','esolang-interpreters-number-4-boolfuck-interpreter','faberge-easter-eggs-crush-test','regular-expression-check-if-divisible-by-0b111-7','my-smallest-code-interpreter-aka-brainf-star-star-k','ascii85-encoding-and-decoding','the-position-of-a-digital-string-in-a-infinite-digital-string','tiny-three-pass-compiler','6-by-6-skyscrapers'];

const randomizer = function (array) {
  let index = Math.floor(Math.random() * array.length);
  return array[index];
};

var generateLink = function (diff, lang) {
  if (diff === 'easy') {
    var res = randomizer(challangesEasy);
  } else if (diff === 'mid') {
    res = randomizer(challangesMedium);
  }
  else {
    res = randomizer(challangesHard);
  }
  return `https://www.codewars.com/kata/${res}/train/${lang}`;
};


module.exports = generateLink;
