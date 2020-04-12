import './style.css';
import moment from 'moment';

let map = new Map();
setup();
restore();

function removeChilden(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function setup() {
  map.set('Date creation (Asc)', { asc: true, param: 'creationDate' });
  map.set('Date creation (Desc)', { asc: false, param: 'creationDate' });
  map.set('Due date (Asc)', { asc: true, param: 'endDate' });
  map.set('Due date (Desc)', { asc: false, param: 'endDate' });
  map.set('Text (Asc)', { asc: true, param: 'text' });
  map.set('Text (Desc)', { asc: false, param: 'text' });

  document
    .querySelectorAll('.dropdown-menu')
    .forEach(drop => drop.addEventListener('click', sort));

  search.addEventListener('keyup', searchRecords);
}

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

function searchRecords(event) {
  let text = event.target.value;
  // if (!text) {
  //   Array.from(doneTasks.children).forEach(task => (task.style.display = null));
  //   Array.from(openTasks.children).forEach(task => (task.style.display = null));
  //   return;
  // }

  Array.from(openTasks.children).forEach(task =>
    manipulateTaskDisplay(text, task),
  );
  Array.from(doneTasks.children).forEach(task =>
    manipulateTaskDisplay(text, task),
  );
}

function manipulateTaskDisplay(text, task) {
  let span = task.querySelector('span');
  let txt = span.originalText;

  if (txt.includes(text)) {
    if (task.style.display === 'none') task.style.display = null;

    span.innerHTML = txt
      .split(' ')
      .map(str => {
        if (str.includes(text)) {
          let idx = str.indexOf(text);
          let substr = str.substring(idx, text.length);
          let boldPart = '<b>' + substr + '</b>';
          str = str.replace(substr, boldPart);
        }
        return str;
      })
      .join(' ');
  } else {
    span.innerHTML = span.originalText;
    task.style.display = 'none';
  }
}

function sort(event) {
  let option = event.target.innerHTML;
  let button = event.target.parentNode.parentNode.querySelector('.btn');
  button.innerHTML = option;
  let sortParam = map.get(option).param;
  let order = map.get(option).asc;

  let storage = button.id === 'sortOpenButton' ? 'openRecords' : 'doneRecords';

  let records = getRecordsFromStorage(storage);
  records.sort((rec1, rec2) =>
    rec1[sortParam] > rec2[sortParam] && order ? 1 : -1,
  );
  localStorage.setItem(storage, JSON.stringify(records));

  let tasksContainer = button.id === 'sortOpenButton' ? openTasks : doneTasks;
  removeChilden(tasksContainer);
  getRecordsFromStorage(storage).forEach(record => drawRecord(record));
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

    rec.endDate = '';
    rec.done = false;
    addToStorage(rec);

    task.querySelector('.endDateContainer').innerHTML = '';

    records.splice(records.indexOf(rec), 1);
    localStorage.setItem('doneRecords', JSON.stringify(records));
  } else {
    doneTasks.appendChild(task);
    fromWhereToDelete = openTasks;
    let records = getRecordsFromStorage('openRecords');
    let rec = records.filter(r => r.id === id)[0];

    rec.endDate = moment();
    rec.done = true;
    addToStorage(rec);

    task.querySelector('.endDateContainer').innerHTML = moment(
      rec.endDate,
    ).format('LT');

    records.splice(records.indexOf(rec), 1);
    localStorage.setItem('openRecords', JSON.stringify(records));
  }

  Array.from(fromWhereToDelete)
    .filter(node => node.isEqualNode(task))
    .forEach(node => fromWhereToDelete.removeChild(node));
}

function deleteRecord(event) {
  let btn = event.target;
  let task = btn.closest('.taskContainer');
  let id = task.querySelector('.idContainer').innerHTML;

  let tasksChoosed = task.parentNode.id;
  let storage = tasksChoosed === 'openTasks' ? 'openRecords' : 'doneRecords';

  let records = getRecordsFromStorage(storage);
  records = records.filter(r => r.id !== id);
  localStorage.setItem(storage, JSON.stringify(records));

  task.remove();
}

function endOfInput(event) {
  let inp = event.target;
  let keyCode = event.keyCode;

  let task = inp.parentNode.parentNode;
  let span = task.getElementsByTagName('span')[0];
  let idContainer = task.querySelector('.idContainer');

  if (!(escPressed(keyCode) || enterPressed(keyCode))) return;

  if (event.keyCode === 13) {
    span.innerHTML = event.target.value;
    span.originalText = event.target.value;
    let tasksChoosed = task.closest('.baseContainer');
    let storage =
      tasksChoosed.id === 'openTasks' ? 'openRecords' : 'doneRecords';

    let records = getRecordsFromStorage(storage);
    records
      .filter(r => r.id === idContainer.innerHTML)
      .forEach(r => {
        r.text = event.target.value;
      });
    localStorage.setItem(storage, JSON.stringify(records));
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
  span.originalText = record.text;
  textContainer.appendChild(span);
  textContainer.addEventListener('dblclick', changeText);
  inputContainer.appendChild(textContainer);

  let timeIntervalsContainer = document.createElement('div');
  timeIntervalsContainer.classList.add('timeIntervalsContainer');

  let creationDateContainer = document.createElement('div');
  creationDateContainer.classList.add('creationDateContainer');
  creationDateContainer.innerHTML = moment(record.creationDate).format('LT');

  // timeIntervalsContainer.innerHTML = moment(record.creationDate).format('LT');
  timeIntervalsContainer.appendChild(creationDateContainer);

  let endDateContainer = document.createElement('div');
  endDateContainer.classList.add('endDateContainer');
  if (record.endDate) {
    endDateContainer.innerHTML = moment(record.endDate).format('LT');
  }
  timeIntervalsContainer.appendChild(endDateContainer);

  taskContainer.appendChild(timeIntervalsContainer);

  let removeBtnContainer = document.createElement('div');
  removeBtnContainer.classList.add('removeRecordContainer');
  removeBtnContainer.addEventListener('click', deleteRecord);
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
