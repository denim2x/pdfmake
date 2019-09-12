import OutputDocument from './OutputDocument';
import fs from 'fs';
import { resolve } from './helpers/node';

class OutputDocumentServer extends OutputDocument {

	/**
	 * @param {string} filename
	 */
	write(filename) {
		this.getStream().pipe(fs.createWriteStream(resolve(filename)));
		this.getStream().end();
	}

}

export default OutputDocumentServer;
