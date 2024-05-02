import {PDFDocument, StandardFonts, rgb} from 'pdf-lib';

async function readTxt(e: any): Promise<String>{
	const file = e.target.files[0];
	if(!file){
		return;
	}

	return file.text();
}

function pageSet(content: string, width: number, padding: number, font: any, fontSize: number): string{
	let ret = "";

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
		ret += lines.join("\n") + "\n\n";
	});

	return ret;
}

async function toPdf(content: string): Promise<void>{
	const pdfDoc = await PDFDocument.create();

	const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
	const fontSize = 11;

	const page = pdfDoc.addPage();
	const {width, height} = page.getSize();

	page.drawText(pageSet(content, width, 50, font, fontSize), {
		x: 50,
		y: height - 4 * fontSize,
		size: fontSize,
		font: font
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