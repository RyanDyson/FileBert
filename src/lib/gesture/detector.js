let video;
let handPose;
let hands = [];
let px = [];
let py = [];
let isFist = false;
let fistStartTime = 0;
let fistHeldFor075Second = false;
let roomIsOpen = false;
// check if no hand in prev frame
let wasHandAbsent = true; 
// check if hand entered as fist
let enteredAsFist = false; 

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  if (hands.length > 0) {
    let hand = hands[0];
    
    let wrist = hand.keypoints[0];
    let thumb = hand.keypoints[4];
    let index = hand.keypoints[8];
    let middle = hand.keypoints[12];
    let ring = hand.keypoints[16];
    let pinky = hand.keypoints[20];
    
    // MCP for relative size calculation
    let middle_mcp = hand.keypoints[9];

    let fingers = [thumb, index, middle, ring, pinky];

    noStroke();
    fill(255, 0, 0);

    for (let finger of fingers) {
        circle(finger.x, finger.y, 16);
    }

    // palm size (distance from wrist to middle finger knuckle)
    let palmSize = dist(wrist.x, wrist.y, middle_mcp.x, middle_mcp.y);

    // multiplier: 1.5x palm size usually covers curled fingers
    let fistThreshold = palmSize * 1.5;

    let fingersCurled = dist(wrist.x, wrist.y, index.x, index.y) < fistThreshold &&
                        dist(wrist.x, wrist.y, middle.x, middle.y) < fistThreshold &&
                        dist(wrist.x, wrist.y, ring.x, ring.y) < fistThreshold &&
                        dist(wrist.x, wrist.y, pinky.x, pinky.y) < fistThreshold;

    let fingersExpanded = dist(wrist.x, wrist.y, index.x, index.y) > fistThreshold &&
                          dist(wrist.x, wrist.y, middle.x, middle.y) > fistThreshold &&
                          dist(wrist.x, wrist.y, ring.x, ring.y) > fistThreshold &&
                          dist(wrist.x, wrist.y, pinky.x, pinky.y) > fistThreshold;

    // check thumbs up or down
    let thumb_mcp = hand.keypoints[2];
    let isThumbUp = false;
    let isThumbDown = false;

    if (fingersCurled) {
        // up
        if (thumb.y < thumb_mcp.y - (palmSize * 0.75)) { 
             isThumbUp = true;
        }
        // down
        else if (thumb.y > thumb_mcp.y + (palmSize * 0.75)) {
             isThumbDown = true;
        }
    }

    // fist is detected if fingers are curled and thumb is not extended
    let isFistCurrent = false;
    if (fingersCurled && !isThumbUp && !isThumbDown) {
        isFistCurrent = true;
    }

    // check if hand just entered the frame as a fist
    if (wasHandAbsent && isFistCurrent) {
      enteredAsFist = true;
    }

    // receive file detection
    // if hand entered as fist and now fingers are expanded -> receive file
    if (enteredAsFist && fingersExpanded) {
      document.getElementById("gesture-output").innerText = "Receive File";
      enteredAsFist = false; // reset so it doesn't trigger repeatedly
    }

    // two hand detection - check if both hands are present
    if (hands.length > 1) {
      let left_hand = hands[1];
      let right_index = index; // first hand's index finger
      let left_index = left_hand.keypoints[8]; // second hand's index finger

      fill(0, 255, 0); // green color for second hand
      circle(left_index.x, left_index.y, 16);

      // check distance between index fingers
      if (dist(left_index.x, left_index.y, right_index.x, right_index.y) < 50) {
        document.getElementById("gesture-output").innerText = "Close Room";
        roomIsOpen = false;
      }
    }

    // track fist timing (for other gestures)
    if (isFistCurrent && !isFist) {
      // fist just started (but not from entering the frame)
      if (!wasHandAbsent) {
        fistStartTime = millis();
        fistHeldFor075Second = false;
      }
    } else if (isFistCurrent && isFist) {
      // holding fist
      let fistDuration = millis() - fistStartTime;
      if (fistDuration >= 750 && !fistHeldFor075Second) {
        fistHeldFor075Second = true;
        document.getElementById("gesture-output").innerText = "Release to open room";
      }
    } else if (!isFistCurrent && isFist && !fistHeldFor075Second && !enteredAsFist) {
      // fist was released before 0.75 seconds -> open room gesture
      document.getElementById("gesture-output").innerText = "Open Room";
      roomIsOpen = true;
    }

    isFist = isFistCurrent;
    wasHandAbsent = false; // hand is now present

    if (isThumbUp) {
        document.getElementById("gesture-output").innerText = "Yes";
        fistHeldFor075Second = false;
        enteredAsFist = false;
    } else if (isThumbDown) {
        document.getElementById("gesture-output").innerText = "No";
        fistHeldFor075Second = false;
        enteredAsFist = false;
    }
  } else {
    // all five points are gone
    if (isFist && fistHeldFor075Second) {
      // fist was held for at least 0.75 seconds, then all hand points disappeared -> send file
      document.getElementById("gesture-output").innerText = "Send File";
      fistHeldFor075Second = false;
    }
    
    // reset states
    isFist = false;
    fistStartTime = 0;
    wasHandAbsent = true;
    enteredAsFist = false;
  }
}