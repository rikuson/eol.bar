const { XMLBuilder } = require('fast-xml-parser');

class SvgAlert {
  constructor(err) {
    this.xml = new XMLBuilder({ ignoreAttributes: false });
    this.nodes = {
      svg: {
        '@_xmlns': 'http://www.w3.org/2000/svg',
        svg: {
          g: {
            '@_style': 'background-color: #000',
            '@_font-size': '20',
            '@_font-family': 'sans-serif',
            text: {
              '@_fill': '#000',
              '@_x': '20',
              '@_y': '40',
              '#text': err.message,
            },
          },
        },
      }
    };
  }

  render() {
    return this.xml.build(this.nodes);
  }
}

module.exports = SvgAlert;
