export function escPressed(code) {
  return code === 27;
}

export function enterPressed(code) {
  return code === 13;
}

export function textEntryFound(originalText, textPart) {
  return (
    originalText.split(' ').filter(token => token.startsWith(textPart)).length >
    0
  );
}

export function modifyTextStyle(originalText, textPart) {
  return originalText
    .split(' ')
    .map(str => {
      if (str.startsWith(textPart)) {
        let idx = str.indexOf(textPart);
        let substr = str.substring(idx, textPart.length);
        let boldPart = '<b>' + substr + '</b>';
        str = str.replace(substr, boldPart);
      }
      return str;
    })
    .join(' ');
}
