import './style.css';

// function endOfInput(event) {
//   if (event.keyCode === 13) {
//     let container = document.createElement('div');
//     let span = document.createElement('span');
//     container.classList.add('inputPosition');
//     // span.classList.add('inputPosition');
//     span.style.setProperty('word-wrap', 'break-word');
//     span.innerHTML = this.value;
//     container.appendChild(span);
//     this.parentNode.appendChild(container);
//     this.setAttribute('type', 'hidden');
//     this.value = '';
//   }
// }

// recordInput.addEventListener('keyup', endOfInput); MODIFY NAME

function createRecord() {
  let text = addTask.value;

  let taskContainer = document.createElement('div');
  taskContainer.classList.add('taskContainer', 'shadowed');

  openTasks.appendChild(taskContainer);

  let checkboxContainer = document.createElement('div');
  checkboxContainer.classList.add('checkboxContainer');
  let checkboxLabel = document.createElement('label');
  checkboxLabel.classList.add('checkbox-inline');
  let checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkboxLabel.appendChild(checkbox);
  checkboxContainer.appendChild(checkboxLabel);
  taskContainer.appendChild(checkboxContainer);

  let inputContainer = document.createElement('div');
  inputContainer.classList.add('inputContainer');
  let inp = document.createElement('input');
  inp.classList.add('inputPosition', 'transparentInput');
  inputContainer.appendChild(inp);
  taskContainer.appendChild(inputContainer);

  let timeIntervalsContainer = document.createElement('div');
  timeIntervalsContainer.classList.add('timeIntervalsContainer');
  timeIntervalsContainer.innerHTML = 'LALALA';
  taskContainer.appendChild(timeIntervalsContainer);

  let removeBtnContainer = document.createElement('div');
  removeBtnContainer.classList.add('removeRecordContainer');
  let removeBtn = document.createElement('button');
  removeBtn.classList.add('fa', 'fa-trash', 'removeRecord');
  removeBtnContainer.appendChild(removeBtn);
  taskContainer.appendChild(removeBtnContainer);
}

createRecord();
