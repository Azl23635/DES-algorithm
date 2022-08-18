import Feistel from './feistel.mjs';
import Key from './key.mjs';

export default class Des {
  static #one_initialPermute = (plain64) => {
    let ipOut64 = '';
    //Initial permutation lookup table
    const ipLookup = [
      58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
      62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
      57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61,
      53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
    ];
    //Order bits according to table
    for (let i = 0; i < ipLookup.length; i++) {
      ipOut64 += plain64[ipLookup[i] - 1];
    }
    //Return output
    return ipOut64;
  };

  static #two_handleFboxStructure = (left32, right32, roundKey48) => {
    let leftXOR = '';
    //Gets output from feistel function
    let fboxOut = Feistel.fboxOut(right32, roundKey48);
    //XORs left side of data with fbox output
    for (let i = 0; i < left32.length; i++) {
      left32[i] !== fboxOut[i] ? (leftXOR += '1') : (leftXOR += '0');
    }
    //Returns output, this will be the new right side
    return leftXOR;
  };

  static #three_finalPermute = (inp64) => {
    let finalPermOut64 = '';
    //Lookup table for final permutation
    const finalPermLookup = [
      40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
      38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
      36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
      34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
    ];
    //Order bits according to table
    for (let i = 0; i < inp64.length; i++) {
      finalPermOut64 += inp64[finalPermLookup[i] - 1];
    }
    //Return output
    return finalPermOut64;
  };
  //Function oversees encryption
  static #desEncryption = (plain64, key64) => {
    //Initial permute plaintext
    const iniPerm = this.#one_initialPermute(plain64);
    //Divide to left/right
    let left = iniPerm.substring(0, iniPerm.length / 2);
    let right = iniPerm.substring(iniPerm.length / 2, iniPerm.length);
    let prevRight = iniPerm.substring(
      iniPerm.length / 2,
      iniPerm.length
    );
    //16 rounds
    for (let i = 0; i < 16; i++) {
      //Gets key for round
      let key = Key.roundKeyGen(key64, i + 1);
      if (i !== 15) {
        //Right side goes through fbox, xors with left, becomes new right side
        right = this.#two_handleFboxStructure(left, right, key);
        //Left side is previous right side
        left = prevRight;
        prevRight = right;
      } else {
        //For last round, don't swap sides
        left = this.#two_handleFboxStructure(left, right, key);
        right = prevRight;
      }
    }
    //Final permute the data, return result
    return this.#binToHex(this.#three_finalPermute(left + right));
  };

  //Function oversees decryption
  static #desDecryption = (cipher64, key64) => {
    //Initial permute ciphertext
    const dInitPerm = this.#one_initialPermute(cipher64);
    //Divide to left/right
    let left = dInitPerm.substring(
      dInitPerm.length / 2,
      dInitPerm.length
    );
    let right = dInitPerm.substring(0, dInitPerm.length / 2);
    let prevLeft = left;
    //16 rounds, decrementing
    for (let i = 15; i >= 0; i--) {
      //Gets key for round
      let key = Key.roundKeyGen(key64, i + 1);
      if (i !== 0) {
        //Left side goes through fbox, xors with right, becomes new left side
        left = this.#two_handleFboxStructure(right, left, key);
        //Right side is previous left side
        right = prevLeft;
        prevLeft = left;
      } else {
        //For last round, don't swap sides
        right = this.#two_handleFboxStructure(right, left, key);
        left = prevLeft;
      }
    }
    //Final permute the data, return result
    return this.#binToHex(this.#three_finalPermute(right + left));
  };
  //Pads input if not 64 bit
  static #padData = (data) => {
    if (data.length < 64) {
      let output = data.padStart(64, '0');
      return output;
    }
    return data;
  };
  //Convert 64 bit hex to bin
  static #keyToBin = (key64) => {
    let out = 0;
    out = BigInt('0x' + key64);
    return this.#padData(out.toString(2));
  };
  //Convert 64 bit bin to hex
  static #binToHex = (bin64) => {
    let out = 0;
    out = BigInt('0b' + bin64);
    return out.toString(16).toUpperCase();
  };
  //How encryption is accessed, data must be <= 64 bit
  static encryptDes = (plaintext64, key64) => {
    if (plaintext64) {
      let outputval = '';
      outputval = this.#keyToBin(plaintext64);
      if (outputval.length > 64) {
        return 'Data too large.';
      }
      return this.#desEncryption(outputval, this.#keyToBin(key64));
    }
  };
  //How decryption is accessed, data must be <= 64 bit
  static decryptDes = (ciphertext64, key64) => {
    if (ciphertext64) {
      let outputval = '';
      outputval = this.#keyToBin(ciphertext64);
      if (outputval.length > 64) {
        return 'Data too large.';
      }
      return this.#desDecryption(outputval, this.#keyToBin(key64));
    }
  };
}
