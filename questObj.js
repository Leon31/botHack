var arrOfQuest = [
  {
     quest:"Can you compelte the sentence?\n Context is the thing to the left of the dot...",
     title:[".com", "don\'t know", "at call site"],
     payload: ["false Reference/Operators/this", "false Reference/Operators/this", "true"]
   },
  { quest: 'Which of these is a correct method to create a new array?',
    title:
     [ 'var myArray = ();',
       'var myArray = [];',
       'var myArray = new Array[];',
       'var myArray = {};',
       'var myArray = array();' ],
    payload: [ "false Reference/Operators/this", "true", "false Reference/Operators/this", "false Reference/Operators/this", "false Reference/Operators/this" ] },
  { quest: "var obj1 = {}; var obj2 = {}; What is the value of (obj1 === obj2)?",
    title: [ 'true', 'false' ],
    payload: [ "false Reference/Operators/Comparison_Operators#Identity", "true" ]
  },
  { quest: 'What does the following expression return? 1 + 5 + ” bottles of milk”;',
    title:
     [ '“15 bottles of milk”',
       '“6 bottles of milk”',
       'undefined. An exception is thrown',
       '“5 bottles of milk”' ],
    payload: [ "false Reference/Global_Objects/String", "true", "false Reference/Global_Objects/String", "false Reference/Global_Objects/String" ] },
  { quest: 'How do you create an object in JavaScript?',
    title:
     [ 'var obj = {};',
       'function Foo() {} var obj = new Foo();',
       'All of these work.',
       'var obj = new Object();' ],
    payload: [ "false Reference/Global_Objects/Object", "false Reference/Global_Objects/Object", "true", "false Reference/Global_Objects/Object" ] },
  { quest: 'What is the result of the following statement: typeof “x”;',
    title:
     [ '“character”',
       '“[object String]”',
       'Throws error “ReferenceError: x is not defined”',
       '“string”',
       '“undefined”' ],
    payload: [ "false Reference/Operators/typeof", "false Reference/Operators/typeof", "false Reference/Operators/typeof", "true", "false Reference/Operators/typeof" ] },
  { quest: 'Primitive types are passed by :',
  title: [ 'Value', 'Pointer', 'Reference' ],
  payload: [ "true", "false Data_structures", "false Data_structures" ] },
  { quest: 'Which is not a primitive data type in JavaScript?',
    title: [ 'boolean', 'number', 'string', 'character' ],
    payload: [ "false Data_structures", "false Data_structures", "false Data_structures", "true" ] },
  { quest: 'To what type are values converted internally when evaluating a conditional statement?',
    title: [ 'positive', 'negative', 'integer', 'tinyint', 'boolean' ],
    payload: [ "false Data_structures", "false Data_structures", "false Data_structures", "false Data_structures", "true" ] },
  { quest: 'Which of these is not a logical operator?',
    title: [ '!', '&', '&&', '||' ],
    payload: [ "false Operators", "true", "false Operators", "false Operators" ] },
  { quest: 'Which of the following variable types does not exist in JavaScript?',
    title: [ 'boolean', 'number', 'object', 'double', 'string' ],
    payload: [ "false Data_structures", "false Data_structures", "false Data_structures", "true", "false Data_structures" ] },
  { quest: 'How do you write a conditional statement that will *only* execute the contained code if variable x has a value 5 of type *number*?',
    title:
     [ 'if (x == 5) { … }',
       'if x = 5 …',
       'if (x === 5) { … }',
       'if x = 5 then …' ],
      payload: [ "false Reference/Statements/if...else", "false Reference/Statements/if...else", "true", "false Reference/Statements/if...else" ] }
];

module.exports = arrOfQuest;
