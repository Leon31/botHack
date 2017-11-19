const challangesEasy = ['third-angle-of-a-triangle','opposite-number','even-or-odd','remove-first-and-last-character','jennys-secret-message', 'counting-sheep-dot-dot-dot','sentence-smash','numbers-in-strings'];
const challangesMedium = ['opposite-number','even-or-odd','reverse-or-rotate','up-and-down','getting-along-with-integer-partitions','ball-upwards','twice-linear','magnet-particules-in-boxes','reverse-or-rotate'];
const challangesHard = ['4-by-4-skyscrapers','my-smallest-code-interpreter-aka-brainf-star-star-k','esolang-interpreters-number-4-boolfuck-interpreter','faberge-easter-eggs-crush-test','regular-expression-check-if-divisible-by-0b111-7','my-smallest-code-interpreter-aka-brainf-star-star-k','ascii85-encoding-and-decoding','the-position-of-a-digital-string-in-a-infinite-digital-string','tiny-three-pass-compiler','6-by-6-skyscrapers'];

const randomizer = function (array) {
  let index = Math.floor(Math.random() * array.length);
  return array[index];
};

var generateLink = function (diff) {
  if (diff === 'easy') {
    var res = randomizer(challangesEasy);
  } else if (diff === 'mid') {
    res = randomizer(challangesMedium);
  }
  else {
    res = randomizer(challangesHard);
  }
  return `https://www.codewars.com/kata/${res}/train/javascript`;
};


module.exports = generateLink;
