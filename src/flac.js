/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:26:05 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-26 14:09:48
 */
function FLAC_MB_Type(bit) {
    switch (bit) {
        case 0: return 'STREAMINFO';
        case 1: return 'PADDING';
        case 2: return 'APPLICATION';
        case 3: return 'SEEKTABLE';
        case 4: return 'VORBIS_COMMEN';
        case 5: return 'CUESHEET';
        case 6: return 'PICTURE';
        default: return 'reserved';
    }
}
function FLAC_MBD_STREAMINFO(data, dv, offset, length) {
    let BlockSizeMin = dv.getUint16(offset);
    let BlockSizeMax = dv.getUint16(offset + 2);
    let FrameSizeMin = connectBits(new Uint8Array(data, offset + 4, 3));
    let FrameSizeMax = connectBits(new Uint8Array(data, offset + 7, 3));
    let sampleRate = pickBits(connectBits(new Uint8Array(data, offset + 10, 3)), 23, 4);
    let channels = pickBits(dv.getUint8(offset + 12), 1, 3) + 1;
    let bits = connectBits([
        pickBits(dv.getUint8(offset + 12), 0, 0),
        pickBits(dv.getUint8(offset + 13), 4, 7)
    ], 4) + 1;
    //查明相差的240个样本是啥
    let samples = pickBits(connectBits(new Uint8Array(data, offset + 13, 5)), 0, 35);
    let md5 = int2char(new Uint8Array(data, offset + 18, 128 / 8));
    return {
        BlockSizeMin, BlockSizeMax,
        FrameSizeMin, FrameSizeMax,
        sampleRate, channels, bits, samples, md5
    }
}
function FLAC_MBD_PIC_TYPE(t) {
    switch (t) {
        case 0: return 'Other';
        case 1: return '32x32 pixels \'file icon\' (PNG only)';
        case 2: return 'Other file icon';
        case 3: return 'Cover(front)';
        case 4: return 'Cover(back)';
        case 5: return 'Leaflet page';
        case 6: return 'Media(e.g.label side of CD)';
        case 7: return 'Lead artist/ lead performer/ soloist';
        case 8: return 'Artist / performer';
        case 9: return 'Conductor';
        case 10: return 'Band / Orchestra';
        case 11: return 'Composer';
        case 12: return 'Lyricist / text writer';
        case 13: return 'Recording Location';
        case 14: return 'During recording';
        case 15: return 'During performance';
        case 16: return 'Movie / video screen capture';
        case 17: return 'A bright coloured fish';
        case 18: return 'Illustration';
        case 19: return 'Band / artist logotype';
        case 20: return 'Publisher / Studio logotype';
        default: return 'reserved';
    }
}
function FLAC_MBD_PICTURE(data, dv, offset, length) {
    let picOffset = 0;

    let type = dv.getUint32(offset);
    let typeDes = FLAC_MBD_PIC_TYPE(type);
    let mimeLength = dv.getUint32(offset + 4);
    picOffset += 8;
    let mime = int2Str(new Uint8Array(data, offset + picOffset, mimeLength));
    picOffset += mimeLength;
    let descLength = dv.getUint32(offset + picOffset);
    picOffset += 4;
    let desc = int2Str(new Uint8Array(data, offset + picOffset, descLength));
    picOffset += descLength;

    let imgHeight = dv.getUint32(offset + picOffset);
    let imgWidth = dv.getUint32(offset + picOffset + 4);
    let imgColorDeepth = dv.getUint32(offset + picOffset + 8);
    let imgColorUsed = dv.getUint32(offset + picOffset + 12);
    let imgSize = dv.getUint32(offset + picOffset + 16);
    let imgOffset = offset + picOffset + 20;
    let imgData = new Uint8ClampedArray(data, imgOffset, imgSize);
    let blob = new Blob([imgData], { 'type': mime });
    let imgurl = URL.createObjectURL(blob);
    return {
        type, typeDes, mimeLength, mime, descLength, desc,
        imgHeight, imgWidth, imgColorDeepth, imgColorUsed, imgSize, imgOffset, imgurl
    };
}
function FLAC_MBD_VORBIS_COMMEN(data, dv, offset, length) {
    let commenOffset = 0;
    let vendor_length = dv.getUint32(offset, true);
    let vendor_string = int2Str(new Uint8Array(data, offset + 4, vendor_length));
    commenOffset += 4 + vendor_length;
    let user_comment_list_length = dv.getUint32(offset + commenOffset, true);
    let user_comment = {};
    commenOffset += 4;
    for (let i = 0; i <= user_comment_list_length - 1; i++) {
        let common_size = dv.getUint32(offset + commenOffset, true);
        let common = int2Str(new Uint8Array(data, offset + commenOffset + 4, common_size), 3);
        let common_title = common.slice(0, common.indexOf("=") - 1);
        let common_content = common.slice(common.indexOf("=") + 1, common.length);
        user_comment[common_title] = common_content;
        commenOffset += 4 + common_size;
    }
    return {
        vendor_length, vendor_string,
        user_comment_list_length, user_comment
    }
}

function FLAC_Decoder(data) {
    let flacInfo = {};
    let offset = 0;
    let dv = new DataView(data);

    //fLaC Mark
    //0x66 0x4C 0x61 0x43
    flacInfo.Format = int2Str(new Uint8Array(data, 1 - 1, 4));
    offset += 4;

    flacInfo.MetaBlocks = [];
    while (true) {
        let block = {};
        let blockOffset = offset;
        let blockDataOffset = blockOffset + 4;
        let isLast = pickBit(dv.getUint8(offset), 7);
        block.type = FLAC_MB_Type(pickBits(dv.getUint8(blockOffset), 0, 6));
        block.offset = blockOffset;
        block.dataOffset = blockDataOffset;
        block.dataSize = connectBits(new Uint8Array(data, blockOffset + 1, 3));
        switch (block.type) {
            case 'STREAMINFO':
                block.info = FLAC_MBD_STREAMINFO(data, dv, block.dataOffset, block.dataSize);
                break;
            case 'PICTURE':
                block.info = FLAC_MBD_PICTURE(data, dv, block.dataOffset, block.dataSize);
                break;
            case 'VORBIS_COMMEN':
                block.info = FLAC_MBD_VORBIS_COMMEN(data, dv, block.dataOffset, block.dataSize);
                break;
        }

        flacInfo.MetaBlocks.push(block);
        offset += 4 + block.dataSize;
        if (isLast) break;
    }
    return flacInfo;
}