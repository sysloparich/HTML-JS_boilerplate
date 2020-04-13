import './style.css';
import moment from 'moment';

function drawRecord(record) {
  const layout = `
    <div class='checkboxContainer'>
      <label class='checkbox-inline'>
        <input type='checkbox' class='checkboxClass'></input>
      </label>
    </div>

    <div class="inputContainer">
      <input class='inputPosition transparent' style='display:none;'></input>
      <div class='inputPosition textContainer'>
        <span style='word-wrap: break-word;'>
          ${record.text}
        </span>
      </div>
    </div>

    <div class='timeIntervalsContainer'>
      <div class='creationDateContainer'>
        ${moment(record.creationDate).format('LT')}
      </div>
      <div class='endDateContainer'>
        ${record.endDate ? moment(record.endDate).format('LT') : ''}
      </div>
    </div>

    <div class='removeRecordContainer' style='display:none;'>
      <button class='fa fa-trash removeRecord'></button>
    </div>

    <div class='idContainer' style='display: none;'>${record.id}</div>
`;

  let newRec = document.createElement('div');
  newRec.classList.add('taskContainer', 'shadowed');
  newRec.style.display = record.display ? record.display : null;
  newRec.innerHTML = layout;
  newRec.querySelector('.checkboxClass').checked = record.done;

  addEventListeners(newRec);

  if (record.done) {
    doneTasks.appendChild(newRec);
  } else {
    openTasks.appendChild(newRec);
  }
}

function addEventListeners(newRec) {
  newRec.addEventListener('mouseenter', manipulateTrashBin);
  newRec.addEventListener('mouseleave', manipulateTrashBin);
  newRec.querySelector('.checkboxClass').addEventListener('click', switchLists);
  newRec
    .querySelector('.inputPosition, .transparent')
    .addEventListener('keyup', endOfInput);
  newRec
    .querySelector('.textContainer')
    .addEventListener('dblclick', changeText);
  newRec
    .querySelector('.removeRecordContainer')
    .addEventListener('click', deleteRecord);
}

function resetViewFor(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function fullResetView() {
  [openTasks, doneTasks].forEach(list => {
    resetViewFor(list);
  });
}

function drawAll(listOfLists) {
  if (listOfLists) {
    listOfLists.forEach(list => list.forEach(rec => drawRecord(rec)));
  } else {
    getRecordsFromStorage('openRecords').forEach(record => drawRecord(record));
    getRecordsFromStorage('doneRecords').forEach(record => drawRecord(record));
  }
}

function clearStorage(storage) {
  localStorage.setItem(storage, JSON.stringify([]));
}

function clearRecords(event) {
  let link = event.target.id;

  let list = link === 'clearOpenList' ? openTasks : doneTasks;
  resetViewFor(list);

  let storage = link === 'clearOpenList' ? 'openRecords' : 'doneRecords';
  clearStorage(storage);
}

function setup() {
  sortMap.set('Date creation (Asc)', { asc: true, param: 'creationDate' });
  sortMap.set('Date creation (Desc)', { asc: false, param: 'creationDate' });
  sortMap.set('Due date (Asc)', { asc: true, param: 'endDate' });
  sortMap.set('Due date (Desc)', { asc: false, param: 'endDate' });
  sortMap.set('Text (Asc)', { asc: true, param: 'text' });
  sortMap.set('Text (Desc)', { asc: false, param: 'text' });

  document
    .querySelectorAll('.dropdown-menu')
    .forEach(drop => drop.addEventListener('click', sort));

  search.addEventListener('keyup', searchRecords);

  document
    .querySelectorAll('.clearList')
    .forEach(clear => clear.addEventListener('click', clearRecords));

  addBtn.addEventListener('click', createRecord);
  addTask.addEventListener('keyup', createRecord);

  addBtn.addEventListener('click', resetSort);
  addTask.addEventListener('keyup', resetSort);

  drawAll();
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

function textEntryFound(originalText, textPart) {
  return (
    originalText.split(' ').filter(token => token.startsWith(textPart)).length >
    0
  );
}

function modifyTextStyle(originalText, textPart) {
  return originalText
    .split(' ')
    .map(str => {
      if (str.startsWith(textPart)) {
        let idx = str.indexOf(textPart);
        let substr = str.substring(idx, textPart.length);
        let boldPart = '<b>' + substr + '</b>';
        str = str.replace(substr, boldPart);
      }
      return str;
    })
    .join(' ');
}

function buildModifiedRecord(record, partText) {
  if (textEntryFound(record.text, partText)) {
    let modifiedText = modifyTextStyle(record.text, partText);
    record.text = modifiedText;
    record.display = null;
  } else {
    record.display = 'none';
  }

  return record;
}

function searchRecords(event) {
  fullResetView();

  let partText = event.target.value;

  let openRecs = getRecordsFromStorage('openRecords').map(task =>
    buildModifiedRecord(task, partText),
  );
  let doneRecs = getRecordsFromStorage('doneRecords').map(task =>
    buildModifiedRecord(task, partText),
  );

  drawAll([openRecs, doneRecs]);
}

function sort(event) {
  let option = event.target.innerHTML;
  let button = event.target.parentNode.parentNode.querySelector('.btn');
  button.innerHTML = option;
  let sortParam = sortMap.get(option).param;
  let order = sortMap.get(option).asc;

  let storage = button.id === 'sortOpenButton' ? 'openRecords' : 'doneRecords';

  let records = getRecordsFromStorage(storage);
  records.sort((rec1, rec2) =>
    rec1[sortParam] > rec2[sortParam] && order ? 1 : -1,
  );
  localStorage.setItem(storage, JSON.stringify(records));

  let tasksContainer = button.id === 'sortOpenButton' ? openTasks : doneTasks;
  resetViewFor(tasksContainer);
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

  if (!event.target.value) return;

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

  // span.style.display = 'unset';
  span.style.display = null;
  inp.value = '';
  inp.style.display = 'none';
}

function changeText(event) {
  let textContainer = event.currentTarget;
  let inputContainer = textContainer.parentNode;
  let inp = inputContainer.getElementsByTagName('input')[0];
  // inp.style.display = 'unset';
  inp.style.display = null;
  inp.focus();
  let span = inputContainer.getElementsByTagName('span')[0];
  span.style.display = 'none';
}

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

function resetSort(event) {
  sortOpenButton.innerHTML = 'Sort by';
}

function manipulateTrashBin(event) {
  let display = event.type === 'mouseenter' ? null : 'none';
  event.target.querySelector('.removeRecordContainer').style.display = display;
}

let sortMap = new Map();
setup();
