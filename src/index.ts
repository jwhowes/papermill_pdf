import {PDFDocument, StandardFonts} from 'pdf-lib';
import {DocumentOptions, Pages} from './util';

async function readTxt(e: any): Promise<String>{
	const file = e.target.files[0];
	if(!file){
		return;
	}

	return file.text();
}

function getPages(content: string, options: DocumentOptions): Pages{
	let pages: Pages = [[]];
	let currHeight: number = options.yPadding;
	let currPage: number = 0;

	content.split("\r\n\r\n").forEach((paragraph, _) => {
		let currWidth: number = options.xPadding;
		pages[currPage].push("");
		paragraph.split(" ").forEach((word, _) => {
			let wordWidth: number = options.font.widthOfTextAtSize(word + " ", options.fontSize);
			if(wordWidth + currWidth >= options.width - options.xPadding){
				if(currHeight + options.lineHeight >= options.height - options.yPadding){
					pages.push([]);
					currPage++;
					currHeight = options.yPadding;
				}
				currHeight += options.lineHeight;
				pages[currPage].push("");
				currWidth = options.xPadding;
			}

			pages[currPage][pages[currPage].length - 1] += word + " ";
			currWidth += wordWidth;
		});
		pages[currPage].push("");
		currHeight += 2 * options.lineHeight;
	});

	return pages;
}

function writePages(pages: Pages, options: DocumentOptions, pdfDoc: PDFDocument): void{
	pages.forEach((lines, _) => {
		let page = pdfDoc.addPage();
		lines.forEach((line, idx) => {
			page.drawText(line, {
				x: 50,
				y: options.height - options.yPadding - idx * options.lineHeight,
				size: options.fontSize,
				font: options.font
			});
		});
	});
}

async function toPdf(content: string): Promise<void>{
	const pdfDoc: PDFDocument = await PDFDocument.create();

	const options: DocumentOptions = {
		font: await pdfDoc.embedFont(StandardFonts.TimesRoman),
		fontSize: 12,

		xPadding: 50,

		width: 595.28,
		height: 841.89,

		leadingHeight: 6
	};

	if(!options.lineHeight){
		options.lineHeight = options.font.heightAtSize(options.fontSize) + options.leadingHeight
	}

	if(!options.yPadding){
		options.yPadding = 4 * options.fontSize;
	}

	let pages: Array<Array<string>> = getPages(content, options);

	writePages(pages, options, pdfDoc);

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