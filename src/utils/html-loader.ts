function getFullScreenIframe(html: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");

  iframe.srcdoc = html;
  iframe.style.width = "100vw";
  iframe.style.height = "100vh";
  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.zIndex = "9999";
  iframe.style.border = "none";

  return iframe;
}

function loadFullScreenIframe(html: string): HTMLIFrameElement {
  const iframe = getFullScreenIframe(html);

  document.body.appendChild(iframe);

  return iframe;
}

export default { getFullScreenIframe, loadFullScreenIframe };
