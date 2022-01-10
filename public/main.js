window.onload = () => {
  const terminalElm = document.getElementsByClassName('terminal')[0];
  const exampleReq = fetch('/nodejs');
  setTimeout(() => {
    const innerElm = document.getElementsByClassName('typing')[0];
    innerElm.className = '';
    exampleReq.then((r) => r.text()).then((ascii) => {
      ascii = ascii.replaceAll('\n      ', '\n');
      ascii = ascii.replaceAll('\n', '<br />');
      ascii = ascii.replaceAll('[37m[44m', '<span class="active">');
      ascii = ascii.replaceAll('[37m[100m', '<span class="maintenance">');
      ascii = ascii.replaceAll('[49m[39m', '</span>');
      terminalElm.innerHTML += '<br />' + ascii + '> ';
    });
  }, 4500);
};
