(function($, undefined) {
"use strict";
	
	
	var transcriptSaver = function($element, options) {
			
			// Get the Options
			options = this.options = $.extend({}, transcriptSaver.prototype.options, options);
			
			this.$element = $element;
			this.element = $element[0];
			
			this.playerGadget = undefined;
			this.writerGadget = undefined;
			
			this.lastTranscript = "";
			this.lastCurrentTime = 0.0;
			this.debounceTimeout = -1;
			this.lastTranscriptChange = 0;
			this.lastProgressSave = 0;
			
			this.debounceSaveProgressBound = this.debounceSaveProgress.bind(this);
			
			this.storeState = {};
			
			var self = this;
			this.onTranscriptChanged = function() {
				if(self.playerGadget) self.lastCurrentTime = self.playerGadget.player.currentTime;
				self.lastTranscriptChange = Date.now();
				//console.log("Transcript changed");
				if(self.debounceTimeout === -1) self.debounceSaveProgress();
			};
			this.onunload = function() {
				if(self.debounceTimeout !== -1) {
					self.saveProgress();
				}
			};
			
			$element.on("change", ".storeState", function(e) {
				self.saveStoreStateFor(e.target);
			});
			
			$(window).on("unload.transcriptSaver", this.onunload);
			
			this.setTranscriptPlayer(options.$transcriptPlayer);
			this.setTranscriptWriter(options.$transcriptWriter);
		};
	
	transcriptSaver.prototype = {
		// default options
		options: {
			debounce: 5 * 1000,
			maxDebounce: 30 * 1000,
			store: window.store.namespace("Transcript"),	// Namespace the store
			$playerURLInput: undefined,
			$transcriptPlayer: undefined,
			$transcriptWriter: undefined,
		},
		setTranscriptPlayer: function($transcriptPlayer) {
			var options = this.options;
			if(this.playerGadget) options.$transcriptPlayer.off(".transcriptSaver");
			options.$transcriptPlayer = $transcriptPlayer;
			this.playerGadget = $transcriptPlayer ? options.$transcriptPlayer.data("gadget-transcriptPlayer") : undefined;
		},
		setTranscriptWriter: function($transcriptWriter) {
			var options = this.options;
			if(this.writerGadget) options.$transcriptWriter.off(".transcriptSaver");
			options.$transcriptWriter = $transcriptWriter;
			this.writerGadget = $transcriptWriter ? options.$transcriptWriter.data("gadget-transcriptWriter") : undefined;
			
			if(this.writerGadget) $transcriptWriter.on("transcriptChanged.transcriptSaver", this.onTranscriptChanged);
		},
		debounceSaveProgress: function() {
			if(this.debounceTimeout !== -1) window.clearTimeout(this.debounceTimeout);
			var maxTime = this.lastProgressSave + this.options.maxDebounce,
				nextTime = Math.min(maxTime, this.lastTranscriptChange + this.options.debounce),
				nextDelay = nextTime - Date.now();
			if(nextDelay <= 0) {
				this.saveProgress();
			}
			else {
				//console.log("Timeout:", nextDelay);
				this.debounceTimeout = window.setTimeout(this.debounceSaveProgressBound, nextDelay);
			}
		},
		saveProgress: function() {
			if(this.writerGadget) {
				window.clearTimeout(this.debounceTimeout);
				this.debounceTimeout = -1;
				var transcript = this.options.$transcriptWriter.val();
				if(transcript !== this.lastTranscript) {
					this.options.store.set("state.transcript", transcript);
					this.lastTranscript = transcript;
				}
				this.options.store.set("state.currentTime", this.lastCurrentTime);
				this.lastProgressSave = Date.now();
				//console.log("State saved");
				this.$element.trigger("progressSaved");
			}
		},
		loadProgress: function() {
			if(this.writerGadget) {
				var transcript = this.options.store.get("state.transcript");
				if(transcript !== null) {
					this.lastTranscript = transcript;
					this.options.$transcriptWriter.val(transcript);
				}
			
				var currentTime = this.options.store.get("state.currentTime");
				if(currentTime !== null) {
					this.lastCurrentTime = currentTime;
					if(this.playerGadget) this.playerGadget.player.currentTime = currentTime;
				}
			
				if(transcript !== null || currentTime !== null) {
					this.lastProgressSave = Date.now();
					this.$element.trigger("progressLoaded");
				}
			}
		},
		savePlayerSource: function() {
			this.options.store.set("state.playerURLInput", this.options.$playerURLInput.val());
		},
		loadPlayerSource: function() {
			var source = this.options.store.get("state.playerURLInput");
			if(source !== null) {
				this.options.$playerURLInput.val(source);
				if(!this.playerGadget.player.currentSrc) {
					// http://api.jquery.com/category/events/event-object/
					var e = $.Event("keydown", {which: 13});	// Enter key
					this.options.$playerURLInput.trigger(e);
				}
			}
		},
		_loadStoreStateKey: function(type, key) {
			var data = JSON.parse(this.options.store.get("state." + type));
			if(!this.storeState[type]) this.storeState[type] = {};
			this.storeState[type][key] = data && data[key];
		},
		_getStoreStateInfoFor: function(elem, getVal) {
			var $elem = $(elem),
				infos = {elem: elem, $elem: $elem};
			
			if($elem.is("input[type=checkbox]")) {
				infos.type = "checkboxes";
				infos.key = $elem.prop("id");
			}
			else if($elem.is("input[type=radio]")) {
				infos.type = "radios";
				infos.key = $elem.prop("name");
			}
			else if($elem.is("select:not([multiple])")) {
				infos.type = "selects";
				infos.key = $elem.prop("id");
			}
			else {
				console.log("storeState not implemented for:", elem);
			}
			
			if(infos.type && getVal) this._getStoreStateInfosValFor(infos);
			
			return infos;
		},
		_getStoreStateInfosValFor: function(infos) {
			var type = infos.type,
				key = infos.key,
				$element = this.$element,
				$target;
			
			if(type) {
				if(type === "checkboxes") {
					infos.val = infos.$elem.is(":checked") || undefined;
				}
				else if(type === "radios") {
					$target = $element.find('input[type=radio][name="' + key + '"]:checked');
					infos.val = $target.val();
				}
				else if(type === "selects") {
					$target = $element.find("select#" + key + " option:selected");
					infos.val = $target.val();
				}
			}
			return infos;
		},
		saveStoreStateVal: function(type, key, val) {
			var storeState = this.storeState;
			if(!storeState[type]) storeState[type] = {};
			if(storeState[type][key] !== val) {
				if(val === undefined) delete storeState[type][key];
				else storeState[type][key] = val;
				this.options.store.set("state." + type, JSON.stringify(storeState[type]));
			}
		},
		saveStoreStateFor: function(elem) {
			var infos = this._getStoreStateInfoFor(elem, true),
				type = infos.type;
			
			if(type) {
				this.saveStoreStateVal(type, infos.key, infos.val);
				this.$element.trigger(infos.key + "Saved");
			}
		},
		saveAllStoreStates: function() {
			var self = this;
			this.$element.find(".storeState").each(function(i, elem) {
				self.saveStoreStateFor(elem);
			});
		},
		loadStoreStateVal: function(type, key) {
			this._loadStoreStateKey(type, key);
			
			var $element = this.$element,
				storeState = this.storeState,
				storedVal = storeState[type] ? storeState[type][key] : undefined,
				$target, infos;
			
			if(type === "checkboxes") {
				$target = $element.find("input[type=checkbox]#" + key);
				infos = this._getStoreStateInfoFor($target[0], true);
				if(storedVal !== infos.val) $target.prop('checked', !!storedVal).change();
			}
			else if(type === "radios") {
				$target = $element.find('input[type=radio][name="' + key + '"]');
				infos = this._getStoreStateInfoFor($target[0], true);
				if(storedVal !== infos.val) {
					if(storedVal !== undefined && storedVal !== false) {
						$target.filter('[value="' + storedVal + '"]').prop('checked', true).change();
					}
					else {
						$target.filter(":checked").prop('checked', false).change();
					}
				}
			}
			else if(type === "selects") {
				$target = $element.find("select#" + key);
				infos = this._getStoreStateInfoFor($target[0], true);
				if(storedVal !== infos.val) {
					if(storedVal !== undefined && storedVal !== false) {
						$target.find('option[value="' + storedVal + '"]').prop('selected', true);
						$target.change();
					}
					else {
						$target.find("option:selected").prop('selected', false);
						$target.change();
					}
				}
			}
			else {
				console.log("loadStoreStateVal not implemented for type: " + type);
			}
		},
		loadStoreStateFor: function(elem) {
			var infos = this._getStoreStateInfoFor(elem);
			
			if(infos.type) {
				this.loadStoreStateVal(infos.type, infos.key);
				this.$element.trigger(infos.key + "Loaded");
			}
		},
		loadAllStoreStates: function() {
			var self = this,
				radioNames = {};
			
			this.$element.find(".storeState").each(function(i, elem) {
				var $elem = $(elem);
				if($elem.is("input[type=radio]")) {
					var name = $elem.prop("name");
					if(name !== undefined && radioNames[name]) return;
					else radioNames[name] = true;
				}
				self.loadStoreStateFor(elem);
			});
		},
		saveAll: function() {
			this.savePlayerSource();
			this.saveProgress();
			this.saveAllStoreStates();
		},
		loadAll: function() {
			this.loadPlayerSource();
			this.loadProgress();
			this.loadAllStoreStates();
		},
		destroy: function() {
			$(window).off("unload", this.onunload);
			if(this.playerGadget)  this.options.$transcriptPlayer.off(".transcriptSaver");
			if(this.writerGadget) this.options.$transcriptWriter.off(".transcriptSaver");
			this.$element.off(".transcriptSaver");
		}
	};
	
	$.gadget("transcriptSaver", transcriptSaver);
	
})($);