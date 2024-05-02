import {PDFFont} from 'pdf-lib';

export interface DocumentOptions{
	font: PDFFont;
	fontSize: number;
	xPadding: number;
	yPadding?: number;
	width: number;
	height: number;
	leadingHeight?: number;
	lineHeight?: number;
}

export type Pages = Array<Array<string>>;