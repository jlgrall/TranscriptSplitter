(function($, undefined) {
"use strict";
	
	var videosExtensions = ["webm", "mp4", "ogv", "avi", "m4v", "mov"],
		subExtensions = ["vtt"],
		parseSource = function(source) {
			// TODO: use http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript/12900504#12900504
			var dot = source.lastIndexOf("."),
				pathName = dot === -1 ? source : source.substring(0, dot),
				ext = dot === -1 ? "" : source.substring(0, dot),
				tracks = [];
			
			//tracks.push(pathName + "vtt");
			
			return {
				source: source,
				pathName: pathName,
				ext: ext,
				tracks: tracks,
			};
		},
		generateVideoInnerTags = function(source) {
			var elems = [];
			source.tracks.forEach(function(track) {
				elems.push($('<track />', {src: track, kind: "captions"}));
			});
			return elems;
		};
	
	
	var transcriptVideo = function($video, options) {
			
			// Get the Options
			options = this.options = $.extend({}, transcriptVideo.prototype.options, options);
			
			this.$video = $video;
			this.video = $video[0];
			var player = this.player = this.video;
			
			this.src = undefined;
			this.source = undefined;
			
			var self = this;
			
		};
	
	transcriptVideo.prototype = {
		// default options
		options: {
		},
		setSrc: function(src) {
			this.src = src;
			this.source = parseSource(src);
			this.video.src = this.source.source;
			this.$video.empty().prepend(generateVideoInnerTags(this.source));
			this.player.load();
		},
		playbackRate: function (playbackRate) {
			if(playbackRate != undefined) {
				playbackRate = parseFloat(playbackRate);
				if(playbackRate != this.player.playbackRate) {
					this.player.playbackRate = playbackRate;
					this.$video.trigger("playbackRateChanged", {playbackRate: playbackRate});
				}
			}
			else return this.player.playbackRate;
		},
		processCanPlayElements: function($elems) {
			var player = this.player;
			
			$elems.each(function(i, elem) {
				var $elem = $(elem),
					res = player.canPlayType($elem.data("type"));
					
				$elem.removeClass("canPlayProbably canPlayMaybe canPlayNo");
				
				if(res === "probably") $elem.addClass("canPlayProbably");
				else if(res === "maybe") $elem.addClass("canPlayMaybe");
				else if(res === "") $elem.addClass("canPlayNo");
			})
		},
		destroy: function() {
			this.$video.off(".transcriptVideo");
		}
	};
	
	$.gadget("transcriptVideo", transcriptVideo);
	
})($);