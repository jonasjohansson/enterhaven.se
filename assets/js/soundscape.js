// Source type
const Source = {
  INTRO: 'INTRO',
};

// Source URLs
const sources = {
  [Source.INTRO]: {
    filename: 'ishotellet-intro-1.0-128k.mp3'
  },
  [Source.SCORE]: {
    filename: 'ishotellet-d-1.2-128k.mp3'
  },
};

// Audio context and nodes
let context
let volume

let hasStarted = false

/**
 * Returns the full URL to a source with a given filename
 */
function getSourceUrl(sourceFilename) {
  return `assets/audio/${sourceFilename}`;
}

/**
 * Fetches an audio source and returns an ArrayBuffer with
 * the audio data in it.
 */
async function fetchSource(url) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve(xhr.response);
      }
    };
    xhr.addEventListener('error', evt => reject(evt));
    xhr.send();
  });
}

/**
 * Decodes an ArrayBuffer of audio into an AudioBuffer.
 */
async function decodeAudio(audioData) {
  return new Promise((resolve, reject) => {
    context.decodeAudioData(audioData, resolve, reject);
  })
}

/**
 * Returns a looping AudioNode playing back a given AudioBuffer.
 */
function getLoopingAudioNode(audioBuffer) {
  const node = context.createBufferSource();
  node.buffer = audioBuffer;
  node.loop = true;
  return node;
}

async function fetchAudioNodeFromUrl(url) {
  const audioData = await fetchSource(url)
  const audioBuffer = await decodeAudio(audioData)
  const audioNode = getLoopingAudioNode(audioBuffer)
  return audioNode
}

function fadeTo(parameter, value, duration) {
  parameter.linearRampToValueAtTime(
    value,
    context.currentTime + duration / 1000
  )
}

async function setupAudioChain() {
  context = getAudioContext();

  volume = context.createGain();
  volume.gain.setValueAtTime(0, context.currentTime);
  volume.connect(context.destination);

  // Resume audio context on basically any user action.
  //
  // Doing this concurrently, to make sure the first one doesn't
  // "hijack" the user action that allows audio to play.
  await Promise.all([
    StartAudioContext(context),
    StartAudioContext(THREE.AudioContext.getContext())
  ]);
}

async function startIntro() {
  const introAudioData = await introFetchPromise
  const introAudioBuffer = await decodeAudio(introAudioData)
  const introNode = getLoopingAudioNode(introAudioBuffer)

  const introVolume = context.createGain()
  introVolume.gain.setValueAtTime(0, context.currentTime)
  introVolume.connect(context.destination)

  introNode.connect(introVolume)

  return {
    node: introNode,
    volume: introVolume,
  }
}

async function prepareFullScore() {
  const scoreNode = await fetchAudioNodeFromUrl(
    getSourceUrl(sources[Source.SCORE].filename)
  )

  const scoreVolume = context.createGain()
  scoreVolume.gain.setValueAtTime(0, context.currentTime)
  scoreVolume.connect(context.destination)

  scoreNode.connect(scoreVolume)

  return {
    node: scoreNode,
    volume: scoreVolume,
  }
}

/**
 *
 */
async function startSoundscape() {
  if (hasStarted === true) {
    return
  }

  try {
    hasStarted = true
    await setupAudioChain()

    const intro = await startIntro()

    intro.node.start()
    fadeTo(intro.volume.gain, 0.15, 5000)

    // Now fetch full score et al
    const score = await prepareFullScore()

    // Swap audio
    fadeTo(intro.volume.gain, 0, 10000)
    score.node.start()
    fadeTo(score.volume.gain, 0.2, 10000)

    setTimeout(() => intro.node.stop(), 11000)
  }
  catch (err) {
    console.log('An error occured while rocking soundscape:');
    console.log(err);
  }
}

// This little trick here is done to preload the audio whilst
// the context has not yet been set up. This way, when the user
// taps the enter button, audio will start playing more quickly.
let introFetchPromise = fetchSource(
  getSourceUrl(sources[Source.INTRO].filename)
)

window.startSoundscape = startSoundscape
