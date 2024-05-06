import {PDFDocument, PDFFont, StandardFonts} from 'pdf-lib';
import {DocumentOptions, Pages} from './util';

async function readTxt(file: File): Promise<string>{
	if(!file){
		return;
	}

	return file.text();
}

// Returns pages as a 2D-array of strings (each page is a list of lines)
function getPages(content: string, options: DocumentOptions, font: PDFFont): Pages{
	let pages: Pages = [[]];
	let currHeight: number = options.yPadding;
	let currPage: number = 0;

	content = content.replace(/\t/g, "    ");
	content = content.replace(/\r/g, "");  // Removes carriage return characters (so we default to LF endings)

	content.split("\n").forEach((paragraph, _) => {
		let currWidth: number = options.xPadding;  // Each line begins at x = xPadding (end of line is width - xPadding)
		pages[currPage].push("");  // Begin a new empty line (new paragraph)
		currHeight += options.lineHeight;
		paragraph.split(" ").forEach((word, _) => {  // Loop through words in paragraph
			let wordWidth: number;
			try{
				wordWidth = font.widthOfTextAtSize(word + " ", options.fontSize);
			}catch(error){
				window.alert("Document contains invalid character: " + error.message[22] + ". Try changing to a more standard font.");
				throw error;
			}
			if(wordWidth + currWidth >= options.width - options.xPadding){  // If adding the new word would cause us to overflow the page width then we need a new line
				if(currHeight + options.lineHeight >= options.height - options.yPadding){  // If adding said new line would cause us to overflow the page then we need a new page
					pages.push([]);
					currPage++;
					currHeight = options.yPadding;
				}
				pages[currPage].push("");
				currHeight += options.lineHeight;
				currWidth = options.xPadding;
			}
			pages[currPage][pages[currPage].length - 1] += word + " ";  // Add word to line
			currWidth += wordWidth;
		});
	});
	return pages;
}

function writePages(pages: Pages, options: DocumentOptions, font: PDFFont, pdfDoc: PDFDocument): void{
	pages.forEach((lines, _) => {  // Loop through pages, printing each to a new pdf page
		let page = pdfDoc.addPage();
		lines.forEach((line, idx) => {  // Print every line on the page with a space of lineHeight between them
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

	if(!options.lineHeight){  // The programmer can choose to specify lineHeight directly, or it can be calculated with the help of leadingHeight
		options.lineHeight = font.heightAtSize(options.fontSize) + options.leadingHeight
	}

	if(!options.yPadding){  // If yPadding isn't specified default to 4 * font size
		options.yPadding = 4 * options.fontSize;
	}

	let pages: Pages = getPages(content, options, font);
	writePages(pages, options, font, pdfDoc);

	const pdfBytes = await pdfDoc.save();
	const pdfBlob = new Blob([pdfBytes], {type: 'application/pdf'})
	const objectUrl = URL.createObjectURL(pdfBlob);

	const aTag = document.createElement("a");
	aTag.href = objectUrl;
	aTag.download = options.fileName;

	aTag.click();
	window.URL.revokeObjectURL(objectUrl);
}

window.onload = function(){
	// Create drop down list of fonts
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
		let file: File = formData.get("fileInput") as File;
		let fileName: string = file.name;

		let pos: number = fileName.includes(".") ? fileName.lastIndexOf(".") : fileName.length;
		fileName = fileName.substring(0, pos) + ".pdf";

		readTxt(file).then((content) => {
			const options: DocumentOptions = {  // Options for pdf design (font taken from user input)
				fileName: fileName,
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