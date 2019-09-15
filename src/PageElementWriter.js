import ElementWriter from './ElementWriter';

/**
 * An extended ElementWriter which can handle:
 * - page-breaks (it adds new pages when there's not enough space left),
 * - repeatable fragments (like table-headers, which are repeated everytime
 *                         a page-break occurs)
 * - transactions (used for unbreakable-blocks when we want to make sure
 *                 whole block will be rendered on the same page)
 */
class PageElementWriter extends ElementWriter {
	constructor(context) {
		super(context);
		this.transactionLevel = 0;
		this.repeatables = [];
	}

	addLine(line, dontUpdateContextPosition, index) {
		return this._fitOnPage(() => super.addLine(line, dontUpdateContextPosition, index));
	}

	addImage(image, index) {
		return this._fitOnPage(() => super.addImage(image, index));
	}

	addCanvas(image, index) {
		return this._fitOnPage(() => super.addCanvas(image, index));
	}

	addSVG(image, index) {
		return this._fitOnPage(() => super.addSVG(image, index));
	}

	addQr(qr, index) {
		return this._fitOnPage(() => super.addQr(qr, index));
	}

	addVector(vector, ignoreContextX, ignoreContextY, index) {
		return super.addVector(vector, ignoreContextX, ignoreContextY, index);
	}

	beginClip(width, height) {
		return super.beginClip(width, height);
	}

	endClip() {
		return super.endClip();
	}

	addFragment(fragment, useBlockXOffset, useBlockYOffset, dontUpdateContextPosition) {
		return this._fitOnPage(() => super.addFragment(fragment, useBlockXOffset, useBlockYOffset, dontUpdateContextPosition));
	}

	moveToNextPage(pageOrientation) {
		let nextPage = this.context().moveToNextPage(pageOrientation);

		// moveToNextPage is called multiple times for table, because is called for each column
		// and repeatables are inserted only in the first time. If columns are used, is needed
		// call for table in first column and then for table in the second column (is other repeatables).
		this.repeatables.forEach(function (rep) {
			if (rep.insertedOnPages[this.context().page] === undefined) {
				rep.insertedOnPages[this.context().page] = true;
				this.addFragment(rep, true);
			} else {
				this.context().moveDown(rep.height);
			}
		}, this);

		this.emit('pageChanged', {
			prevPage: nextPage.prevPage,
			prevY: nextPage.prevY,
			y: this.context().y
		});
	}

	beginUnbreakableBlock(width, height) {
		if (this.transactionLevel++ === 0) {
			this.originalX = this.context().x;
			this.pushContext(width, height);
		}
	}

	commitUnbreakableBlock(forcedX, forcedY) {
    if (--this.transactionLevel === 0) {
      let unbreakableContext = this.context();
      this.popContext();
      let nbPages = unbreakableContext.pages.length;
      unbreakableContext.canBreak = false;
      const layout = (fragment) => {
        if (nbPages > 1) {
          // for out-of-context blocks (headers, footers, background) height should be the whole DocumentContext height
          fragment.height = unbreakableContext.getCurrentPage().pageSize.height - unbreakableContext.pageMargins.top - unbreakableContext.pageMargins.bottom;
          if (forcedX === undefined && forcedY === undefined) {
            for (let i = 0, l = this.repeatables.length; i < l; i++) {
              fragment.height -= this.repeatables[i].height;
            }
          }
        } else {
          const ctx = this.context();
          const height = ctx.getCurrentPage().pageSize.height - ctx.pageMargins.bottom;
          if (unbreakableContext.y < height) {  
            fragment.height = unbreakableContext.y;
          } else {
            fragment.height = height - ctx.y;   // FIXME: Split long paragraphs, if present
          }
        }

        if (forcedX !== undefined || forcedY !== undefined) {
          super.addFragment(fragment, true, true, true);
        } else {
          this.addFragment(fragment, false, true, false);
        }
      };

      if (nbPages > 0) {
        // handle multi-page unbreakableBlocks by recursively unbreaking inner blocks
        let fragments = unbreakableContext.pages;
        for (let fragment of fragments) {
          fragment.xOffset = forcedX;
          fragment.yOffset = forcedY; //TODO: vectors can influence height in some situations
          layout(fragment);
        }
      }
    }
  }

	currentBlockToRepeatable() {
		let unbreakableContext = this.context();
		let rep = { items: [] };

		unbreakableContext.pages[0].items.forEach(item => {
			rep.items.push(item);
		});

		rep.xOffset = this.originalX;

		//TODO: vectors can influence height in some situations
		rep.height = unbreakableContext.y;

		rep.insertedOnPages = [];

		return rep;
	}

	pushToRepeatables(rep) {
		this.repeatables.push(rep);
	}

	popFromRepeatables() {
		this.repeatables.pop();
	}

	_fitOnPage(addFct) {
		let position = addFct();
		if (!position) {
			this.moveToNextPage();
			position = addFct();
		}
		return position;
	}

}

export default PageElementWriter;
