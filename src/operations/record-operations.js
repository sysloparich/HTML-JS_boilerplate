import { escPressed, enterPressed } from '../utils.js';
import Record from '../record.js';
import {
  fullResetView,
  drawAll,
  drawRecord,
  resetViewFor,
  spanOverlapInput,
} from './draw-operations.js';
import {
  moveToAnotherList,
  addToStorage,
  getRecordsFromStorage,
  deleteFromStorage,
  clearStorage,
  modifyRecordContent,
} from './storage-operations';
import moment from 'moment';

import {
  OPEN_RECORDS_STORAGE_NAME,
  DONE_RECORDS_STORAGE_NAME,
  sortMap,
  dropdownToStorageMap,
  dropdownToTaskContainerMap,
  taskContainerToStorageMap,
  linkToStorageMap,
  linkToTaskContainerMap,
} from '../constants.js';

import { textEntryFound, modifyTextStyle } from '../utils.js';

export function clearRecords(event) {
  let link = event.target.id;
  let container = document.querySelector(
    '#' + linkToTaskContainerMap.get(link),
  );

  resetViewFor(container);
  clearStorage(linkToStorageMap.get(link));
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

export function searchRecords(event) {
  fullResetView();

  let partText = event.target.value;

  let openRecs = getRecordsFromStorage(OPEN_RECORDS_STORAGE_NAME).map(task =>
    buildModifiedRecord(task, partText),
  );
  let doneRecs = getRecordsFromStorage(DONE_RECORDS_STORAGE_NAME).map(task =>
    buildModifiedRecord(task, partText),
  );

  drawAll([openRecs, doneRecs]);
}

function sortForStorage(storage, sortParam) {
  let records = getRecordsFromStorage(storage);
  records.sort((rec1, rec2) =>
    rec1[sortParam.field] > rec2[sortParam.field] && sortParam.order ? 1 : -1,
  );
  localStorage.setItem(storage, JSON.stringify(records));

  return records;
}

export function sort(event) {
  let option = sortMap.get(event.target.dataset.sortOption);
  let dropdownId = event.currentTarget.id;

  let records = sortForStorage(dropdownToStorageMap.get(dropdownId), {
    field: option.param,
    order: option.asc,
  });

  let container = document.querySelector(
    '#' + dropdownToTaskContainerMap.get(dropdownId),
  );

  resetViewFor(container);
  drawAll([records]);
}

export function switchLists(event) {
  fullResetView();

  let checkbox = event.target;
  let task = checkbox.closest('.taskContainer');
  let taskDone = task.querySelector('.checkboxClass').checked;
  let taskId = task.querySelector('.idContainer').dataset.id;

  moveToAnotherList({ id: taskId, done: taskDone });

  drawAll();
}

export function deleteRecord(event) {
  let btn = event.target;

  let task = btn.closest('.taskContainer');
  let id = task.querySelector('.idContainer').dataset.id;
  let storage = taskContainerToStorageMap.get(task.parentNode.id);

  deleteFromStorage(storage, id);
  task.remove();
}

export function createRecord(event) {
  if (event.type === 'keyup' && !enterPressed(event.keyCode)) return;

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

export function endOfInput(event) {
  let inp = event.target;
  let task = inp.closest('.taskContainer');
  let span = task.getElementsByTagName('span')[0];

  let keyCode = event.keyCode;

  if (escPressed(keyCode)) {
    spanOverlapInput(span, inp);
    return;
  }

  if (!inp.value) return;

  if (enterPressed(keyCode)) {
    span.innerHTML = inp.value;
    span.originalText = inp.value;
    let tasksChoosed = task.closest('.baseContainer');
    modifyRecordContent(
      taskContainerToStorageMap.get(tasksChoosed.id),
      task.querySelector('.idContainer').dataset.id,
      inp.value,
    );
    spanOverlapInput(span, inp);
  }
}
