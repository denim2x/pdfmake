var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

var pdfmake = require('../js/index');
pdfmake.setFonts(fonts);

const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

function makeTable(row_size, rows) {
  let header = rows == 1 ? `1 row of ${row_size} paragraphs` : `${rows} rows of ${row_size} paragraphs each`;
  return {
    style: 'tableExample',
    table: {
      dontBreakRows: true,
      // keepWithHeaderRows: 1,
      widths: ['*'],
      body: [
        [{ text: header, style: 'tableHeader' }],
        ...`${ `${text}\n`.repeat(row_size) }|`.repeat(rows).split('|').map((e, i) => [`${i+1}. ${e}`]).slice(0, -1)
      ]
    }
  };
}

function makeRows(row_size, rows, breakable) {
  let header = rows == 1 ? `1 row of ${row_size} paragraphs` : `${rows} rows of ${row_size} paragraphs each`;
  return [
    [{ text: header, style: 'tableHeader' }],
    ...`${ `${text}\n`.repeat(row_size) }|`.repeat(rows).split('|').map((e, i) => [{ text: `${i+1}. ${e}`, breakable }]).slice(0, -1)
  ];
}

var docDefinition = {
	content: [
		{ text: 'Table with very long rows', style: 'header' },
    {
      style: 'tableExample',
      table: {
        dontBreakRows: true,
        // keepWithHeaderRows: 1,
        widths: ['*'],
        body: [
          ...makeRows(6, 1, true),
          ...makeRows(2, 4)
        ]
      }
    }
	],
	styles: {
		header: {
			fontSize: 18,
			bold: true,
			margin: [0, 0, 0, 10]
		},
		subheader: {
			fontSize: 16,
			bold: true,
			margin: [0, 10, 0, 5]
		},
		tableExample: {
			margin: [0, 5, 0, 15]
		},
		tableHeader: {
			bold: true,
			fontSize: 13,
			color: 'black',
      _delimiter: true
		}
	},
	defaultStyle: {
		// alignment: 'justify'
	}
};

var now = new Date();

var pdf = pdfmake.createPdf(docDefinition);
pdf.write('pdfs/long-table.pdf');

console.log(new Date() - now);
