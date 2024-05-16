import {StandardFonts} from 'pdf-lib';

export interface DocumentOptions{
	fileName: string;
	font: StandardFonts;
	fontSize: number;
	xPadding: number;
	yPadding?: number;
	width: number;
	height: number;
	leadingHeight?: number;
	lineHeight?: number;
}

export class Line{
	text: string;
	neededStretch: number;

	constructor(text: string){
		this.text = text;
		this.neededStretch = 0;
	}
	
	addWord(word: string){
		this.text += word;
	}

	addStretch(stretch: number): void{
		this.neededStretch = stretch;
	}
}

export type Pages = Array<Array<Line>>;