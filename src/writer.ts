import IDocItem from "./interfaces/iDocItem";

const fs = require("fs").promises;

/**
 * Writes items to various file formats
 */
abstract class DocApiItemWriterBase<T extends IDocItem> {
  protected docApiItems: IDocItem[];

  protected abstract descriptionTemplateHtml: string;
  protected abstract cachedFilename: string;

  protected constructor(docApiItems: T[]) {
    this.docApiItems = docApiItems;
  }

  protected abstract initHtmlTemplate();

  protected async initAsync() {}

  /**
   * Convert input to a filename safe string
   * @param input
   */
  protected toFilename = (input: string) =>
    input.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}
