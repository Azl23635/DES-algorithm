import Feistel from './feistel.mjs';
import Key from './key.mjs';

export default class Des {
  static #one_initialPermute = (plain64) => {
    let ipOut64 = '';
    const ipLookup = [
      58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
      62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
      57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61,
      53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7,
    ];
    for (let i = 0; i < ipLookup.length; i++) {
      ipOut64 += plain64[ipLookup[i] - 1];
    }
    return ipOut64;
  };

  static #two_handleFboxStructure = (left32, right32, roundKey48) => {
    let leftXOR = '';
    let fboxOut = Feistel.fboxOut(right32, roundKey48);
    for (let i = 0; i < left32.length; i++) {
      left32[i] !== fboxOut[i] ? (leftXOR += '1') : (leftXOR += '0');
    }
    return leftXOR;
  };

  static #three_finalPermute = (inp64) => {
    let finalPermOut64 = '';
    const finalPermLookup = [
      40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
      38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
      36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
      34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25,
    ];
    for (let i = 0; i < inp64.length; i++) {
      finalPermOut64 += inp64[finalPermLookup[i] - 1];
    }
    return finalPermOut64;
  };

  static #desEncryption = (plain64, key64) => {
    const iniPerm = this.#one_initialPermute(plain64);
    let left = iniPerm.substring(0, iniPerm.length / 2);
    let right = iniPerm.substring(iniPerm.length / 2, iniPerm.length);
    let prevRight = iniPerm.substring(
      iniPerm.length / 2,
      iniPerm.length
    );
    for (let i = 0; i < 16; i++) {
      let key = Key.roundKeyGen(key64, i + 1);
      if (i !== 15) {
        right = this.#two_handleFboxStructure(left, right, key);
        left = prevRight;
        prevRight = right;
      } else {
        left = this.#two_handleFboxStructure(left, right, key);
        right = prevRight;
      }
    }
    return this.#three_finalPermute(left + right);
  };

  static #desDecryption = (cipher64, key64) => {
    const dInitPerm = this.#one_initialPermute(cipher64);
    let left = dInitPerm.substring(
      dInitPerm.length / 2,
      dInitPerm.length
    );
    let right = dInitPerm.substring(0, dInitPerm.length / 2);
    let prevLeft = left;

    for (let i = 15; i >= 0; i--) {
      let key = Key.roundKeyGen(key64, i + 1);
      if (i !== 0) {
        left = this.#two_handleFboxStructure(right, left, key);
        right = prevLeft;
        prevLeft = left;
      } else {
        right = this.#two_handleFboxStructure(right, left, key);
        left = prevLeft;
      }
    }
    return this.#three_finalPermute(right + left);
  };
  static #padData = (data) => {
    if (data.length < 64) {
      let output = data.padStart(64, '0');
      return output;
    }
    return data;
  };
  static #keyToBin = (key64) => {
    let out = 0;
    out = BigInt('0x' + key64);
    return this.#padData(out.toString(2));
  };
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
