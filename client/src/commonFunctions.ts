export function formatBytes(bytes: any, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatBitPerSec(bytes: any, decimals = 2) {
  if (bytes === 0) return "0 b/s";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    "b/s",
    "Kb/s",
    "Mb/s",
    "Gb/s",
    "Tb/s",
    "Pb/s",
    "Eb/s",
    "Zb/s",
    "Yb/s",
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function ConvertMinutes(num: any) {
  num = Math.floor(num / 1000);

  let d = Math.floor((num / 60 / 60 / 24));
  let h = Math.floor((num / 60 / 60) % 24);
  let m = Math.floor((num / 60) % 60);
  let s = Math.round(num % 60);

  return `${d != 0 ? d + ":" : ""}${
    num > 3600
      ? h.toLocaleString("en-US", {
          minimumIntegerDigits: 2,
          useGrouping: false,
        }) + ":"
      : ""
  }${m.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}:${s.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  })}`;
}

export function tokenRefresh() {
  fetch(`https://${process.env.REACT_APP_SECURITY_ENDPOINT}/api/set_token`, {
    credentials: "include",
  }).catch(
    (e) =>
      (window.location.href = `http://${process.env.REACT_APP_SECURITY_ENDPOINT}/?callback=${window.location.href}`)
  );
}
