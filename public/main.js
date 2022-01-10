window.onload = () => {
  const terminalElm = document.getElementsByClassName('terminal')[0];
  setTimeout(() => {
    const innerElm = document.getElementsByClassName('typing')[0];
    innerElm.className = '';
    const response = document.getElementsByClassName('hidden')[0];
    response.className = '';
  }, 4500);
};
