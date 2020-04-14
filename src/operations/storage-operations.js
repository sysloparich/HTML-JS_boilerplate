import moment from 'moment';

import {
  OPEN_RECORDS_STORAGE_NAME,
  DONE_RECORDS_STORAGE_NAME,
} from '../constants.js';

export function clearStorage(storage) {
  localStorage.setItem(storage, JSON.stringify([]));
}

export function getRecordsFromStorage(list) {
  let records = JSON.parse(localStorage.getItem(list));
  return records ? records : [];
}

export function moveToAnotherListInternally(params, storages) {
  let fromWhereToDelete = getRecordsFromStorage(storages.from);
  let whereToAdd = getRecordsFromStorage(storages.to);

  let record = fromWhereToDelete.filter(rec => rec.id === params.id)[0];
  record.done = !record.done;
  record.endDate = params.endDate;

  whereToAdd.push(record);
  fromWhereToDelete.splice(fromWhereToDelete.indexOf(record), 1);

  localStorage.setItem(storages.from, JSON.stringify(fromWhereToDelete));
  localStorage.setItem(storages.to, JSON.stringify(whereToAdd));
}

export function moveToAnotherList(params) {
  if (params.done) {
    moveToAnotherListInternally(
      { id: params.id, endDate: moment() },
      {
        from: OPEN_RECORDS_STORAGE_NAME,
        to: DONE_RECORDS_STORAGE_NAME,
      },
    );
  } else {
    moveToAnotherListInternally(
      { id: params.id, endDate: '' },
      {
        from: DONE_RECORDS_STORAGE_NAME,
        to: OPEN_RECORDS_STORAGE_NAME,
      },
    );
  }
}

export function deleteFromStorage(storage, id) {
  let records = getRecordsFromStorage(storage);
  records = records.filter(r => r.id !== id);
  localStorage.setItem(storage, JSON.stringify(records));
}

export function addToStorage(record) {
  let key = record.done ? DONE_RECORDS_STORAGE_NAME : OPEN_RECORDS_STORAGE_NAME;
  let saved = getRecordsFromStorage(key);

  let records = saved;
  records.push(record);
  localStorage.setItem(key, JSON.stringify(records));
}

export function modifyRecordContent(storage, recordId, text) {
  let records = getRecordsFromStorage(storage, recordId);
  records
    .filter(r => r.id === recordId)
    .forEach(r => {
      r.text = text;
    });
  localStorage.setItem(storage, JSON.stringify(records));
}
