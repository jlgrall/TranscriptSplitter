/* TranscriptSplitter v0.1 - Jean-Louis Grall - MIT License - https://github.com/jlgrall/TranscriptSplitter */

(function($, undefined) {
"use strict";
	
	/* Helpers */
	var Array_proto = Array.prototype,
		Array_push = Array_proto.push,
		Array_splice = Array_proto.splice,
		spliceArray = function(array, start, deleteCount, addItems) {
			var spliceArgs = [start, deleteCount];
			Array_push.apply(spliceArgs, addItems);
			return Array_splice.apply(array, spliceArgs);
		};
	
	/* The max line length that the user aims for: */
	var maxLength = 42;
	
	var getUnmodifiedLinesInText = function(text, oldText) {
			var tl = text.length,
				ol = oldText.length,
				min = Math.min(tl, ol),
				preLength = 0,
				preLines = 0,
				postLength = 0,
				postLines = 0,
				i;
			for(i = 0; i < min; i++) {
				if(text.charAt(i) !== oldText.charAt(i)) break;
				else if(text.charAt(i) === "\n") {
					preLines++;
					preLength = i + 1;
				}
			}
			if(i === min) {
				if(tl === ol || text.charAt(i) === "\n") {
					preLines++;
					preLength = i;
				}
			}
			min -= preLength;
			for(i = 0; i < min; i++) {
				if(text.charAt(tl - 1 - i) !== oldText.charAt(ol - 1 - i)) break;
				else if(text.charAt(tl - 1 - i) === "\n") {
					postLines++;
					postLength = i + 1;
				}
			}
			if(min > 0 && i === min) {
				if(text.charAt(tl - 1 - i) === "\n" && tl - 1 - i > preLength) {
					postLines++;
					postLength = i;
				}
				else if(oldText.charAt(ol - 1 - i) === "\n" && ol - 1 - i > preLength) {
					postLines++;
					postLength = i;
				}
			}
			return {
				preLength: preLength,
				preLines: preLines,
				postLength: postLength,
				postLines: postLines
			};
		},
		baseLineinfoElement = $("<div class='lineinfo'>??</div>"),
		createLineElement = function() {
			return baseLineinfoElement.clone();
		},
		updateLineElement = function(elem, length) {
			if(length === 0) elem.addClass("empty");
			else elem.removeClass("empty");
			if(length > maxLength) elem.addClass("error");
			else elem.removeClass("error");
			return elem.text(length);
		},
		createLineInfo = function(text, start, end) {
			var length = end - start;
			return {
				length: length,
				elem: null
			};
		},
		getLinesInfos = function(text, from, to) {
			var linesDescr = [],
				start = from;
			for(var i = from; i < to; i++) {
				if(text.charAt(i) === "\n") {
					linesDescr.push(createLineInfo(text, start, i));
					start = i + 1;
				}
			}
			if(i > start || start === from) linesDescr.push(createLineInfo(text, start, i));
			return linesDescr;
		},
		updateLineLengths = function(scrolledlinesDiv, linesInfos, text, oldText) {
			var unmodLines = getUnmodifiedLinesInText(text, oldText),
				hasModifiedLines = text.length !== oldText.length || unmodLines.preLength !== text.length || unmodLines.postLength !== 0;
			
			//console.log(unmodLines)
			
			if(hasModifiedLines) {
				var from = unmodLines.preLength,
					to = text.length - unmodLines.postLength,
					modifiedLinesInfos = getLinesInfos(text, from, to);
				
				//console.log(text.length, from, to, modifiedLinesInfos.map(function(val) { return val.length; }))
				
				var modifiedOldLinesNb = linesInfos.length - unmodLines.preLines - unmodLines.postLines,
					updateOldLinesNb = Math.min(modifiedOldLinesNb, modifiedLinesInfos.length),
					removeOldLinesNb = modifiedOldLinesNb - updateOldLinesNb,
					insertNewLinesNb = modifiedLinesInfos.length - updateOldLinesNb;
				
				var start = unmodLines.preLines;
				for(var i = 0; i < updateOldLinesNb; i++) {
					var modifiedOldLineInfos = linesInfos[start + i],
						modifiedLineInfos = modifiedLinesInfos[i];
					modifiedOldLineInfos.length = modifiedLineInfos.length;
					updateLineElement(modifiedOldLineInfos.elem, modifiedLineInfos.length);
				}
				var insertLinesInfos = modifiedLinesInfos.slice(updateOldLinesNb);
				start += updateOldLinesNb;
				
				for(i = 0; i < removeOldLinesNb; i++) {
					modifiedOldLineInfos = linesInfos[start + i];
					modifiedOldLineInfos.elem.remove();
				}
				
				if(insertNewLinesNb > 0) {
					var insertElems = [];
					for(i = 0; i < insertNewLinesNb; i++) {
						modifiedLineInfos = insertLinesInfos[i];
						var elem = updateLineElement(createLineElement(), modifiedLineInfos.length);
						modifiedLineInfos.elem = elem;
						insertElems.push(elem);
					}
					if(start === 0) scrolledlinesDiv.prepend(insertElems);
					else linesInfos[start - 1].elem.after(insertElems);
				}
				
				spliceArray(linesInfos, start, removeOldLinesNb, insertLinesInfos);
			}
		};
	
	var getCharWidthFor = function(elem) {
			var temp = $("<span></span>").css({
					"display": "inline",
					"fontSize": elem.css("fontSize"),
					"fontFamily": elem.css("fontFamily"),
					"lineHeight": elem.css("lineHeight")
				}),
				tempText = ["m"];
			while(tempText.length < 200) tempText.push("m");
			temp.text(tempText.join("")).insertAfter(elem);
			var charWidth = temp.innerWidth() / 200;
			temp.remove();
			return charWidth;
		},
		setbgPos = function(textarea, bgPos, scrollLeft) {
			var arr = [];
			for(var i = 0, l = bgPos.length; i < l; i++) {
				arr.push((bgPos[i] - scrollLeft) + "px 0");
			}
			textarea.css("backgroundPosition", arr.join(","));
		},
		findCaret = function(ta) {
			return ta.selectionDirection === "forward" ? ta.selectionEnd : ta.selectionStart;
		},
		findCaretInLine = function(ta, text) {
			var caret = findCaret(ta),
				pos = text.lastIndexOf("\n", caret - 1);
			return caret - 1 - pos;
		},
		setCaretPosition = function(ta, pos) {
			return ta.selectionStart = ta.selectionEnd = pos;
		},
		findCharAroundPos = function(text, pos, _char, at) {
			for(var i = 0, l = at.length; i < l; i++) {
				if(text.charAt(pos + at[i]) === _char) return pos + at[i];
			}
			return -1;
		},
		spliceTextarea = function(ta, text, start, deleteCount, addString, caret) {
			if(addString === undefined) addString = "";
			if(caret === undefined) caret = findCaret(ta);
			if(caret >= start) {
				caret += addString.length - (caret === start ? 0 : deleteCount);
			}
			text = text.substr(0, start) + addString + text.substr(start + deleteCount);
			ta.value = text;
			setCaretPosition(ta, caret);
			return text;
		};
	
	
	
	var transcriptSplitter = function(textarea, options) {
			
			// Get the Options
			var opts = $.extend({}, $.fn.transcriptSplitter.prototype.options, options);
			
			
			var ta = textarea[0],
				textareaOriginalWidth = textarea.outerWidth();
			
			/* Turn off the wrapping of lines as we don't want to screw up the line numbers */
			textarea.attr("wrap", "off");
			
			/* Wrap the text area in the elements we need */
			var transsplitterwrapDiv = $("<div class='transsplitterwrap'></div>"),
				linesDiv = $("<div class='lines'></div>").appendTo(transsplitterwrapDiv),
				scrolledlinesDiv = $("<div class='scrolledlines'></div>").appendTo(linesDiv),
				linedTextAreaDiv = $("<div class='textareawrap'></div>").appendTo(transsplitterwrapDiv),
				linePosDiv = $("<div class='linepos'>-1</div>").appendTo(transsplitterwrapDiv);
			
			transsplitterwrapDiv.insertAfter(textarea);
			linedTextAreaDiv.append(textarea);
			
			/* Positions of backgrounds relative to the characters width */
			var charWidth = getCharWidthFor(textarea),
				bgPos = [charWidth * 2 * maxLength, charWidth * maxLength];
			
			/* Narrow the width of textarea */
			if(opts.keepWidth) {
				var addedWidth = transsplitterwrapDiv.outerWidth() - textarea.outerWidth();
				textarea.outerWidth(textareaOriginalWidth - addedWidth);
			}
			
			/* Keep informations for each line */
			var oldText = "",
				linesInfos = [createLineInfo(oldText, 0, 0)],
				elem = updateLineElement(createLineElement(), 0);
			linesInfos[0].elem = elem;
			scrolledlinesDiv.prepend(elem);
			
			/* Event: text changes */
			var textareaLineHeight = parseInt(textarea.css("lineHeight"), 10);
			textarea.on("change keyup", function(e) {
				//var start = Date.now();
				var text = textarea.val();
				
				var which = e.which;
				if(e.type === "keyup" && which === 8 || which === 13 || which === 46) {	// Backspace || Return || Delete
					var caret = findCaret(ta);
					
					if(which === 46) which = 8;	// Delete => Backspace
					if(which === 8 && oldText.charAt(caret) === "\n") {	// Backspace
						ta.scrollTop -= textareaLineHeight;
						if(text.charAt(caret - 1) !== "\n" && caret > 0) {
							var spacePos = findCharAroundPos(text, caret, " ", [-1, 0]);
							if(spacePos === -1 && text.charAt(caret) !== "\n" && caret < text.length) {
								text = spliceTextarea(ta, text, caret, 0, " ");
							}
						}
					}
					else if(which === 13) {	// Return
						ta.scrollTop += textareaLineHeight;
						var spacePos = findCharAroundPos(text, caret, " ", [-2, 0]);
						if(spacePos !== -1) {
							text = spliceTextarea(ta, text, spacePos, 1);
						}
					}
				}
				
				updateLineLengths(scrolledlinesDiv, linesInfos, text, oldText);
				oldText = text;
				//console.log(Date.now() - start);
			});
			
			/*  */
			var checkLinePos = function() {
					var linePos = findCaretInLine(ta, textarea.val());
					if(linePos > maxLength) linePosDiv.addClass("error");
					else linePosDiv.removeClass("error");
					linePosDiv.text(linePos + "/" + maxLength);
				},
				lastSelectionStart = -1,
				lastSelectionEnd = -1,
				findLinePos_mousemove = function(e) {
					if(ta.selectionStart !== lastSelectionStart || ta.selectionEnd !== lastSelectionEnd) {
						lastSelectionStart = ta.selectionStart;
						lastSelectionEnd = ta.selectionEnd;
						checkLinePos();
					}
				};
			textarea.on("keydown click", function(e) {
				setTimeout(checkLinePos);
			}).on("mousedown", function(e) {
				textarea.on("mousemove", findLinePos_mousemove);
			}).on("mouseup", function(e) {
				textarea.off("mousemove", findLinePos_mousemove);
				lastSelectionStart = -1;
				lastSelectionEnd = -1;
			});
			
			
			/* Event scroll: make lineinfos and backgrounds scroll in sync */
			var lastScrollTop = 0,
				lastScrollLeft = 0;
			textarea.on("scroll", function(e) {
				var scrollTop = ta.scrollTop;
				if(scrollTop !== lastScrollTop) {
					scrolledlinesDiv[0].style.top = (-this.scrollTop) + "px";
					lastScrollTop = scrollLeft;
				}
				var scrollLeft = ta.scrollLeft;
				if(scrollLeft !== lastScrollLeft) {
					setbgPos(textarea, bgPos, scrollLeft);
					lastScrollLeft = scrollLeft;
				}
			});
			
			setbgPos(textarea, bgPos, ta.scrollLeft);
			textarea.change();
			checkLinePos();
	};
	
	transcriptSplitter.prototype = {
		// default options
		options: {
			keepWidth: true
		}
	};
	
	$.gadget("transcriptSplitter", transcriptSplitter);
	
})($);