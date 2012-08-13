/**
 * File explorer logic
 */
var currentPath = "file:///store";
$('#FileExplorerPage').live('pagebeforeshow', function(event) {
	populate(currentPath);
});
function populate(path){
	try {
		var dirEntry = new DirectoryEntry({fullPath: path});
		var directoryReader = dirEntry.createReader();
		directoryReader.readEntries(successDirectoryReader,failDirectoryReader);
	} catch (e) {
		alert(dump(e));
	}
}
function successDirectoryReader(entries) {
    var i;
    $("#Explorer").html('');
    for (i=0; i<entries.length; i++) {
        if (entries[i].isDirectory) {
        	$("#Explorer").append("<div style='width:104px;float:left;text-align:center;'><div><img src='local:///resources/folder.png' style='border:2px;' onclick='changePath(this)'/></div><div style='width:100px;word-wrap:break-word;'>" + entries[i].name + "</div></div>");
        } else {
        	var fileType = blackberry.io.file.getFileProperties(entries[i].fullPath).mimeType;
        	if (Left(fileType,5) == 'image') {
        		// if file is of type image, then show in small size
        		$("#Explorer").append("<div style='width:104px;float:left;text-align:center;'><div><img src='" + entries[i].fullPath + "' height='80px' width='80px' style='border:2px;' /></div><div  style='width:100px;word-wrap:break-word;'>" + entries[i].name + "</div></div>");
        	} else {
        		$("#Explorer").append("<div style='width:104px;float:left;text-align:center;'><div><img src='local:///resources/file.png' style='border:2px;' /></div><div>" + entries[i].name + "</div></div>");
        	}
        }
    }
    // add an option to go to parent directory
    if (currentPath != "file:///store") {
    	$("#Explorer").append("<div style='width:104px;float:left;text-align:center;'><div><img src='local:///resources/folder.png' style='border:2px;' onclick='backPath()'/></div><div style='width:100px;word-wrap:break-word;'>..</div></div>");
    }
}
function failDirectoryReader(error) {
    alert("Failed to list directory contents: " + error.code);
}
function backPath() {
	currentPath = Left(currentPath, currentPath.lastIndexOf('/'));
	populate(currentPath); 
}
function changePath(ele){
	currentPath = currentPath + "/" + $(ele).parent().next().html();
	populate(currentPath);
}

//Error dump function
function dump(arr,level) {
    var dumped_text = "";
    if(!level) level = 0;

    var level_padding = "";
    for(var j=0;j<level+1;j++) level_padding += "    ";

    if(typeof(arr) == 'object') {  
        for(var item in arr) {
            var value = arr[item];

            if(typeof(value) == 'object') { 
                dumped_text += level_padding + "'" + item + "' ...\n";
                dumped_text += dump(value,level+1);
            } else {
                dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
            }
        }
    } else { 
        dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
    }
    return dumped_text;
}

//String left function
function Left(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}
