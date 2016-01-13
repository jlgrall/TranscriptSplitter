(function($, undefined) {
"use strict";
	
	/* Textarea helpers */
	
	// TODO: replace all the selection code with https://developer.mozilla.org/en-US/docs/Web/API/Selection
	//		 (Also see: https://github.com/timdown/rangyinputs/blob/master/rangyinputs-jquery-src.js)
	//		 Also see transcriptsplitter.js
	var // Inspired by: http://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript/11077016#11077016
		insertAtSelection = function(myField, myValue) {
			//IE support
			if (document.selection) {
				myField.focus();
				var sel = document.selection.createRange();
				sel.text = myValue;
			}
			//MOZILLA and others
			else if (myField.selectionStart || myField.selectionStart == '0') {
				var startPos = myField.selectionStart;
				var endPos = myField.selectionEnd;
				myField.value = myField.value.substring(0, startPos)
								+ myValue
								+ myField.value.substring(endPos, myField.value.length);
				myField.selectionStart = startPos + myValue.length;
				myField.selectionEnd = myField.selectionStart;
			} else {
				myField.value += myValue;
			}
		},
		// From: http://stackoverflow.com/questions/263743/caret-position-in-textarea-in-characters-from-the-start/3373056#3373056
		getInputSelection = function(el) {
			var start = 0, end = 0, normalizedValue, range,
				textInputRange, len, endRange;

			if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
				start = el.selectionStart;
				end = el.selectionEnd;
			} else {
				range = document.selection.createRange();

				if (range && range.parentElement() == el) {
					len = el.value.length;
					normalizedValue = el.value.replace(/\r\n/g, "\n");

					// Create a working TextRange that lives only in the input
					textInputRange = el.createTextRange();
					textInputRange.moveToBookmark(range.getBookmark());

					// Check if the start and end of the selection are at the very end
					// of the input, since moveStart/moveEnd doesn't return what we want
					// in those cases
					endRange = el.createTextRange();
					endRange.collapse(false);

					if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
						start = end = len;
					} else {
						start = -textInputRange.moveStart("character", -len);
						start += normalizedValue.slice(0, start).split("\n").length - 1;

						if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
							end = len;
						} else {
							end = -textInputRange.moveEnd("character", -len);
							end += normalizedValue.slice(0, end).split("\n").length - 1;
						}
					}
				}
			}

			return {
				start: start,
				end: end
			};
		},
		// Inspired from: https://richonrails.com/articles/text-area-manipulation-with-jquery
		setInputSelection = function(input, selectionStart, selectionEnd) {
			if (input.createTextRange) {
				var range = input.createTextRange();
				range.collapse(true);
				range.moveEnd('character', selectionEnd);
				range.moveStart('character', selectionStart);
				range.select();
			} else if (input.setSelectionRange) {
				input.focus();
				input.setSelectionRange(selectionStart, selectionEnd);
			}
		},
		toggleWrapSelectionWithTag = function($textarea, tag) {
			var textarea = $textarea[0],
				scrollTop = textarea.scrollTop,
				scrollLeft = textarea.scrollLeft,
				text = $textarea.val(),
				sel = getInputSelection(textarea),
				openingTag = "<" + tag + ">",
				closingTag = "</" + tag + ">",
				hasPreTag = text.substring(sel.start - openingTag.length, sel.start) === openingTag,
				hasPostTag = text.substring(sel.end, sel.end + closingTag.length) === closingTag;
			if(hasPreTag && hasPostTag) {
				$textarea.val(text.substring(0, sel.start - openingTag.length)
							+ text.substring(sel.start, sel.end)
							+ text.substring(sel.end + closingTag.length));
				setInputSelection(textarea, sel.start - openingTag.length, sel.end - openingTag.length);
			}
			else {
				$textarea.val(text.substring(0, sel.start)
							+ openingTag
							+ text.substring(sel.start, sel.end)
							+ closingTag
							+ text.substring(sel.end, text.length));
				setInputSelection(textarea, sel.start + openingTag.length, sel.end + openingTag.length);
			}
			textarea.scrollTop = scrollTop;
			textarea.scrollLeft = scrollLeft;
		};
	
	/* Time related helpers */
	var padZeros = function(i, length) {
			var num = "" + i;
			if(num.length < length) {
				num = "000000000000000000000000000000".substr(0, length - num.length) + num;
			}
			return num;
		},
		currentTime2Timestamp = function(currentTime, showHours) {
			var totalMinutes = Math.floor(currentTime / 60),
				hours = Math.floor(totalMinutes / 60) + "",
				minutes = padZeros(showHours ? totalMinutes % 60 : totalMinutes, 2),
				seconds = padZeros(Math.floor(currentTime % 60), 2);
			return (showHours ? hours + ":" : "") + minutes + ":" + seconds;
		},
		timestamp2CurrentTime = function(timestamp) {
			var currentTime = 0.0,
				parts = timestamp.split(/[\:\.\,]/),
				secs = parts.pop();
			if(secs.length > 2 && parts.length) {	// If the last number has 3 digits or more, it is a milliseconds count (except if it is the only part)
				currentTime += parseFloat("0." + secs, 10);
				secs = parts.pop();
			}
			currentTime += parseInt(secs, 10);
			if(parts.length) {
				var mins = parts.pop();
				currentTime += parseInt(mins, 10) * 60;
				if(parts.length) {
					var hours = parts.pop();
					currentTime += parseInt(hours, 10) * 60 * 60;
				}
			}
			return currentTime;
		},
		isTimestampChar = function(text, pos, onlyDigits) {
			switch(text.charAt(pos)) {
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					return true;
				case ':':
					return !onlyDigits;
				case '.':
				case ',':
						// if a '.' or a ',' is preceded by milliseconds (3 digits), it is not part of a timestamp.
						return !onlyDigits && (!isTimestampChar(text, pos - 1, true)
											|| !isTimestampChar(text, pos - 2, true)
											|| !isTimestampChar(text, pos - 3, true));
				default:
					return false;
			}
		};
	
	var transcriptWriter = function($textarea, options) {
			
			// Get the Options
			options = this.options = $.extend({}, transcriptWriter.prototype.options, options);
			
			this.$element = $textarea;
			this.element = $textarea[0];
			this.$textarea = $textarea;
			this.textarea = $textarea[0];
			
			var self = this;
			$textarea.on("keydown.transcriptWriter", function(e) {
				var player = options.player;
				if(e.which === 9 && !e.altKey && !e.metaKey) {		// Tab key
					e.preventDefault();
					if(player) {
						if(e.shiftKey) {	// With Shift key
							player.currentTime = player.currentTime - 3 * options.player.playbackRate;
						}
						else {		// Without Shift key
							if(player.paused) player.play();
							else player.pause();
						}
					}
				}
				if(e.metaKey && !e.shiftKey && !e.altKey) {	// Ctrl on Windows, Command on Mac
					if(e.which === 66) {		// B and metaKey
						toggleWrapSelectionWithTag($textarea, "b");
						self.transcriptChanged();
					}
					else if(e.which === 73) {	// I and metaKey
						toggleWrapSelectionWithTag($textarea, "i");
						self.transcriptChanged();
					}
					else if(e.which === 85) {	// U and metaKey
						toggleWrapSelectionWithTag($textarea, "u");
						self.transcriptChanged();
					}
				}
			}).on("change.transcriptWriter", function(e) {
				self.transcriptChanged();
			}).on("keyup.transcriptWriter", function(e) {
				switch(e.which) {	// keys list: http://unixpapa.com/js/key.html
					case 9:		// Tab
					case 16:	// Shift
					case 17:	// Ctrl
					case 18:	// Alt
					case 20:	// CapsLock
					case 144:	// NumLock
					case 27:	// Esc
					case 33:	// Page Up
					case 34:	// Page Down
					case 35:	// End
					case 36:	// Home
					case 37:	// Left arrow
					case 38:	// Up arrow
					case 39:	// Right arrow
					case 91:	// Windows Left Start
					case 92:	// Windows Right Start
					case 93:	// Windows Menu
					case 224:	// Mac Command
						break;
					default:
						// TODO: use oninput instead of onchange and onkeyup
						//       See: https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/oninput
						self.transcriptChanged();
				}
			});
		};
	
	transcriptWriter.prototype = {
		// default options
		options: {
			player: undefined,
		},
		setPlayer: function(player) {
			this.options.player = player;
			this.$textarea.trigger("playerChanged", {player: player});
		},
		transcriptChanged: function() {
			this.$textarea.trigger("transcriptChanged");
		},
		toggleWrapSelectionWithTag: function(tag) {
			toggleWrapSelectionWithTag(this.$textarea, tag);
		},
		insertTimestampAtSelection: function(prefix, suffix) {
			if(this.options.player) {
				if(!prefix) prefix = "[";
				if(!suffix) suffix = "]";
				var player = this.options.player,
					showHours = player.duration >= 60 * 60,	// Show hours if video duration is more than 1 hour
					timestamp = prefix + currentTime2Timestamp(player.currentTime, showHours) + suffix;
				insertAtSelection(this.textarea, timestamp);
				this.transcriptChanged();
			}
		},
		_findTimestampAroundPos: function(text, pos) {
			var start = pos,
				end = pos - 1;
			while(isTimestampChar(text, start - 1)) start--;
			while(isTimestampChar(text, end + 1)) end++;
			return start < end ? {start: start, end: end, timestamp: text.substring(start, end + 1)} : undefined;
		},
		seekToTimestampAtCaret: function(select) {
			if(this.options.player) {
				var text = this.$textarea.val(),
					at = getInputSelection(this.textarea).start,
					res = this._findTimestampAroundPos(text, at);
				if(res) {
					this.options.player.currentTime = timestamp2CurrentTime(res.timestamp);
					if(select) setInputSelection(this.textarea, res.start, res.end + 1);
				}
			}
		},
		destroy: function() {
			
			this.$textarea.off(".transcriptWriter");
		}
	};
	
	$.gadget("transcriptWriter", transcriptWriter);
	
})($);