import { getRecordsFromStorage } from './storage-operations.js';
import {
  OPEN_RECORDS_STORAGE_NAME,
  DONE_RECORDS_STORAGE_NAME,
} from '../constants.js';
import { switchLists, endOfInput, deleteRecord } from './record-operations.js';

import moment from 'moment';

export function drawRecord(record) {
  if (record.display == 'none') return;

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
  
      <div class='idContainer' style='display: none;' data-id=${
        record.id
      }></div>
  `;
  let newRec = document.createElement('div');
  newRec.classList.add('taskContainer', 'shadowed');
  newRec.innerHTML = layout;
  newRec.querySelector('.checkboxClass').checked = record.done;

  addEventListeners(newRec);

  if (record.done) {
    doneTasks.appendChild(newRec);
  } else {
    openTasks.appendChild(newRec);
  }
}

export function resetViewFor(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function fullResetView() {
  [openTasks, doneTasks].forEach(list => {
    resetViewFor(list);
  });
}

export function drawAll(listOfLists) {
  if (listOfLists) {
    listOfLists.forEach(list => list.forEach(rec => drawRecord(rec)));
  } else {
    getRecordsFromStorage(OPEN_RECORDS_STORAGE_NAME).forEach(record =>
      drawRecord(record),
    );
    getRecordsFromStorage(DONE_RECORDS_STORAGE_NAME).forEach(record =>
      drawRecord(record),
    );
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

function manipulateTrashBin(event) {
  let display = event.type === 'mouseenter' ? null : 'none';
  event.target.querySelector('.removeRecordContainer').style.display = display;
}

export function resetSort(event) {
  sortOpenButton.innerHTML = 'Sort by';
}

export function modifySortLabel(event) {
  let option = event.target.innerHTML;
  let button = event.currentTarget.parentNode.querySelector('.btn');
  button.innerHTML = option;
}

export function changeText(event) {
  let inputContainer = event.currentTarget.parentNode;
  let inp = inputContainer.getElementsByTagName('input')[0];

  inp.style.display = null;
  inp.focus();

  let span = inputContainer.getElementsByTagName('span')[0];
  span.style.display = 'none';
}

export function spanOverlapInput(span, inp) {
  span.style.display = null;
  inp.value = '';
  inp.style.display = 'none';
}
