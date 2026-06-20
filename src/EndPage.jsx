export default function EndPage() {
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
      justifyContent: "center",
      overflowX: "hidden",
      padding: "clamp(8px, 5vh, 64px) 20px 32px",
    },
    content: {
      width: "min(100%, 1000px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    invitation: {
      width: "min(92vw, 860px)",
      display: "block",
    },
    button: {
      marginTop: "clamp(6px, 3vh, 36px)",
      padding: 0,
      border: 0,
      background: "transparent",
      cursor: "pointer",
    },
    weddingSite: {
      width: "min(82vw, 760px)",
      display: "block",
    },
    endCredit: {
      width: "min(88vw, 760px)",
      display: "block",
      marginTop: "clamp(8px, 4vh, 44px)",
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
