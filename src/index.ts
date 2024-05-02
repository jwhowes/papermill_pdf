import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';

async function readTxt(e: any): Promise<String>{
	const file = e.target.files[0];
	if(!file){
		return;
	}

	return file.text();
}

function pageSet(content: string, width: number, height: number, padding: number, font: any, fontSize: number): Array<string>{
	const lineHeight: number = 2 * font.heightAtSize(fontSize);
	const hPadding: number = 3 * lineHeight;

	let pages: Array<string> = [""];
	let currHeight: number = hPadding;
	console.log(hPadding);
	console.log(lineHeight);

	content.split("\r\n\r\n").forEach((paragraph, pidx) => {
		let currWidth: number = padding;
		let lines: Array<string> = [""];

		paragraph.split(" ").forEach((word, widx) => {
			let wordWidth: number = font.widthOfTextAtSize(word + " ", fontSize);
			if(wordWidth + currWidth >= width - padding){
				lines.push("");
				currWidth = padding;
			}
			lines[lines.length - 1] += word + " ";
			currWidth += wordWidth;
		});

		lines.forEach((line, lidx) => {
			if(currHeight + lineHeight >= height - 2 * hPadding){
				pages.push("");
				currHeight = hPadding;
			}
			pages[pages.length - 1] += line + "\n";
			currHeight += lineHeight;
		});
		pages[pages.length - 1] += "\n";
		currHeight += lineHeight;
	});

	return pages;
}

async function toPdf(content: string): Promise<void>{
	const pdfDoc = await PDFDocument.create();

	const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	const fontSize = 11;
	const [width, height] = [595.28, 841.89];

	let pages: Array<string> = pageSet(content, width, height, 50, font, fontSize);
	pages.forEach((pageText, idx) => {
		let page = pdfDoc.addPage();
		page.drawText(pageText, {
			x: 50,
			y: height - 4 * fontSize,
			size: fontSize,
			font: font
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