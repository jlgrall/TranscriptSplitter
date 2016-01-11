Transcript Splitter
===================

Online webapp to transcribe videos. Makes it easy to subtitle or write captions for your videos.

You can drag a video from your computer to the webapp, and start writing your transcript. Keyboard shortcuts allows you to pause and skip back (rewind). When you are finished, just save your transcript.

**Splitter mode:** use this mode to visually cut the lines at a maximum line width.

**Compatibility:** recent browsers and IE10+. (Older browsers may have a degraded experience)

It works locally, no data is sent online.

**Try: [Transcript Splitter online](http://jlgrall.github.io/TranscriptSplitter/transcriptsplitter.html)**

Published under the free MIT license.

Splitter mode code is inspired by [JQuery Lined TextArea plugin](http://alan.blog-city.com/jquerylinedtextarea.htm)


## Features:

- Drag and drop videos and transcript files from your computer.
- Shows you what video formats are supported by your browser.
- Adjust playback speed.
- Shortcuts: play/pause, skip back, insert bold, italic and underline tags, ..., and still use your operating system's text editing shortcuts.
- Keeps your current progress in your browser's LocalStorage, preventing unexpected loss of your work. (Though some browsers clear the LocalStorage at the end of the session)
- No internet connection needed. Videos and transcript files are loaded locally, no data is sent on the network.

**Splitter mode:**

- Shows line length in front of every line and cursor position in current line.
- Visually see the maximum allowed width (with monospaced font only).
- Switch: monospaced or proportional font.
- Automatically add/remove spaces when splitting/combining lines.


## Use cases:

- Writing a transcription of a video in a distraction-free interface with direct control of the video via easy shortcuts.
- When correcting a transcript, double-click the inserted timestamps to go to the relevant parts of the video.

**Splitter mode:**

- Before using [YouTube's transcribe and automatic timing](https://support.google.com/youtube/answer/2734796#transcribe), you want to split the lines according to the [recommended format](https://support.google.com/youtube/answer/2734799). Transcript Splitter will save you time.
- Fix the line length of a SubRip (.srt), a WebVTT (.vtt) or other files by hand with visual assistance.