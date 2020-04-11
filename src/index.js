import './style.css';
import moment from 'moment';

restore();

function getRecordsFromStorage(list) {
  let records = JSON.parse(localStorage.getItem(list));
  return records ? records : [];
}

class Record {
  constructor(obj) {
    this.id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    this.text = obj.text;
    this.creationDate = obj.creationDate;
    this.done = false;
  }
}

function escPressed(code) {
  return code === 27;
}

function enterPressed(code) {
  return code === 13;
}

function switchLists(event) {
  let checkbox = event.target;

  let task = checkbox.parentNode.parentNode.parentNode;
  let fromWhereToDelete;

  let id = task.querySelector('.idContainer').innerHTML;

  if (!checkbox.checked) {
    openTasks.appendChild(task);
    fromWhereToDelete = doneTasks;
    let records = getRecordsFromStorage('doneRecords');
    let rec = records.filter(r => r.id === id)[0];

    rec.done = false;
    addToStorage(rec);

    records.splice(records.indexOf(rec), 1);
    localStorage.setItem('doneRecords', JSON.stringify(records));
  } else {
    doneTasks.appendChild(task);
    fromWhereToDelete = openTasks;
    let records = getRecordsFromStorage('openRecords');
    let rec = records.filter(r => r.id === id)[0];

    rec.done = true;
    addToStorage(rec);

    records.splice(records.indexOf(rec), 1);
    localStorage.setItem('openRecords', JSON.stringify(records));
  }

  Array.from(fromWhereToDelete)
    .filter(node => node.isEqualNode(task))
    .forEach(node => fromWhereToDelete.removeChild(node));
}

function endOfInput(event) {
  let inp = event.target;
  let keyCode = event.keyCode;
  let span = inp.parentNode.parentNode.getElementsByTagName('span')[0];

  if (!(escPressed(keyCode) || enterPressed(keyCode))) return;

  if (event.keyCode === 13) {
    span.innerHTML = event.target.value;
  }

  span.style.display = 'unset';
  inp.value = '';
  inp.style.display = 'none';
}

function changeText(event) {
  let textContainer = event.currentTarget;
  let inputContainer = textContainer.parentNode;
  let inp = inputContainer.getElementsByTagName('input')[0];
  inp.style.display = 'unset';
  let span = inputContainer.getElementsByTagName('span')[0];
  span.style.display = 'none';
}

addBtn.addEventListener('click', createRecord);
addTask.addEventListener('keyup', createRecord);

function createRecord(event) {
  if (event.type === 'keyup' && event.keyCode !== 13) return;

  let text = addTask.value;
  if (!text) return;

  addTask.value = '';

  let newRecord = new Record({
    text: text,
    creationDate: moment(),
  });
  drawRecord(newRecord);

  addToStorage(newRecord);
}

function addToStorage(record) {
  let key = record.done ? 'doneRecords' : 'openRecords';
  let saved = getRecordsFromStorage(key);

  let records = saved;
  records.push(record);
  localStorage.setItem(key, JSON.stringify(records));
}

function restore() {
  getRecordsFromStorage('openRecords').forEach(record => drawRecord(record));
  getRecordsFromStorage('doneRecords').forEach(record => drawRecord(record));
}

function drawRecord(record) {
  let taskContainer = document.createElement('div');
  taskContainer.classList.add('taskContainer', 'shadowed');

  if (record.done) {
    doneTasks.appendChild(taskContainer);
  } else {
    openTasks.appendChild(taskContainer);
  }

  let checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkboxContainer');
  let checkboxLabel = document.createElement('label');
  checkboxLabel.classList.add('checkbox-inline');
  let checkbox = document.createElement('input');
  checkbox.addEventListener('click', switchLists);
  checkbox.type = 'checkbox';
  checkbox.checked = record.done;
  checkboxLabel.appendChild(checkbox);
  checkboxContainer.appendChild(checkboxLabel);
  taskContainer.appendChild(checkboxContainer);

  let inp = document.createElement('input');
  inp.classList.add('inputPosition', 'transparentInput');

  let inputContainer = document.createElement('div');
  inputContainer.classList.add('inputContainer');
  inp.addEventListener('keyup', endOfInput);
  inputContainer.appendChild(inp);
  taskContainer.appendChild(inputContainer);
  inp.style.display = 'none';

  let textContainer = document.createElement('div');
  let span = document.createElement('span');
  textContainer.classList.add('inputPosition');
  span.style.setProperty('word-wrap', 'break-word');
  span.innerHTML = record.text;
  textContainer.appendChild(span);
  textContainer.addEventListener('dblclick', changeText);
  inputContainer.appendChild(textContainer);

  let timeIntervalsContainer = document.createElement('div');
  timeIntervalsContainer.classList.add('timeIntervalsContainer');
  timeIntervalsContainer.innerHTML = moment(record.creationDate).format('LT');
  taskContainer.appendChild(timeIntervalsContainer);

  let removeBtnContainer = document.createElement('div');
  removeBtnContainer.classList.add('removeRecordContainer');
  let removeBtn = document.createElement('button');
  removeBtn.classList.add('fa', 'fa-trash', 'removeRecord');
  removeBtnContainer.appendChild(removeBtn);
  taskContainer.appendChild(removeBtnContainer);

  let idContainer = document.createElement('div');
  idContainer.classList.add('idContainer');
  idContainer.style.display = 'none';
  idContainer.innerHTML = record.id;
  taskContainer.appendChild(idContainer);
}
