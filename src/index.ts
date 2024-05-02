import {PDFDocument, PDFFont, StandardFonts} from 'pdf-lib';
import {DocumentOptions, Pages} from './util';

async function readTxt(file: File): Promise<string>{
	if(!file){
		return;
	}

	return file.text();
}

function getPages(content: string, options: DocumentOptions, font: PDFFont): Pages{
	let pages: Pages = [[]];
	let currHeight: number = options.yPadding;
	let currPage: number = 0;

	content.split("\r\n\r\n").forEach((paragraph, _) => {
		let currWidth: number = options.xPadding;
		pages[currPage].push("");
		paragraph.split(" ").forEach((word, _) => {
			let wordWidth: number = font.widthOfTextAtSize(word + " ", options.fontSize);
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

function writePages(pages: Pages, options: DocumentOptions, font: PDFFont, pdfDoc: PDFDocument): void{
	pages.forEach((lines, _) => {
		let page = pdfDoc.addPage();
		lines.forEach((line, idx) => {
			page.drawText(line, {
				x: 50,
				y: options.height - options.yPadding - idx * options.lineHeight,
				size: options.fontSize,
				font: font
			});
		});
	});
}

async function toPdf(content: string, options: DocumentOptions): Promise<void>{
	const pdfDoc: PDFDocument = await PDFDocument.create();
	const font: PDFFont = await pdfDoc.embedFont(options.font);

	if(!options.lineHeight){
		options.lineHeight = font.heightAtSize(options.fontSize) + options.leadingHeight
	}

	if(!options.yPadding){
		options.yPadding = 4 * options.fontSize;
	}

	let pages: Pages = getPages(content, options, font);

	writePages(pages, options, font, pdfDoc);

	const pdfBytes = await pdfDoc.save();
	const pdfBlob = new Blob([pdfBytes], {type: 'application/pdf'})
	const objectUrl = URL.createObjectURL(pdfBlob);

	window.open(objectUrl);
}

window.onload = function(){
	const fontSelect: HTMLSelectElement = document.getElementById("fontSelect") as HTMLSelectElement;
	Object.values(StandardFonts).forEach((font, _) => {
		let option = document.createElement("option");
		option.value = font;
		option.innerHTML = font.replace("-", " ");
		fontSelect.appendChild(option);
	});
	fontSelect.value = StandardFonts.TimesRoman;

	const form: HTMLFormElement = document.getElementById("fileForm") as HTMLFormElement;
	form.addEventListener('submit', (e) => {
		e.preventDefault();
		const formData: FormData = new FormData(form);

		readTxt(formData.get("fileInput") as File).then((content) => {
			const options: DocumentOptions = {
				font: fontSelect.value as StandardFonts,
				fontSize: parseInt(formData.get("fontSize") as string),

				xPadding: 50,

				width: 595.28,
				height: 841.89,

				leadingHeight: 6
			};

			toPdf(content, options);
		});
	});
}