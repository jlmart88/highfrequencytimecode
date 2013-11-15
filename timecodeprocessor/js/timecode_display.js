function timecode_display(id,string)
{
    result = string;
    document.getElementById(id).innerHTML = result;
    //setTimeout(timecode_display(id,TimecodeReader),'1');
    return true;
}
