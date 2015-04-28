
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
		
		if(relation === "sibling" || relation === "same"){
			doContinue = false;
		}
		else{
			genCount += 1;
			from = getParentButton(from);
			
			if(from === undefined || from === null || !from.checked){
				doContinue = false;
				genCount = -1;
			}
		}
	}
	return genCount;
}

var getCommentHtml = function(element,level){
	var indent = "";
	for(var i = 0; i < level; i++){
		indent+=">";
	}
	var markdown  = toMarkdown(element.parentElement.getElementsByClassName("usertext")[0].getElementsByClassName("usertext-body")[0].getElementsByClassName("md")[0].innerHTML).replace(new RegExp("\n","g"), '\n'+indent);
	var div = document.createElement("div");
	div.innerHTML = markdown;
	markdown = div.textContent || div.innerText || "";
	markdown = markdown.replace(/\[[^\]]\]/g, '');
	return markdown;
	
	return toMarkdown(element.parentElement.getElementsByClassName("usertext")[0].getElementsByClassName("usertext-body")[0].getElementsByClassName("md")[0].innerHTML).replace(new RegExp("\n","g"), '\n'+indent);
	
	
}
var getCommentScore = function(element){
	var toReturn;
	try{
		toReturn = element.parentElement.getElementsByClassName("tagline")[0].getElementsByClassName("score")[1].innerText.split(" ")[0];
	}
	catch(err){
		toReturn = "<hidden> ";
	}
	return toReturn;
}
var getCommentAuthor = function(element){
	return element.parentElement.getElementsByClassName("author")[0].innerText;
}
var getCommentPostTitle = function(element){
	return document.getElementsByClassName("title")[0].innerText;
}
var getCommentPermalink = function(element){
	return element.parentElement.getElementsByClassName("bylink")[0].href;
}

var generateCommentMarkup = function(element, level){
	var commentText = getCommentHtml(element, level);
	var commentScore = getCommentScore(element);
	var commentAuthor = getCommentAuthor(element);
	var commentPermalink = getCommentPermalink(element);
	var indent = "";
	for(var i = 0; i < level; i++){
		indent+=">";
	}
var toReturn = ""
	toReturn+= indent;
	toReturn += "---\n";
	toReturn += indent;
	toReturn+=commentText+"\n\n";
	toReturn += indent;
	toReturn += "**^("+commentScore+"pt, )^[/u/"+commentAuthor+"]("+commentPermalink+")**\n\n";
	return toReturn;

	
}

var toRecord = getCheckedBoxes();
var previous = toRecord[0];
var embedString = "";
var level = 1;
for(var d = 0; d < toRecord.length; d++){
	
	var relation = evaluateRelationship(toRecord[d],previous);
	
	switch(relation){
	case "same":
		
		embedString += generateCommentMarkup(toRecord[d],level);
		level = 1;
		break;
	case "child":
		level += 1;
		embedString += generateCommentMarkup(toRecord[d],level);
		break;
	case "sibling":
		embedString += generateCommentMarkup(toRecord[d],level);
		break;
	case "uncle":
		level -= 1;
		embedString += generateCommentMarkup(toRecord[d],level);
		break;
	case "none":
		var gens = getGenerationDifference(previous, toRecord[d]);
		var gens2 = getGenerationDifference(toRecord[d],previous);
		gens = Math.max(gens,gens2);
		if(gens != -1){
			for(var i = 0; i < gens; i++){
				level--;
			}
			embedString += generateCommentMarkup(toRecord[d],level);
		}
		break;
	}
	previous = toRecord[d];
}

embedString+="\n>---\n>^(Generated:"+Date(Date.now()).replace("(","").replace(")","")+" using )^[RedBedd](http://www.jhaenchen.github.io/ReddBed)\n\n>---";



var title = document.getElementsByClassName("thing link")[0].getElementsByClassName("title")[0].getElementsByTagName("a")[0].innerText;
var titleUrl = document.getElementsByClassName("thing link")[0].getElementsByClassName("title")[0].getElementsByTagName("a")[0].href;

var postSubmitTime = document.getElementsByClassName("thing link")[0].getElementsByClassName("live-timestamp")[0].title;

var postAuthor = document.getElementsByClassName("thing link")[0].getElementsByClassName("author")[0].innerText;
var postCommentCount = document.getElementsByClassName("comments")[0].innerText.split(" ")[0];

embedString = ">---\n>####["+title+"]("+titleUrl+") \n>####^(submitted "+postSubmitTime+" by /u/"+postAuthor+")\n>####^["+postCommentCount+"]("+window.location.href+") ^[comments]("+window.location.href+")\n".concat(embedString);


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



var popup = document.createElement("div");
popup.setAttribute("style","z-index:5;position: relative; width:50%; background-color:black;");
document.body.insertAdjacentHTML( 'afterbegin', '<div id=\'popup\' style=\" border: 2px solid black; -moz-border-radius: 10px; border-radius: 10px; z-index:5;position: fixed; width:75%; background-color:#E6E6E6; margin: 0 auto; top: 15%; left: 12.5%; text-align:center; font-family: \'Segoe UI\', Frutiger, \'Frutiger Linotype\', \'Dejavu Sans\', \'Helvetica Neue\', Arial, sans-serif; font-style: normal; font-variant: normal; font-weight: 500; line-height: 26.3999996185303px; \"><h2 style=\"font-size: 48px; position:relative; top:10%;\">ReddBed<\/h2> <h1 style=\"font-size:18px; text-align:left; padding-left:5px;\">Your Markdown schema:<\/h1> <textarea id=\"embedSchema\" style=\"height:20%; padding: 5px;word-wrap: break-word;line-height:15px ; text-align: left; font-size:12px; -moz-border-radius: 10px; border-radius: 10px; width:90%; border: 1px solid #BDBDBD; margin: 0 auto; background-color:#FAFAFA; margin-bottom:10px;\">'+embedString+'<\/textarea><br><button class= "btn" id="embedDone" onclick=\'document.getElementById("popup").parentNode.removeChild(document.getElementById("popup"));\' type="button" style="margin-bottom:10px; background: #3498db; background-image: -webkit-linear-gradient(top, #3498db, #2980b9); background-image: -moz-linear-gradient(top, #3498db, #2980b9); background-image: -ms-linear-gradient(top, #3498db, #2980b9); background-image: -o-linear-gradient(top, #3498db, #2980b9); background-image: linear-gradient(to bottom, #3498db, #2980b9); -webkit-border-radius: 28; -moz-border-radius: 28; border-radius: 28px; font-family: Arial; color: #ffffff; font-size: 17px; padding: 6px 20px 6px 20px; text-decoration: none;}">Got it.</button> <\/div>' );


document.getElementById("embedSchema").onclick =  function(){
	//SelectText("embedSchema");
}
document.getElementById("embedDone").onclick = function(){
	window.getSelection().removeAllRanges();
}
		
		
		
		
		
		
		
		
		