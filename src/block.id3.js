/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 14:33:19 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-24 16:27:27
 */
function id3_unknlt(data, dv, offset) {
    let length = 0;
    while (dv.getUint8(offset + length) !== 0) {
        length += 1;
    }
    let text = int2Str(new Uint8Array(data, offset, length));
    return [length + 1, text];
}

function id3_text(data, dv, offset, size) {
    /*
    <Header for 'User defined text information frame', ID: "TXXX">
    Text encoding    $xx
    Value            <text string according to encoding>
    */
    // Text encoding
    //    0x00   ISO-8859-1     Terminated with 0x00.
    //    0x01   UTF-16         Terminated with 0x00 0x00, with BOM.
    //    0x02   UTF-16BE       Terminated with 0x00 0x00, without BOM.
    //    0x03   UTF-8          Terminated with $00.
    //  Attention! 0x00 may also means using the default codec on that operating system
    //    e.g.  On Simplified Chinese Windows : GB-2312, on English Windows : ISO-8859-1
    //          On Linux : utf-8
    let itemEncode = dv.getUint8(offset);
    let itemContent = int2Str(new Uint8Array(data, offset + 1, size - 1, true), itemEncode);
    return itemContent;
}
function id3_pic(data, dv, offset, size) {
    /*
    Text encoding   $xx
    MIME type       <text string> $00
    Picture type    $xx
    Description     <text string according to encoding> $00 (00)
    Picture data    <binary data>
    */
    //Text encoding
    //Same with tags start with 'T'.
    let itemEncode = dv.getUint8(offset);
    offset += 1;

    //MIME type
    //Length unknow
    //End With 0x00
    let [mimeLength, itemMime] = id3_unknlt(data, dv, offset);
    offset += mimeLength;

    //Picture type
    let itemPicType = dv.getUint8(offset);
    offset += 1;

    //Description
    //Length unknow
    //End With 0x00
    let [desLength, itemDes] = id3_unknlt(data, dv, offset);
    offset += desLength;

    //Real Length
    let itemRealSize = size - desLength - 1 - mimeLength - 1;
    //Data
    let itemData = new Uint8ClampedArray(data, offset, itemRealSize);
    let blob = new Blob([itemData], { 'type': itemMime });
    let imgurl = URL.createObjectURL(blob);
    let result = {
        //Offset: offset,
        Encode: itemEncode,
        Mime: itemMime,
        PicType: itemPicType,
        Des: itemDes,
        Size: size,
        RealSize: itemRealSize,
        imgurl
    };
    return result;
}
function id3(data, dv, offset, length) {
    let chunk = {};
    /*
    ID3 Header
        identifier   "ID3"
        version           $03 00
        flags             %abc00000
        size              4 * %0xxxxxxx
    $49 44 33 yy yy xx zz zz zz zz
    */
    //Identifier
    chunk.isID3 = int2Str(new Uint8Array(data, offset, 3));
    //version
    chunk.Ver = dv.getUint16(offset + 3, true);
    //flags
    chunk.unsynch = pickBit(dv.getUint8(offset + 5), 7);
    chunk.xheader = pickBit(dv.getUint8(offset + 5), 6);
    chunk.xindicator = pickBit(dv.getUint8(offset + 5), 5);
    //size = chunk.Size - 10
    chunk.id3Size = connectBits(new Uint8Array(data, offset + 6, 4, true), 7);
    chunk.headerSize = 10;
    /*
    ID3 Extended Header
        Extended header size   $xx xx xx xx
        Extended Flags         $xx xx
        Size of padding        $xx xx xx xx
    */
    if (chunk.xheader) {
        chunk.xheader = {
            Size: dv.getUint32(offset + chunk.headerSize),
            Flag: dv.getUint8(offset + chunk.headerSize + 4),
        }
        chunk.headerSize += 4 + chunk.xheader.Size;
    }
    /*
    ID3 Tags
        Frame ID       $xx xx xx xx (four characters)
        Size           $xx xx xx xx
        Flags          $xx xx
    */chunk.info = {};
    let tagOffset = offset + chunk.headerSize;
    while (tagOffset < offset + length) {
        let itemName = int2Str(new Uint8Array(data, tagOffset, 4));
        let itemSize = dv.getUint32(tagOffset + 4);
        let itemFlags = int2Str(new Uint8Array(data, tagOffset + 8, 2));
        let itemHeaderSize = 10;
        
        //================================
        if (itemName.indexOf('T') === 0) {
            let itemContent = id3_text(data, dv, tagOffset + itemHeaderSize, itemSize);
            if (itemName == 'TXXX') {
                if (!chunk.info.TXXX) chunk.info.TXXX = [];
                chunk.info.TXXX.push(itemContent);
            } else { chunk.info[itemName] = itemContent; }
        }else
        //================================
        if (itemName == 'APIC') {
            if (!chunk.info.APIC) chunk.info.APIC = [];
            chunk.info.APIC.push(id3_pic(data, dv, tagOffset + itemHeaderSize, itemSize));
        }else
        //================================
        {
            chunk.info[itemName] = "unsupported"
        }
        tagOffset += itemHeaderSize + itemSize;
    }
    return chunk;
}