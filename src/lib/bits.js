/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:14:18 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-24 14:21:58
 */

/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
function isInteger(obj) {
    return typeof obj === 'number' && obj % 1 === 0
}

/**
 * 
 * 
 * @param {any} start 
 * @param {any} length 
 * @returns 
 */
function makeBits(start, length) {
    let zeros = Array(start).fill(0).join('');
    let ones = Array(length).fill(1).join('');
    return parseInt(ones + zeros, 2);
}

/**
 * 
 * 
 * @param {any} Bits 
 * @param {any} bit 
 * @returns 
 */
function pickBit(Bits, bit) {
    return (Bits & (1 << bit)) != 0;
}

/**
 * 
 * 
 * @param {any} Bits 
 * @param {any} start 
 * @param {any} end 
 * @returns 
 */
function pickBits(Bits, start, end) {
    let andBits = 0;
    if (start > end) {
        [start, end] = [end, start]
    }
    return (Bits & makeBits(start, end - start + 1)) >> start;
}

/**
 * 
 * 
 * @param {any} BitsArr 
 * @param {number} [BitLength=8] 
 * @returns 
 */
function connectBits(BitsArr, BitLength = 8) {
    let sum = 0;
    for (i = 0; i <= BitsArr.length - 1; i++) {
        sum += (BitsArr[i] & makeBits(0, BitLength)) << ((BitsArr.length - 1 - i) * BitLength);
    }
    return sum;
}

/**
 * 
 * 
 * @param {any} Bits 
 * @param {any} BitLength 
 * @param {any} sufixBits 
 * @param {any} sufixLength 
 * @returns 
 */
function pushBits(Bits, BitLength, sufixBits, sufixLength) {
    let sum;
    if (isInteger(Bits)) {
        sum = Bits;
    } else {
        sum = connectBits(BitsArr, BitLength) << sufixLength;
    }
    sum += sufixBits & makeBits(0, sufixLength);
    return sum;
}