function enterHaven(timeOfDay) {
    console.log(timeOfDay);
    var $intro = document.querySelector('#intro');
    $intro.classList.add('fadeOut');
    // window.startSoundscape();
    var $audio = document.querySelector('audio');
    $audio.play();
}
