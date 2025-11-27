
(async () => {
  const getUserAgentInfo = () => {
    const ua = navigator.userAgent;
    let browser = "autre";
    let os = "autre";
    let device = /Mobi|Android/i.test(ua) ? "mobile" : "desktop";

    // Navigateur
    if (/Chrome/.test(ua) && !/Edg/.test(ua)) browser = "chrome";
    else if (/Firefox/.test(ua)) browser = "firefox";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "safari";
    else if (/Edg/.test(ua)) browser = "edge";

    // OS
    if (/Windows NT/.test(ua)) os = "windows";
    else if (/Mac OS/.test(ua)) os = "mac";
    else if (/Linux/.test(ua)) os = "linux";
    else if (/Android/.test(ua)) os = "android";
    else if (/iPhone|iPad/.test(ua)) os = "ios";

    return { browser, os, device };
  };

  const getCountry = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      return data.country_code.toLowerCase(); // exemple: "fr"
    } catch (e) {
      console.warn("Impossible d'obtenir le pays");
      return "unknown";
    }
  };

  const info = getUserAgentInfo();
  const countryCode = await getCountry();

  const payload = {
    country: { [countryCode]: 1 },
    device: { [info.device]: 1 },
    browser: { [info.browser]: 1 },
    os: { [info.os]: 1 },
    referrer: document.referrer ? { [new URL(document.referrer).hostname]: 1 } : { direct: 1 },
    pages: { [window.location.pathname]: 1 },
    unique: 1
  };

  fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(data => console.log("Stat envoyée :", data))
    .catch(err => console.error("Erreur d'envoi :", err));
})();
