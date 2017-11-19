var arrOfQuest = [
  { quest: 'Which of these is a correct method to create a new array?',
    title:
     [ 'var myArray = ();',
       'var myArray = [];',
       'var myArray = new Array[];',
       'var myArray = {};',
       'var myArray = array();' ],
    payload: [ "false Operators/this", "true", "false Operators/this", "false Operators/this", "false Operators/this" ] },
  {
    quest:"Which is the right way to initialise an Array?\n",
    title:["var arr = [1,2,3]", "arr[1][2][3]", "var arr = {1,2,3}"],
    payload: ["true ", "false Global_Objects/Array", "false Global_Objects/Array"]
  },
  { quest: "var obj1 = {}; var obj2 = {}; What is the value of (obj1 === obj2)?",
    title: [ 'true', 'false' ],
    payload: [ "false Operators/Comparison_Operators#Identity", "true" ]
  },
  { quest: 'What does the following expression return? 1 + 5 + ” bottles of milk”;',
    title:
     [ '“15 bottles of milk”',
       '“6 bottles of milk”',
       'undefined. An exception is thrown',
       '“5 bottles of milk”' ],
    payload: [ "false Global_Objects/String", "true", "false Global_Objects/String", "false Global_Objects/String" ] },
    { quest: 'How do you create an object in JavaScript?',
      title:
       [ 'var obj = {};',
         'function Foo() {} var obj = new Foo();',
         'All of these work.',
         'var obj = new Object();' ],
      payload: [ "false Global_Objects/Object", "false Global_Objects/Object", "true", "false Global_Objects/Object" ] },
      { quest: 'What is the result of the following statement: typeof “x”;',
        title:
         [ '“character”',
           '“[object String]”',
           'Throws error “ReferenceError: x is not defined”',
           '“string”',
           '“undefined”' ],
        payload: [ "false Operators/typeof", "false Operators/typeof", "false Operators/typeof", "true", "false Operators/typeof" ] },
        { quest: 'Primitive types are passed by :',
          title: [ 'Value', 'Pointer', 'Reference' ],
          payload: [ "true", "false Data_structures", "false Data_structures" ] },
          { quest: 'Which is not a primitive data type in JavaScript?',
            title: [ 'boolean', 'number', 'string', 'character' ],
            payload: [ "false Data_structures", "false Data_structures", "false Data_structures", "true" ] }
];

module.exports = arrOfQuest;
