import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./VideoCall.css";
import { useNavigate } from "react-router-dom";
import AC from "agora-chat";

let channelParameters = {
  localAudioTrack: null,
  localVideoTrack: null,
  screenVideoTrack: null,
  screenAudioTrack: null,
  localUserName: " ",
  localUserUid: null,
  remoteUsers: [],
  channelName: "",
  channelToken: "",
};

let cloudRecordParameters = {
  resourceId: "",
  sessionId: "",
  recordedFileName: null,
  uid:""
};

const agoraEngine = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let options = {
  appId: "b8e5a7e1a8524c3999359b0d30bee2bb",
  channel: "",
  uid: 0,
  appKey: "61501494#948832",
};

const chatConnection = new AC.connection({
  appKey: options.appKey,
});


const generateRtcToken = (channelName, rtcUid) => {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  return fetch(
    `http://localhost:3030/rtc/${channelName}/publisher/uid/${rtcUid}/?expiry=36000`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      return result;
    })
    .catch((error) => console.log("error", error));
};

const join = async (pa) => {

 
  var min = 100;
  var max = 1000;
  var uid = Math.floor(Math.random() * (max - min + 1)) + min;
  channelParameters.localUserUid = uid;
  channelParameters.channelName = pa.state.roomName;

  const rtcToken = JSON.parse(
    await generateRtcToken(pa.state.roomName, uid)
  ).rtcToken;

  channelParameters.channelToken = rtcToken;
  console.log("rtcToken" + rtcToken);

  await agoraEngine.join(options.appId, pa.state.roomName, rtcToken, uid);

  const promiseChat = new Promise((resolve, reject) => {
    chatConnection.open({
      user: channelParameters.localUserName,
      pwd: channelParameters.localUserName,
    });
  });

  promiseChat
    .then(() => {
      console.log("Chat login success");
    })
    .catch((err) => {
      console.log("Chat login failed " + err);
    });

  chatConnection.addEventHandler("connection&message", {
    onConnected: () => {
      console.log("Chat Connection success !");
    },
    onDisconnected: () => {
      console.log("Logout success !");
    },
    onTextMessage: (message) => {
      console.log(message);
      const fromAddress = message.from;
      const chatMsg = message.msg;
      console.log(fromAddress);
      console.log(chatMsg);

      const containerDiv = document.createElement("div");
      containerDiv.className = "container";

      const pDiv = document.createElement("p");
      pDiv.textContent = fromAddress;
      pDiv.className = "sender";

      containerDiv.appendChild(pDiv);

      const pMsgDiv = document.createElement("p");
      pMsgDiv.textContent = message.msg;
      pMsgDiv.className = "message";

      containerDiv.appendChild(pMsgDiv);

      const spanDiv = document.createElement("span");
      spanDiv.className = "timeStamp";

      const date = new Date();
      const time = date.toTimeString().split(" ")[0].split(":");
      spanDiv.textContent = time[0] + ":" + time[1];

      // containerDiv.appendChild(spanDiv);

      const chatWindowDiv = document.getElementById("chatWindow");
      chatWindowDiv.appendChild(containerDiv);
    },
  });

  channelParameters.localAudioTrack =
    await AgoraRTC.createMicrophoneAudioTrack();
  channelParameters.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  if (pa.state.isCameraEnabled) {
    const img = document.getElementById("camera");
    img.src = "./../../on-camera.png";
    const localDiv = document.getElementById("localVideo");
    channelParameters.localVideoTrack?.play(localDiv);
    await agoraEngine.publish([channelParameters.localVideoTrack]);
  }

  if (pa.state.isMicrophoneEnabled) {
    await agoraEngine.publish([channelParameters.localAudioTrack]);
    const img = document.getElementById("muteAudio");
    img.src = "./../../audio.png";
  }
};

function VideoCall() {
  const navigate = useNavigate();
  
  useEffect(() => {
    window.onbeforeunload = function () {
      navigate("/");
    };
  });

  const userPublished = async (user, mediaType) => {
  const id = user.uid;
  channelParameters.remoteUsers[id] = user;
  await agoraEngine.subscribe(user, mediaType);

  console.log("published");

  if (mediaType === "video") {
    const remoteDiv = document.createElement("div");
    remoteDiv.id = `remoteVideo-${id}`;
    remoteDiv.className = "videoFrames";
    const remoteUsersDiv = document.getElementById("remoteUsers");
    remoteUsersDiv.prepend(remoteDiv);

    user.videoTrack.play(`remoteVideo-${id}`);
  }
  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

const userUnPublished = (user, mediaType) => {
  if (mediaType === "video") {
    const id = user.uid;
    delete channelParameters.remoteUsers[id];
  }
};

  const locationParameters = useLocation();
  channelParameters.localUserName = locationParameters.state.userName;
  agoraEngine.on("user-unpublished", userUnPublished);
  agoraEngine.on("user-published", userPublished);

  join(locationParameters);

  
  const muteAudio = async () => {
    const img = document.getElementById("muteAudio");
    if (img.src.indexOf("no") !== -1) {
      img.src = "./../../audio.png";
      await channelParameters.localAudioTrack?.setMuted(false);
      await agoraEngine.publish([channelParameters.localAudioTrack]);
    } else {
      img.src = "./../../no-audio.png";
      await channelParameters.localAudioTrack?.setMuted(true);
    }
  };

  const acquireResource = async (channelName, recordUid) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Accept", "application/json");

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "http://localhost:3030/acquire?channelName=" +
        channelName +
        "&recordUid=" +
        recordUid,
        requestOptions
      );
      const result_1 = await response.text();
      return result_1;
    } catch (error) {
      return console.log("error", error);
    }
  };

  const startRecording = async (channelName, recordUid) => {
    const recordUidToken = JSON.parse(
      await generateRtcToken(channelName, recordUid)
    ).rtcToken;

    var request = {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({
        recorderToken: recordUidToken,
        resourceId: cloudRecordParameters.resourceId
      }),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await fetch(
        "http://localhost:3030/start?channelName=" +
        channelName +
        "&recordUid=" +
        recordUid,
        request
      );
      const result_1 = await res.text();
      document.getElementById("Record").title = "Recording";
      return result_1;
    } catch (error) {
      return console.log("error", error);
    }
      
  };

  const stopRecording = async (channelName, recordUid) => {
    var request = {
      method: "POST",
      redirect: "follow",
      body: JSON.stringify({
        sessionId: cloudRecordParameters.sessionId,
        resourceId: cloudRecordParameters.resourceId
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      const res = await fetch("http://localhost:3030/stop?channelName=" + channelName + "&recordUid=" + recordUid, request);
      const result_1 = await res.text();
      document.getElementById("Record").title = "Record";
      return result_1;
    } catch (error) {
      return console.log("error", error);
    }
  };

  const cloudRecord = async () => {
    const channelName = channelParameters.channelName;

    if (document.getElementById("Record").title === "Record") {
      var min = 100;
      var max = 500;
      cloudRecordParameters.uid = Math.floor(Math.random() * (max - min + 1)) + min;
      
      cloudRecordParameters.resourceId = JSON.parse(
        await acquireResource(channelName, cloudRecordParameters.uid)
      ).resourceId;

       cloudRecordParameters.sessionId = JSON.parse(await startRecording(channelName, cloudRecordParameters.uid)).sessionId;
    }
    else {
      cloudRecordParameters.recordedFileName = await stopRecording(channelName, cloudRecordParameters.uid);
      console.log(cloudRecordParameters.recordedFileName)
    }
  }


  const muteCamera = async () => {
    const img = document.getElementById("camera");

    if (img.src.indexOf("no") !== -1) {
      if (
        channelParameters.screenVideoTrack !== null &&
        channelParameters.screenVideoTrack.isPlaying === true
      ) {
        await agoraEngine.unpublish([channelParameters.screenVideoTrack]);
        channelParameters.screenVideoTrack &&
          channelParameters.screenVideoTrack.close();
        channelParameters.screenAudioTrack &&
          channelParameters.screenAudioTrack.close();

        const localDiv = document.getElementById("localVideo");
        if (localDiv.hasChildNodes()) {
          localDiv.removeChild(localDiv.children[0]);
        }
      }
      await channelParameters.localVideoTrack?.setEnabled(true);
      await agoraEngine.publish([channelParameters.localVideoTrack]);
      img.src = "./../../on-camera.png";
      const localDiv = document.getElementById("localVideo");
      channelParameters.localVideoTrack?.play(localDiv);
    } else {
      img.src = "./../../no-camera.png";
      const localDiv = document.getElementById("localVideo");
      if (localDiv.hasChildNodes()) {
        localDiv.removeChild(localDiv.children[0]);
      }
      await agoraEngine.unpublish([channelParameters.localVideoTrack]);
      await channelParameters.localVideoTrack?.setEnabled(false);
    }
  };

  const screenShare = async () => {
    if (
      channelParameters.screenVideoTrack !== null &&
      channelParameters.screenVideoTrack.isPlaying === true
    ) {
      await agoraEngine.unpublish([channelParameters.screenVideoTrack]);
      channelParameters.screenVideoTrack &&
        channelParameters.screenVideoTrack.close();
      channelParameters.screenAudioTrack &&
        channelParameters.screenAudioTrack.close();
      channelParameters.localAudioTrack &&
        channelParameters.localAudioTrack.close();
    } else {
      const localDiv = document.getElementById("localVideo");
      if (
        localDiv.hasChildNodes() &&
        channelParameters.localVideoTrack.enabled
      ) {
        localDiv.removeChild(localDiv.children[0]);
        await agoraEngine.unpublish([channelParameters.localVideoTrack]);
        const img = document.getElementById("camera");
        img.src = "./../../no-camera.png";
      }

      const screenShareTrack = await AgoraRTC.createScreenVideoTrack(
        {
          encoderConfig: "1080p_1",
        },
        "auto"
      );

      if (screenShareTrack instanceof Array) {
        channelParameters.screenVideoTrack = screenShareTrack[0];
        channelParameters.screenAudioTrack = screenShareTrack[1];
      } else {
        channelParameters.screenVideoTrack = screenShareTrack;
      }

      channelParameters.screenVideoTrack.on("track-ended", async () => {
        await agoraEngine.unpublish([channelParameters.screenVideoTrack]);
        channelParameters.screenVideoTrack &&
          channelParameters.screenVideoTrack.close();
        channelParameters.screenAudioTrack &&
          channelParameters.screenAudioTrack.close();
        channelParameters.localAudioTrack &&
          channelParameters.localAudioTrack.close();
      });

      if (channelParameters.screenAudioTrack == null) {
        await agoraEngine.publish([
          channelParameters.screenVideoTrack
        ]);
      } else {
        await agoraEngine.publish([
          channelParameters.screenVideoTrack,
        ]);
      }
      channelParameters.screenVideoTrack.play("localVideo");
    }
  };

  const fetchGroupUsers = () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    return fetch("http://localhost:3030/fetchUsers", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        return result;
      })
      .catch((error) => console.log("error", error));
  };

  const sendMessage = async () => {
    //fetch group users
    const groupInfo = await fetchGroupUsers();
    const members = JSON.parse(groupInfo).json.data;

    let peerMessage = document.getElementById("messageInput").value.toString();

    members.forEach((member) => {
      let option = {
        chatType: "singleChat",
        type: "txt",
        to: member.member,
        msg: peerMessage,
      };

      let msg = AC.message.create(option);
      chatConnection
        .send(msg)
        .then((res) => {
          console.log("Send private text success");
        })
        .catch(() => {
          console.log("send message failed");
        });
    });

    const containerDiv = document.createElement("div");
    containerDiv.className = "container darker";

    const pDiv = document.createElement("p");
    pDiv.textContent = peerMessage;

    containerDiv.appendChild(pDiv);

    const spanDiv = document.createElement("span");
    spanDiv.className = "darkerTimeStamp";

    const date = new Date();
    const time = date.toTimeString().split(" ")[0].split(":");
    spanDiv.textContent = time[0] + ":" + time[1];

    // containerDiv.appendChild(spanDiv);

    const chatWindowDiv = document.getElementById("chatWindow");
    chatWindowDiv.appendChild(containerDiv);
  };

  const leave = async () => {

    channelParameters.localVideoTrack?.close();
    channelParameters.screenVideoTrack?.close();
    channelParameters.screenAudioTrack?.close();
    channelParameters.localAudioTrack?.close();
    chatConnection.close();
    await agoraEngine.leave();
    navigate("/");
  };

  return (
    <>
      <div>
        <div class="wrapper">
          <div id="header">Room Name : {locationParameters.state.roomName}</div>
          <div class="row">
            <div class="remoteVideo" id="remoteUsers">
              <div class="videoFrames" />
              <div class="videoFrames" />
              <div class="videoFrames" />
            </div>
            <div class="localVideo" id="localVideo"></div>
            <h3 class="chattitle">Chat</h3>
            <div class="chatWindow" id="chatWindow"></div>
          </div>
        </div>
        <div class="footer">
          <div class="row">
            <div class="column first">
              <button class="button" title="Microphone" onClick={muteAudio}>
                <img
                  id="muteAudio"
                  class="muteimg"
                  alt="nocamera"
                  src="./../../no-audio.png"
                ></img>
              </button>
              <button class="button" title="Camera" onClick={muteCamera}>
                <img
                  id="camera"
                  class="nocameraimg"
                  alt="nocamera"
                  src="./../../no-camera.png"
                ></img>
              </button>
              <button class="button" title="Screen Share" onClick={screenShare}>
                <img
                  class="muteimg"
                  alt="nocamera"
                  src="./../../screenshare.png"
                ></img>
              </button>
              <button
                id="Record"
                class="button"
                title="Record"
                onClick={cloudRecord}
              >
                <img
                  id="upload"
                  class="muteimg"
                  alt="upload"
                  src="./../../upload.png"
                ></img>
              </button>
              <button
                class="button disconnect"
                title="End Call"
                onClick={leave}
              >
                <img
                  class="muteimg"
                  alt="nocamera"
                  src="./../../endcall.png"
                ></img>
              </button>
            </div>
            <div class="column second">
              <div class="flexContainer">
                <input type="text" class="inputField" id="messageInput" />
                <button type="submit" class="submit" onClick={sendMessage}>
                  <i class="fa fa-paper-plane" aria-hidden="true"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

};
export default VideoCall;