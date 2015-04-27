

var x = document.getElementsByClassName("entry");
for(var i = 0; i < x.length; i++){
	var allPermas = x[i].getElementsByClassName("bylink");
	if(allPermas.length > 0){
		var pieces = allPermas[0]["href"].split("/");
		var link = pieces[pieces.length-1];
		var btn = document.createElement("input");
		btn.setAttribute("type","checkbox");
		btn.setAttribute("id",link);
		btn.setAttribute("class","reddbed_select");
		var existing = x[i].getElementsByClassName("reddbed_select");
		if(existing.length <= 0){
			x[i].insertBefore(btn,x[i].childNodes[0]);
		}
		
		
	}
	
	
}

