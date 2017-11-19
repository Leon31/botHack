var arrOfQuest = [
  {
    quest:"Can you compelte the sentence?\n Context is the thing on the left of the dot...",
    title:[".com", "I don't know", "at the call site"],
    payload: ["false Operators/this", "false Operators/this", "true"]
  },
  {
    quest:"Which is the right way to initialise an Array?\n",
    title:["var arr = [1,2,3]", "arr[1][2][3]", "var arr = {1,2,3}"],
    payload: ["true ", "false Global_Objects/Array", "false Global_Objects/Array"]
  }
];

module.exports = arrOfQuest;
