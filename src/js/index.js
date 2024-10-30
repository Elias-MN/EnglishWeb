import { DatabaseManager } from "./indexedDB.js";

const dbManager = DatabaseManager.getInstance();
const formElements = document.querySelectorAll("form input");
const tbodyElement = document.querySelector("tbody");
const importButton = document.querySelector("#importButton");
const exportButton = document.querySelector("#exportButton");
const fileInput = document.querySelector("#fileInput");

let addButton = formElements[3];

function addEntry(event) {
  event.preventDefault();

  let word = formElements[0].value;
  let translation = formElements[1].value;
  let phrase = formElements[2].value;

  if (word === "" || translation === "" || phrase === "") {
    alert("Fill the empty fields");
    return;
  }

  let entry = { "word": word, "translation": translation, "phrase": phrase };

  addDataDB(entry);

  clearForm();

}

function updateDOM(data, entryId) {

  let newEntry = `
    <tr id=${entryId} class="wordRow">
      <td data-label="Word"><ruby> ${data.word} <rt> ${data.translation} </rt></ruby></td>
      <td data-label="Phrase">${data.phrase}</td>
      <td>
        <button class="delete-btn mybutton"><i class='delete-btn bx bx-trash' ></i></button>
        <button class="edit-btn mybutton"><i class='edit-btn bx bx-edit-alt' ></i></button>
      </td>
    </tr>
  `;
  tbodyElement.innerHTML += newEntry;
}

function clearForm() {
  for (let index = 0; index < formElements.length - 1; index++) {
    formElements[index].value = "";
  }
}

function deleteEntry(element, event) {
  console.log(element);
  console.log(event);

  let confirmation = confirm("Are you sure you want to delete this entry?");
  if (confirmation) {
    //  Option 1
    // const row = element.parentNode.parentNode;
    // row.remove();

    // Option 2
    // const row = element.closest('tr');
    // row.remove();

    // Option 3
    // const row = element.closest('tr');
    // row.parentNode.removeChild(row);

    // Option 4
    const row = element.closest('tr');
    console.log(row)
    deleteDataDB(row.id);
    row.classList.add('fade-out');
    setTimeout(() => row.remove(), 500);
  }

}

function editRow(row) {
  console.log(row);

}

async function addDataDB(data) {
  dbManager.open()
    .then(() => {
      dbManager.createData(data)
        .then((response) => {
          updateDOM(data, response.result);
        })
        .catch((error) => {
          console.error("Error createData: " + error);
        });
    })
    .catch((error) => {
      console.error("Error open: " + error);
    });
}

async function deleteDataDB(id) {
  dbManager.open()
    .then(() => {
      dbManager.deleteData(parseInt(id))
        .then(() => {
          console.log("Deleted item with id: " + id);
        })
        .catch((error) => {
          console.error("Error createData: " + error);
        });
    })
    .catch((error) => {
      console.error("Error open: " + error);
    });
}

async function getAllData() {

  dbManager.open()
    .then(() => {
      dbManager.readAllData()
        .then((response) => {
          response.forEach(element => {
            updateDOM(element, element.id);
          });
        })
        .catch((error) => {
          console.error("Error readAllData: " + error);
        });
    })
    .catch((error) => {
      console.error("Error open: " + error);
    });
}

async function exportJSON() {
  dbManager.open()
    .then(() => {
      dbManager.readAllData()
        .then((response) => {
          let rows = "";
          response.forEach(element => {
            rows += `{
                    "word": "${element.word}",
                    "translation": "${element.translation}",
                    "phrase": "${element.phrase}"
                  },`;
          });

          // Delete last character of rows (a coma)
          rows = rows.slice(0, -1);

          let json = `
          {
          "projectName": "English Web",
          "ITVocabulary": [${rows}]
          }`;

          createFile(json, "Vocabulary.json");

        })
        .catch((error) => {
          console.error("Error readAllData: " + error);
        });
    })
    .catch((error) => {
      console.error("Error open: " + error);
    });
}

function importJSON(json){
  console.log(json.ITVocabulary);
}

function createFile(content, nameFile){
  // Create element with <a> tag
  let link = document.createElement("a");
  // Create a blog object with the file content which you want to add to the file
  let file = new Blob([content], { type: 'text/plain' });
  // Add file content in the object URL
  link.href = URL.createObjectURL(file);
  // Add file name
  link.download = nameFile;
  // Add click event to <a> tag to save file.
  link.click();
  URL.revokeObjectURL(link.href);
}

function processFile(files) {
  let reader = new FileReader();
  reader.onload = (event) => {
    try {
      let jsonData = JSON.parse(event.target.result);
      importJSON(jsonData);
    } catch (err) {
      console.error("Error al analizar el JSON:", err);
    }
  };
  reader.readAsText(files[0]);
}

document.querySelector('table').addEventListener('click', function (event) {
  let element = event.target;
  if (element.tagName === 'BUTTON' || event.target.tagName === 'I') {
    if (element.classList.contains('delete-btn')) {
      deleteEntry(element, event);
    }
    if (element.classList.contains('edit-btn')) {
      const row = element.closest('tr');
      editRow(row);
    }
  }
});

addButton.addEventListener("click", addEntry);

exportButton.addEventListener("click", exportJSON);

importButton.addEventListener("click", ()=>{
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  let file = fileInput.files;
  processFile(file);
});

getAllData();
