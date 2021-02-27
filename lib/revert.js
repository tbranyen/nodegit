var NodeGit = require('../');
var shallowClone = NodeGit.Utils.shallowClone;
var normalizeOptions = NodeGit.Utils.normalizeOptions;

var Revert = NodeGit.Revert;
var _commit = Revert.commit;
var _revert = Revert.revert;

/**
 * Reverts the given commit against the given "our" commit, producing an index that reflects the
 * result of the revert.
 *
 * @param {Repository}   repo           The repository that contains the given commits.
 * @param {Commit}       revert_commit  The commit to revert.
 * @param {Commit}       our_commit     The commit to revert against (e.g. HEAD).
 * @param {number}       mainline       The parent of the revert commit, if it is a merge.
 * @param {MergeOptions} merge_options  The merge options (or null for defaults).
 * @returns {Index} The index result.
 * @async
 */
Revert.commit = function (repo, revert_commit, our_commit, mainline, merge_options) {
  merge_options = normalizeOptions(merge_options, NodeGit.MergeOptions);

  return _commit.call(this, repo, revert_commit, our_commit, mainline, merge_options);
};

/**
 * Reverts the given commit, producing changes in the index and working directory.
 *
 * @param {Repository}    repo            The repository to perform the revert in.
 * @param {Commit}        commit          The commit to revert.
 * @param {RevertOptions} revert_options  The revert options (or null for defaults).
 * @async
 */
Revert.revert = function (repo, commit, revertOpts) {
  var mergeOpts;
  var checkoutOpts;

  if (revertOpts) {
    revertOpts = shallowClone(revertOpts);
    mergeOpts = revertOpts.mergeOpts;
    checkoutOpts = revertOpts.checkoutOpts;
    delete revertOpts.mergeOpts;
    delete revertOpts.checkoutOpts;
  }

  revertOpts = normalizeOptions(revertOpts, NodeGit.RevertOptions);

  if (mergeOpts) {
    revertOpts.mergeOpts = normalizeOptions(mergeOpts, NodeGit.MergeOptions);
  }

  if (checkoutOpts) {
    revertOpts.checkoutOpts = normalizeOptions(checkoutOpts, NodeGit.CheckoutOptions);
  }

  return _revert.call(this, repo, commit, revertOpts);
};
