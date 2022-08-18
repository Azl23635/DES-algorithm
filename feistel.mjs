export default class Feistel {
  //Substitution box for the fuction
  static sBoxLookup = [
    [
      [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
    ],

    [
      [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
    ],

    [
      [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
    ],

    [
      [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
    ],

    [
      [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
    ],

    [
      [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
    ],

    [
      [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
    ],

    [
      [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
    ],
  ];

  static #one_expansion = (input32) => {
    let expOutput48 = '';
    //Lookup table for expansion
    const expansionLookup = [
      32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12,
      13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24,
      25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1,
    ];
    //Order bits according to table
    for (let i = 0; i < expansionLookup.length; i++) {
      expOutput48 += input32[expansionLookup[i] - 1];
    }
    //Return result
    return expOutput48;
  };

  static #two_XOR = (input48, roundKey48) => {
    let xorOutput48 = '';
    //Simple XOR
    for (let i = 0; i < input48.length; i++) {
      input48[i] !== roundKey48[i]
        ? (xorOutput48 += '1')
        : (xorOutput48 += '0');
    }
    //Return XOR result
    return xorOutput48;
  };

  static #three_sBox = (xor48) => {
    const sboxOut = [];
    const xorDivided = [];
    //Divide into 6 bit blocks, FORMAT: [bitsAll, bitsInner, bitsOuter]
    for (let i = 0; i < 8; i++) {
      xorDivided.push([xor48.slice(6 * i, 6 * i + 6)]);
      xorDivided[i].push(
        xorDivided[i][0].slice(1, -1),
        xorDivided[i][0].charAt(0) + xorDivided[i][0].charAt(5)
      );
      //Lookup output for the block
      sboxOut.push(
        this.sBoxLookup[i][parseInt(xorDivided[i][2], 2)][
          parseInt(xorDivided[i][1], 2)
        ]
      );
    }
    //Convert to binary, pad to 4 bits
    const sboxOutBinArr = sboxOut.map((elem) => elem.toString(2));
    sboxOutBinArr.forEach((elem, ind) =>
      elem.length < 4
        ? (sboxOutBinArr[ind] = elem.padStart(4, '0'))
        : null
    );
    let sboxOutStr = sboxOutBinArr.join('');
    //Return result
    return sboxOutStr;
  };

  static #four_permutation = (perm32) => {
    let permOutput = '';
    //Lookup table for permutation
    const permLookup = [
      16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2,
      8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
    ];
    //Order bits according to table
    for (let i = 0; i < permLookup.length; i++) {
      permOutput += perm32[permLookup[i] - 1];
    }
    //Return result
    return permOutput;
  };

  //Top level function/ how module is accessed
  static fboxOut = (inData32, inKey48) =>
    this.#four_permutation(
      this.#three_sBox(
        this.#two_XOR(this.#one_expansion(inData32), inKey48)
      )
    );
}
