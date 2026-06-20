import { useEffect, useState } from "react";

export default function EndPage() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const updateLayout = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", updateLayout);

    return () => {
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  const goToWeddingSite = () => {
    window.location.href = "https://a2saywedo.com/";
  };

  const styles = {
    page: {
      minHeight: "100dvh",
      width: "100%",
      boxSizing: "border-box",
      background: "#F4EFEA",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflowX: "hidden",
      padding: isMobile ? "32px 18px" : "clamp(10px, 2vh, 20px) 20px",
    },
    content: {
      width: isMobile ? "min(100%, 420px)" : "min(100%, 860px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    invitation: {
      width: isMobile ? "min(92vw, 380px)" : "min(72vw, 760px)",
      maxHeight: isMobile ? "none" : "24vh",
      objectFit: "contain",
      display: "block",
    },
    button: {
      marginTop: isMobile ? 18 : "clamp(8px, 2vh, 18px)",
      padding: 0,
      border: 0,
      background: "transparent",
      cursor: "pointer",
    },
    weddingSite: {
      width: isMobile ? "min(84vw, 350px)" : "min(62vw, 680px)",
      maxHeight: isMobile ? "none" : "13vh",
      objectFit: "contain",
      display: "block",
    },
    endCredit: {
      width: isMobile ? "min(88vw, 380px)" : "min(64vw, 690px)",
      maxHeight: isMobile ? "none" : "60vh",
      objectFit: "contain",
      display: "block",
      marginTop: isMobile ? 22 : "clamp(8px, 2vh, 18px)",
    },
  };

  return (
    <main style={styles.page}>
      <div style={styles.content}>
        <img
          src="/end-scene/invitation.png"
          alt="Amie and Andrew cordially invite you to their wedding"
          style={styles.invitation}
        />

        <button
          type="button"
          onClick={goToWeddingSite}
          style={styles.button}
          aria-label="Open wedding site"
        >
          <img
            src="/end-scene/weddingsite.png"
            alt=""
            style={styles.weddingSite}
          />
        </button>

        <img
          src="/end-scene/endcredit.png"
          alt="Created with love by Amie"
          style={styles.endCredit}
        />
      </div>
    </main>
  );
}
