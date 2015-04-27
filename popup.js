// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

	
	
function click(e) {

	if(e.currentTarget.getAttribute("id")==="checkbox"){
		chrome.tabs.executeScript(null,
	        {file:"reddit.js"});
	}
	else if(e.currentTarget.getAttribute("id")==="generateHtml"){
		chrome.tabs.executeScript(null,
	        {file:"generate.js"});
	}
	else if(e.currentTarget.getAttribute("id")==="generateReddit"){
		chrome.tabs.executeScript(null,
	        {file:"generateMarkdown.js"});
	}

	
	
	
  window.close();
}

document.addEventListener('DOMContentLoaded', function () {
    
  var divs = document.querySelectorAll('a');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});
