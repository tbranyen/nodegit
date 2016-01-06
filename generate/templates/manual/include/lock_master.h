#ifndef LOCK_MASTER_H
#define LOCK_MASTER_H

class LockMasterImpl;

class LockMaster {

  static bool enabled;

  LockMasterImpl *impl;

  template<typename T>
  void AddLocks(const T *t) {
    // by default, don't lock anything
  }

  // base case for variadic template unwinding
  void AddParameters() {
  }

  // processes a single parameter, then calls recursively on the rest
  template<typename T, typename... Types>
  void AddParameters(const T *t, const Types*... args) {
    if(t) {
      AddLocks(t);
    }
    AddParameters(args...);
  }

  void ConstructorImpl();
  void DestructorImpl();
  void ObjectToLock(const void *);
public:

  // we lock on construction
  template<typename ...Types> LockMaster(bool emptyGuard, const Types*... types) {
    if(!enabled) {
      return;
    }

    ConstructorImpl();
    AddParameters(types...);
  }

  // and unlock on destruction
  ~LockMaster() {
    if(!enabled) {
      return;
    }
    DestructorImpl();
  }

  class TemporaryUnlock {
    LockMasterImpl *impl;

    void ConstructorImpl();
    void DestructorImpl();
  public:
    TemporaryUnlock() {
      if(!enabled) {
        return;
      }
      ConstructorImpl();
    }
    ~TemporaryUnlock() {
      if(!enabled) {
        return;
      }
      DestructorImpl();
    }
  };

  static void Initialize();

  static void Enable() {
    enabled = true;
  }

  static void Disable() {
    enabled = false;
  }
};


template<> inline void LockMaster::AddLocks(const git_repository *repo) {
  // when using a repo, lock the repo
  ObjectToLock(repo);
}

template<> inline void LockMaster::AddLocks(const git_index *index) {
  // when using an index, lock the repo, or if there isn't one lock the index
  const void *owner = git_index_owner(index);
  if(!owner) {
    owner = index;
  }
  ObjectToLock(owner);
}

template<> inline void LockMaster::AddLocks(const git_commit *commit) {
  // when using a commit, lock the repo
  const void *owner = git_commit_owner(commit);
  ObjectToLock(owner);
}

// ... more locking rules would go here.  According to an analysis of idefs.json,
// the following types are passed as non-const * and may require locking
// (some likely, some probably not):
// 'git_annotated_commit',
// 'git_blame_options',
// 'git_blob',
// 'git_buf',
// 'git_checkout_options',
// 'git_cherrypick_options',
// 'git_clone_options',
// 'git_commit',
// 'git_config',
// 'git_diff',
// 'git_diff_perfdata',
// 'git_error',
// 'git_fetch_options',
// 'git_fetch_options',
// 'git_filter',
// 'git_filter_list',
// 'git_hashsig',
// 'git_index',
// 'git_merge_file_input',
// 'git_merge_options',
// 'git_merge_options',
// 'git_note',
// 'git_note_iterator',
// 'git_object',
// 'git_odb',
// 'git_odb_object',
// 'git_oid',
// 'git_oidarray',
// 'git_packbuilder',
// 'git_patch',
// 'git_pathspec',
// 'git_push_options',
// 'git_rebase',
// 'git_rebase_options',
// 'git_refdb',
// 'git_reference',
// 'git_reflog',
// 'git_remote',
// 'git_remote_callbacks',
// 'git_remote_callbacks',
// 'git_repository',
// 'git_repository_init_options',
// 'git_revwalk',
// 'git_signature',
// 'git_stash_apply_options',
// 'git_status_list',
// 'git_strarray',
// 'git_submodule',
// 'git_submodule_update_options',
// 'git_tag',
// 'git_transfer_progress',
// 'git_transport',
// 'git_tree',
// 'git_treebuilder',
// 'git_writestream'
//
// Other types are always passed as const * and perhaps don't require locking
// (it's not a guarantee though)


#endif