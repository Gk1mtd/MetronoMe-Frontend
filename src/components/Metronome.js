import React from "react";

/**
 * Implements an Metronome
 * enables click sounds, via sound synth/oscilator
 * makes BPM value hearable
 *
 * start with audioContext.resume()
 * stop with  audioContext.suspend()
 */
function Metronome({ bpm }) {
  const [userInputBpmState, setUserInputBpmState] = React.useState(bpm);

  /** +++++++++++++++++++++++++
   * source: https://blog.paul.cx/post/metronome/
   *  */

  // UTILITY FUNCTIONS

  /** returns always a the tempo you give, if its between min and max
   * to be save from outrageous numbers from user like 2000 or 5 as bpm
   */
  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }
  function clampTempo(t) {
    return clamp(t, 30, 300);
  }
  // +++++++++++++++++++++++++
  /** takes input from user and makes sure it is an integer and between min and max tempo values */
  function getTempo() {
    return clampTempo(parseInt(userInputBpmState));
  }

  // METRONOME CORE

  /**First we need to set an AudioContext to be able to use the Web Audio API */

  /** genereal setup */

  let audioContext = new AudioContext();
  /** creates audiobuffer in the right size */
  let audioBuffer = audioContext.createBuffer(
    1,
    audioContext.sampleRate * 2,
    audioContext.sampleRate
  );
  /** get channel: Mono? */
  let channel = audioBuffer.getChannelData(0);

  // Synthesize Sound/Click
  let phase = 0;
  let amp = 1;
  let durationOfSound = audioContext.sampleRate / 50;
  let frequency = 440;

  for (let i = 0; i < durationOfSound; i++) {
    channel[i] = Math.sin(phase) * amp;
    phase += (2 * Math.PI * frequency) / audioContext.sampleRate;
    if (phase > 2 * Math.PI) {
      phase -= 2 * Math.PI;
    }
    amp -= 1 / durationOfSound;
  }

  let audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.loop = true;
  audioSource.loopEnd = 1 / (getTempo() / 60);

  // connect source with context
  audioSource.connect(audioContext.destination);
  audioSource.start(0);
  audioContext.suspend();

  // audioContext.resume = start
  // audioContext.suspend = stop
  const [toggle, setToggle] = React.useState(false);

  async function unMount() {
    console.log("unmount");
    if (audioContext.state === "running") {
      await audioContext.suspend();
    } else if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  }

  React.useEffect(() => {
    return () => {
      unMount();
    };
  }, []);

  return (
    <div>
      <button
        onClick={async function () {
          if (audioContext.state === "running") {
            await audioContext.suspend();
          } else if (audioContext.state === "suspended") {
            await audioContext.resume();
          }
        }}
      >
        {audioContext.state === "running" ? "◼" : "▶"}
      </button>
    </div>
  );
}

export default Metronome;
