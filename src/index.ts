import {PDFDocument, PDFFont, StandardFonts, rgb} from 'pdf-lib';

async function readTxt(e: any): Promise<String>{
	const file = e.target.files[0];
	if(!file){
		return;
	}

	return file.text();
}

function pageSet(content: string, width: number, height: number, yPadding: number, xPadding: number, font: PDFFont, fontSize: number, lineHeight: number): Array<Array<string>>{
	let pages: Array<Array<string>> = [[]];
	let currHeight: number = yPadding;
	let currPage: number = 0;

	content.split("\r\n\r\n").forEach((paragraph, _) => {
		let currWidth: number = xPadding;
		pages[currPage].push("");
		paragraph.split(" ").forEach((word, _) => {
			let wordWidth: number = font.widthOfTextAtSize(word + " ", fontSize);
			if(wordWidth + currWidth >= width - xPadding){
				if(currHeight + lineHeight >= height - yPadding){
					pages.push([]);
					currPage++;
					currHeight = yPadding;
				}
				currHeight += lineHeight;
				pages[currPage].push("");
				currWidth = xPadding;
			}

			pages[currPage][pages[currPage].length - 1] += word + " ";
			currWidth += wordWidth;
		});
		pages[currPage].push("");
		currHeight += 2 * lineHeight;
	});

	return pages;
}

async function toPdf(content: string): Promise<void>{
	const pdfDoc: PDFDocument = await PDFDocument.create();

	const font: PDFFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	const fontSize: number = 11;
	const [width, height] = [595.28, 841.89];

	const leading: number = 6;
	const lineHeight = font.heightAtSize(fontSize) + leading;
	const yPadding = 4 * fontSize;

	let pages: Array<Array<string>> = pageSet(content, width, height, yPadding, 50, font, fontSize, lineHeight);

	console.log(pages);

	pages.forEach((lines, _) => {
		let page = pdfDoc.addPage();
		lines.forEach((line, idx) => {
			page.drawText(line, {
				x: 50,
				y: height - yPadding - idx * lineHeight,
				size: fontSize,
				font: font
			});
		});
	});

	const pdfBytes = await pdfDoc.save();
	const pdfBlob = new Blob([pdfBytes], {type: 'application/pdf'})
	const objectUrl = URL.createObjectURL(pdfBlob);

	window.open(objectUrl);
}

window.onload = function(){
	document.getElementById("fileInput").addEventListener('change', (e) => {
		readTxt(e).then(toPdf);
	});
}