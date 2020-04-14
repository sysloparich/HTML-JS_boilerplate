export default class Record {
  constructor(obj) {
    this.id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    this.text = obj.text;
    this.creationDate = obj.creationDate;
    this.done = false;
  }
}
