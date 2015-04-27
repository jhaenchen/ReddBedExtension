
alert("hi");
function getCheckedBoxes() {
  var checkboxes = document.getElementsByClassName("reddbed_select");
  var checkboxesChecked = [];
  // loop over them all
  for (var i=0; i<checkboxes.length; i++) {
     // And stick the checked ones onto an array...
     if (checkboxes[i].checked) {
        checkboxesChecked.push(checkboxes[i]);
     }
  }
  // Return the array if it is non-empty, or null
  return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}



		
var getParentButton = function(current){
	var theParentContainer = current.parentElement.parentElement.parentElement.parentElement.parentElement;
	//console.log(theParentContainer);
	var theParent;

	//Look to the next element up to see if it's selected
	for(var i = 0; i < theParentContainer.children.length; i++){
		if(theParentContainer.children[i].className.indexOf("entry") > -1){
			theParent = theParentContainer.children[i];
		}
	}
	if(theParent !== undefined && theParent !== null){
		var parentButton;
		for(var i = 0; i < theParent.children.length; i++){
			if(theParent.children[i].tagName === "INPUT"){
				parentButton = theParent.children[i];
			}
		}
		return parentButton;
	}
}

//This function should determine the relationship between two buttons - parent, child, sibling, or uncle
//Returns the relationship between the current and the previous
var evaluateRelationship = function (current, previous){

	if(current === previous){
		return "same";
	}
	//The current is a child of the previous
	var parentButton = getParentButton(current);
	if(parentButton !== null && parentButton !== undefined){
		if(parentButton.getAttribute("id") === previous.getAttribute("id")){
			return "child";	
		}
	}
	
	//The current is the parent of the previous
	var childButton = getParentButton(previous);
	if(childButton !== null && childButton !== undefined){
		if(childButton.getAttribute("id") === current.getAttribute("id")){
			return "parent";
		}
	}
	
	//The current is a sibling of the previous
	var parentContainer = current.parentElement.parentElement.parentElement;

	for(var i = 0; i < parentContainer.children.length; i++){
		try{
			var id = parentContainer.children[i].getAttribute("data-fullname").split("_")[1];
			var childButton = document.getElementById(id);
			if(childButton.getAttribute("id") === previous.getAttribute("id")){
				return "sibling";
			}
		}
		catch(err){}
	}
	
	parentContainer = parentContainer.parentElement.parentElement;
	for(var i = 0; i < parentContainer.children.length; i++){
		try{
			var id = parentContainer.children[i].getAttribute("data-fullname").split("_")[1];
			var childButton = document.getElementById(id);
			if(childButton.getAttribute("id") === previous.getAttribute("id")){
				return "uncle";
			}
		}
		catch(err){}
	}
	return "none";
//ANYTHING WITHOUT A SELECTED PARENT IS NECESSARILY A TOP LEVEL COMMENT
		
}

var getGenerationDifference = function (from, to){
	var doContinue = true;
	var genCount = 0;
	while(doContinue){
		var relation = evaluateRelationship(from, to);
		console.log(relation);
		if(relation === "sibling" || relation === "same"){
			doContinue = false;
		}
		else{
			genCount += 1;
			from = getParentButton(from);
			console.log(from);
			if(from === undefined || from === null || !from.checked){
				doContinue = false;
				genCount = -1;
			}
		}
	}
	return genCount;
}

var getCommentHtml = function(element){
		console.log
	
}


var toRecord = getCheckedBoxes();
var previous = toRecord[0];
var embedString = "";
var level = 1;
for(var d = 0; d < toRecord.length; d++){
	var relation = evaluateRelationship(toRecord[d],previous);
	console.log(relation);
	switch(relation){
	case "same":
		console.log(toRecord[d]);
		embedString += "<div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
		level = 1;
		break;
	case "child":
		embedString += "<div class=\"child\"><div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
		
		level += 2;
		console.log(level);
		break;
	case "sibling":
		embedString += "</div><div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
		break;
	case "uncle":
		embedString += "</div></div></div><div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
		level -= 2;
		break;
	case "none":
		var gens = getGenerationDifference(previous, toRecord[d]);
		var gens2 = getGenerationDifference(toRecord[d],previous);
		gens = Math.max(gens,gens2);
		console.log(gens);
		console.log(level);
		
		if(gens != -1){
			for(var i = 0; i < 2*gens+1; i++){
				embedString += "</div>";
			}
			embedString += "<div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
			level = level-2*gens;
			console.log(level);
			console.log(embedString);
		}
		else{
			
			for(var i = 0; i < level; i++){
				embedString += "</div>";
			}
			embedString += "<div class=\"red-comment\"><a href=\""+window.location.href+toRecord[d].getAttribute("id")+"\"></a>";
			level = 1;
			
		}
		break;
	}
	previous = toRecord[d];
}

for(var i = level; i > 0; i--){
	embedString += "</div>";
	
}



var titles = document.getElementsByClassName("title");
var postUrl;
for(var i = 0; i < titles.length; i++){

	if(titles[i].parentElement.className ==="title"){
		postUrl = titles[i].href;
	}
}

embedString = "<div class=\"red-item\"><a href=\""+postUrl+"\"></a><div class=\"child\">".concat(embedString);
embedString += "</div></div>";

function SelectText(element) {
    var doc = document
        , text = doc.getElementById(element)
        , range, selection
    ;    
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();        
        range = document.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

console.log(embedString);
var encoded = embedString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
//var popup = document.creatElement("div");
//popup.setAttribute("style","z-index:5;position: relative; width:50%; background-color:black;");
//document.body.insertAdjacentHTML( 'afterbegin', '<div id=\'popup\' style=\" border: 2px solid black; -moz-border-radius: 10px; border-radius: 10px; z-index:5;position: fixed; width:75%; background-color:#E6E6E6; margin: 0 auto; top: 15%; left: 12.5%; text-align:center; font-family: \'Segoe UI\', Frutiger, \'Frutiger Linotype\', \'Dejavu Sans\', \'Helvetica Neue\', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: 500; line-height: 26.3999996185303px; \"><h2 style=\"font-size: 48px; position:relative; top:10%;\">ReddBed<\/h2> <h1 style=\"font-size:18px; text-align:left; padding-left:5px;\">Your html schema:<\/h1> <textarea id=\"embedSchema\" style=\"height:20%; padding: 5px;word-wrap: break-word;line-height:15px ; text-align: left; font-size:12px; -moz-border-radius: 10px; border-radius: 10px; width:90%; border: 1px solid #BDBDBD; margin: 0 auto; background-color:#FAFAFA; margin-bottom:10px;\">'+encoded+'<\/textarea><button class= "btn" id="embedDone" onclick=\'document.getElementById("popup").parentNode.removeChild(document.getElementById("popup"));\' type="button" style="margin-bottom:10px; background: #3498db; background-image: -webkit-linear-gradient(top, #3498db, #2980b9); background-image: -moz-linear-gradient(top, #3498db, #2980b9); background-image: -ms-linear-gradient(top, #3498db, #2980b9); background-image: -o-linear-gradient(top, #3498db, #2980b9); background-image: linear-gradient(to bottom, #3498db, #2980b9); -webkit-border-radius: 28; -moz-border-radius: 28; border-radius: 28px; font-family: Arial; color: #ffffff; font-size: 17px; padding: 6px 20px 6px 20px; text-decoration: none;}">Got it.</button> <\/div>' );


document.getElementById("embedSchema").onclick =  function(){
	SelectText("embedSchema");
}

		
		
		
		
		
		
		
		
		