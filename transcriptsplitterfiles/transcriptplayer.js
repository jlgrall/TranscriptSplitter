(function($, undefined) {
"use strict";
	
	var transcriptPlayer = function($element, options) {
			
			// Get the Options
			options = this.options = $.extend({}, transcriptPlayer.prototype.options, options);
			
			this.$element = $element;
			this.element = $element[0];
			
			this.$transcriptVideo = options.$transcriptVideo;
			this.transcriptVideo = options.$transcriptVideo[0];
			this.videoGadget = options.$transcriptVideo.data("gadget-transcriptVideo");
			
			this.player = this.transcriptVideo;
			
			this.src = undefined;
		};
	
	transcriptPlayer.prototype = {
		// default options
		options: {
			$transcriptVideo: undefined,
		},
		getPlayer: function() {
			return this.player;
		},
		setSrc: function(src) {
			var oldSrc = this.source;
			this.source = src;
			var ret = this.videoGadget.setSrc(src);
			if(oldSrc) URL.revokeObjectURL(this.source);
			return ret;
		},
		playbackRate: function (playbackRate) {
			return this.videoGadget.playbackRate(playbackRate);
		},
		processCanPlayElements: function($elems) {
			return this.videoGadget.processCanPlayElements($elems);
		},
		destroy: function() {
			this.$element.off(".transcriptPlayer");
		}
	};
	
	$.gadget("transcriptPlayer", transcriptPlayer);
	
})($);