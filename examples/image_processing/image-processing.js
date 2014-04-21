/*
 * based on Say Cheese! from https://github.com/leemachin/say-cheese
 */

var CameraInterface = (function() {

  var CameraInterface;

  navigator.getUserMedia = navigator.getUserMedia ||
                            navigator.webkitGetUserMedia ||
                            navigator.mozGetUserMedia ||
                            navigator.msGetUserMedia ||
                            false;

  window.URL = window.URL || window.webkitURL;

  CameraInterface = function CameraInterface(element, options) {
    this.video = null,
    this.events = {},
    this.stream = null,
	this.timer = null,
	this.canvas = null,
	this.canvasContext = null,
    this.options = {
		video: {}
    };

    this.setOptions(options);
	if(element !== null) {
		this.element = document.querySelector(element);
	} else {
		this.element = null;
	}
    return this;
  };

  CameraInterface.prototype.on = function on(evt, handler) {
    if (this.events.hasOwnProperty(evt) === false) {
      this.events[evt] = [];
    }

    this.events[evt].push(handler)
  };

  CameraInterface.prototype.off = function off(evt, handler) {
    this.events[evt] = this.events[evt].filter(function(h) {
      return h !== handler;
    });
  };

  CameraInterface.prototype.trigger = function trigger(evt, data) {
    if (this.events.hasOwnProperty(evt) === false) {
      return false;
    }

    this.events[evt].forEach(function(handler) {
      handler.call(this, data);
    }.bind(this));
  };

  CameraInterface.prototype.setOptions = function setOptions(options) {
    for (var opt in options) {
      this.options[opt] = JSON.parse(JSON.stringify(options[opt]));
    }
  }

	CameraInterface.prototype.createVideo = function createVideo() {
		if(this.video === null) {
			this.video = document.createElement('video');
			if(this.element == null) {
				this.video.setAttribute("style", "display:none;");
			}
		}
	};
  
	CameraInterface.prototype.createCanvas = function() {
		if(this.canvas === null) {
			this.canvas = document.createElement('canvas');
			this.canvasContext = this.canvas.getContext('2d');
		}
	};

  /* Start up the stream, if possible */
  CameraInterface.prototype.start = function start() {

    // fail fast and softly if browser not supported
    if (navigator.getUserMedia === false) {
      this.trigger('error', 'NOT_SUPPORTED');
      return false;
    }

    var success = function success(stream) {
      this.stream = stream;
      this.createVideo();
	  this.createCanvas();

      this.video.src = URL.createObjectURL(stream);

      if(this.element !== null) {
		this.element.appendChild(this.video);
	  }

		this.video.play();
		// TODO: we should only call this function if a new image is available
		var This = this;

	  // start the timer when the video is ready
		this.video.addEventListener("canplay", function() {
			this.timer = setInterval(function() {
				var w = This.canvas.width = This.video.videoWidth;
				var h = This.canvas.height = This.video.videoHeight;
				This.canvasContext.drawImage(This.video, 0, 0, w, h);

				This.trigger('newImage', This.canvasContext.getImageData(0,0,w,h));
			}, 10);
		});
    }.bind(this);

    /* error is also called when someone denies access */
    var error = function error(error) {
      this.trigger('error', error);
    }.bind(this);

    return navigator.getUserMedia({ video: this.options.video }, success, error);
  };

  CameraInterface.prototype.stop = function stop() {
		clearInterval(this.timer);
		this.timer = null;
		this.stream.stop();

		if (window.URL && window.URL.revokeObjectURL) {
			window.URL.revokeObjectURL(this.video.src);
		}

		return this.trigger('stop');
  };

  return CameraInterface;

})();
