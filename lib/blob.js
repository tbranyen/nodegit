var util = require('util');
var NodeGit = require('../');
var Blob = NodeGit.Blob;
var LookupWrapper = NodeGit.Utils.lookupWrapper;
var TreeEntry = NodeGit.TreeEntry;
var normalizeOptions = NodeGit.Utils.normalizeOptions;

var _filteredContent = Blob.filteredContent;
var _filter = Blob.prototype.filter;

/**
 * Retrieves the blob pointed to by the oid.
 *
 * @param {Repository}          repo  The repo that the blob lives in.
 * @param {string | Oid | Blob} id    The blob to lookup.
 * @returns {Blob}
 * @async
 */
Blob.lookup = LookupWrapper(Blob);

/**
 * Retrieve the content of the Blob.
 *
 * @returns {Buffer} Contents as a buffer.
 */
Blob.prototype.content = function () {
  return this.rawcontent().toBuffer(this.rawsize());
};

/**
 * Retrieve the Blob's type.
 *
 * @returns {number} The filemode of the blob.
 */
Blob.prototype.filemode = function () {
  var FileMode = TreeEntry.FILEMODE;

  return this.isBinary() ? FileMode.EXECUTABLE : FileMode.BLOB;
};

/**
 * Retrieve the Blob's content as String.
 *
 * @returns {string} Contents. As a string.
 */
Blob.prototype.toString = function () {
  return this.content().toString();
};

/**
 * Get a buffer with the filtered content of a blob.
 *
 * This applies filters as if the blob was being checked out to the working directory under the
 * specified filename. This may apply CRLF filtering or other types of changes depending on the file
 * attributes set for the blob and the content detected in it.
 *
 * @param asPath  Path used for file attribute lookups, etc.
 * @param opts    Options to use for filtering the blob.
 * @returns {Promise<string>}
 * @async
 */
Blob.prototype.filter = function (asPath, opts) {
  if (opts) {
    opts = normalizeOptions(opts, NodeGit.BlobFilterOptions);
  }
  return _filter.call(this, asPath, opts);
};

Blob.filteredContent = util.deprecate(
  _filteredContent,
  'NodeGit.Blob.filteredContent is deprecated' + ' use NodeGit.Blob.prototype.filter instead.'
);
