const socket = io();
const peer = new Peer();
let currentPeerId = null;
let otherUser = null;
let connection = null;
let connectionValid = false;
let playAsWhite = true;