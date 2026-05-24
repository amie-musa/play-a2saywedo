import { useState } from "react";
import Game from "./Game";

import title from "./assets/title.PNG";
import heart from "./assets/heart.gif";
import instructions from "./assets/instructions.PNG";
import skipText from "./assets/skip.PNG";
import rsvpButton from "./assets/rsvp_button.PNG";
import playButton from "./assets/play_button.PNG";

export default function App() {
  const handleRSVP = () => {
    window.location.href = "https://a2saywedo.com";
  };

  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    setStarted(true);
  };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "#F4EFEA",
      overflowX: "hidden",
    },
    container: {
      minHeight: "100dvh",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#F4EFEA",
      padding: "0px",
      boxSizing: "border-box",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    titleRow: {
      width: "100%",
      justifyContent: "center",
      marginBottom: "8px",
    },
    title: {
      width: "120%",
      maxWidth: "750px",
    },
    heart: {
      width: "100%",
      maxWidth: "450px",
    },
    instructions: {
      width: "90%",
      maxWidth: "550px",
    },
    buttonRow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "24px",
      flexWrap: "wrap",
      width: "100%",
    },
    imageButton: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      transition: "transform 0.2s ease",
    },
    buttonImage: {
      width: "180px",
      maxWidth: "40vw",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.content}>
          <img src={title} alt="Title" style={styles.title} />
          <img src={heart} alt="Heart" style={styles.heart} />

          <img
            src={instructions}
            alt="Instructions"
            style={styles.instructions}
          />

          <div style={styles.buttonRow}>
            <button style={styles.imageButton} onClick={handleRSVP}>
              <img src={rsvpButton} alt="RSVP" style={styles.buttonImage} />
            </button>

            <button style={styles.imageButton} onClick={handlePlay}>
              <img src={playButton} alt="PLAY" style={styles.buttonImage} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}