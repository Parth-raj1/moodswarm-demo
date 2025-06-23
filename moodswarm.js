document.getElementById("start").addEventListener("click", async () => {
  try {
    // Reset UI
    document.getElementById("result").className = "safe";
    document.getElementById("result").textContent = "LISTENING...";
    document.getElementById("instruction").textContent = "Speak a scam phrase (e.g. 'Send money now!')";
    
    // Access microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);
    
    let scamDetected = false;
    let sampleCount = 0;

    processor.onaudioprocess = (event) => {
      const data = event.inputBuffer.getChannelData(0);
      
      // 1. Calculate intensity (volume)
      const intensity = calculateIntensity(data);
      
      // 2. Calculate pitch
      const pitch = detectPitch(data, audioContext.sampleRate);
      
      // 3. Mood Swarm valence formula
      const valence = calculateValence(pitch, intensity);
      
      // 4. Scam detection logic
      if (valence < -0.8 && intensity > 0.1) {
        scamDetected = true;
        document.getElementById("result").textContent = "SCAM! 🚨";
        document.getElementById("result").className = "scam";
        document.getElementById("instruction").textContent = "High threat detected!";
      }
      
      // Stop after 5 seconds of listening
      if (sampleCount++ > 50 && !scamDetected) {
        cleanup();
        document.getElementById("result").textContent = "SAFE";
        document.getElementById("instruction").textContent = "No threats detected";
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
    
    // Cleanup function
    const cleanup = () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach(track => track.stop());
    };
    
  } catch (err) {
    document.getElementById("result").textContent = "ERROR";
    document.getElementById("instruction").textContent = "Please allow microphone access";
  }
});

// Mood Swarm Core Calculations
function calculateValence(pitch, intensity) {
  // Tuned weights based on scam voice patterns
  const PITCH_WEIGHT = -0.7;
  const INTENSITY_WEIGHT = -0.3;
  const BASE_VALENCE = 0.2;
  
  // Normalize inputs
  const normPitch = Math.min(1, pitch / 800); 
  const normIntensity = Math.min(1, intensity * 10);
  
  return BASE_VALENCE + 
         (PITCH_WEIGHT * normPitch) + 
         (INTENSITY_WEIGHT * normIntensity);
}

function calculateIntensity(data) {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.abs(data[i]);
  }
  return sum / data.length;
}

function detectPitch(data, sampleRate) {
  // Autocorrelation pitch detection
  const buf = new Float32Array(data.length);
  const autocorr = new Float32Array(data.length);
  
  // Copy and normalize data
  let max = 0.01;
  for (let i = 0; i < data.length; i++) {
    buf[i] = data[i];
    if (Math.abs(data[i]) > max) max = Math.abs(data[i]);
  }
  for (let i = 0; i < data.length; i++) buf[i] /= max;
  
  // Autocorrelation
  for (let lag = 0; lag < data.length; lag++) {
    let sum = 0;
    for (let i = 0; i < data.length - lag; i++) {
      sum += buf[i] * buf[i + lag];
    }
    autocorr[lag] = sum;
  }
  
  // Find first peak
  let peakIndex = 10; // Skip first samples
  for (let i = 10; i < autocorr.length - 1; i++) {
    if (autocorr[i] > autocorr[i - 1] && autocorr[i] > autocorr[i + 1]) {
      peakIndex = i;
      break;
    }
  }
  
  return sampleRate / peakIndex;
}