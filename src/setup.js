import {
  OPEN_RECORDS_STORAGE_NAME,
  DONE_RECORDS_STORAGE_NAME,
  OPEN_RECORDS_CONTAINER_NAME,
  DONE_RECORDS_CONTAINER_NAME,
  sortMap,
  dropdownToStorageMap,
  dropdownToTaskContainerMap,
  taskContainerToStorageMap,
  linkToStorageMap,
  linkToTaskContainerMap,
} from './constants.js';

import {
  sort,
  searchRecords,
  createRecord,
  clearRecords,
} from './operations/record-operations.js';

import {
  drawAll,
  resetSort,
  modifySortLabel,
} from './operations/draw-operations.js';

export function setup() {
  mapsSetup();
  listenersSetup();
  drawAll();
}

function mapsSetup() {
  sortMap.set('creationDateAsc', { asc: true, param: 'creationDate' });
  sortMap.set('creationDateDesc', { asc: false, param: 'creationDate' });
  sortMap.set('dueDateAsc', { asc: true, param: 'endDate' });
  sortMap.set('dueDateDesc', { asc: false, param: 'endDate' });
  sortMap.set('textAsc', { asc: true, param: 'text' });
  sortMap.set('textDesc', { asc: false, param: 'text' });

  dropdownToStorageMap.set('openMenuDropdown', OPEN_RECORDS_STORAGE_NAME);
  dropdownToStorageMap.set('doneMenuDropdown', DONE_RECORDS_STORAGE_NAME);

  dropdownToTaskContainerMap.set(
    'openMenuDropdown',
    OPEN_RECORDS_CONTAINER_NAME,
  );
  dropdownToTaskContainerMap.set(
    'doneMenuDropdown',
    DONE_RECORDS_CONTAINER_NAME,
  );

  taskContainerToStorageMap.set(
    OPEN_RECORDS_CONTAINER_NAME,
    OPEN_RECORDS_STORAGE_NAME,
  );
  taskContainerToStorageMap.set(
    DONE_RECORDS_CONTAINER_NAME,
    DONE_RECORDS_STORAGE_NAME,
  );

  linkToStorageMap.set('clearOpenList', OPEN_RECORDS_STORAGE_NAME);
  linkToStorageMap.set('clearDoneList', DONE_RECORDS_STORAGE_NAME);

  linkToTaskContainerMap.set('clearOpenList', OPEN_RECORDS_CONTAINER_NAME);
  linkToTaskContainerMap.set('clearDoneList', DONE_RECORDS_CONTAINER_NAME);
}

function listenersSetup() {
  document.querySelectorAll('.dropdown-menu').forEach(drop => {
    drop.addEventListener('click', sort);
    drop.addEventListener('click', modifySortLabel);
  });

  search.addEventListener('keyup', searchRecords);

  document
    .querySelectorAll('.clearList')
    .forEach(clear => clear.addEventListener('click', clearRecords));

  addBtn.addEventListener('click', createRecord);
  addTask.addEventListener('keyup', createRecord);

  addBtn.addEventListener('click', resetSort);
  addTask.addEventListener('keyup', resetSort);
}
