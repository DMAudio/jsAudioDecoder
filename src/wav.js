/*
 * @Author: Kitagawa.Kenta 
 * @Date: 2017-06-24 15:57:37 
 * @Last Modified by: Kitagawa.Kenta
 * @Last Modified time: 2017-06-24 17:01:49
 */
function WAV_fmt(data, dv, offset) {
    return {
        PCM: dv.getUint16(offset, true),
        Channels: dv.getUint16(offset + 2, true),
        SampleRate: dv.getUint32(offset + 4, true),
        //ByteRate = Channels * SampleRate * SampleBits / 8
        ByteRate: dv.getUint32(offset + 8, true),
        BlochunkAlign: dv.getUint16(offset + 12, true),
        SampleBits: dv.getUint16(offset + 14, true)
    }
}

function WAV_LIST(data, dv, offset, size) {
    let result = [];
    let listOffset = offset + 4;//(String)'info'
    while (listOffset < offset + size) {
        let subchunk = {
            Name: int2Str(new Uint8Array(data, listOffset, 4, true)),
            Size: dv.getUint32(listOffset + 4, true),
            Offset: listOffset + 8,
        }
        subchunk.Content = int2Str(new Uint8Array(data, listOffset + 8, subchunk.Size, true))
        result.push(subchunk);
        if (dv.getUint8(listOffset + 8 + subchunk.Size) === 0) {
            listOffset += 1
        }
        listOffset += 8 + subchunk.Size;
    }
    return result;
}

function WAV_Decoder(result) {
    let WavInfo = {};
    let data = result;
    let dv = new DataView(data);

    WavInfo.isRIFF = int2Str(new Uint8Array(data, 1 - 1, 4));
    WavInfo.Size = dv.getUint32(5 - 1, true);
    WavInfo.Format = int2Str(new Uint8Array(data, 9 - 1, 4));

    let offset = 12;
    while (WavInfo.Size + 12 - offset >= 8) {
        let chunk = {
            Type: int2Str(new Uint8Array(data, offset, 4)),
            Size: dv.getUint32(offset + 4, true),
            Offset: offset
        }
        offset += 8;
        switch (chunk.Type) {
            case 'fmt':
                chunk = Object.assign(chunk, WAV_fmt(data, dv, offset)); break;
            case 'LIST':
                chunk.info = WAV_LIST(data, dv, offset, chunk.Size); break;
            case 'id3':
                chunk = Object.assign(chunk, id3(data, dv, offset, chunk.Size)); break;
            default:
                break;
        }
        offset += chunk.Size;
        WavInfo[chunk['Type']] = chunk;
    }
    return WavInfo;
};