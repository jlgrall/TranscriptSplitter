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
			
			this.onTranscriptChanged = function() {
				if(this.playerGadget) this.lastCurrentTime = this.playerGadget.player.currentTime;
				this.lastTranscriptChange = Date.now();
				//console.log("Transcript changed");
				if(this.debounceTimeout === -1) this.debounceSaveProgress();
			}.bind(this);
			this.onPlaybackRateChanged = function(e, data) {
				this.savePlaybackRate();
			}.bind(this);
			this.onunload = function() {
				if(this.debounceTimeout !== -1) {
					this.saveProgress();
				}
			}.bind(this);
			
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
			
			if(this.playerGadget) $transcriptPlayer.on("playbackRateChanged", this.onPlaybackRateChanged);
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
		savePlaybackRate: function() {
			if(this.playerGadget) {
				this.options.store.set("state.playbackRate", this.playerGadget.playbackRate());
				this.$element.trigger("playbackRateSaved");
			}
		},
		loadPlaybackRate: function() {
			if(this.playerGadget) {
				var playbackRate = parseFloat(this.options.store.get("state.playbackRate"));
				if(!isNaN(playbackRate)) {
					this.playerGadget.playbackRate(playbackRate);
					this.$element.trigger("playbackRateLoaded");
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
		saveAll: function() {
			this.savePlayerSource();
			this.saveProgress();
			this.savePlaybackRate();
		},
		loadAll: function() {
			this.loadPlayerSource();
			this.loadProgress();
			this.loadPlaybackRate();
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