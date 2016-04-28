export default class Chromecast {

	constructor() {
		/**
		 * const
		 */

		this.CAST_API_INITIALIZATION_DELAY = 1000;
		this.PROGRESS_BAR_UPDATE_DELAY = 1000;
		this.SESSION_IDLE_TIMEOUT = 300000;
		this.MEDIA_SOURCE_ROOT = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/';
		this.CAST_ICON_THUMB_ACTIVE = 'images/cast_icon_active.png';
		this.CAST_ICON_THUMB_IDLE = 'images/cast_icon_idle.png';
		this.CAST_ICON_THUMB_WARNING = 'images/cast_icon_warning.png';

		/**
		 * variables
		 */
		this.appActive = false;
		this.currentMediaSession = null;
		this.currentVolume = 0.5;
		this.progressFlag = 1;
		this.mediaCurrentTime = 0;
		this.session = null;
		this.storedSession = null;
		this.mediaURLs = [
		    'http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4',
		    'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4',
		    'http://commondatastorage.googleapis.com/gtv-videos-bucket/tears_of_steel_1080p.mov',
		    'http://commondatastorage.googleapis.com/gtv-videos-bucket/reel_2012_1280x720.mp4',
		    'http://commondatastorage.googleapis.com/gtv-videos-bucket/Google%20IO%202011%2045%20Min%20Walk%20Out.mp3'];
		this.mediaTitles = [
		    'Big Buck Bunny',
		    'Elephant Dream',
		    'Tears of Steel',
		    'Reel 2012',
		    'Google I/O 2011 Audio'];

		this.mediaThumbs = [
		    'images/BigBuckBunny.jpg',
		    'images/ElephantsDream.jpg',
		    'images/TearsOfSteel.jpg',
		    'images/reel.jpg',
		    'images/google-io-2011.jpg'];
		this.currentMediaURL = this.mediaURLs[0];
		this.currentMediaTitle = this.mediaTitles[0];
		this.currentMediaThumb = this.mediaThumbs[0];

		this.timer = null;
	}

	initializeCastApi() {
		//console.log("*****chromecast plugin available");
		var applicationIDs = [
			'BF8B25A4',
			'5EDA7289',
			chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
	    ];


		// auto join policy can be one of the following three
		// 1) no auto join
		// 2) same appID, same URL, same tab
		// 3) same appID and same origin URL
		var autoJoinPolicyArray = [
		  chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
		  chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
		  chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
		];

		var sessionRequest = new chrome.cast.SessionRequest(applicationIDs[0]);
		var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
		this.sessionListener,
		this.receiverListener,
	    autoJoinPolicyArray[1]);

		chrome.cast.initialize(apiConfig, this.onInitSuccess.bind(this), this.onError.bind(this));
	}

	onInitSuccess() {
		console.log('*****init success');

		// check if a session ID is saved into localStorage
		this.storedSession = JSON.parse(window.localStorage.getItem('storedSession'));
		if (this.storedSession) {
			var dateString = this.storedSession.timestamp;
			var now = new Date().getTime();

			if (now - dateString < SESSION_IDLE_TIMEOUT) {
				document.getElementById('joinsessionbyid').style.display = 'block';
			}
		}
	}

	onError(e) {
		console.log('Error', e);
	}

	sessionListener(e) {
		console.log('New session ID: ' + e.sessionId);
		this.session = e;
		//document.getElementById('casticon').src = CAST_ICON_THUMB_ACTIVE;
		if (this.session.media.length != 0) {
			console.log('Found ' + this.session.media.length + ' existing media sessions.');
			this.onMediaDiscovered('sessionListener', this.session.media[0]);
		}
		this.session.addMediaListener(this.onMediaDiscovered.bind(this, 'addMediaListener'));
		this.session.addUpdateListener(sessionUpdateListener.bind(this));
		// disable join by session id when auto join already
		if (this.storedSession) {
			document.getElementById('joinsessionbyid').style.display = 'none';
		}
	}

	receiverListener(e) {
		if (e === 'available') {
			console.log('*****receiver found');
		} else {
			console.log('*****receiver list empty');
		}
	}

	sessionUpdateListener(isAlive) {
		console.log("sessionUpdateListener()");
		if (!isAlive) {
			this.session = null;
			document.getElementById('casticon').src = this.CAST_ICON_THUMB_IDLE;
			// var playpauseresume = document.getElementById('playpauseresume');
			// playpauseresume.innerHTML = 'Play';
			if (this.timer) {
				clearInterval(this.timer);
			} else {
				// this.timer = setInterval(this.updateCurrentTime.bind(this), this.PROGRESS_BAR_UPDATE_DELAY);
				// playpauseresume.innerHTML = 'Pause';
			}
		}
	}

	sendMessage(Msg) {
		var namespace = "urn:x-cast:com.adamriggs";
		console.log(Msg);
		if(this.appActive){
			this.session.sendMessage(namespace, Msg, this.onSendMessageSuccess.bind(this), this.onSendMessageFailure.bind(this));
		}
	}

	onSendMessageSuccess(event) {
		//console.log("onSendMessageSuccess()");
		//console.log("event: ", event);
	}

	onSendMessageFailure(event) {
		//console.log("onSendMessageFailure()");
		//console.log("event: ", event);
	}

	toggleApp() {
		//console.log(session.status);
		if(!this.session || this.session.status!="connected") {
			this.launchApp();
		} else {
			this.stopApp();
		}
	}

	launchApp() {
		console.log('launching app...');
		this.appActive = true;
		chrome.cast.requestSession(this.onRequestSessionSuccess.bind(this), this.onLaunchError.bind(this));
		// if (timer) {
		//   clearInterval(timer);
		// }
	}

	onRequestSessionSuccess(e) {
		console.log('session success: ' + e.sessionId);
		// saveSessionID(e.sessionId);
		this.session = e;
		document.getElementById('casticon').src = this.CAST_ICON_THUMB_ACTIVE;
		this.session.addUpdateListener(this.sessionUpdateListener.bind(this));
		if (this.session.media.length != 0) {
			this.onMediaDiscovered('onRequestSession', session.media[0]);
		}
		this.session.addMediaListener(
		this.onMediaDiscovered.bind(this, 'addMediaListener'));

		//loadMedia(currentMediaURL);
	}

	onLaunchError() {
		console.log('launch error');
	}

	stopApp() {
		this.appActive = false;
		this.session.stop(this.onStopAppSuccess.bind(this), this.onError.bind(this));
	}

	onStopAppSuccess() {
		console.log('Session stopped');
		//document.getElementById('casticon').src = CAST_ICON_THUMB_IDLE;
	}

	loadMedia(mediaURL) {
		if (!session) {
			console.log('no session');
			return;
		}

		if (mediaURL) {
			var mediaInfo = new chrome.cast.media.MediaInfo(mediaURL);
			currentMediaTitle = 'custom title needed';
			currentMediaThumb = 'images/video_icon.png';
			//document.getElementById('thumb').src = MEDIA_SOURCE_ROOT + currentMediaThumb;
		} else {
			console.log('loading...' + currentMediaURL);
			var mediaInfo = new chrome.cast.media.MediaInfo(currentMediaURL);
		}

		mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
		mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
		mediaInfo.contentType = 'video/mp4';

		mediaInfo.metadata.title = currentMediaTitle;
		mediaInfo.metadata.images = [{'url': MEDIA_SOURCE_ROOT + currentMediaThumb}];

		var request = new chrome.cast.media.LoadRequest(mediaInfo);
		request.autoplay = true;
		request.currentTime = 0;

		session.loadMedia(request,
			onMediaDiscovered.bind(this, 'loadMedia'),
			onMediaError);

	}

	onMediaDiscovered(how, mediaSession) {
		console.log('new media session ID:' + mediaSession.mediaSessionId);
		currentMediaSession = mediaSession;
		currentMediaSession.addUpdateListener(onMediaStatusUpdate);
		mediaCurrentTime = currentMediaSession.currentTime;
		//playpauseresume.innerHTML = 'Play';

		document.getElementById('casticon').src = CAST_ICON_THUMB_ACTIVE;
		document.getElementById('playerstate').innerHTML = currentMediaSession.playerState;

		if (!timer) {
			// timer = setInterval(updateCurrentTime.bind(this), PROGRESS_BAR_UPDATE_DELAY);
			// playpauseresume.innerHTML = 'Pause';
		}
	}

	onMediaError(e) {
		console.log('media error');
		document.getElementById('casticon').src = CAST_ICON_THUMB_WARNING;
	}

	onMediaStatusUpdate(isAlive) {
		if (!isAlive) {
			currentMediaTime = 0;
		} else {
			if (currentMediaSession.playerState == 'PLAYING') {
				if (progressFlag) {
					document.getElementById('progress').value = parseInt(100 * currentMediaSession.currentTime / currentMediaSession.media.duration);
					document.getElementById('progress_tick').innerHTML = currentMediaSession.currentTime;
					document.getElementById('duration').innerHTML = currentMediaSession.media.duration;
					progressFlag = 0;
				}
			  document.getElementById('playpauseresume').innerHTML = 'Pause';
			}
		}
		document.getElementById('playerstate').innerHTML = currentMediaSession.playerState;
	}

}