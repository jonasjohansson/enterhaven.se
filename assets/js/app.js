var $intro, $audio;
var $playBtn;

window.onload = () => {
	document.body.classList.remove('loading');
	$playBtn = document.querySelector('button');
	$playBtn.addEventListener('click', playAudio);
	let now = new Date();
	let h = now.getHours();
	if (h >= 16 || h <= 6) document.documentElement.className = 'night';
};

function playAudio() {
	$intro = document.querySelector('#intro');
	$audio = document.querySelector('audio');
	$playBtn.classList.add('fadeOut');
	$playBtn.setAttribute('disabled', true);
	$audio.play();
}
