var Observable = require("FuseJS/Observable");

var fdb = new ForerunnerDB();
var db = fdb.db("todolist");
var tasks = db.collection("tasks");
var result = Observable(),
    textInput = Observable(""),
    textInputNotEmpty = Observable(false),
    noTasks = Observable(true);

initDB();

function Task(){
  this.title = "empty";
  this.done = Observable(false);
  this._id = Math.floor((Math.random() * 999999) + 1); 
}

function addTask(args){
  _task = new Task();
  _task.title = textInput.value;
  tasks.insert({
    title: _task.title,
    done: _task.done.value,
    _id: _task._id
  });
  tasks.save(function (err) {
      if (!err) {
        result.add(_task);
        textInput.value = "";
        valueChanged();   
        isResultEmpty();
      }
  });  
}

function setToDone(args){
  tasks.update({
      _id: args.data._id
  }, {
      $overwrite: {
        done: !args.data.done.value
      }
  });
  tasks.save(function (err) {
      if (!err) {
        args.data.done.value = !args.data.done.value;
      }
  });  
}

function remove(args){
  tasks.remove({
    _id: {
        "$eq": args.data._id
    }
  });
  tasks.save(function (err) {
      if (!err) {
        result.remove(args.data);
        isResultEmpty();
      }
  });    
}

function valueChanged(){
  if(textInput.value.length >= 1){
    textInputNotEmpty.value = true;
  }else{
    textInputNotEmpty.value = false;
  }
}

function isResultEmpty(){
  if(result.value != null){
    noTasks.value = false;
  }else{
    noTasks.value = true;
  }
}

function initDB(){
  tasks.load(function (err, tableStats, metaStats) {
      if (!err) {
          var _result = tasks.find();
          _result.forEach(function(value) {
              var _task = new Task();
              _task.title = value.title;
              _task.done.value = value.done;
              _task._id = value._id;
              result.add(_task);
          });
          isResultEmpty();
      }
  });
}

module.exports = {
	addTask: addTask,
  result: result,
  textInput: textInput,
  remove: remove,
  setToDone: setToDone,
  textInputNotEmpty: textInputNotEmpty,
  valueChanged: valueChanged,
  noTasks: noTasks
};