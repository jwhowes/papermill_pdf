import {StandardFonts} from 'pdf-lib';

export interface DocumentOptions{
	font: StandardFonts;
	fontSize: number;
	xPadding: number;
	yPadding?: number;
	width: number;
	height: number;
	leadingHeight?: number;
	lineHeight?: number;
}

export type Pages = Array<Array<string>>;