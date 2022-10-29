'use strict';

class ModbusSlave {
    constructor(id) {
        this.id = id;
    }

    /**
     * ref: https://github.com/yuanxu2017/modbus-crc16
     * Calculates the buffers CRC16.
     *
     * @param {Buffer} buffer the data buffer. EX.[0x01, 0x04, 0x00, 0x00, 0x00, 0x02]
     * @return {number} the calculated CRC16.
     */
    crc16(buffer) {
        let crc = 0xFFFF;
        let odd;
        let l = buffer.length;
        for (let i = 0; i < l; i++) {
            crc = crc ^ buffer[i];
            for (let j = 0; j < 8; j++) {
                odd = crc & 0x0001;
                crc = crc >> 1;
                if (odd) {
                    crc = crc ^ 0xA001;
                }
            }
        }
        // swap the most significant and least significant byte.
        let crc2 = ((crc - (crc >> 8 << 8)) << 8) + (crc >> 8);
        return crc2;
    }

    /**
     * 16 bit integer to 8 bit integer
     *
     * @param {number} inputNumber 16 bit integer
     * @return {Array} 8 bit integer array EX.[0x71, 0xFB]
     */
    int16To8(inputNumber) {
        let int8Arr = [];
        int8Arr.push(inputNumber >> 8); // high byte
        int8Arr.push(inputNumber & 0x00FF); // low byte
        return int8Arr //[0xFF, 0x00]
    }

    /**
     * modbus RTU frame generator
     * @return {Array} RTU frame [0x01, 0x04, 0x00, 0x00, 0x00, 0x02, 0x71, 0xCB],
     */
    modbusRTUGenerator(functionCode, startAddress, numOfRegister) {
        let frame = [];
        frame.push(this.id, functionCode);
        frame.push(this.int16To8(startAddress)[0]);
        frame.push(this.int16To8(startAddress)[1]);
        frame.push(this.int16To8(numOfRegister)[0]);
        frame.push(this.int16To8(numOfRegister)[1]);
        let crc = this.crc16(frame);
        frame.push(this.int16To8(crc)[0]);
        frame.push(this.int16To8(crc)[1]);
        return frame;
    }
}

let slave1 = new ModbusSlave(0x02);
// let self = this;
console.log(slave1.modbusRTUGenerator(0x4, 0x0, 0x2));

