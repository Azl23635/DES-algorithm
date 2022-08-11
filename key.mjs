export default class Key {
  static #rotateKey = (key, shiftBy = 1) => {
    let rotateOut = '';
    for (let i = 0; i < key.length; i++) {
      key.length - 1 >= i + shiftBy
        ? (rotateOut += key[i + shiftBy])
        : (rotateOut += key[i + shiftBy - key.length]);
    }
    return rotateOut;
  };

  static #one_dropThenPermute = (key64) => {
    let left = '';
    let right = '';
    let pcLookup = [
      [
        57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2,
        59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
      ],
      [
        63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6,
        61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
      ],
    ];
    for (let i = 0; i < pcLookup.length; i++) {
      for (let j = 0; j < pcLookup[i].length; j++) {
        i === 0
          ? (left += key64[pcLookup[i][j] - 1])
          : (right += key64[pcLookup[i][j] - 1]);
      }
    }
    return [left, right];
  };

  static #two_bitRotate = (keyLeftRight56, round) => {
    let keyLeft = keyLeftRight56[0];
    let keyRight = keyLeftRight56[1];
    const bitShiftLookup = [
      1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1,
    ];
    const output = [];
    const bitShiftForRound = bitShiftLookup
      .slice(0, round)
      .reduce((total, curr) => total + curr, 0);

    for (let i = 0; i < bitShiftForRound; i++) {
      keyLeft = this.#rotateKey(keyLeft);
      keyRight = this.#rotateKey(keyRight);
    }
    output.push(keyLeft + keyRight);
    return output;
  };

  static #three_permutationTwo = (keyLeftRightRotated) => {
    let pcTwoOutput48 = '';
    const pcTwoLookup = [
      14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26,
      8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45,
      33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32,
    ];
    const rotatedKey = keyLeftRightRotated[0];

    for (let i = 0; i < pcTwoLookup.length; i++) {
      pcTwoOutput48 += rotatedKey[pcTwoLookup[i] - 1];
    }
    return pcTwoOutput48;
  };

  static roundKeyGen(key64, round) {
    return this.#three_permutationTwo(
      this.#two_bitRotate(this.#one_dropThenPermute(key64), round)
    );
  }
}
