import Des from './des.mjs';
import Key from './key.mjs';
import Feistel from './feistel.mjs';

const encrypt = () => {
  if (
    document.getElementById('hex-key').value.length >= 16 &&
    textFile
  ) {
    try {
      document.getElementById('output').innerHTML = Des.encryptDes(
        textFile,
        document.getElementById('hex-key').value
      );
      document.getElementById('output-label').innerHTML = 'Output';
    } catch (error) {
      document.getElementById('output').innerHTML = error;
      console.log(document.getElementById('hex-key').value);
    }
  } else {
    document.getElementById('output').innerHTML =
      'Error: Check key length or data length';
  }
};

const decrypt = () => {
  if (
    document.getElementById('hex-key').value.length >= 16 &&
    textFile
  ) {
    try {
      document.getElementById('output').innerHTML = Des.decryptDes(
        textFile,
        document.getElementById('hex-key').value
      );
      document.getElementById('output-label').innerHTML = 'Output';
    } catch (error) {
      document.getElementById('output').innerHTML = error;
    }
  } else {
    document.getElementById('output').innerHTML =
      'Error: Check key length or data length';
  }
};

let textFile;
const loadFile = async (file) => {
  textFile = await file.text();
};

document
  .querySelector('#text')
  .addEventListener('change', (event) =>
    loadFile(event.target.files[0])
  );
document
  .querySelector('#encrypt-btn')
  .addEventListener('click', () => encrypt());
document
  .querySelector('#decrypt-btn')
  .addEventListener('click', () => decrypt());
